Current preferred files already wired in app.js:

- mus_mainMenu.webm        (menu/splash loop)
- mus_questionBed_1_5.webm (question gameplay loop)
- final_answer.ogg         (lock-in/start/lifeline cue)
- win.ogg                  (correct + stage clear)
- lose.ogg                 (wrong + fail)
- mus_end.webm             (walk away cue)

Optional legacy fallback names (if present they are used as backup):

- ambience-loop.mp3
- start.mp3
- lifeline.mp3
- lockin.mp3
- correct.mp3
- wrong.mp3
- walkaway.mp3
- win.mp3
- fail.mp3

Notes:
- The app tries preferred files first, then fallback names, then synthetic tones.
- Keep loop tracks cleanly trimmed for better seamless playback.
