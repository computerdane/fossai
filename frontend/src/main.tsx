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

const url = "http://localhost:3000";
const defaultHonoContext = hc<AppType>(url);
export const HonoContext = createContext(defaultHonoContext);

export const EnvContext = createContext<ClientEnvType>(null!);
function EnvProvider({ children }: { children: React.ReactNode }) {
  const [env, setEnv] = useState<ClientEnvType>();
  const client = useContext(HonoContext);
  useEffect(() => {
    if (!env) {
      (async () => {
        const res = await client.env.$get();
        if (res.ok) {
          const data = await res.json();
          document.title = data.SITE_TITLE;
          setEnv(data);
        }
      })();
    }
  }, []);
  if (!env) return <>Loading...</>;
  return <EnvContext.Provider value={env}>{children}</EnvContext.Provider>;
}

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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Theme accentColor="gray" appearance="dark">
      <HonoContext.Provider value={defaultHonoContext}>
        <EnvProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<App />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </EnvProvider>
      </HonoContext.Provider>
    </Theme>
  </StrictMode>,
);
