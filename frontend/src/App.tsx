import "./App.css";
import {
  Box,
  Flex,
  IconButton,
  ScrollArea,
  Select,
  TextArea,
  TextField,
  Tooltip,
} from "@radix-ui/themes";
import { MagnifyingGlassIcon, Pencil2Icon } from "@radix-ui/react-icons";
import { useContext } from "react";
import { HonoContext, MeContext } from "./main";
import { OpenAI } from "openai";
import MessageBubble from "./components/Message";

function App() {
  const me = useContext(MeContext);
  const client = useContext(HonoContext);

  const openai = new OpenAI({
    baseURL: client.api.openai[":path{.+}"]
      .$url({ param: { path: "" } })
      .toString(),
    apiKey: "",
    dangerouslyAllowBrowser: true,
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
          <Select.Root defaultValue="gpt-4.1">
            <Select.Trigger variant="soft" />
            <Select.Content position="popper">
              <Select.Item value="gpt-4.1">gpt-4.1</Select.Item>
              <Select.Item value="gpt-4o">gpt-4o</Select.Item>
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
        <TextArea
          size="3"
          radius="large"
          placeholder="Write a message to MODEL"
          className="chat-area"
        />
      </Flex>
    </Flex>
  );
}

export default App;
