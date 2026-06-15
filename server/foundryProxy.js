import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const tokenCache = new Map();

function cleanConfigValue(value) {
  if (typeof value !== "string") return "";
  let normalized = value.trim();
  while (normalized.endsWith(";")) normalized = normalized.slice(0, -1).trim();
  if ((normalized.startsWith("\"") && normalized.endsWith("\"")) || (normalized.startsWith("'") && normalized.endsWith("'"))) {
    normalized = normalized.slice(1, -1).trim();
  }
  while (normalized.endsWith(";")) normalized = normalized.slice(0, -1).trim();
  return normalized;
}

export function getOpenAiBaseUrl(endpoint) {
  const trimmed = cleanConfigValue(endpoint);
  const normalized = trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
  if (normalized.includes("/openai/v1/")) return normalized;
  if (normalized.endsWith("/openai/")) return `${normalized}v1/`;
  if (normalized.includes(".services.ai.azure.com/api/projects/")) return `${normalized}openai/v1/`;
  return `${normalized}openai/v1/`;
}

function getResponseText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) return data.output_text;
  const choiceText = data?.choices?.[0]?.message?.content;
  if (typeof choiceText === "string" && choiceText.trim()) return choiceText;
  const output = Array.isArray(data?.output) ? data.output : [];
  return output
    .flatMap((item) => Array.isArray(item.content) ? item.content : [])
    .map((part) => part.text || part.content || "")
    .filter(Boolean)
    .join("\n");
}

function getMcpApprovalRequests(data) {
  return Array.isArray(data?.output)
    ? data.output.filter((item) => item?.type === "mcp_approval_request" && item.id)
    : [];
}

function getOauthConsentRequests(data) {
  return Array.isArray(data?.output)
    ? data.output.filter((item) => item?.type === "oauth_consent_request")
    : [];
}

function getOauthConsentMessage(request) {
  const serverLabel = request?.server_label || request?.attributes?.server_label || "the Foundry knowledge tool";
  const consentLink = request?.consent_link || request?.attributes?.consent_link || "";
  if (consentLink.includes("can't be found in this workspace")) {
    return `Foundry Agent reached ${serverLabel}, but that knowledge connection cannot be found in this Foundry project workspace. Remove and re-add the knowledge source on the agent, then publish a new agent version.`;
  }
  if (consentLink && !/^https?:\/\//i.test(consentLink)) {
    return `Foundry Agent requested OAuth consent for ${serverLabel}, but Foundry returned an error instead of a usable consent URL: ${consentLink}`;
  }
  return `Foundry Agent requested OAuth consent for ${serverLabel}. Open the agent in Foundry Playground and complete consent for the knowledge tool.`;
}

export function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 2_000_000) {
        reject(new Error("Request body is too large."));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });
    req.on("error", reject);
  });
}

function getAzureCliAccessToken(resource) {
  const cached = tokenCache.get(resource);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  try {
    const azCommand = getAzureCliCommand();
    const token = runAzureCliTokenCommand(azCommand, resource);
    if (!token) throw new Error("Azure CLI returned an empty access token.");
    tokenCache.set(resource, { token, expiresAt: Date.now() + 50 * 60 * 1000 });
    return token;
  } catch (error) {
    throw new Error(`Could not get an Azure access token. Run "az login" in a terminal, then retry. ${error.message}`);
  }
}

