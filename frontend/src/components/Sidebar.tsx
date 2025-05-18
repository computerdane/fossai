import {
  ColorWheelIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  Pencil2Icon,
  SunIcon,
  HamburgerMenuIcon,
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
import { useContext, useState } from "react";
import { accentColors, CustomThemeContext, EnvContext } from "../context";
import Fuse from "fuse.js";

function Sidebar({
  chats,
  chatId,
}: {
  chats: { id: string; title: string }[];
  chatId: string;
}) {
  const env = useContext(EnvContext);
  const { theme, setTheme } = useContext(CustomThemeContext);
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");

  const fuse = new Fuse(chats, { keys: ["title"] });
  chats = search ? fuse.search(search).map(({ item }) => item) : chats;

  return (
    <Flex
      direction="column"
      className={`transition-all duration-300 ease-in-out ${
        collapsed ? "w-14" : "w-xs"
      }`}
      p="1"
      gap="1"
    >
      <Flex
        mx="2"
        my="2"
        gap="4"
        justify={collapsed ? "center" : "between"}
        align="center"
      >
        <IconButton
          variant="ghost"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          <HamburgerMenuIcon />
        </IconButton>

        {!collapsed && (
          <Tooltip content="New chat">
            <IconButton variant="ghost" asChild>
              <RouterLink to="/">
                <Pencil2Icon />
              </RouterLink>
            </IconButton>
          </Tooltip>
        )}
      </Flex>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          collapsed ? "opacity-0 max-h-0" : "opacity-100 max-h-full"
        }`}
      >
        <Flex gap="1" className="mt-1">
          <TextField.Root
            placeholder="Search chats..."
            variant="soft"
            radius="full"
            className="grow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon />
            </TextField.Slot>
          </TextField.Root>
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
      </div>

      <div className="mt-auto">
        <Flex mx="2" my="2" gap="4" justify={collapsed ? "center" : "start"}>
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
          {!collapsed && !env.DISABLE_USER_SET_THEME_ACCENT_COLOR && (
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
                    />
                  ))}
                </Box>
              </Popover.Content>
            </Popover.Root>
          )}
        </Flex>
      </div>
    </Flex>
  );
}

export default Sidebar;
