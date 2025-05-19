import { useState, useEffect, useContext } from "react";
import { OpenAI } from "openai";
import { useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/honoClient";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { EnvContext } from "../context";

interface UseChatStreamingArgs {
  chatId: string;
  messages: { id: string; role: string; content: string }[];
  model: string;
  openai: OpenAI;
  headers: Record<string, string>;
}

export function useChatStreaming({
  chatId,
  messages,
  model,
  openai,
  headers,
}: UseChatStreamingArgs) {
  const [streaming, setStreaming] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const env = useContext(EnvContext);

  async function generateTitle(content: string) {
    if (chatId) {
      const completions = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: `${env.TITLE_GENERATION_PROMPT} ${content}`,
          },
        ],
        max_tokens: 10,
        top_p: 0.1,
      });
      const title = completions.choices.at(0)?.message.content;

      if (title) {
        await client.api.chat[":id"].$put(
          { param: { id: chatId }, json: { title } },
          { headers }
        );
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      }
    }
  }

  useEffect(() => {
    const last = messages.at(-1);
    if (!chatId || last?.role !== "user") return;

    (async () => {
      const res = await client.api.chat[":id"].message.$post(
        {
          param: { id: chatId },
          json: { content: "", role: "assistant", model },
        },
        { headers }
      );
      if (!res.ok) throw new Error("Failed to create placeholder message");
      const { id } = await res.json();
      setStreaming((prev) => ({ ...prev, [id]: "" }));
      queryClient.invalidateQueries({ queryKey: ["messages", chatId] });

      let finalText = "";
      const requestMessages = messages.map(({ role, content }) => ({
        role,
        content,
      })) as ChatCompletionMessageParam[];
      const stream = await openai.chat.completions.create({
        model,
        messages: requestMessages,
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta.content;
        if (delta) {
          finalText += delta;
          setStreaming((prev) => ({ ...prev, [id]: finalText }));
        }
      }

      await client.api.message[":id"].$put(
        { param: { id }, json: { content: finalText } },
        { headers }
      );
      queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
      if (messages.length === 1) {
        generateTitle(messages[0].content);
      }
    })();
  }, [chatId, model, messages, openai, headers, queryClient]);

  return streaming;
}
