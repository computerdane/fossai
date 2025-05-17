import "./App.css";
import {
  Box,
  Flex,
  IconButton,
  ScrollArea,
  Select,
  TextField,
  Tooltip,
} from "@radix-ui/themes";
import { MagnifyingGlassIcon, Pencil2Icon } from "@radix-ui/react-icons";
import { useContext, useState } from "react";
import { AuthContext, HonoContext, AppContext } from "./main";
import MessageBubble from "./components/Message";
import { useQuery } from "@tanstack/react-query";
import MessageInput from "./components/MessageInput";

function App() {
  const { models } = useContext(AppContext);
  const client = useContext(HonoContext);
  const { headers } = useContext(AuthContext);

  const [model, setModel] = useState(models[0]);

  const { error: chatsError, data: chats } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const res = await client.api.chats.$get({}, { headers });
      return await res.json();
    },
  });

  return (
    <Flex className="h-dvh">
      <Flex direction="column" className="w-xs min-w-xs max-w-xs" p="1" gap="1">
        <Flex gap="1">
          <TextField.Root
            placeholder="Search chats..."
            variant="soft"
            radius="full"
            className="grow"
          >
            <TextField.Slot>
              <MagnifyingGlassIcon />
            </TextField.Slot>
          </TextField.Root>
          <Tooltip content="New chat">
            <IconButton variant="soft">
              <Pencil2Icon />
            </IconButton>
          </Tooltip>
        </Flex>
      </Flex>
      <Flex direction="column" flexGrow="1" p="1">
        <Box className="chat-area mb-1">
          <Select.Root value={model} onValueChange={setModel}>
            <Select.Trigger variant="soft" />
            <Select.Content position="popper">
              {models?.map((model) => (
                <Select.Item key={model} value={model}>
                  {model}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Box>
        <ScrollArea className="grow" size="2">
          <Flex direction="column" gap="4" p="4" className="chat-area">
            <MessageBubble
              message={{ role: "user", content: "what up" }}
              float="right"
            ></MessageBubble>
            <MessageBubble
              message={{
                role: "assistant",
                model: "gpt-4",
                content:
                  "what upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat up",
              }}
              float="left"
            ></MessageBubble>
            <MessageBubble
              message={{ role: "user", content: "what up" }}
              float="right"
            ></MessageBubble>
            <MessageBubble
              message={{
                role: "assistant",
                model: "gpt-4",
                content: "eeeeeeee",
              }}
              float="left"
            ></MessageBubble>
            <MessageBubble
              message={{ role: "user", content: "what up" }}
              float="right"
            ></MessageBubble>
            <MessageBubble
              message={{
                role: "assistant",
                model: "gpt-4",
                content:
                  "what upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat up",
              }}
              float="left"
            ></MessageBubble>
            <MessageBubble
              message={{ role: "user", content: "what up" }}
              float="right"
            ></MessageBubble>
            <MessageBubble
              message={{
                role: "assistant",
                model: "gpt-4",
                content: "eeeeeeee",
              }}
              float="left"
            ></MessageBubble>
            <MessageBubble
              message={{ role: "user", content: "what up" }}
              float="right"
            ></MessageBubble>
            <MessageBubble
              message={{
                role: "assistant",
                model: "gpt-4",
                content:
                  "what upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat up",
              }}
              float="left"
            ></MessageBubble>
            <MessageBubble
              message={{ role: "user", content: "what up" }}
              float="right"
            ></MessageBubble>
            <MessageBubble
              message={{
                role: "assistant",
                model: "gpt-4",
                content: "eeeeeeee",
              }}
              float="left"
            ></MessageBubble>
            <MessageBubble
              message={{ role: "user", content: "what up" }}
              float="right"
            ></MessageBubble>
            <MessageBubble
              message={{
                role: "assistant",
                model: "gpt-4",
                content:
                  "what upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat upwhat up",
              }}
              float="left"
            ></MessageBubble>
            <MessageBubble
              message={{ role: "user", content: "what up" }}
              float="right"
            ></MessageBubble>
            <MessageBubble
              message={{
                role: "assistant",
                model: "gpt-4",
                content: "eeeeeeee",
              }}
              float="left"
            ></MessageBubble>
          </Flex>
        </ScrollArea>
        <MessageInput model={model} />
      </Flex>
    </Flex>
  );
}

export default App;
