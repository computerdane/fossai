import { createContext } from "react";
import type { getMe } from "../api/queries";

export type AuthContextType = {
  token: string;
  headers: Record<string, string>;
  me: Awaited<ReturnType<typeof getMe>>;
};

export const AuthContext = createContext<AuthContextType>(null!);