function runAzureCliTokenCommand(azCommand, resource) {
  if (process.platform === "win32") {
    const comSpec = process.env.ComSpec || "cmd.exe";
    return execFileSync(comSpec, ["/d", "/c", "call", azCommand, "account", "get-access-token", "--resource", resource, "--query", "accessToken", "-o", "tsv"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  }

  return execFileSync(azCommand, [
    "account",
    "get-access-token",
    "--resource",
    resource,
    "--query",
    "accessToken",
    "-o",
    "tsv",
  ], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function getAzureCliCommand() {
  const explicitPath = process.env.AZURE_CLI_PATH?.trim();
  if (explicitPath) return explicitPath;

  if (process.platform === "win32") {
    const candidates = [
      "C:\\Program Files (x86)\\Microsoft SDKs\\Azure\\CLI2\\wbin\\az.cmd",
      "C:\\Program Files\\Microsoft SDKs\\Azure\\CLI2\\wbin\\az.cmd",
    ];
    const installedPath = candidates.find((candidate) => existsSync(candidate));
    return installedPath || "az.cmd";
  }

  return "az";
}

async function getManagedIdentityAccessToken(resource, clientId = "") {
  const cacheKey = `managed-identity:${resource}:${clientId}`;
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  let url = "";
  const headers = {};

  if (process.env.IDENTITY_ENDPOINT && process.env.IDENTITY_HEADER) {
    url = `${process.env.IDENTITY_ENDPOINT}?api-version=2019-08-01&resource=${encodeURIComponent(resource)}`;
    headers["X-IDENTITY-HEADER"] = process.env.IDENTITY_HEADER;
    if (clientId) url += `&client_id=${encodeURIComponent(clientId)}`;
  } else {
    url = `http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=${encodeURIComponent(resource)}`;
    headers.Metadata = "true";
    if (clientId) url += `&client_id=${encodeURIComponent(clientId)}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Managed identity token request failed ${response.status}: ${await response.text()}`);
  }
  const data = await response.json();
  if (!data.access_token) throw new Error("Managed identity token response did not include an access token.");

  const expiresIn = Number(data.expires_in || 3000);
  tokenCache.set(cacheKey, {
    token: data.access_token,
    expiresAt: Date.now() + Math.max(60, expiresIn - 120) * 1000,
  });
  return data.access_token;
}

function getFoundryAuthHeaders({ key, bearerToken }) {
  if (bearerToken) {
    return { "Content-Type": "application/json", Authorization: `Bearer ${bearerToken}` };
  }
  return { "Content-Type": "application/json", "api-key": key };
}

async function postFoundryJson(url, auth, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: getFoundryAuthHeaders(auth),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    const error = new Error(`Azure AI Foundry API ${response.status}: ${text}`);
    error.status = response.status;
    error.details = text;
    throw error;
  }
  return response.json();
}

function resolveFoundryChatConfig(body, env) {
  const key = cleanConfigValue(env.AZURE_OPENAI_API_KEY || env.FOUNDRY_API_KEY || env.HARDCODED_FOUNDRY_KEY || body.foundryKey || "");
  const endpoint = cleanConfigValue(
    env.AZURE_OPENAI_ENDPOINT ||
    env.FOUNDRY_OPENAI_ENDPOINT ||
    env.DEFAULT_FOUNDRY_ENDPOINT ||
    body.foundryOpenAiEndpoint ||
    ""
  ).trim();
  return { key, endpoint };
}

function resolveFoundryAgentConfig(body, env) {
  const endpoint = cleanConfigValue(
    body.foundryProjectEndpoint ||
    env.AZURE_AI_PROJECT_ENDPOINT ||
    env.AZURE_EXISTING_AIPROJECT_ENDPOINT ||
    env.FOUNDRY_PROJECT_ENDPOINT ||
    ""
  ).trim();
  const agentVersion = cleanConfigValue(body.foundryAgentVersion || env.FOUNDRY_AGENT_VERSION || "");
  return { endpoint, agentVersion };
}

async function resolveFoundryAgentAuth(body, env) {
  const explicitToken = cleanConfigValue(body.foundryAccessToken || env.AZURE_FOUNDRY_ACCESS_TOKEN || "");
  if (explicitToken) return { bearerToken: explicitToken };

  const authMode = String(env.AZURE_FOUNDRY_AGENT_AUTH || "azure-cli").trim().toLowerCase();
  const resource = String(env.AZURE_FOUNDRY_TOKEN_RESOURCE || "https://ai.azure.com").trim();
  if (authMode === "managed-identity") {
    const clientId = String(env.AZURE_CLIENT_ID || env.MANAGED_IDENTITY_CLIENT_ID || "").trim();
    return { bearerToken: await getManagedIdentityAccessToken(resource, clientId) };
  }
  if (authMode === "azure-cli") {
    return { bearerToken: getAzureCliAccessToken(resource) };
  }

  const key = cleanConfigValue(env.AZURE_OPENAI_API_KEY || env.FOUNDRY_API_KEY || env.HARDCODED_FOUNDRY_KEY || body.foundryKey || "");
  return { key };
}

function validateFoundryAgentEndpoint(endpoint) {
  const normalized = String(endpoint || "").trim().toLowerCase();
  if (normalized.includes(".openai.azure.com")) {
    throw new Error(
      "Foundry Agent mode needs the Azure AI Foundry project endpoint copied from the project Home page, not the Azure OpenAI resource endpoint ending in .openai.azure.com/openai/v1/."
    );
  }
}

export function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

export function sendError(res, error) {
  const status = Number.isInteger(error.status) ? error.status : 500;
  sendJson(res, status, {
    error: error.message,
    details: error.details || "",
  });
}

export async function handleFoundryChat(req, res, env = process.env) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }
  try {
    const body = await readJsonBody(req);
    const { key, endpoint } = resolveFoundryChatConfig(body, env);
    const deployment = cleanConfigValue(
      env.AZURE_OPENAI_DEPLOYMENT ||
      env.FOUNDRY_DEPLOYMENT ||
      env.DEFAULT_FOUNDRY_DEPLOYMENT ||
      body.foundryDeployment ||
      ""
    ).trim();
    if (!key) throw new Error("No Azure AI Foundry API key configured.");
    if (!endpoint) throw new Error("No Azure AI Foundry endpoint configured.");
    if (!deployment) throw new Error("No Azure AI Foundry deployment configured.");

    const data = await postFoundryJson(`${getOpenAiBaseUrl(endpoint)}chat/completions`, { key }, {
      model: deployment,
      max_tokens: 800,
      store: true,
      messages: [
        { role: "developer", content: "You are a helpful assistant." },
        { role: "user", content: String(body.prompt || "") },
      ],
    });
    sendJson(res, 200, { text: data.choices?.[0]?.message?.content || "" });
  } catch (error) {
    sendError(res, error);
  }
}

