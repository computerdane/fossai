import { useContext, useEffect, useState } from "react";
import Login from "../Login";
import { EnvContext, AuthContext, type AuthContextType } from ".";
import { useMutation } from "@tanstack/react-query";
import { refresh } from "../api/mutations";
import { getMe } from "../api/queries";
import Spinner from "../components/Spinner";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const env = useContext(EnvContext);
  const [token, setToken] = useState<string>(null!);
  const [headers, setHeaders] = useState<Record<string, string>>(null!);
  const [me, setMe] = useState<AuthContextType["me"]>(null!);

  const { mutate: tryRefresh, isPending } = useMutation({
    mutationFn: refresh,
    onSuccess(data) {
      setToken(data.token);
    },
  });

  useEffect(() => {
    if (!env.DISABLE_AUTH) {
      tryRefresh();
    }
  }, [env.DISABLE_AUTH, tryRefresh]);

  useEffect(() => {
    if (token) {
      setHeaders({ Authorization: `Bearer ${token}` });
    }
  }, [token]);

  useEffect(() => {
    if (headers) {
      getMe(headers).then(setMe);
    }
  }, [headers]);

  if (!env.DISABLE_AUTH && isPending) {
    return <Spinner />;
  }

  if (!env.DISABLE_AUTH && !token) {
    return <Login setToken={setToken} />;
  }

  if (!me) {
    return <Spinner />;
  }

  return (
    <AuthContext.Provider value={{ me, token, headers }}>
      {children}
    </AuthContext.Provider>
  );
}
