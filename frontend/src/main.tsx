import { createContext, StrictMode, useContext, useState } from "react";
import { createRoot } from "react-dom/client";
import "@radix-ui/themes/styles.css";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import Login from "./Login.tsx";
import { hc } from "hono/client";
import type { AppType, ClientEnvType } from "@fossai/backend";
import { Theme } from "@radix-ui/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OpenAI from "openai";

const url = "http://localhost:3000";
const client = hc<AppType>(url);
export const HonoContext = createContext(client);

const env = await (await client.env.$get()).json();
export const EnvContext = createContext<ClientEnvType>(env);

export const AuthContext = createContext<{ headers: Record<string, string> }>(
  null!,
);
function AuthProvider({ children }: { children: React.ReactNode }) {
  const env = useContext(EnvContext);
  const [token, setToken] = useState<string>();

  if (!env.DISABLE_AUTH && !token) return <Login setToken={setToken} />;
  return (
    <AuthContext.Provider
      value={{ headers: { Authorization: `Bearer ${token}` } }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const openai = new OpenAI({
  baseURL: client.api.openai[":path{.+}"]
    .$url({ param: { path: "" } })
    .toString(),
  apiKey: "",
  dangerouslyAllowBrowser: true,
});
export const OpenaiContext = createContext(openai);

const me = await (await client.api.me.$get()).json();
let models = [];
for await (const model of openai.models.list()) {
  if (new RegExp(env.CHAT_MODELS_FILTER_REGEX).test(model.id)) {
    models.push(model.id);
  }
}
models.sort();
const appContext = { me, models };

export const AppContext = createContext(appContext);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Theme accentColor="gray" appearance="dark">
      <HonoContext.Provider value={client}>
        <EnvContext.Provider value={env}>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <BrowserRouter>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <AppContext.Provider value={appContext}>
                        <OpenaiContext.Provider value={openai}>
                          <App />
                        </OpenaiContext.Provider>
                      </AppContext.Provider>
                    }
                  />
                </Routes>
              </BrowserRouter>
            </QueryClientProvider>
          </AuthProvider>
        </EnvContext.Provider>
      </HonoContext.Provider>
    </Theme>
  </StrictMode>,
);
