import {
  ColorWheelIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  Pencil2Icon,
  SunIcon,
} from "@radix-ui/react-icons";
import {
  Box,
  Flex,
  IconButton,
  Popover,
  ScrollArea,
  Separator,
  TextField,
  Tooltip,
} from "@radix-ui/themes";
import { Link as RouterLink } from "react-router";
import ChatButton from "./ChatButton";
import { useContext } from "react";
import { accentColors, CustomThemeContext } from "../context";

function Sidebar({
  chats,
  chatId,
}: {
  chats?: { id: string; title: string }[];
  chatId?: string;
}) {
  const { theme, setTheme } = useContext(CustomThemeContext);

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

      <Flex m="2" gap="4">
        <IconButton
          variant="ghost"
          onClick={() =>
            setTheme((t) => ({
              ...t,
              appearance: t.appearance === "dark" ? "light" : "dark",
            }))
          }
        >
          {theme.appearance === "dark" ? <MoonIcon /> : <SunIcon />}
        </IconButton>
        <Popover.Root>
          <Popover.Trigger>
            <IconButton variant="ghost">
              <ColorWheelIcon />
            </IconButton>
          </Popover.Trigger>
          <Popover.Content className="max-w-2xs!">
            <Box>
              {accentColors.map((color) => (
                <IconButton
                  key={`color-${color}`}
                  color={color}
                  className="m-0.5!"
                  onClick={() =>
                    setTheme((t) => ({ ...t, accentColor: color }))
                  }
                ></IconButton>
              ))}
            </Box>
          </Popover.Content>
        </Popover.Root>
      </Flex>
    </Flex>
  );
}

export default Sidebar;
