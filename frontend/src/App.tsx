import { useContext, useEffect, useState } from "react";
import "./App.css";
import { HonoContext, AuthContext } from "./main";
import { Text } from "@radix-ui/themes";

function App() {
  const { headers } = useContext(AuthContext);
  const client = useContext(HonoContext);

  const [text, setText] = useState("");

  useEffect(() => {
    client.api.ping
      .$get({}, { headers })
      .then(async (res) => setText(await res.text()));
  }, []);

  return <Text>{text}</Text>;
}

export default App;
