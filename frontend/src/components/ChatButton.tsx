import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { Button, Flex, IconButton, Link, Tooltip } from "@radix-ui/themes";
import { Link as RouterLink } from "react-router";
import EditChatDialog from "./EditChatDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { AuthContext } from "../context";
import { client } from "../api/honoClient";

function ChatButton({
  chat,
  selected,
}: {
  chat: { id: string; title: string };
  selected: boolean;
}) {
  const { headers } = useContext(AuthContext);

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await client.api.chat[":id"].$delete(
        { param: { id: chat.id } },
        { headers },
      );
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

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
          <EditChatDialog
            chat={chat}
            childrenFn={(openDialog) => (
              <Tooltip content="Edit chat">
                <IconButton size="1" variant="soft" onClick={openDialog}>
                  <Pencil1Icon />
                </IconButton>
              </Tooltip>
            )}
          />

          <Tooltip content="Delete chat">
            <IconButton
              size="1"
              variant="soft"
              onClick={() => deleteMutation.mutate()}
            >
              <TrashIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Flex>
  );
}

export default ChatButton;
