# Studio Millionaire Azure Deployment

This runbook documents the working deployment path for the current app:

```text
React/Vite frontend + Node server.js backend proxy -> Azure App Service
```

The app must run as a Node web app, not as a static-only site, because the Foundry proxy routes run server-side:

```text
/api/foundry/agent
/api/foundry/chat
```

## Target Azure Resources

```text
Subscription: Azure for Students
Subscription ID: 296a1f10-9e40-4b06-87db-bdf3572b1886
Tenant ID: 653bc138-3d5b-4555-b9d4-5e3c2bacb491
Resource group: rg-jsaibuildathon
Region: spaincentral
App Service: wwbcm
Live URL: https://wwbcm.azurewebsites.net
Foundry project endpoint: https://res-jsaibuildathon.services.ai.azure.com/api/projects/jsaibuildathon
Azure OpenAI endpoint: https://res-jsaibuildathon.openai.azure.com/openai/v1
Foundry Agent: StudioMillionaireAgent
```

## 1. Sign In With MFA

Azure may block write operations unless the CLI session satisfies MFA claims.

```powershell
az logout
az login --tenant "653bc138-3d5b-4555-b9d4-5e3c2bacb491" --scope "https://management.core.windows.net//.default" --claims-challenge "eyJhY2Nlc3NfdG9rZW4iOnsiYWNycyI6eyJlc3NlbnRpYWwiOnRydWUsInZhbHVlcyI6WyJwMSJdfX19"
az account set --subscription 296a1f10-9e40-4b06-87db-bdf3572b1886
az account show --query "{name:name,id:id,tenantId:tenantId,user:user.name}" -o json
```

## 2. Build Locally

```powershell
npm install
npm.cmd run build
```

## 3. Configure Existing App Service For Node

The existing App Service `wwbcm` was previously PHP. Set it to Node 22 and use `npm start`.

Use `az rest` with a JSON file because the `NODE|22-lts` value contains a pipe character, which is easy to break in PowerShell.

Create `.deploy-siteconfig.json`:

```json
{
  "properties": {
    "linuxFxVersion": "NODE|22-lts",
    "appCommandLine": "npm start"
  }
}
```

Apply it:

```powershell
az rest --method PATCH --uri "https://management.azure.com/subscriptions/296a1f10-9e40-4b06-87db-bdf3572b1886/resourceGroups/rg-jsaibuildathon/providers/Microsoft.Web/sites/wwbcm/config/web?api-version=2022-03-01" --body '@.deploy-siteconfig.json' -o json
```

## 4. Enable Managed Identity

```powershell
az webapp identity assign --name wwbcm --resource-group rg-jsaibuildathon -o json
```

Record the returned `principalId`. The working deployment used:

```text
055df421-aedd-4df3-8091-4f3940b5bd28
```

For a new App Service, replace that value in the RBAC commands below with the new `principalId`.

## 5. Set Production App Settings

```powershell
az webapp config appsettings set --name wwbcm --resource-group rg-jsaibuildathon --settings AZURE_FOUNDRY_AGENT_AUTH=managed-identity AZURE_AI_PROJECT_ENDPOINT=https://res-jsaibuildathon.services.ai.azure.com/api/projects/jsaibuildathon AZURE_OPENAI_ENDPOINT=https://res-jsaibuildathon.openai.azure.com/openai/v1 AZURE_OPENAI_DEPLOYMENT=gpt-4.1-mini FOUNDRY_AGENT_NAME=StudioMillionaireAgent FOUNDRY_AGENT_VERSION= AZURE_FOUNDRY_TOKEN_RESOURCE=https://ai.azure.com VITE_AZURE_AI_PROJECT_ENDPOINT=https://res-jsaibuildathon.services.ai.azure.com/api/projects/jsaibuildathon VITE_AZURE_OPENAI_ENDPOINT=https://res-jsaibuildathon.openai.azure.com/openai/v1 VITE_AZURE_OPENAI_DEPLOYMENT=gpt-4.1-mini VITE_FOUNDRY_AGENT_ENABLED=true VITE_FOUNDRY_AGENT_NAME=StudioMillionaireAgent VITE_FOUNDRY_AGENT_VERSION= VITE_FOUNDRY_AGENT_AUTO_APPROVE=true -o json
```

