import "./Sidebar.css";
import {
  ColorWheelIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  Pencil2Icon,
  SunIcon,
  HamburgerMenuIcon,
  ExitIcon,
} from "@radix-ui/react-icons";
import {
  Box,
  Flex,
  Heading,
  IconButton,
  Popover,
  ScrollArea,
  TextField,
  Tooltip,
} from "@radix-ui/themes";
import { Link as RouterLink } from "react-router";
import ChatButton from "./ChatButton";
import { useContext, useState } from "react";
import { accentColors, CustomThemeContext, EnvContext } from "../context";
import Fuse from "fuse.js";
import clsx from "clsx";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../api/mutations";
import { useLocalStorage } from "@uidotdev/usehooks";

function Sidebar({
  chats,
  chatId,
}: {
  chats: { id: string; title: string }[];
  chatId: string;
}) {
  const env = useContext(EnvContext);
  const { theme, setTheme } = useContext(CustomThemeContext);
  const [collapsed, setCollapsed] = useLocalStorage("collapsed", true);
  const [search, setSearch] = useState("");

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      window.location.reload();
    },
  });

  const fuse = new Fuse(chats, { keys: ["title"] });
  chats = search ? fuse.search(search).map(({ item }) => item) : chats;

  return (
    <Flex
      direction="column"
      style={{ transition: "width min-width" }}
      className={clsx(
        "duration-200 ease-in-out",
        collapsed ? "collapsed" : "min-w-xs w-xs",
      )}
      gap="1"
    >
      <Flex
        mx={collapsed ? "0" : "2"}
        my="2"
        gap="1"
        direction={collapsed ? "column" : "row"}
        justify="between"
        className={clsx(collapsed && "collapsed")}
        align="center"
      >
        <IconButton
          variant="soft"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          <HamburgerMenuIcon />
        </IconButton>

        {!collapsed && <Heading size="4">{env.LOGIN_PAGE_TITLE}</Heading>}

        <Tooltip content="New chat">
          <IconButton variant={chatId ? "soft" : "solid"} asChild>
            <RouterLink to="/">
              <Pencil2Icon />
            </RouterLink>
          </IconButton>
        </Tooltip>
      </Flex>

      <Box p="1" className={clsx(collapsed && "invisible")}>
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
      </Box>

      <ScrollArea
        className={clsx("grow px-1", collapsed && "invisible")}
        scrollbars="vertical"
      >
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

      <Flex
        mx={collapsed ? "0" : "2"}
        my="2"
        gap="1"
        direction={collapsed ? "column" : "row"}
        className={clsx(collapsed && "collapsed")}
        align="center"
      >
        <IconButton
          variant="soft"
          onClick={() =>
            setTheme((t) => ({
              ...t,
              appearance: t.appearance === "dark" ? "light" : "dark",
            }))
          }
        >
          {theme.appearance === "dark" ? <MoonIcon /> : <SunIcon />}
        </IconButton>

        {!env.DISABLE_USER_SET_THEME_ACCENT_COLOR && (
          <Popover.Root>
            <Popover.Trigger>
              <IconButton variant="soft">
                <ColorWheelIcon />
              </IconButton>
            </Popover.Trigger>
            <Popover.Content className="max-w-3xs!">
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

        {!collapsed && <div className="grow" />}

        <Tooltip content="Logout">
          <IconButton variant="soft" onClick={() => logoutMutation.mutate()}>
            <ExitIcon />
          </IconButton>
        </Tooltip>
      </Flex>
    </Flex>
  );
}

export default Sidebar;
