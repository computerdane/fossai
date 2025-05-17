import type { Message } from "@fossai/backend";
import { Box, Card, Heading, Text } from "@radix-ui/themes";
import clsx from "clsx";
import type { Updateable } from "kysely";

function MessageBubble({ message }: { message: Updateable<Message> }) {
  const float = message.role === "user" ? "right" : "left";

  return (
    <Box className={clsx(`m${float === "right" ? "l" : "r"}-4`)}>
      <Card
        className={clsx("max-w-3xl w-fit!", float === "right" && "ml-auto")}
      >
        {message.role === "assistant" && (
          <Heading size="2" mb="1">
            {message.model}
          </Heading>
        )}
        <Text as="p">{message.content}</Text>
      </Card>
    </Box>
  );
}

export default MessageBubble;