The app is prebuilt locally, so disable remote Oryx build:

```powershell
az webapp config appsettings set --name wwbcm --resource-group rg-jsaibuildathon --settings SCM_DO_BUILD_DURING_DEPLOYMENT=false ENABLE_ORYX_BUILD=false -o json
```

## 6. Assign Foundry Access To Managed Identity

Use the App Service managed identity `principalId`.

```powershell
az role assignment create --assignee 055df421-aedd-4df3-8091-4f3940b5bd28 --role "Azure AI Developer" --scope "/subscriptions/296a1f10-9e40-4b06-87db-bdf3572b1886/resourceGroups/rg-jsaibuildathon/providers/Microsoft.CognitiveServices/accounts/res-jsaibuildathon/projects/jsaibuildathon" -o json
```

```powershell
az role assignment create --assignee 055df421-aedd-4df3-8091-4f3940b5bd28 --role "Cognitive Services OpenAI User" --scope "/subscriptions/296a1f10-9e40-4b06-87db-bdf3572b1886/resourceGroups/rg-jsaibuildathon/providers/Microsoft.CognitiveServices/accounts/res-jsaibuildathon" -o json
```

## 7. Create A Linux-Friendly Zip Package

Use `tar`, not PowerShell `Compress-Archive`.

`Compress-Archive` can create ZIP entries with Windows backslashes, which Linux App Service Kudu cannot deploy cleanly.

```powershell
Remove-Item -LiteralPath .deploy-wwbcm.zip -Force -ErrorAction SilentlyContinue
tar -a -c -f .deploy-wwbcm.zip dist server server.js package.json package-lock.json
```

## 8. Deploy The Zip

```powershell
az webapp deployment source config-zip --name wwbcm --resource-group rg-jsaibuildathon --src .deploy-wwbcm.zip -o json
```

If the command times out locally, check the deployment status before retrying:

```powershell
az webapp log deployment show --name wwbcm --resource-group rg-jsaibuildathon -o json
```

A successful deployment includes:

```text
Deployment successful. deployer = Push-Deployer deploymentPath = ZipDeploy. Extract zip.
```

## 9. Verify

```powershell
az webapp show --name wwbcm --resource-group rg-jsaibuildathon --query "{host:defaultHostName,state:state,linuxFxVersion:siteConfig.linuxFxVersion,startup:siteConfig.appCommandLine,identity:identity.type}" -o json
```

Expected values:

```text
host: wwbcm.azurewebsites.net
state: Running
linuxFxVersion: NODE|22-lts
startup: npm start
identity: SystemAssigned
```

Check the live site:

```powershell
(Invoke-WebRequest -Uri "https://wwbcm.azurewebsites.net" -UseBasicParsing -TimeoutSec 60).StatusCode
```

Expected:

```text
200
```

## 10. Clean Up Local Deployment Files

```powershell
Remove-Item -LiteralPath .deploy-wwbcm.zip -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath .deploy-siteconfig.json -Force -ErrorAction SilentlyContinue
```

## Auth Model In Production

```text
Player browser -> App Service backend
App Service managed identity -> Azure AI Foundry Agent
Foundry Agent -> Foundry IQ/Search using API/custom keys stored in Foundry project connections
```

The public players do not need `az login`.

The App Service managed identity authenticates to Foundry.

The Foundry Agent uses the existing Foundry project connections:

```text
Search connection: smjsaibuildathonqtw5k9
Knowledge MCP connection: kb-kb-studiomillionair-tw5k9
```
