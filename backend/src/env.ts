function throwIfUnset(name: string) {
  console.error(`Error: Environment variable '${name}' must be set.`);
  process.exit(1);
}

const env = {
  server: {
    JWT_SECRET: process.env.JWT_SECRET ?? "I <3 FOSS!",
    POSTGRES_CONNECTION_STRING:
      process.env.POSTGRES_CONNECTION_STRING ?? "postgres://localhost",
    OPENAI_API_KEY:
      process.env.OPENAI_API_KEY ?? throwIfUnset("OPENAI_API_KEY"),
    EMAIL_VALIDATION_REGEX: new RegExp(
      process.env.EMAIL_VALIDATION_REGEX ??
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/email#basic_validation
        "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$",
    ),
  },
  client: {
    SITE_TITLE: process.env.SITE_TITLE ?? "fossai - AI Assistant",
    LOGIN_PAGE_TITLE: process.env.LOGIN_PAGE_TITLE ?? "fossai",
    LOGIN_PAGE_SUBTITLE: process.env.LOGIN_PAGE_SUBTITLE ?? "Free AI.",
    DISABLE_AUTH: !!process.env.DISABLE_AUTH,
    CHAT_MODELS_FILTER_REGEX:
      process.env.CHAT_MODELS_FILTER_REGEX ?? "^(gpt-[3|4].+|o[1|3|4].+)$",
    TITLE_GENERATION_PROMPT:
      process.env.TITLE_GENERATION_PROMPT ??
      `
You are going to generate a brief chat title for a new chat with an AI
assistant. Include one emoji at the start of the title. Here are some examples:

- ⛈️ Weather forecast this week
- 👔 How to tie a tie
- ✈️ Cool facts about airplanes
- 👋 Friendly greeting

Ensure the title is a summary of the chat message, and make sure it is as
accurate as possible, without anything made-up or inferred about the message.
Here is the messsage: `,
  },
};

export default env;
