import { useEffect, useRef, useState } from "react";
import MessageInputToolbar from "./MessageInputToolbar";
import { Flex } from "@radix-ui/themes";

export default function MessageInput({
  model,
  onSubmit,
}: {
  model: string;
  onSubmit: (content: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null!);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (ref.current) {
      const maxHeight = 200;
      ref.current.style.height = "auto";
      const nextHeight = Math.min(ref.current.scrollHeight, maxHeight);
      ref.current.style.height = `${nextHeight}px`;
      ref.current.style.overflowY =
        ref.current.scrollHeight > maxHeight ? "auto" : "hidden";
    }
  }, [input]);

  const handleSubmit = () => {
    const content = input.trim();
    if (content) {
      onSubmit(content);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !(e.ctrlKey && input.includes("\n"))
    ) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Flex
      direction="column"
      className="rt-TextAreaRoot rt-r-size-3 rt-variant-surface z-10"
      data-radius="large"
    >
      <textarea
        autoFocus
        ref={ref}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Write a message to ${model}`}
        rows={1}
        className="resize-none shadow-none outline-none my-2 mx-3"
      />
      <div className="grow" />
      <MessageInputToolbar onSend={handleSubmit} canSend={!!input.trim()} />
    </Flex>
  );
}
