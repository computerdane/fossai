import {
  ExitIcon,
  MagnifyingGlassIcon,
  Pencil2Icon,
} from "@radix-ui/react-icons";
import {
  Flex,
  IconButton,
  ScrollArea,
  Separator,
  TextField,
  Tooltip,
} from "@radix-ui/themes";
import { Link as RouterLink } from "react-router";
import ChatButton from "./ChatButton";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../api/mutations";

function Sidebar({
  chats,
  chatId,
}: {
  chats?: { id: string; title: string }[];
  chatId?: string;
}) {
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      window.location.reload();
    },
  });
  return (
    <Flex
      direction="column"
      className="w-xs min-w-xs max-w-xs bg-(--accent-1)"
      p="1"
      gap="1"
    >
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

      <Separator mx="auto" />

      <ScrollArea className="grow px-1" scrollbars="vertical">
        <Flex direction="column" gap="1">
          {chats?.map((chat) => (
            <ChatButton
              key={`chat-${chat.id}`}
              chat={chat}
              selected={chat.id === chatId}
            />
          ))}
        </Flex>
      </ScrollArea>

      <Separator my="2" />
      <Tooltip content="Logout">
        <IconButton
          variant="soft"
          onClick={() => logoutMutation.mutate()}
          className="mx-auto"
        >
          <ExitIcon />
        </IconButton>
      </Tooltip>
    </Flex>
  );
}

export default Sidebar;
