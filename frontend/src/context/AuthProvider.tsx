import { useContext, useState } from "react";
import Login from "../Login";
import { EnvContext, AuthContext } from ".";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const env = useContext(EnvContext);
  const [token, setToken] = useState<string>(null!);

  if (!env.DISABLE_AUTH && !token) {
    return <Login setToken={setToken} />;
  }

  return (
    <AuthContext.Provider
      value={{ token, headers: { Authorization: `Bearer ${token}` } }}
    >
      {children}
    </AuthContext.Provider>
  );
}
