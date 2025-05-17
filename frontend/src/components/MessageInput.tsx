import { TextArea } from "@radix-ui/themes";
import { useRef } from "react";

function MessageInput({
  model,
  onSubmit,
}: {
  model: string;
  onSubmit: (content: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null!);

  return (
    <TextArea
      autoFocus
      ref={ref}
      size="3"
      radius="large"
      placeholder={`Write a message to ${model}`}
      className="chat-area"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          if (e.shiftKey) return;
          const content = ref.current.value.trim();
          if (!e.ctrlKey && content.includes("\n")) return;
          e.preventDefault();
          onSubmit(content);
          ref.current.value = "";
        }
      }}
    />
  );
}

export default MessageInput;
