import { client } from "../lib/honoClient";

export const getMe = async (headers: Record<string, string>) => {
  const res = await client.api.me.$get({}, { headers });
  return await res.json();
};

export const getChats = async (headers: Record<string, string>) => {
  const res = await client.api.chats.$get({}, { headers });
  return await res.json();
};

export const getMessages = async (
  headers: Record<string, string>,
  chatId: string,
) => {
  const res = await client.api.chat[":id"].messages.$get(
    { param: { id: chatId } },
    { headers },
  );
  return await res.json();
};
