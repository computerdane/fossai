import { client } from "./honoClient";

export const createNewMessage = async (
  headers: Record<string, string>,
  chatId: string,
  content: string
) => {
  const res = await client.api.chat[":id"].message.$post(
    {
      param: { id: chatId },
      json: { content, role: "user" },
    },
    { headers }
  );
  const { id } = await res.json();
  return id;
};

export const createNewChat = async (
  headers: Record<string, string>,
  content: string
) => {
  const res = await client.api.chat.$post(
    { json: { title: "New Chat" } },
    { headers }
  );
  const { id } = await res.json();
  await createNewMessage(headers, id, content);
  return id;
};