export async function handleFoundryAgent(req, res, env = process.env) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }
  try {
    const body = await readJsonBody(req);
    const { endpoint, agentVersion } = resolveFoundryAgentConfig(body, env);
    const agentName = String(body.foundryAgentName || env.FOUNDRY_AGENT_NAME || "").trim();
    if (!endpoint) throw new Error("No Azure AI Foundry project endpoint configured.");
    if (!agentName) throw new Error("No Azure AI Foundry agent name configured.");
    validateFoundryAgentEndpoint(endpoint);

    const auth = await resolveFoundryAgentAuth(body, env);
    const baseUrl = getOpenAiBaseUrl(endpoint);
    const agentReference = { name: agentName, type: "agent_reference" };
    if (agentVersion) agentReference.version = agentVersion;
    const autoApprove = body.foundryAgentAutoApprove !== false;

    const conversation = await postFoundryJson(`${baseUrl}conversations`, auth, { items: [] });
    const conversationId = conversation.id;
    if (!conversationId) throw new Error("Azure AI Foundry did not return a conversation id.");

    await postFoundryJson(`${baseUrl}conversations/${encodeURIComponent(conversationId)}/items`, auth, {
      items: [{ type: "message", role: "user", content: String(body.prompt || "") }],
    });

    let response = await postFoundryJson(`${baseUrl}responses`, auth, {
      conversation: conversationId,
      input: "",
      agent_reference: agentReference,
    });

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const oauthConsentRequests = getOauthConsentRequests(response);
      if (oauthConsentRequests.length) throw new Error(getOauthConsentMessage(oauthConsentRequests[0]));

      const approvals = getMcpApprovalRequests(response);
      if (!approvals.length) break;
      if (!autoApprove) {
        throw new Error(`The Foundry Agent requested MCP tool approval in conversation ${conversationId}. Enable auto-approval in settings or approve the tool in Foundry.`);
      }

      await postFoundryJson(`${baseUrl}conversations/${encodeURIComponent(conversationId)}/items`, auth, {
        items: approvals.map((approval) => ({
          type: "mcp_approval_response",
          approval_request_id: approval.id,
          approve: true,
        })),
      });

      response = await postFoundryJson(`${baseUrl}responses`, auth, {
        conversation: conversationId,
        input: "",
        agent_reference: agentReference,
      });
    }

    const oauthConsentRequests = getOauthConsentRequests(response);
    if (oauthConsentRequests.length) throw new Error(getOauthConsentMessage(oauthConsentRequests[0]));

    if (getMcpApprovalRequests(response).length) {
      throw new Error(`The Foundry Agent still needs MCP approval after retries in conversation ${conversationId}. Complete consent in Foundry Playground or change the knowledge tool permissions.`);
    }

    const text = getResponseText(response).trim();
    if (!text) throw new Error("The Foundry Agent returned no response text.");
    sendJson(res, 200, { text });
  } catch (error) {
    sendError(res, error);
  }
}
