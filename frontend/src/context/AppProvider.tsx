import { useContext, useEffect, useState } from "react";
import { OpenAiContext, EnvContext, AppContext } from ".";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const openai = useContext(OpenAiContext);
  const env = useContext(EnvContext);
  const [models, setModels] = useState<string[]>(null!);

  useEffect(() => {
    (async () => {
      const modelList: string[] = [];
      for await (const model of openai.models.list()) {
        if (new RegExp(env.CHAT_MODELS_FILTER_REGEX).test(model.id)) {
          modelList.push(model.id);
        }
      }
      modelList.sort();
      setModels(modelList);
    })();
  }, [env.CHAT_MODELS_FILTER_REGEX, openai.models]);

  if (!models) return <>Loading...</>;

  return (
    <AppContext.Provider value={{ models }}>{children}</AppContext.Provider>
  );
}
