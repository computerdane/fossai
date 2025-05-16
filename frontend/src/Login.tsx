import { useContext } from "react";
import { HonoContext } from "./main";

function Login({ setToken }: { setToken: (token: string) => void }) {
  const client = useContext(HonoContext);

  async function login() {
    const res = await client.login.$post({
      json: { email: "dane@computerdane.net" },
    });
    if (res.ok) {
      const { token } = await res.json();
      setToken(token);
    }
  }

  return <button onClick={login}>Login</button>;
}

export default Login;
