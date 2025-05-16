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

export const TokenContext = createContext<string>(null!);
function TokenProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string>();
  if (!token) return <Login setToken={setToken} />;
  return (
    <TokenContext.Provider value={token}>{children}</TokenContext.Provider>
  );
}

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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Theme accentColor="iris" appearance="dark">
      <HonoContext.Provider value={defaultHonoContext}>
        <EnvProvider>
          <TokenProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<App />} />
              </Routes>
            </BrowserRouter>
          </TokenProvider>
        </EnvProvider>
      </HonoContext.Provider>
    </Theme>
  </StrictMode>,
);
