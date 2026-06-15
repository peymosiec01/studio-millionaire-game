import React from "react";

import { DEFAULT_SHOW_TITLE } from "../constants";
import { getCustomShowTitle } from "../domain/customShow";

export function SettingsModal({
  state,
  isFoundry,
  open,
  onClose,
  onSave,
  updateState,
}) {
  if (!open) return null;

  const customShowConfigured = state.customShowEnabled && state.customShowTopic.trim();

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <aside className="settings-nav" aria-label="Settings sections">
          <button
            type="button"
            className={`settings-nav-item ${state.settingsTab === "model" ? "active" : ""}`}
            onClick={() => updateState((draft) => { draft.settingsTab = "model"; })}
          >
            Model provider
          </button>
          <button
            type="button"
            className={`settings-nav-item ${state.settingsTab === "show" ? "active" : ""}`}
            onClick={() => updateState((draft) => { draft.settingsTab = "show"; })}
          >
            Show
          </button>
        </aside>
        <div className="settings-content">
          <div className="settings-head">
            <div>
              <h2>{state.settingsTab === "show" ? "Show" : "Model provider"}</h2>
              <p>{state.settingsTab === "show" ? "Choose the learning show used by Career and Drill Sprint." : "Choose your model provider and credentials."}</p>
            </div>
            <button className="settings-close" onClick={onClose}>X</button>
          </div>

          <div className="settings-body">
            <div className="settings-reset-notice">
              Saving settings restarts the game, stops any active round, clears saved career progress, and regenerates custom show structure when needed.
            </div>

            {state.settingsTab === "model" && (
              <section className="settings-section">
                <div className="settings-section-head">
                  <span>Model Provider & Credentials</span>
                  <small>{isFoundry ? "Azure AI Foundry" : "Anthropic"}</small>
                </div>
                <div className="provider-toggle">
                  <button className={`provider-tab ${!isFoundry ? "active-anthropic" : ""}`} onClick={() => updateState((draft) => { draft.provider = "anthropic"; }, true)}>Anthropic (Claude)</button>
                  <button className={`provider-tab ${isFoundry ? "active-openai" : ""}`} onClick={() => updateState((draft) => { draft.provider = "foundry"; }, true)}>Microsoft Foundry</button>
                </div>
                {!isFoundry && (
                  <div className="api-key-section">
                    <label htmlFor="apiKeyInput">Anthropic API Key</label>
                    <input id="apiKeyInput" type="password" value={state.apiKey} onChange={(e) => updateState((draft) => { draft.apiKey = e.target.value; })} />
                    <label htmlFor="modelSelect" style={{ marginTop: 4 }}>Model</label>
                    <select id="modelSelect" className="model-select" value={state.model} onChange={(e) => updateState((draft) => { draft.model = e.target.value; })}>
                      <option value="claude-sonnet-4-20250514">Claude Sonnet 4 (recommended)</option>
                      <option value="claude-opus-4-5">Claude Opus 4.5</option>
                      <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 (fastest)</option>
                    </select>
                  </div>
                )}
                {isFoundry && (
                  <div className="api-key-section">
                    <label htmlFor="foundryPathSelect">Foundry path</label>
                    <select
                      id="foundryPathSelect"
                      className="model-select"
                      value={state.foundryAgentEnabled ? "agent" : "direct"}
                      onChange={(e) =>
                        updateState((draft) => {
                          draft.foundryAgentEnabled = e.target.value === "agent";
                        }, true)
                      }
                    >
                      <option value="direct">Azure OpenAI API Key</option>
                      <option value="agent">Foundry Agent with Foundry IQ</option>
                    </select>

                    {state.foundryAgentEnabled && (
                      <>
                        <label htmlFor="foundryProjectEndpointInput" style={{ marginTop: 4 }}>
                          Foundry Project Endpoint
                        </label>
                        <input
                          id="foundryProjectEndpointInput"
                          type="text"
                          value={state.foundryProjectEndpoint}
                          placeholder="https://res-jsaibuildathon.services.ai.azure.com/api/projects/jsaibuildathon"
                          onChange={(e) =>
                            updateState((draft) => {
                              draft.foundryProjectEndpoint = e.target.value;
                            })
                          }
                        />

                        <label htmlFor="foundryAgentNameInput" style={{ marginTop: 4 }}>
                          Foundry Agent Name
                        </label>
                        <input
                          id="foundryAgentNameInput"
                          type="text"
                          value={state.foundryAgentName}
                          placeholder="StudioMillionaireAgent"
                          onChange={(e) =>
                            updateState((draft) => {
                              draft.foundryAgentName = e.target.value;
                            })
                          }
                        />

                        <label htmlFor="foundryAgentAutoApproveInput" className="settings-checkbox-row">
                          <input
                            id="foundryAgentAutoApproveInput"
                            type="checkbox"
                            checked={state.foundryAgentAutoApprove}
                            onChange={(e) =>
                              updateState((draft) => {
                                draft.foundryAgentAutoApprove = e.target.checked;
                              }, true)
                            }
                          />
                          Auto-approve Foundry IQ tool requests during gameplay
                        </label>

                        <div className="hint">
                          The app uses the latest published version of this agent unless FOUNDRY_AGENT_VERSION is set on the backend. Paste the project endpoint, not the Azure OpenAI endpoint ending in .openai.azure.com/openai/v1/.
                        </div>
                      </>
                    )}

                    {!state.foundryAgentEnabled && (
                      <>
                        <label htmlFor="foundryKeyInput">Azure OpenAI API Key override</label>
                        <input
                          id="foundryKeyInput"
                          type="password"
                          autoComplete="off"
                          spellCheck="false"
                          value={state.foundryKey}
                          placeholder="Configured securely on the server"
                          onChange={(e) =>
                            updateState((draft) => {
                              draft.foundryKey = e.target.value;
                            })
                          }
                        />

                        <label htmlFor="foundryOpenAiEndpointInput" style={{ marginTop: 4 }}>
                          Azure OpenAI Endpoint
                        </label>
                        <input
                          id="foundryOpenAiEndpointInput"
                          type="text"
                          value={state.foundryOpenAiEndpoint}
                          placeholder="https://res-jsaibuildathon.openai.azure.com/openai/v1"
                          onChange={(e) =>
                            updateState((draft) => {
                              draft.foundryOpenAiEndpoint = e.target.value;
                            })
                          }
                        />

                        <label htmlFor="foundryDeploymentInput" style={{ marginTop: 4 }}>
                          Deployment Name
                        </label>
                        <input
                          id="foundryDeploymentInput"
                          type="text"
                          value={state.foundryDeployment}
                          onChange={(e) =>
                            updateState((draft) => {
                              draft.foundryDeployment = e.target.value;
                            })
                          }
                        />

                        <div className="hint">
                          Direct model mode uses the Azure OpenAI endpoint and deployment name. Leave the key blank to use the server-side Azure App Setting; keys typed here are only for local testing.
                        </div>
                      </>
                    )}

                  </div>
                )}
              </section>
            )}

            {state.settingsTab === "show" && (
              <section className="settings-section">
                <div className="settings-section-head">
                  <span>Show</span>
                  <small>{customShowConfigured ? "Custom show active" : "Default show"}</small>
                </div>
                <div className="api-key-section custom-show-section">
                  <label htmlFor="showPathSelect">Show path</label>
                  <select
                    id="showPathSelect"
                    className="model-select"
                    value={state.customShowEnabled ? "custom" : "default"}
                    onChange={(e) =>
                      updateState((draft) => {
                        draft.customShowEnabled = e.target.value === "custom";
                      }, true)
                    }
                  >
                    <option value="default">Default Copilot Studio show</option>
                    <option value="custom">Custom show from my topic/source</option>
                  </select>

                  {!state.customShowEnabled && (
                    <div className="hint">
                      Career and Drill Sprint use the built-in Copilot Studio and Agent Academy show structure.
                    </div>
                  )}

                  {state.customShowEnabled && (
                    <>
                      <label htmlFor="customShowTitleInput">Show Title</label>
                      <input
                        id="customShowTitleInput"
                        type="text"
                        value={state.customShowTitle}
                        placeholder="Studio Millionaire: Learn Anything"
                        onChange={(e) => updateState((draft) => { draft.customShowTitle = e.target.value; })}
                      />
                      <label htmlFor="customShowTopicInput">Topic</label>
                      <input
                        id="customShowTopicInput"
                        type="text"
                        value={state.customShowTopic}
                        placeholder="e.g. Power Platform licensing, Nigerian history, my exam notes"
                        onChange={(e) => updateState((draft) => { draft.customShowTopic = e.target.value; })}
                      />
                      <label htmlFor="customShowSourceInput">Source Material</label>
                      <textarea
                        id="customShowSourceInput"
                        value={state.customShowSource}
                        placeholder="Paste study notes, website text, a PDF excerpt, or any material you want the game to teach from."
                        onChange={(e) => updateState((draft) => { draft.customShowSource = e.target.value; })}
                      />
                      <div className="hint">Career and Drill Sprint generate from this custom show when a topic is provided.</div>
                    </>
                  )}
                </div>
                <div className="default-show-card">
                  <strong>{customShowConfigured ? getCustomShowTitle(state) : DEFAULT_SHOW_TITLE}</strong>
                  <span>
                    {customShowConfigured
                      ? `Custom structure: Foundations, Core Skills, Applied Scenarios, and Exam Readiness for ${state.customShowTopic}.`
                      : "Default game show for Copilot Studio and Agent Academy practice."}
                  </span>
                </div>
              </section>
            )}
          </div>

          <div className="settings-actions">
            <button className="secondary-btn" onClick={onClose}>Cancel</button>
            <button className="cta-btn" style={{ padding: "0.75rem 1.4rem", fontSize: 14 }} onClick={onSave}>Save Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
}
