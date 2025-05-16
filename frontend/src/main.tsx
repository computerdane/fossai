import { createContext, StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import Login from "./Login.tsx";
import { hc } from "hono/client";
import type { AppType } from "@fossai/backend";

export const TokenContext = createContext<string>("");

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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HonoContext.Provider value={defaultHonoContext}>
      <TokenProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
          </Routes>
        </BrowserRouter>
      </TokenProvider>
    </HonoContext.Provider>
  </StrictMode>,
);
