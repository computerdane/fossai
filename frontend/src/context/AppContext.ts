import { createContext } from "react";

export const AppContext = createContext<{ models: string[] }>(null!);
