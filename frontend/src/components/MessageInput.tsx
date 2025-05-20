import { useEffect, useRef, useState } from "react";
import MessageInputToolbar from "./MessageInputToolbar";

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
    <div className="w-full rounded-xl border border-[var(--accent-6)] bg-[var(--accent-1)] px-4 pt-3 pb-1">
      <textarea
        ref={ref}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Write a message to ${model}`}
        rows={1}
        className="w-full resize-none border-none bg-transparent p-0 text-[15px] leading-relaxed text-[var(--accent-12)] shadow-none outline-none"
      />
      <MessageInputToolbar
        onSend={handleSubmit}
        canSend={input.trim() !== ""}
      />
    </div>
  );
}
