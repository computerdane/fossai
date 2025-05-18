import { useContext, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Login from "../Login";
import { EnvContext, AuthContext } from ".";
import { refresh } from "../api/mutations";
import Spinner from "../components/Spinner";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const env = useContext(EnvContext);
  const [token, setToken] = useState<string>();

  const { mutate: tryRefresh, isPending } = useMutation({
    mutationFn: refresh,
    onSuccess: (data) => {
      setToken(data.token);
    },
  });

  useEffect(() => {
    if (!env.DISABLE_AUTH) {
      tryRefresh();
    }
  }, [env.DISABLE_AUTH, tryRefresh]);

  if (!env.DISABLE_AUTH && isPending) {
    return <Spinner />;
  }

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
