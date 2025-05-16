function Login({ setToken }: { setToken: (token: string) => void }) {
  return <button onClick={() => setToken("booyah")}>Login</button>;
}

export default Login;
