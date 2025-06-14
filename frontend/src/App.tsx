import "./App.css";
import { Button, Flex, Heading, ScrollArea, Select } from "@radix-ui/themes";
import { useContext, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MessageInput from "./components/MessageInput";
import { useNavigate, useParams } from "react-router";
import MessageBubble from "./components/MessageBubble";
import Sidebar from "./components/Sidebar";
import { createNewChat, createNewMessage } from "./api/mutations";
import { getChats, getMessages } from "./api/queries";
import { AuthContext, OpenAiContext, AppContext } from "./context";
import { useChatStreaming } from "./hooks/useChatStreaming";
import clsx from "clsx";
import { useMyLocalStorage } from "./hooks/useMyLocalStorage";

function App() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { models } = useContext(AppContext);
  const { me, headers } = useContext(AuthContext);
  const openai = useContext(OpenAiContext);

  const [defaultModel, setDefaultModel] = useMyLocalStorage(
    "defaultModel",
    models[0],
  );
  const [model, setModel] = useState(
    models.includes(defaultModel) ? defaultModel : models[0],
  );

  const { data: chats, isSuccess } = useQuery({
    queryKey: ["chats"],
    queryFn: () => getChats(headers),
  });

  useEffect(() => {
    if (
      isSuccess &&
      chatId &&
      chats &&
      !chats.find((chat) => chat.id === chatId)
    ) {
      navigate("/");
    }
  }, [isSuccess, chatId, chats, navigate]);

  const { data: messages } = useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => getMessages(headers, chatId!),
    enabled: !!chatId,
  });

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  function scrollToBottom() {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }

  const newMessageMutation = useMutation({
    mutationFn: ({ chatId, content }: { chatId: string; content: string }) =>
      createNewMessage(headers, chatId, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages"] }),
  });

  const newChatMutation = useMutation({
    mutationFn: (content: string) => createNewChat(headers, content),
    onSuccess: async (id) => {
      await queryClient.invalidateQueries({ queryKey: ["chats"] });
      navigate(`/c/${id}`);
    },
  });

  const streaming = useChatStreaming({
    chatId: chatId!,
    messages: messages ?? [],
    model,
    openai,
    headers,
  });

  useEffect(scrollToBottom, [messages, streaming]);

  return (
    <Flex className="h-dvh">
      <Sidebar chats={chats ?? []} chatId={chatId ?? ""} />

      <Flex
        direction="column"
        flexGrow="1"
        p="1"
        className="bg-(--accent-2) transition-[background-color]"
      >
        <Flex justify="center">
          <Flex className="chat-area mb-1" gap="1" align="baseline">
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

            <Button
              mx="2"
              size="1"
              variant="ghost"
              onClick={() => setDefaultModel(model)}
            >
              Set as default
            </Button>
          </Flex>
        </Flex>

        <ScrollArea ref={scrollAreaRef} size="2" className="h-auto! grow">
          <Flex justify="center">
            <Flex direction="column" gap="4" p="4" className="chat-area">
              {messages?.map((message) => {
                const content = streaming[message.id] ?? message.content;
                return (
                  <MessageBubble
                    key={`message-${message.chat_id}-${message.id}`}
                    message={{ ...message, content }}
                  />
                );
              })}
            </Flex>
          </Flex>
        </ScrollArea>

        <Flex justify="center">
          <Flex
            direction="column"
            className="chat-area message-input-transition"
            px={chatId ? "0" : "5"}
          >
            {!chatId && (
              <Heading size="5" m="2">
                Hi {me.email != "anon" ? me.first_name : "there"}! How can I
                help you?
              </Heading>
            )}
            <MessageInput
              model={model}
              onSubmit={(content) => {
                if (chatId) {
                  newMessageMutation.mutate({ chatId, content });
                } else {
                  newChatMutation.mutate(content);
                }
              }}
            />
          </Flex>
        </Flex>

        <div className={clsx("message-input-transition", !chatId && "grow")} />
      </Flex>
    </Flex>
  );
}

export default App;
