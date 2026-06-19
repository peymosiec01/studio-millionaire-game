import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  AUDIO_FILES,
  DEFAULT_SHOW_TITLE,
  LETTERS,
  QUESTIONS_PER_STAGE,
  SAVE_KEY,
  SPRINT_BASE_POINTS,
  SPRINT_PRIZE_LADDER_COUNT,
  SPRINT_PRIZE_TIERS,
  SPRINT_TIME_PENALTY,
  SPRINT_TOTAL_SECONDS,
  STAGES,
  STAGE_MAP,
} from "./constants";
import { cleanConfigValue, clone } from "./config";
import { buildAgentPrompt } from "./ai/orchestrator";
import { createInitialState } from "./state/initialState";
import {
  getCustomShowPlan,
  getCustomShowSignature,
  getCustomShowSourceReferences,
  getCustomShowTitle,
  hasCustomShow,
} from "./domain/customShow";
import {
  getCareerSummary,
  getCurrentStage,
  getDifficulty,
  getStageByKey,
  getStageTopics,
  hasSavedProgress,
  isValidStageKey,
  normalizeBestProgress,
  normalizeCheckpoint,
  normalizeStageList,
} from "./domain/progression.jsx";
import {
  REWARD_SHOP_ITEMS,
  awardSprintEventCurrencies,
  awardSprintPrizeTier,
  canAfford,
  getImmediateRewardChips,
  getNextPrizeTier,
  getRewardVisual,
  getSprintPrizeProgress,
  getWallet,
  spendCurrency,
} from "./domain/rewards";
import {
  formatTime,
  getSprintDrill,
  getSprintReward,
  getSprintTopics,
  isSprintMode,
} from "./domain/sprint";
import { AppGuideLauncher, AppGuidePanel } from "./components/AppGuidePanel";
import { EndScreen, PromotionScreen } from "./components/EndScreens";
import { AppHeader, SplashScreen } from "./components/HomeScreen";
import { QuestionScreen } from "./components/QuestionScreen";
import { RewardShopModal } from "./components/RewardShopModal";
import { SettingsModal } from "./components/SettingsModal";
import { callModel } from "./ai/providers";
import {
  buildGroundingBlock,
  buildPhoneFriendPrompt,
  buildQuestionPrompt,
} from "./ai/prompts";
import { designCustomShowPlan, generateQuestionDraft } from "./ai/flows";

const isAzureOpenAiEndpoint = (value) => typeof value === "string" && value.toLowerCase().includes(".openai.azure.com");
const isFoundryProjectEndpoint = (value) => typeof value === "string" && value.toLowerCase().includes(".services.ai.azure.com/api/projects/");

