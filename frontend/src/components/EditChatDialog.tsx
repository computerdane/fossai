import { Button, Dialog, Flex, TextField } from "@radix-ui/themes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form } from "radix-ui";
import { useContext, useRef, useState } from "react";
import { AuthContext } from "../context";
import { deleteChat, updateChatTitle } from "../api/mutations";

function EditChatDialog({
  childrenFn,
  chat,
}: {
  childrenFn: (openDialog: () => void) => React.ReactNode;
  chat: { id: string; title: string };
}) {
  const ref = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);

  const { headers } = useContext(AuthContext);

  const queryClient = useQueryClient();
  const saveMutation = useMutation({
    mutationFn: (title: string) => updateChatTitle(headers, chat.id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteChat(headers, chat.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  function save() {
    const title = ref.current?.value;
    if (title) {
      if (title !== chat.title) {
        saveMutation.mutate(title);
      }
      setOpen(false);
    }
  }

  function del() {
    deleteMutation.mutate();
    setOpen(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>{childrenFn(() => setOpen(true))}</Dialog.Trigger>

      <Dialog.Content className="max-w-md!">
        <Dialog.Title>Edit Chat</Dialog.Title>

        <Form.Root className="grow" action={save}>
          <Form.Field name="title">
            <Flex align="baseline" justify="between">
              <Form.Label>Title</Form.Label>
              <Form.Message className="text-xs" match="valueMissing">
                Please enter a title
              </Form.Message>
            </Flex>
            <Form.Control asChild>
              <TextField.Root
                ref={ref}
                name="title"
                defaultValue={chat.title}
                required
              ></TextField.Root>
            </Form.Control>
          </Form.Field>
          <Flex gap="3" mt="4">
            <Dialog.Close>
              <Button color="red" onClick={del}>
                Delete
              </Button>
            </Dialog.Close>

            <div className="grow" />

            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>

            <Dialog.Close>
              <Form.Submit asChild>
                <Button onClick={save}>Save</Button>
              </Form.Submit>
            </Dialog.Close>
          </Flex>
        </Form.Root>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default EditChatDialog;
