import OpenAI from "openai";
import { client } from "../lib/honoClient";
import { useContext } from "react";
import { AuthContext, OpenAiContext } from ".";

export function OpenAiProvider({ children }: { children: React.ReactNode }) {
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
