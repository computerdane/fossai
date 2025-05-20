import { ArrowUpIcon, UploadIcon } from "@radix-ui/react-icons";
import { Toolbar } from "radix-ui";

export default function MessageInputToolbar({
  onSend,
  canSend,
}: {
  onSend: () => void;
  canSend: boolean;
}) {
  return (
    <Toolbar.Root
      className="mt-2 flex w-full items-center justify-between border-t border-[var(--accent-6)] pt-2"
      aria-label="Message input actions"
    >
      <Toolbar.Button
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--accent-11)] hover:bg-[var(--accent-3)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-7)]"
        aria-label="Upload file"
      >
        <UploadIcon />
      </Toolbar.Button>

      <input
        type="file"
        hidden
        onChange={(e) => {
          console.log(
            "not yet implemented, please be excellent to eachother",
            e
          );
        }}
      />

      <Toolbar.Button
        onClick={onSend}
        disabled={!canSend}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--accent-11)] hover:bg-[var(--accent-3)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-7)] disabled:opacity-40"
        aria-label="Send message"
      >
        <ArrowUpIcon />
      </Toolbar.Button>
    </Toolbar.Root>
  );
}
