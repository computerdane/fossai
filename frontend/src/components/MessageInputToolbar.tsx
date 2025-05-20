import { PaperPlaneIcon, UploadIcon } from "@radix-ui/react-icons";
import { IconButton, Tooltip } from "@radix-ui/themes";
import { Toolbar } from "radix-ui";

export default function MessageInputToolbar({
  onSend,
  canSend,
}: {
  onSend: () => void;
  canSend: boolean;
}) {
  return (
    <Toolbar.Root className="flex bg-(--accent-3) rounded-b-(--radius-3) p-0.5">
      <Toolbar.Button asChild>
        <Tooltip content="Upload file">
          <IconButton variant="soft">
            <UploadIcon />
          </IconButton>
        </Tooltip>
      </Toolbar.Button>

      <div className="grow" />

      <Toolbar.Button asChild>
        <IconButton variant="soft" onClick={onSend} disabled={!canSend}>
          <PaperPlaneIcon />
        </IconButton>
      </Toolbar.Button>
    </Toolbar.Root>
  );
}
