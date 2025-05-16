import { useContext } from "react";
import "./App.css";
import { TokenContext } from "./main";
import { Text } from "@radix-ui/themes";

function App() {
  const token = useContext(TokenContext);

  return <Text>{token}</Text>;
}

export default App;