function App() {
  const [state, setState] = useState(createInitialState);
  const stateRef = useRef(state);
  const sprintTimerRef = useRef(null);
  const usedTopicIdxsRef = useRef(new Set());
  const initRanRef = useRef(false);
  const audioTracksRef = useRef({});
  const activeBackgroundTrackRef = useRef("");
  const audioAssetsReadyRef = useRef(false);
  const audioCtxRef = useRef(null);
  const synthAmbienceTimerRef = useRef(null);
  const ambienceStartingRef = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const initAudioAssets = useCallback(() => {
    if (audioAssetsReadyRef.current) return;
    audioAssetsReadyRef.current = true;
    Object.entries(AUDIO_FILES).forEach(([key, sources]) => {
      const list = Array.isArray(sources) ? sources : [sources];
      const track = new Audio();
      track.preload = "auto";
      track.dataset.ready = "0";
      track.dataset.index = "0";

      const loadAtIndex = (index) => {
        if (index >= list.length) {
          track.dataset.ready = "0";
          return;
        }
        track.dataset.index = String(index);
        track.src = list[index];
        track.load();
      };

      const markReady = () => {
        track.dataset.ready = "1";
        if (activeBackgroundTrackRef.current === key) {
          track.play().catch(() => {});
        }
      };

      track.addEventListener("loadeddata", markReady);
      track.addEventListener("canplay", markReady);
      track.addEventListener("canplaythrough", markReady);
      track.addEventListener("error", () => {
        const next = Number(track.dataset.index || "0") + 1;
        track.dataset.ready = "0";
        loadAtIndex(next);
      });

      loadAtIndex(0);
      audioTracksRef.current[key] = track;
    });
  }, []);

  const stopTrack = useCallback((name) => {
    const track = audioTracksRef.current[name];
    if (!track) return;
    track.pause();
    track.currentTime = 0;
  }, []);

  const stopAllBackgroundTracks = useCallback(() => {
    stopTrack("ambience");
    stopTrack("menuAmbience");
    activeBackgroundTrackRef.current = "";
  }, [stopTrack]);

  const playTrack = useCallback((name, opts = {}) => {
    if (!stateRef.current.soundEnabled) return false;
    initAudioAssets();
    const track = audioTracksRef.current[name];
    if (!track || !track.src) return false;

    const { loop = false, volume = 0.45, restart = true } = opts;
    track.loop = loop;
    track.volume = volume;
    if (restart && track.readyState > 0) track.currentTime = 0;
    track.play().catch(() => {});
    return true;
  }, [initAudioAssets]);

  const ensureAudioReady = useCallback(() => {
    if (!stateRef.current.soundEnabled) return false;
    initAudioAssets();
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return false;
    if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    return true;
  }, []);

  const playTone = useCallback((freq, duration = 0.12, type = "sine", volume = 0.03, delay = 0, skipEnsure = false) => {
    if (skipEnsure) {
      if (!stateRef.current.soundEnabled || !audioCtxRef.current) return;
    } else if (!ensureAudioReady()) {
      return;
    }
    const ctx = audioCtxRef.current;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.03);
  }, [ensureAudioReady]);

  const startAmbience = useCallback(() => {
    if (!stateRef.current.soundEnabled || synthAmbienceTimerRef.current || !audioCtxRef.current) return;
    ambienceStartingRef.current = true;
    const pulse = () => {
      playTone(130, 0.25, "triangle", 0.012, 0, true);
      playTone(196, 0.22, "sine", 0.01, 0.18, true);
      playTone(146, 0.28, "triangle", 0.009, 0.5, true);
    };
    synthAmbienceTimerRef.current = setInterval(pulse, 4500);
    ambienceStartingRef.current = false;
    pulse();
  }, [playTone]);

  const setBackgroundTrack = useCallback((name) => {
    if (!stateRef.current.soundEnabled || !name) {
      stopAllBackgroundTracks();
      return;
    }
    if (activeBackgroundTrackRef.current === name) return;
    stopAllBackgroundTracks();

    const volume = name === "ambience" ? 0.27 : 0.22;
    const played = playTrack(name, { loop: true, volume, restart: false });
    if (played) {
      activeBackgroundTrackRef.current = name;
    } else if (name === "ambience") {
      ensureAudioReady();
      if (!synthAmbienceTimerRef.current && !ambienceStartingRef.current) startAmbience();
    }
  }, [playTrack, startAmbience, stopAllBackgroundTracks]);


  const startGameAmbience = useCallback(() => {
    if (!stateRef.current.soundEnabled) return;
    setBackgroundTrack("ambience");
  }, [setBackgroundTrack]);

  const stopAmbience = useCallback(() => {
    if (synthAmbienceTimerRef.current) {
      clearInterval(synthAmbienceTimerRef.current);
      synthAmbienceTimerRef.current = null;
    }
    if (activeBackgroundTrackRef.current === "ambience") {
      activeBackgroundTrackRef.current = "";
    }
    stopTrack("ambience");
  }, [stopTrack]);

  const playCue = useCallback((trackName, fallback) => {
    if (!stateRef.current.soundEnabled) return;
    const cueVolume = trackName === "lifeline" ? 0.35 : 0.45;
    const played = playTrack(trackName, { loop: false, volume: cueVolume, restart: true });
    if (!played && typeof fallback === "function") fallback();
  }, [playTrack]);

  const saveProgress = useCallback((snapshot) => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        provider: snapshot.provider,
        model: snapshot.model,
        soundEnabled: snapshot.soundEnabled,
        foundryProjectEndpoint: snapshot.foundryProjectEndpoint,
        foundryOpenAiEndpoint: snapshot.foundryOpenAiEndpoint,
        foundryDeployment: snapshot.foundryDeployment,
        foundryAgentEnabled: snapshot.foundryAgentEnabled,
        foundryAgentName: snapshot.foundryAgentName,
        foundryAgentAutoApprove: snapshot.foundryAgentAutoApprove,
        customShowEnabled: snapshot.customShowEnabled,
        customShowTitle: snapshot.customShowTitle,
        customShowTopic: snapshot.customShowTopic,
        customShowSource: snapshot.customShowSource,
        customShowPlan: snapshot.customShowPlan,
        customShowPlanSignature: snapshot.customShowPlanSignature,
        currentStageKey: snapshot.currentStageKey,
        unlockedStages: normalizeStageList(snapshot.unlockedStages, ["recruit"], snapshot),
        completedStages: normalizeStageList(snapshot.completedStages, [], snapshot),
        bestStageProgress: normalizeBestProgress(snapshot.bestStageProgress, snapshot),
        sprintBestScore: Number.isFinite(snapshot.sprintBestScore) ? Math.max(0, Math.floor(snapshot.sprintBestScore)) : 0,
        checkpoint: normalizeCheckpoint(snapshot.checkpoint, snapshot),
      }));
    } catch {}
  }, []);

  const updateState = useCallback((mutator, persist = false) => {
    setState((prev) => {
      const next = clone(prev);
      mutator(next);
      stateRef.current = next;
      if (persist) saveProgress(next);
      return next;
    });
  }, [saveProgress]);

  const toggleSound = useCallback(() => {
    const willEnable = !stateRef.current.soundEnabled;
    updateState((draft) => { draft.soundEnabled = !draft.soundEnabled; }, true);
    if (willEnable) {
      ensureAudioReady();
      if (stateRef.current.screen === "game") startGameAmbience();
      else setBackgroundTrack("menuAmbience");
      playCue("start", () => {
        playTone(440, 0.08, "sine", 0.02, 0);
        playTone(554, 0.08, "sine", 0.016, 0.1);
      });
    } else {
      stopAllBackgroundTracks();
      stopAmbience();
    }
  }, [ensureAudioReady, playCue, setBackgroundTrack, startGameAmbience, stopAllBackgroundTracks, stopAmbience, updateState]);

  useEffect(() => {
    initAudioAssets();
    return () => {
      Object.values(audioTracksRef.current).forEach((track) => {
        track.pause();
        track.src = "";
      });
      audioTracksRef.current = {};
      audioAssetsReadyRef.current = false;
    };
  }, [initAudioAssets]);

  useEffect(() => {
    const primeAudio = () => {
      initAudioAssets();
      ensureAudioReady();
      const firstTrack = audioTracksRef.current.start || audioTracksRef.current.lockin;
      if (firstTrack) {
        const previousVolume = firstTrack.volume;
        firstTrack.volume = 0;
        firstTrack.play()
          .then(() => {
            firstTrack.pause();
            firstTrack.currentTime = 0;
            firstTrack.volume = previousVolume || 0.45;
          })
          .catch(() => {
            firstTrack.volume = previousVolume || 0.45;
          });
      }
      const current = stateRef.current;
      if (current.soundEnabled) {
        if (current.screen === "game") setBackgroundTrack("ambience");
        else if (current.screen === "splash" || current.screen === "promotion") setBackgroundTrack("menuAmbience");
      }
      window.removeEventListener("pointerdown", primeAudio);
      window.removeEventListener("keydown", primeAudio);
    };

    window.addEventListener("pointerdown", primeAudio, { once: true });
    window.addEventListener("keydown", primeAudio, { once: true });
    return () => {
      window.removeEventListener("pointerdown", primeAudio);
      window.removeEventListener("keydown", primeAudio);
    };
  }, [ensureAudioReady, initAudioAssets, setBackgroundTrack]);

  const stopSprintTimer = useCallback(() => {
    if (!sprintTimerRef.current) return;
    clearInterval(sprintTimerRef.current);
    sprintTimerRef.current = null;
  }, []);

  const finishSprint = useCallback((reason = "timeup") => {
    stopSprintTimer();
    if (reason === "walkaway") playCue("walkaway");
    else playCue("win");
    updateState((draft) => {
      if (!isSprintMode(draft) || draft.screen !== "game") return;
      const isNewBest = draft.sprint.score > draft.sprintBestScore;
      draft.screen = "sprintover";
      draft.currentQ = null;
      draft.currentTopic = null;
      draft.currentGrounding = null;
      draft.answering = false;
      draft.loading = false;
      draft.sprint.timeLeft = Math.max(0, Math.floor(draft.sprint.timeLeft));
      draft.sprint.newBest = isNewBest;
      draft.sprint.paused = false;
      draft.sprint.pausePending = false;
      draft.sprint.timerFreezeQuestions = 0;
      if (isNewBest) draft.sprintBestScore = draft.sprint.score;
      draft.status = reason === "walkaway" ? "Drill Sprint ended early." : "Time is up.";
    }, true);
  }, [playCue, stopSprintTimer, updateState]);

  const startSprintTimer = useCallback(() => {
    stopSprintTimer();
    sprintTimerRef.current = setInterval(() => {
      const current = stateRef.current;
      if (!isSprintMode(current) || current.screen !== "game") {
        stopSprintTimer();
        return;
      }
      if (current.loading || current.sprint.paused || current.sprint.timerFreezeQuestions > 0) return;
      if (current.sprint.timeLeft <= 1) {
        finishSprint("timeup");
        return;
      }
      updateState((draft) => { draft.sprint.timeLeft -= 1; });
    }, 1000);
  }, [finishSprint, stopSprintTimer, updateState]);

  const callAI = useCallback(async (userPrompt) => {
    return callModel(stateRef.current, userPrompt);
  }, []);

  const runAgent = useCallback(async (agentKey, taskPrompt) => {
    return callAI(buildAgentPrompt(agentKey, taskPrompt));
  }, [callAI]);

  const ensureCustomShowPlan = useCallback(async () => {
    const current = stateRef.current;
    if (!hasCustomShow(current)) return null;
    const signature = getCustomShowSignature(current);
    const existing = getCustomShowPlan(current);
    if (existing) return existing;

    updateState((draft) => {
      draft.customShowPlanning = true;
      draft.status = "Designing your custom Studio Millionaire show...";
      draft.errorMsg = "";
    });

    const sourceReferences = getCustomShowSourceReferences(current);

    try {
      const normalized = await designCustomShowPlan({ current, sourceReferences, runAgent });
      updateState((draft) => {
        draft.customShowPlan = normalized;
        draft.customShowPlanSignature = signature;
        draft.customShowPlanning = false;
        draft.status = "Custom show ready.";
        const firstStage = normalized.stages[0]?.key;
        if (firstStage && !isValidStageKey(draft.currentStageKey, draft)) draft.currentStageKey = firstStage;
      }, true);
      return normalized;
    } catch (err) {
      updateState((draft) => {
        draft.customShowPlanning = false;
        draft.status = "";
        draft.errorMsg = `Could not create custom show: ${err.message}`;
      }, true);
      throw err;
    }
  }, [runAgent, updateState]);

  const resetRound = useCallback((draft) => {
    draft.currentQ = null;
    draft.currentTopic = null;
    draft.selectedAnswer = null;
    draft.revealedCorrect = false;
    draft.usedLifelines = { fifty: 0, audience: 0, phone: 0 };
    draft.status = "";
    draft.feedbackType = "";
    draft.feedbackMsg = "";
    draft.eliminated = [];
    draft.hintText = "";
    draft.loading = false;
    draft.answering = false;
    draft.errorMsg = "";
  }, []);

  const isPracticeMode = useCallback((snapshot = stateRef.current) => snapshot.gameMode === "practice", []);

  const loadQuestion = useCallback(async () => {
    const before = stateRef.current;
    if (isSprintMode(before) && before.screen !== "game") return;

    updateState((draft) => {
      draft.loading = true;
      draft.currentQ = null;
      draft.selectedAnswer = null;
      draft.revealedCorrect = false;
      draft.currentGrounding = null;
      draft.eliminated = [];
      draft.hintText = "";
      draft.feedbackMsg = "";
      draft.feedbackType = "";
      draft.errorMsg = "";
      draft.answering = false;
      if (isSprintMode(draft)) draft.sprint.pausePending = false;
    });

    const current = stateRef.current;
    const stage = getCurrentStage(current);
    const sprintDrill = getSprintDrill(current);
    const customShow = hasCustomShow(current);
    const customShowTitle = getCustomShowTitle(current);
    const customShowSource = cleanConfigValue(current.customShowSource);
    const foundryAgentMode = current.provider === "foundry" && current.foundryAgentEnabled;
    const stageTopics = isSprintMode(current) ? getSprintTopics(current) : getStageTopics(current.currentStageKey, current);
    if (!stageTopics.length) {
      updateState((draft) => {
        draft.loading = false;
        draft.errorMsg = "No topics are available for this show yet. Save settings and start again.";
      }, true);
      return;
    }
    const difficulty = isSprintMode(current) ? sprintDrill.difficulty : getDifficulty(current);
    const available = stageTopics.map((_, i) => i).filter((i) => !usedTopicIdxsRef.current.has(i));
    const pool = available.length ? available : stageTopics.map((_, i) => i);
    const topicIndex = pool[Math.floor(Math.random() * pool.length)];
    usedTopicIdxsRef.current.add(topicIndex);
    const topic = stageTopics[topicIndex];
    const customShowPhase = customShow ? getStageByKey(current, topic.stageKey)?.title || topic.label : "";
    const customSourceReferences = customShow ? getCustomShowSourceReferences(current) : [];
    const groundingBlock = buildGroundingBlock({
      foundryAgentMode,
      customShow,
      customShowSource,
      customSourceReferences,
      customShowTopic: current.customShowTopic.trim(),
    });
    const prompt = buildQuestionPrompt({
      current,
      stage,
      sprintDrill,
      topic,
      difficulty,
      customShow,
      customShowTitle,
      customShowPhase,
      groundingBlock,
      sprintMode: isSprintMode(current),
    });

    try {
      const json = await generateQuestionDraft({ prompt, customShow, runAgent });
      const questionReward = isSprintMode(current) ? getSprintReward(current, sprintDrill) : null;
      updateState((draft) => {
        draft.currentQ = questionReward ? { ...json, reward: questionReward } : json;
        draft.currentTopic = topic;
        draft.currentGrounding = foundryAgentMode ? { provider: "Foundry Agent", topic: topic.label } : null;
        draft.loading = false;
        draft.status = "";
        if (!isSprintMode(draft) && !isPracticeMode(draft)) draft.checkpoint = { type: "stage", stageKey: stage.key, qNum: draft.qNum };
      }, !isPracticeMode(stateRef.current));
      playCue("lockin");
    } catch (err) {
      updateState((draft) => {
        draft.currentTopic = topic;
        draft.currentGrounding = foundryAgentMode ? { provider: "Foundry Agent", topic: topic.label } : null;
        draft.loading = false;
        draft.errorMsg = `Could not load question: ${err.message}`;
      }, !isPracticeMode(stateRef.current));
    }
  }, [isPracticeMode, playCue, runAgent, updateState]);

  const completeCurrentStage = useCallback(() => {
    playCue("win");
    updateState((draft) => {
      const currentStage = getCurrentStage(draft);
      draft.currentQ = null;
      draft.currentTopic = null;
      if (isPracticeMode(draft)) {
        draft.checkpoint = null;
        draft.screen = "won";
        return;
      }
      draft.bestStageProgress[currentStage.key] = Math.max(draft.bestStageProgress[currentStage.key] || 0, QUESTIONS_PER_STAGE);
      draft.completedStages = Array.from(new Set([...draft.completedStages, currentStage.key]));
      if (currentStage.nextChoices?.length) {
        draft.unlockedStages = Array.from(new Set([...draft.unlockedStages, ...currentStage.nextChoices]));
        draft.checkpoint = { type: "promotion", stageKey: currentStage.key, qNum: QUESTIONS_PER_STAGE };
        draft.screen = "promotion";
      } else {
        draft.checkpoint = null;
        draft.screen = "won";
      }
    }, !isPracticeMode(stateRef.current));
  }, [isPracticeMode, playCue, updateState]);

  const startStage = useCallback((stageKey, options = {}) => {
    const { mode = "career" } = options;
    ensureAudioReady();
    stopSprintTimer();
    playCue("start");
    usedTopicIdxsRef.current.clear();
    updateState((draft) => {
      draft.gameMode = mode;
      draft.currentStageKey = stageKey;
      draft.screen = "game";
      draft.qNum = 0;
      resetRound(draft);
      draft.usedLifelines = { fifty: 1, audience: 1, phone: 1 };
      if (mode === "practice") {
        draft.checkpoint = null;
        draft.status = "Practice Mode - career unlocks and checkpoints are not changed.";
      } else {
        draft.checkpoint = { type: "stage", stageKey, qNum: 0 };
      }
    }, mode !== "practice");
    setTimeout(() => loadQuestion(), 0);
  }, [ensureAudioReady, loadQuestion, playCue, resetRound, stopSprintTimer, updateState]);

  const startSprint = useCallback(async () => {
    if (hasCustomShow(stateRef.current)) {
      try {
        await ensureCustomShowPlan();
      } catch {
        return;
      }
    }
    ensureAudioReady();
    stopSprintTimer();
    playCue("start");
    usedTopicIdxsRef.current.clear();
    updateState((draft) => {
      draft.gameMode = "sprint";
      draft.screen = "game";
      draft.qNum = 0;
      resetRound(draft);
      draft.sprint.timeLeft = SPRINT_TOTAL_SECONDS;
      draft.sprint.score = 0;
      draft.sprint.streak = 0;
      draft.sprint.newBest = false;
      draft.sprint.paused = false;
      draft.sprint.pausePending = false;
      draft.sprint.timerFreezeQuestions = 0;
      draft.sprint.claimedPrizeTiers = [];
      draft.bonusPoints = 0;
      draft.rewardWallet = { loot: 0, gems: 0, tokens: 0 };
      draft.redeemedItems = [];
      draft.checkpoint = null;
      draft.usedLifelines = { fifty: 1, audience: 1, phone: 1 };
    }, true);
    setTimeout(() => {
      loadQuestion();
      startSprintTimer();
    }, 0);
  }, [ensureAudioReady, ensureCustomShowPlan, loadQuestion, playCue, resetRound, startSprintTimer, stopSprintTimer, updateState]);

  const startGame = useCallback(async () => {
    stopSprintTimer();
    let firstStageKey = "recruit";
    let customPlan = null;
    if (hasCustomShow(stateRef.current)) {
      try {
        customPlan = await ensureCustomShowPlan();
        firstStageKey = customPlan?.stages?.[0]?.key || "recruit";
      } catch {
        return;
      }
    }
    updateState((draft) => {
      draft.gameMode = "career";
      draft.unlockedStages = [firstStageKey];
      draft.completedStages = [];
      draft.bestStageProgress = {};
      draft.checkpoint = null;
    });
    startStage(firstStageKey);
  }, [ensureCustomShowPlan, startStage, stopSprintTimer, updateState]);

  const selectStage = useCallback(async (stageKey) => {
    if (hasCustomShow(stateRef.current)) {
      try {
        await ensureCustomShowPlan();
      } catch {
        return;
      }
    }
    const current = stateRef.current;
    if (!isValidStageKey(stageKey, current)) return;
    const mode = current.unlockedStages.includes(stageKey) ? "career" : "practice";
    startStage(stageKey, { mode });
  }, [ensureCustomShowPlan, startStage]);

  const resumeProgress = useCallback(() => {
    stopSprintTimer();
    const current = stateRef.current;
    if (!current.checkpoint) {
      updateState((draft) => { draft.screen = "splash"; });
      return;
    }
    if (current.checkpoint.type === "promotion") {
      updateState((draft) => {
        draft.gameMode = "career";
        draft.currentStageKey = current.checkpoint.stageKey;
        draft.screen = "promotion";
        resetRound(draft);
      }, true);
      return;
    }
    usedTopicIdxsRef.current.clear();
    updateState((draft) => {
      draft.gameMode = "career";
      draft.currentStageKey = current.checkpoint.stageKey;
      draft.screen = "game";
      draft.qNum = current.checkpoint.qNum;
      resetRound(draft);
      draft.usedLifelines = { fifty: 1, audience: 1, phone: 1 };
    }, true);
    setTimeout(() => loadQuestion(), 0);
  }, [loadQuestion, resetRound, stopSprintTimer, updateState]);

  const choosePromotion = useCallback((stageKey) => {
    if (!stateRef.current.unlockedStages.includes(stageKey) || !isValidStageKey(stageKey, stateRef.current)) return;
    startStage(stageKey);
  }, [startStage]);

  const toggleSprintPause = useCallback(() => {
    const current = stateRef.current;
    if (!isSprintMode(current) || current.screen !== "game") return;
    const shouldResume = current.sprint.paused;
    updateState((draft) => {
      if (draft.sprint.paused) {
        draft.sprint.paused = false;
        draft.sprint.pausePending = false;
        draft.status = "Drill Sprint resumed.";
        return;
      }
      draft.sprint.pausePending = !draft.sprint.pausePending;
      draft.status = draft.sprint.pausePending ? "Pause queued after this question." : "Pause cancelled.";
    });
    if (shouldResume && !current.currentQ) setTimeout(() => loadQuestion(), 0);
  }, [loadQuestion, updateState]);

  const goHome = useCallback(() => {
    stopSprintTimer();
    updateState((draft) => {
      draft.gameMode = "career";
      draft.screen = "splash";
      draft.currentQ = null;
      draft.currentTopic = null;
    }, true);
  }, [stopSprintTimer, updateState]);

  const saveSettingsAndRestart = useCallback(() => {
    stopSprintTimer();
    stopAllBackgroundTracks();
    stopAmbience();
    usedTopicIdxsRef.current.clear();
    updateState((draft) => {
      draft.settingsOpen = false;
      draft.gameMode = "career";
      draft.screen = "splash";
      draft.currentStageKey = "recruit";
      draft.unlockedStages = ["recruit"];
      draft.completedStages = [];
      draft.bestStageProgress = {};
      draft.checkpoint = null;
      draft.qNum = 0;
      draft.currentQ = null;
      draft.currentTopic = null;
      draft.currentGrounding = null;
      draft.selectedAnswer = null;
      draft.revealedCorrect = false;
      draft.usedLifelines = { fifty: 1, audience: 1, phone: 1 };
      draft.feedbackType = "";
      draft.feedbackMsg = "";
      draft.eliminated = [];
      draft.hintText = "";
      draft.loading = false;
      draft.answering = false;
      draft.errorMsg = "";
      draft.status = "Settings saved. Career progress was reset.";
      draft.sprint = {
        timeLeft: SPRINT_TOTAL_SECONDS,
        score: 0,
        streak: 0,
        newBest: false,
        paused: false,
        pausePending: false,
        timerFreezeQuestions: 0,
        claimedPrizeTiers: [],
      };
      draft.bonusPoints = 0;
      draft.rewardWallet = { loot: 0, gems: 0, tokens: 0 };
      draft.shopOpen = false;
      draft.rewardGuideOpen = false;
      draft.redeemedItems = [];
      draft.customShowPlan = null;
      draft.customShowPlanSignature = "";
      draft.customShowPlanning = false;
    }, true);
  }, [stopAllBackgroundTracks, stopAmbience, stopSprintTimer, updateState]);

  const answer = useCallback((idx) => {
    ensureAudioReady();
    const current = stateRef.current;
    if (!current.currentQ || current.answering) return;
    const sprintMode = isSprintMode(current);
    if (sprintMode && current.sprint.paused) return;
    const question = current.currentQ;

    updateState((draft) => {
      draft.answering = true;
      draft.selectedAnswer = idx;
      draft.revealedCorrect = false;
    });

    if (idx === question.correct) {
      updateState((draft) => {
        let bonusMsg = "";
        if (sprintMode) {
          const reward = question.reward || { points: SPRINT_BASE_POINTS, timeBonus: 0, label: `+${SPRINT_BASE_POINTS} Score`, type: "standard" };
          draft.sprint.score += reward.points;
          draft.sprint.streak += 1;
          if (reward.timeBonus) draft.sprint.timeLeft += reward.timeBonus;
          const reachedTier = SPRINT_PRIZE_TIERS.find((tier) => draft.sprint.score >= tier.score && !draft.sprint.claimedPrizeTiers?.includes(tier.score));
          const prizeMsg = awardSprintPrizeTier(draft, reachedTier);
          const eventMsg = awardSprintEventCurrencies(draft);

          // Streak milestone bonus: +30 seconds for every 5-question streak
          if (false && draft.sprint.streak % 5 === 0) {
            draft.sprint.timeLeft += 30;
            bonusMsg = ` ${reward.label}. ðŸ”¥ Streak Milestone! +30 seconds!`;
            playCue("lifeline");
          } else {
            bonusMsg = ` ${reward.label}.${eventMsg}${prizeMsg}`;
          }
          if (prizeMsg && !bonusMsg.includes(prizeMsg)) bonusMsg += prizeMsg;

          // Handle lifeline bonus - increment count if they already have one
          if (reward.type === "lifeline" && reward.lifeline) {
            draft.usedLifelines[reward.lifeline] = (draft.usedLifelines[reward.lifeline] || 0) + 1;
          }
        } else {
          bonusMsg = "";
        }
        draft.feedbackType = "correct";
        draft.feedbackMsg = `Correct! ${question.explanation}${bonusMsg}`;
      });
      playCue("correct");

      setTimeout(() => {
        if (stateRef.current.screen !== "game") return;
        updateState((draft) => {
          draft.qNum += 1;
          if (sprintMode && draft.sprint.timerFreezeQuestions > 0) {
            draft.sprint.timerFreezeQuestions -= 1;
          }
          if (sprintMode && draft.sprint.pausePending) {
            draft.currentQ = null;
            draft.currentTopic = null;
            draft.answering = false;
            draft.loading = false;
            draft.sprint.paused = true;
            draft.sprint.pausePending = false;
            draft.status = "Drill Sprint paused.";
          } else if (!sprintMode && !isPracticeMode(draft)) {
            draft.bestStageProgress[draft.currentStageKey] = Math.max(draft.bestStageProgress[draft.currentStageKey] || 0, draft.qNum);
            draft.checkpoint = { type: "stage", stageKey: draft.currentStageKey, qNum: Math.min(draft.qNum, QUESTIONS_PER_STAGE - 1) };
          }
        }, !isPracticeMode(stateRef.current));
        if (!sprintMode && stateRef.current.qNum >= QUESTIONS_PER_STAGE) completeCurrentStage();
        else if (!stateRef.current.sprint.paused) loadQuestion();
      }, sprintMode ? 900 : 2000);
      return;
    }

    if (sprintMode) {
      updateState((draft) => {
        draft.sprint.streak = 0;
        draft.sprint.timeLeft = Math.max(0, draft.sprint.timeLeft - SPRINT_TIME_PENALTY);
        draft.feedbackType = "wrong";
        draft.feedbackMsg = `Not this one. ${LETTERS[question.correct]} was right. -${SPRINT_TIME_PENALTY}s.`;
      });
      playCue("wrong");
      setTimeout(() => updateState((draft) => { if (draft.screen === "game") draft.revealedCorrect = true; }), 450);
      setTimeout(() => {
        if (stateRef.current.screen !== "game") return;
        updateState((draft) => {
          draft.qNum += 1;
          if (draft.sprint.timerFreezeQuestions > 0) {
            draft.sprint.timerFreezeQuestions -= 1;
          }
          if (draft.sprint.pausePending) {
            draft.currentQ = null;
            draft.currentTopic = null;
            draft.answering = false;
            draft.loading = false;
            draft.sprint.paused = true;
            draft.sprint.pausePending = false;
            draft.status = "Drill Sprint paused.";
          }
        }, true);
        if (stateRef.current.sprint.timeLeft <= 0) finishSprint("timeup");
        else if (!stateRef.current.sprint.paused) loadQuestion();
      }, 900);
      return;
    }

    updateState((draft) => {
      draft.feedbackType = "wrong";
      draft.feedbackMsg = `Not this one. The right answer was ${LETTERS[question.correct]}. ${question.explanation}`;
    });
    playCue("wrong");
    setTimeout(() => updateState((draft) => { if (draft.screen === "game") draft.revealedCorrect = true; }), 650);
    setTimeout(() => {
      if (stateRef.current.screen !== "game") return;
      updateState((draft) => {
        draft.screen = "lost";
        draft.currentQ = null;
        if (!isPracticeMode(draft)) {
          draft.bestStageProgress[draft.currentStageKey] = Math.max(draft.bestStageProgress[draft.currentStageKey] || 0, draft.qNum);
          draft.checkpoint = { type: "stage", stageKey: draft.currentStageKey, qNum: draft.qNum };
        }
      }, !isPracticeMode(stateRef.current));
    }, 2800);
  }, [completeCurrentStage, ensureAudioReady, finishSprint, isPracticeMode, loadQuestion, playCue, updateState]);

  const walkAway = useCallback(() => {
    ensureAudioReady();
    if (isSprintMode(stateRef.current)) {
      finishSprint("walkaway");
      return;
    }
    playCue("walkaway");
    updateState((draft) => {
      draft.screen = "walkaway";
      draft.currentQ = null;
      draft.currentTopic = null;
      if (!isPracticeMode(draft)) {
        draft.bestStageProgress[draft.currentStageKey] = Math.max(draft.bestStageProgress[draft.currentStageKey] || 0, draft.qNum);
        draft.checkpoint = { type: "stage", stageKey: draft.currentStageKey, qNum: draft.qNum };
      }
    }, !isPracticeMode(stateRef.current));
  }, [ensureAudioReady, finishSprint, isPracticeMode, playCue, updateState]);

  const redeemItem = useCallback((itemId) => {
    updateState((draft) => {
      const item = REWARD_SHOP_ITEMS.find((i) => i.id === itemId);
      const wallet = getWallet(draft);
      if (item && canAfford(wallet, item.cost)) {
        spendCurrency(draft, item.cost);
        draft.redeemedItems.push({ ...item, redeemedAt: new Date().toISOString() });

        if (itemId === "buy-fifty") {
          draft.usedLifelines.fifty = (draft.usedLifelines.fifty || 0) + 1;
          draft.status = "Shop redeemed: +1 50:50 lifeline.";
        } else if (itemId === "buy-audience") {
          draft.usedLifelines.audience = (draft.usedLifelines.audience || 0) + 1;
          draft.status = "Shop redeemed: +1 Ask Audience lifeline.";
        } else if (itemId === "buy-phone") {
          draft.usedLifelines.phone = (draft.usedLifelines.phone || 0) + 1;
          draft.status = "Shop redeemed: +1 Phone Friend lifeline.";
        } else if (itemId === "timer-pause") {
          draft.sprint.timerFreezeQuestions = Math.max(draft.sprint.timerFreezeQuestions || 0, 3);
          draft.status = "Shop redeemed: timer frozen for the next 3 answers.";
        } else if (itemId === "timer-reset") {
          draft.sprint.timeLeft = SPRINT_TOTAL_SECONDS;
          draft.status = "Shop redeemed: timer reset to 5 minutes.";
        } else if (itemId === "full-lifeline-pack") {
          draft.usedLifelines.fifty = (draft.usedLifelines.fifty || 0) + 1;
          draft.usedLifelines.audience = (draft.usedLifelines.audience || 0) + 1;
          draft.usedLifelines.phone = (draft.usedLifelines.phone || 0) + 1;
          draft.status = "Shop redeemed: full lifeline pack added.";
        } else {
          draft.status = `Redeemed: ${item.name}!`;
        }
      }
    });
  }, [updateState]);

  const useFifty = useCallback(() => {
    ensureAudioReady();
    const current = stateRef.current;
    if (!current.currentQ || current.usedLifelines.fifty <= 0 || (isSprintMode(current) && current.sprint.paused)) return;
    playCue("lifeline");
    updateState((draft) => {
      draft.usedLifelines.fifty -= 1;
      const wrongs = [0, 1, 2, 3].filter((i) => i !== draft.currentQ.correct);
      draft.eliminated = wrongs.sort(() => Math.random() - 0.5).slice(0, 2);
      draft.status = "50:50 used - two wrong answers removed";
    }, true);
  }, [ensureAudioReady, playCue, updateState]);

  const useAudience = useCallback(() => {
    ensureAudioReady();
    const current = stateRef.current;
    if (!current.currentQ || current.usedLifelines.audience <= 0 || (isSprintMode(current) && current.sprint.paused)) return;
    playCue("lifeline");
    updateState((draft) => {
      draft.usedLifelines.audience -= 1;
      const pcts = [0, 0, 0, 0];
      const active = [0, 1, 2, 3].filter((i) => !draft.eliminated.includes(i));
      const correctPct = Math.floor(Math.random() * 25) + 55;
      pcts[draft.currentQ.correct] = correctPct;
      let remaining = 100 - correctPct;
      const others = active.filter((i) => i !== draft.currentQ.correct);
      others.forEach((i, index) => {
        const value = index === others.length - 1 ? remaining : Math.floor(Math.random() * (remaining + 1));
        pcts[i] = value;
        remaining -= value;
      });
      draft.hintText = `Audience vote - A: ${pcts[0]}%  B: ${pcts[1]}%  C: ${pcts[2]}%  D: ${pcts[3]}%`;
      draft.status = "Audience has voted";
    }, true);
  }, [ensureAudioReady, playCue, updateState]);

  const usePhone = useCallback(async () => {
    ensureAudioReady();
    const current = stateRef.current;
    if (!current.currentQ || current.usedLifelines.phone <= 0 || (isSprintMode(current) && current.sprint.paused)) return;
    playCue("lifeline");
    updateState((draft) => {
      draft.usedLifelines.phone -= 1;
      draft.hintText = "Calling your expert friend...";
      draft.status = "Phone a Friend in progress...";
    });

    try {
      const q = stateRef.current.currentQ;
      const hint = await runAgent("lifelineCoach", buildPhoneFriendPrompt(q));
      updateState((draft) => {
        draft.hintText = `Your expert says: "${hint.trim()}"`;
        draft.status = "Phone a Friend used";
      }, true);
    } catch {
      updateState((draft) => {
        draft.hintText = "Call dropped! Your expert friend couldn't be reached.";
        draft.status = "Phone a Friend used";
      }, true);
    }
  }, [ensureAudioReady, playCue, runAgent, updateState]);

  useEffect(() => {
    if (initRanRef.current) return;
    initRanRef.current = true;
    (async () => {
      const next = createInitialState();
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          next.provider = saved.provider === "foundry" ? "foundry" : "anthropic";
          if (typeof saved.model === "string") next.model = saved.model;
          if (typeof saved.soundEnabled === "boolean") next.soundEnabled = saved.soundEnabled;
          if (typeof saved.foundryProjectEndpoint === "string") next.foundryProjectEndpoint = saved.foundryProjectEndpoint;
          if (typeof saved.foundryOpenAiEndpoint === "string") next.foundryOpenAiEndpoint = saved.foundryOpenAiEndpoint;
          if (typeof saved.foundryEndpoint === "string") {
            if (isFoundryProjectEndpoint(saved.foundryEndpoint)) next.foundryProjectEndpoint = saved.foundryEndpoint;
            if (isAzureOpenAiEndpoint(saved.foundryEndpoint)) next.foundryOpenAiEndpoint = saved.foundryEndpoint;
          }
          if (typeof saved.foundryDeployment === "string") next.foundryDeployment = saved.foundryDeployment;
          if (typeof saved.foundryAgentEnabled === "boolean") next.foundryAgentEnabled = saved.foundryAgentEnabled;
          if (typeof saved.foundryAgentName === "string") next.foundryAgentName = saved.foundryAgentName;
          if (typeof saved.foundryAgentAutoApprove === "boolean") next.foundryAgentAutoApprove = saved.foundryAgentAutoApprove;
          if (typeof saved.customShowEnabled === "boolean") next.customShowEnabled = saved.customShowEnabled;
          if (typeof saved.customShowTitle === "string") next.customShowTitle = saved.customShowTitle;
          if (typeof saved.customShowTopic === "string") next.customShowTopic = saved.customShowTopic;
          if (typeof saved.customShowSource === "string") next.customShowSource = saved.customShowSource;
          if (saved.customShowPlan && typeof saved.customShowPlan === "object") next.customShowPlan = saved.customShowPlan;
          if (typeof saved.customShowPlanSignature === "string") next.customShowPlanSignature = saved.customShowPlanSignature;
          next.currentStageKey = isValidStageKey(saved.currentStageKey, next) ? saved.currentStageKey : "recruit";
          next.unlockedStages = normalizeStageList(saved.unlockedStages, ["recruit"], next);
          next.completedStages = normalizeStageList(saved.completedStages, [], next);
          next.bestStageProgress = normalizeBestProgress(saved.bestStageProgress, next);
          if (Number.isFinite(saved.sprintBestScore)) next.sprintBestScore = Math.max(0, Math.floor(saved.sprintBestScore));
          next.checkpoint = normalizeCheckpoint(saved.checkpoint, next);
        }
      } catch {}
      setState(next);
      stateRef.current = next;
    })();
  }, []);

  useEffect(() => {
    if (state.screen !== "game") stopSprintTimer();
  }, [state.screen, stopSprintTimer]);

  useEffect(() => {
    if (!state.soundEnabled) {
      stopAllBackgroundTracks();
      return;
    }
    if (state.screen === "game") {
      setBackgroundTrack("ambience");
      return;
    }
    if (state.screen === "splash" || state.screen === "promotion") {
      setBackgroundTrack("menuAmbience");
      return;
    }
    stopAllBackgroundTracks();
  }, [setBackgroundTrack, state.screen, state.soundEnabled, stopAllBackgroundTracks]);

  const stage = getCurrentStage(state);
  const sprintMode = isSprintMode(state);
  const sprintDrill = getSprintDrill(state);
  const missionNumber = state.qNum + 1;
  const currentReward = sprintMode
    ? state.currentQ?.reward || { label: `+${SPRINT_BASE_POINTS} Score`, type: "standard" }
    : null;
  const nextPrizeTier = sprintMode ? getNextPrizeTier(state.sprint.score) : null;
  const sprintPrizeProgress = sprintMode ? getSprintPrizeProgress(state.sprint.score) : 0;
  const earnedPrizeTiers = sprintMode ? SPRINT_PRIZE_TIERS.filter((tier) => state.sprint.score >= tier.score) : [];
  const wallet = getWallet(state);
  const qualifiedShopItems = sprintMode ? REWARD_SHOP_ITEMS.filter((item) => canAfford(wallet, item.cost)) : [];
  const immediateRewardChips = sprintMode ? getImmediateRewardChips(currentReward) : [];
  const customShowActive = hasCustomShow(state);
  const foundryAgentMode = state.provider === "foundry" && state.foundryAgentEnabled;
  const practiceMode = state.gameMode === "practice";
  const activeShowTitle = practiceMode ? `${stage.title} Practice` : customShowActive ? getCustomShowTitle(state) : stage.title;
  const customSplashCopy = customShowActive ? getCustomShowPlan(state)?.splashCopy : null;
  const customShowPlan = getCustomShowPlan(state);
  const stageChoices = (customShowActive ? customShowPlan?.stages || [] : STAGES)
    .map((choice) => ({
      ...choice,
      unlocked: state.unlockedStages.includes(choice.key),
    }));
  const splashTitle = customShowActive
    ? customSplashCopy?.title || `Rank Up in ${getCustomShowTitle(state)}`
    : "Rank Up in Agent Academy";
  const splashLead = customShowActive
    ? customSplashCopy?.description || `Answer practical questions, climb the show ladder, and sharpen what you know about ${state.customShowTopic.trim()}.`
    : "Answer practical product questions, climb the rank ladder, and sharpen the decisions you make when building real agents.";
  const homeNote = customShowActive
    ? foundryAgentMode
      ? `Questions generated by your Azure AI Foundry Agent using its configured Foundry IQ knowledge.`
      : `Questions generated with Azure AI Foundry from ${getCustomShowTitle(state)} source material.`
    : foundryAgentMode
      ? "Questions generated by your Azure AI Foundry Agent using its configured Foundry IQ knowledge."
      : "Questions generated with Azure AI Foundry from the Agent Academy curriculum topics.";

  const ladder = useMemo(() => {
    if (sprintMode) {
      return SPRINT_PRIZE_TIERS.slice(0, SPRINT_PRIZE_LADDER_COUNT).map((tier) => {
        let cls = "";
        let marker = "";
        if (state.sprint.score >= tier.score) {
          cls = "won";
          marker = "✓";
        } else if (getNextPrizeTier(state.sprint.score).score === tier.score) {
          cls = `active ${tier.accent}`;
          marker = "★";
        }
        return { key: `tier-${tier.score}`, cls: `${cls} milestone`.trim(), num: `${tier.score}${marker ? ` ${marker}` : ""}`, amount: tier.name, reward: tier.reward };
      }).reverse();
    }
    return Array.from({ length: QUESTIONS_PER_STAGE }, (_, i) => {
      let cls = "";
      let marker = "";
      if (i === state.qNum) {
        cls = "active";
        marker = "★";
      } else if (i < state.qNum) {
        cls = "won";
        marker = "✓";
      }
      if (i === QUESTIONS_PER_STAGE - 1) cls = `${cls} milestone`.trim();
      return {
        key: `m-${i}`,
        cls,
        num: `M${i + 1}${marker ? ` ${marker}` : ""}`,
        amount: `Mission ${i + 1}`,
      };
    }).reverse();
  }, [customShowActive, sprintMode, state.currentStageKey, state.customShowPlanSignature, state.qNum, state.sprint.timeLeft, state.sprint.score, state.sprint.streak, state.sprintBestScore]);

  const isFoundry = state.provider === "foundry";
  const sourceMeta = state.currentTopic
    ? customShowActive
      ? state.currentTopic.label
      : `${state.currentGrounding ? "Foundry IQ grounded" : "Source lesson"}: ${state.currentTopic.label}`
    : "";
  const statusText = sprintMode
    ? `Score ${state.sprint.score} - Streak ${state.sprint.streak} - Time ${formatTime(state.sprint.timeLeft)}`
    : `${practiceMode ? "Practice Mode - " : ""}${state.qNum} of ${QUESTIONS_PER_STAGE} cleared`;
  const savedProgress = hasSavedProgress(state);
  const modelSummary = isFoundry
    ? foundryAgentMode
      ? `Foundry Agent: ${state.foundryAgentName || "not configured"}${state.foundryAgentVersion ? ` v${state.foundryAgentVersion}` : ""}`
      : `Foundry: ${state.foundryDeployment}`
    : `Claude - ${state.model}`;

  return (
    <>
      <AppHeader
        customShowActive={customShowActive}
        showTitle={customShowActive ? getCustomShowTitle(state) : DEFAULT_SHOW_TITLE}
        onOpenSettings={() => updateState((draft) => { draft.settingsOpen = true; })}
      />

      <div id="app">
        {state.screen === "splash" && (
          <SplashScreen
            customShowActive={customShowActive}
            splashTitle={splashTitle}
            splashLead={splashLead}
            homeNote={homeNote}
            stageChoices={stageChoices}
            hasProgress={savedProgress}
            careerSummary={getCareerSummary(state)}
            bestSprintScore={state.sprintBestScore}
            modelSummary={modelSummary}
            customShowPlanning={state.customShowPlanning}
            errorMsg={state.errorMsg}
            onStartGame={startGame}
            onResumeProgress={resumeProgress}
            onStartSprint={startSprint}
            onSelectStage={selectStage}
          />
        )}

        {state.screen === "game" && (
          <QuestionScreen
            state={state}
            sprintMode={sprintMode}
            sprintDrill={sprintDrill}
            stage={stage}
            activeShowTitle={activeShowTitle}
            missionNumber={missionNumber}
            wallet={wallet}
            qualifiedShopItems={qualifiedShopItems}
            immediateRewardChips={immediateRewardChips}
            sourceMeta={sourceMeta}
            statusText={statusText}
            ladder={ladder}
            sprintPrizeProgress={sprintPrizeProgress}
            onTogglePause={toggleSprintPause}
            onWalkAway={walkAway}
            onToggleSound={toggleSound}
            onOpenShop={() => updateState((draft) => { draft.shopOpen = true; })}
            onRedeem={redeemItem}
            onRetryQuestion={loadQuestion}
            onAnswer={answer}
            onFifty={useFifty}
            onAudience={useAudience}
            onPhone={usePhone}
          />
        )}

        {state.screen === "promotion" && (
          <PromotionScreen
            currentStage={getCurrentStage(state)}
            choices={getCurrentStage(state).nextChoices.map((stageKey) => getStageByKey(state, stageKey)).filter(Boolean)}
            onChoosePromotion={choosePromotion}
            onRestart={startGame}
            onHome={goHome}
          />
        )}

        {(state.screen === "won" || state.screen === "walkaway" || state.screen === "lost" || state.screen === "sprintover") && (
          <EndScreen
            screen={state.screen}
            activeShowTitle={activeShowTitle}
            qNum={state.qNum}
            sprintScore={state.sprint.score}
            sprintBestScore={state.sprintBestScore}
            sprintNewBest={state.sprint.newBest}
            practiceMode={practiceMode}
            onPrimary={state.screen === "sprintover" ? startSprint : () => startStage(stage.key, { mode: practiceMode ? "practice" : "career" })}
            onHome={goHome}
          />
        )}

        <RewardShopModal
          open={state.shopOpen && sprintMode}
          wallet={wallet}
          qualifiedShopItems={qualifiedShopItems}
          nextPrizeTier={nextPrizeTier}
          onClose={() => updateState((draft) => { draft.shopOpen = false; })}
          onRedeem={redeemItem}
        />

        <AppGuideLauncher
          wallet={wallet}
          onOpenShop={() => updateState((draft) => { draft.shopOpen = true; })}
          onToggle={() => updateState((draft) => { draft.rewardGuideOpen = !draft.rewardGuideOpen; })}
        />
        <AppGuidePanel
          open={state.rewardGuideOpen}
          onClose={() => updateState((draft) => { draft.rewardGuideOpen = false; })}
        />

        <SettingsModal
          open={state.settingsOpen}
          state={state}
          isFoundry={isFoundry}
          updateState={updateState}
          onClose={() => updateState((draft) => { draft.settingsOpen = false; })}
          onSave={saveSettingsAndRestart}
        />
      </div>
    </>
  );
}

export default App;
