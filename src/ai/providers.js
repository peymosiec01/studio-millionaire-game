export async function callAnthropic(current, userPrompt) {
  const key = current.apiKey.trim();
  if (!key) throw new Error("No Anthropic API key provided. Please enter it in settings.");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: current.model,
      max_tokens: 800,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

async function postLocalJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let message = await res.text();
    try {
      message = JSON.parse(message).error || message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export async function callFoundry(current, userPrompt) {
  const key = current.foundryKey.trim();
  const endpoint = current.foundryOpenAiEndpoint.trim();
  const deployment = current.foundryDeployment.trim();
  if (!endpoint) throw new Error("No Azure OpenAI endpoint provided. Please enter it in settings.");
  if (!deployment) throw new Error("No deployment name provided. Please enter it in settings.");
  const data = await postLocalJson("/api/foundry/chat", {
    foundryKey: key,
    foundryOpenAiEndpoint: endpoint,
    foundryDeployment: deployment,
    prompt: userPrompt,
  });
  return data.text || "";
}

export async function callFoundryAgent(current, userPrompt) {
  const key = current.foundryKey.trim();
  const endpoint = current.foundryProjectEndpoint.trim();
  const agentName = current.foundryAgentName.trim();
  const agentVersion = current.foundryAgentVersion.trim();
  if (!endpoint) throw new Error("No Azure AI Foundry project endpoint provided. Please enter it in settings.");
  if (!agentName) throw new Error("Foundry Agent mode is enabled, but no agent name is configured.");
  const data = await postLocalJson("/api/foundry/agent", {
    foundryKey: key,
    foundryProjectEndpoint: endpoint,
    foundryAgentName: agentName,
    foundryAgentVersion: agentVersion,
    foundryAgentAutoApprove: current.foundryAgentAutoApprove,
    prompt: userPrompt,
  });
  const text = (data.text || "").trim();
  if (!text) throw new Error("The Foundry Agent returned no response text.");
  return text;
}

export function callModel(current, userPrompt) {
  if (current.provider === "foundry" && current.foundryAgentEnabled) return callFoundryAgent(current, userPrompt);
  if (current.provider === "foundry") return callFoundry(current, userPrompt);
  return callAnthropic(current, userPrompt);
}
