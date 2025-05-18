import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./index.css";
import App from "./App.tsx";
import { client } from "./lib/honoClient.ts";
import { BrowserRouter, Route, Routes } from "react-router";
import {
  EnvProvider,
  AuthProvider,
  OpenAiProvider,
  AppProvider,
} from "./context";

// Fetch env eagerly before rendering
const env = await (await client.env.$get()).json();
document.title = env.SITE_TITLE;

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Theme accentColor="gray" appearance="dark">
      <EnvProvider env={env}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {["/", "/c/:chatId"].map((path) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <OpenAiProvider>
                        <AppProvider>
                          <App />
                        </AppProvider>
                      </OpenAiProvider>
                    }
                  />
                ))}
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </QueryClientProvider>
      </EnvProvider>
    </Theme>
  </StrictMode>
);
