import type OpenAI from "openai";
import { createContext } from "react";

export const OpenAiContext = createContext<OpenAI>(null!);
