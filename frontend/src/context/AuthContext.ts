import { createContext } from "react";

export const AuthContext = createContext<{
  token: string;
  headers: Record<string, string>;
}>(null!);