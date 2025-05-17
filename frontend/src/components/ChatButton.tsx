import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { Button, Flex, IconButton, Link, Tooltip } from "@radix-ui/themes";
import { Link as RouterLink } from "react-router";

function ChatButton({
  chat,
  selected,
}: {
  chat: { id: string; title: string };
  selected: boolean;
}) {
  return (
    <Flex key={`chat-${chat.id}`} gap="1">
      <Button
        variant={selected ? "solid" : "soft"}
        asChild
        className="grow! shrink! truncate! inline-block! text-left! pt-1.5!"
      >
        <Link asChild>
          <RouterLink to={`/c/${chat.id}`}>{chat.title}</RouterLink>
        </Link>
      </Button>

      {selected && (
        <>
          <Tooltip content="Edit title">
            <IconButton size="1" variant="soft">
              <Pencil1Icon />
            </IconButton>
          </Tooltip>

          <Tooltip content="Delete chat">
            <IconButton size="1" variant="soft">
              <TrashIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Flex>
  );
}

export default ChatButton;
