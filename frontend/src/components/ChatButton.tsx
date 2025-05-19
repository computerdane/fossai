import { Pencil1Icon } from "@radix-ui/react-icons";
import { Box, Button, IconButton, Link, Tooltip } from "@radix-ui/themes";
import { Link as RouterLink } from "react-router";
import EditChatDialog from "./EditChatDialog";
import clsx from "clsx";

function ChatButton({
  chat,
  selected,
}: {
  chat: { id: string; title: string };
  selected: boolean;
}) {
  return (
    <Box key={`chat-${chat.id}`}>
      <Button
        variant={selected ? "solid" : "soft"}
        asChild
        className={clsx(
          "grow! shrink! truncate! inline-block! text-left! pt-1.5! w-full!",
          selected && "pr-8!",
        )}
      >
        <Link asChild>
          <RouterLink to={`/c/${chat.id}`}>{chat.title}</RouterLink>
        </Link>
      </Button>

      {selected && (
        <EditChatDialog
          chat={chat}
          childrenFn={(openDialog) => (
            <Tooltip content="Edit">
              <IconButton
                size="1"
                variant="solid"
                className="z-10! absolute! right-1! text-(--accent-contrast)!"
                m="1"
                onClick={openDialog}
              >
                <Pencil1Icon />
              </IconButton>
            </Tooltip>
          )}
        />
      )}
    </Box>
  );
}

export default ChatButton;
