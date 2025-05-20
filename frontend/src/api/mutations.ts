import { client } from "../lib/honoClient";

export const refresh = async () => {
  const res = await client.refresh.$post();

  if (!res.ok) {
    throw new Error("Auth using refresh token failed");
  }

  return await res.json();
};

export const logout = async () => {
  await client.logout.$post();
};

export const createNewMessage = async (
  headers: Record<string, string>,
  chatId: string,
  content: string,
) => {
  const res = await client.api.chat[":id"].message.$post(
    {
      param: { id: chatId },
      json: { content, role: "user" },
    },
    { headers },
  );

  if (!res.ok) {
    throw new Error("Failed to create new message");
  }

  const { id } = await res.json();
  return id;
};

export const createNewChat = async (
  headers: Record<string, string>,
  content: string,
) => {
  const res = await client.api.chat.$post(
    { json: { title: "New Chat" } },
    { headers },
  );

  if (!res.ok) {
    throw new Error("Failed to create new chat");
  }

  const { id } = await res.json();
  await createNewMessage(headers, id, content);
  return id;
};

export const deleteChat = async (
  headers: Record<string, string>,
  chatId: string,
) => {
  await client.api.chat[":id"].$delete({ param: { id: chatId } }, { headers });
};

export const updateChatTitle = async (
  headers: Record<string, string>,
  chatId: string,
  title: string,
) => {
  await client.api.chat[":id"].$put(
    { param: { id: chatId }, json: { title } },
    { headers },
  );
};
