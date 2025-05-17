import "./App.css";
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Link,
  ScrollArea,
  Select,
  TextField,
  Tooltip,
} from "@radix-ui/themes";
import { MagnifyingGlassIcon, Pencil2Icon } from "@radix-ui/react-icons";
import { useContext, useEffect, useRef, useState } from "react";
import {
  AuthContext,
  HonoContext,
  AppContext,
  OpenAiContext,
  EnvContext,
} from "./main";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MessageInput from "./components/MessageInput";
import { Link as RouterLink, useNavigate, useParams } from "react-router";
import MessageBubble from "./components/MessageBubble";

function App() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const env = useContext(EnvContext);
  const { models } = useContext(AppContext);
  const client = useContext(HonoContext);
  const { headers } = useContext(AuthContext);
  const openai = useContext(OpenAiContext);

  const [model, setModel] = useState(models[0]);
  const [completion, setCompletion] = useState<string>();
  const [completionMessageId, setCompletionMessageId] = useState<string>();

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await client.api.me.$get({}, { headers });
      return await res.json();
    },
  });

  const { data: chats } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const res = await client.api.chats.$get({}, { headers });
      const chats = await res.json();
      if (!chats.find((chat) => chat.id === chatId)) {
        navigate("/");
      }
      return chats;
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["messages", chatId],
    queryFn: async () => {
      if (!chatId) return [];
      const res = await client.api.chat[":id"].messages.$get(
        {
          param: { id: chatId },
        },
        { headers },
      );
      return await res.json();
    },
    enabled: !!chatId,
    staleTime: Infinity,
  });

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  function scrollToBottom() {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }

  const newMessageMutation = useMutation({
    mutationFn: async ({
      chatId,
      content,
    }: {
      chatId: string;
      content: string;
    }) => {
      const res = await client.api.chat[":id"].message.$post(
        {
          param: { id: chatId },
          json: { content, role: "user" },
        },
        { headers },
      );
      const { id } = await res.json();
      return id;
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  const newChatMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await client.api.chat.$post(
        { json: { title: "New Chat" } },
        { headers },
      );
      const { id } = await res.json();
      await newMessageMutation.mutateAsync({ chatId: id, content });
      return id;
    },
    async onSuccess(id) {
      await queryClient.invalidateQueries({ queryKey: ["chats"] });
      await navigate(`/c/${id}`);
    },
  });

  async function generateTitle(content: string) {
    if (chatId) {
      console.log("caled");
      const completions = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: `${env.TITLE_GENERATION_PROMPT} ${content}`,
          },
        ],
        max_tokens: 10,
        top_p: 0.1,
      });
      const title = completions.choices.at(0)?.message.content;

      if (title) {
        await client.api.chat[":id"].$put(
          { param: { id: chatId }, json: { title } },
          { headers },
        );
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      }
    }
  }

  async function generateAiMessage(currentMessages: typeof messages) {
    if (chatId && currentMessages?.at(-1)?.role === "user") {
      const res = await client.api.chat[":id"].message.$post(
        {
          param: { id: chatId },
          json: { content: "", role: "assistant", model },
        },
        { headers },
      );
      const { id } = await res.json();
      await queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
      setCompletionMessageId(id);

      if (currentMessages.length === 1) {
        generateTitle(currentMessages[0].content);
      }

      let content = "";
      for await (const chunk of await openai.chat.completions.create({
        model,
        messages: currentMessages.map(({ role, content }) => ({
          role,
          content,
        })),
        stream: true,
      })) {
        const delta = chunk.choices.at(0)?.delta.content;
        if (delta) {
          content += delta;
          setCompletion(content);
        }
      }

      await client.api.message[":id"].$put(
        {
          param: { id },
          json: { content },
        },
        { headers },
      );

      await queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
    }
  }

  useEffect(() => {
    scrollToBottom();
    generateAiMessage(messages);

    const latestMessage = messages?.at(-1);
    if (latestMessage?.role === "assistant" && latestMessage.content) {
      setCompletion(undefined);
      setCompletionMessageId(undefined);
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [completion]);

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
            <IconButton variant="soft" asChild>
              <RouterLink to="/">
                <Pencil2Icon />
              </RouterLink>
            </IconButton>
          </Tooltip>
        </Flex>
        <ScrollArea className="grow px-1">
          <Flex direction="column" gap="1">
            <Heading size="1" weight="regular" color="gray">
              Previous Chats
            </Heading>
            {chats?.map((chat) => (
              <Button
                key={`chat-${chat.id}`}
                variant={chat.id === chatId ? "solid" : "soft"}
                asChild
              >
                <Link asChild>
                  <RouterLink
                    to={`/c/${chat.id}`}
                    className="flex! justify-start!"
                  >
                    {chat.title}
                  </RouterLink>
                </Link>
              </Button>
            ))}
          </Flex>
        </ScrollArea>
      </Flex>
      <Flex direction="column" flexGrow="1" p="1">
        <Flex justify="center">
          <Box className="chat-area mb-1">
            <Select.Root value={model} onValueChange={setModel}>
              <Select.Trigger variant="soft" />
              <Select.Content position="popper">
                {models?.map((model) => (
                  <Select.Item key={`model-${model}`} value={model}>
                    {model}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>
        </Flex>
        {chatId ? (
          <>
            <ScrollArea ref={scrollAreaRef} className="grow" size="2">
              <Flex justify="center">
                <Flex direction="column" gap="4" p="4" className="chat-area">
                  {messages?.map((message) => (
                    <MessageBubble
                      key={`message-${message.chat_id}-${message.id}`}
                      message={
                        completion && completionMessageId === message.id
                          ? { ...message, content: completion }
                          : message
                      }
                    />
                  ))}
                </Flex>
              </Flex>
            </ScrollArea>
            <Flex justify="center">
              <Flex direction="column" className="chat-area">
                <MessageInput
                  model={model}
                  onSubmit={(content) => {
                    newMessageMutation.mutate({ chatId, content });
                  }}
                />
              </Flex>
            </Flex>
          </>
        ) : (
          <Flex flexGrow="1" justify="center">
            <Flex direction="column" className="my-auto chat-area">
              <Heading size="5" m="2" weight="regular">
                Hi {me && me.email != "anon" ? me.first_name : "there"}! How can
                I help you?
              </Heading>
              <MessageInput
                model={model}
                onSubmit={(content) => {
                  newChatMutation.mutate(content);
                }}
              />
            </Flex>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}

export default App;
