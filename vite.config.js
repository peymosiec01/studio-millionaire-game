import { defineConfig, loadEnv } from "vite";

import { handleFoundryAgent, handleFoundryChat } from "./server/foundryProxy.js";

function foundryProxyPlugin(env) {
  return {
    name: "studio-millionaire-foundry-proxy",
    configureServer(server) {
      server.middlewares.use("/api/foundry/chat", (req, res) => {
        handleFoundryChat(req, res, env);
      });
      server.middlewares.use("/api/foundry/agent", (req, res) => {
        handleFoundryAgent(req, res, env);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [foundryProxyPlugin(env)],
  };
});
