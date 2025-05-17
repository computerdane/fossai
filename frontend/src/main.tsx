import {
  createContext,
  StrictMode,
  useContext,
  useEffect,
  useState,
} from "react";
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

export const AuthContext = createContext<{
  token: string;
  headers: Record<string, string>;
}>(null!);
function AuthProvider({ children }: { children: React.ReactNode }) {
  const env = useContext(EnvContext);
  const [token, setToken] = useState<string>(null!);

  if (!env.DISABLE_AUTH && !token) return <Login setToken={setToken} />;
  return (
    <AuthContext.Provider
      value={{ token, headers: { Authorization: `Bearer ${token}` } }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const OpenAiContext = createContext<OpenAI>(null!);
function OpenAiContextProvider({ children }: { children: React.ReactNode }) {
  const { token } = useContext(AuthContext);
  const openai = new OpenAI({
    baseURL: client.api.openai[":path{.+}"]
      .$url({ param: { path: "" } })
      .toString(),
    apiKey: token,
    dangerouslyAllowBrowser: true,
  });
  return (
    <OpenAiContext.Provider value={openai}>{children}</OpenAiContext.Provider>
  );
}

export const AppContext = createContext<{ models: string[] }>(null!);
function AppContextProvider({ children }: { children: React.ReactNode }) {
  const openai = useContext(OpenAiContext);
  const [models, setModels] = useState<string[]>(null!);
  useEffect(() => {
    (async () => {
      let modelList: string[] = [];
      for await (const model of openai.models.list()) {
        if (new RegExp(env.CHAT_MODELS_FILTER_REGEX).test(model.id)) {
          modelList.push(model.id);
        }
      }
      modelList.sort();
      setModels(modelList);
    })();
  }, []);
  if (!models) return "Loading...";
  return (
    <AppContext.Provider value={{ models }}>{children}</AppContext.Provider>
  );
}

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
                      <OpenAiContextProvider>
                        <AppContextProvider>
                          <App />
                        </AppContextProvider>
                      </OpenAiContextProvider>
                    }
                  />
                  <Route
                    path="/c/:chatId"
                    element={
                      <OpenAiContextProvider>
                        <AppContextProvider>
                          <App />
                        </AppContextProvider>
                      </OpenAiContextProvider>
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
