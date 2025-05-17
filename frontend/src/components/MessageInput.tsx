import { TextArea } from "@radix-ui/themes";

function MessageInput({ model }: { model: string }) {
  return (
    <TextArea
      size="3"
      radius="large"
      placeholder={`Write a message to ${model}`}
      className="chat-area"
    />
  );
}

export default MessageInput;
