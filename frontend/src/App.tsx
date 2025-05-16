import { useContext } from "react";
import "./App.css";
import { TokenContext } from "./main";

function App() {
  const token = useContext(TokenContext);

  return <>{token}</>;
}

export default App;
