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
import { useContext, useState } from "react";
import { AuthContext, HonoContext, AppContext } from "./main";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MessageInput from "./components/MessageInput";
import { Link as RouterLink, useNavigate, useParams } from "react-router";

function App() {
  const { chatId } = useParams();
  const navigate = useNavigate();

  const { models } = useContext(AppContext);
  const client = useContext(HonoContext);
  const { headers } = useContext(AuthContext);

  const [model, setModel] = useState(models[0]);

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
      return await res.json();
    },
  });

  const queryClient = useQueryClient();
  const newChatMutation = useMutation({
    mutationFn: async () => {
      const res = await client.api.chat.$post(
        { json: { title: "New Chat" } },
        { headers },
      );
      const { id } = await res.json();
      navigate(`/c/${id}`);
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
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
              <Button key={`chat-${chat.id}`} variant="soft" asChild>
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
            <ScrollArea className="grow" size="2">
              <Flex justify="center">
                <Flex direction="column" gap="4" p="4" className="chat-area">
                  hi
                </Flex>
              </Flex>
            </ScrollArea>
            <Flex justify="center">
              <Flex direction="column" className="chat-area">
                <MessageInput model={model} onSubmit={() => {}} />
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
                onSubmit={() => {
                  newChatMutation.mutate();
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
