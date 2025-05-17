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
  },
  client: {
    SITE_TITLE: process.env.SITE_TITLE ?? "fossai - AI Assistant",
    LOGIN_PAGE_TITLE: process.env.LOGIN_PAGE_TITLE ?? "fossai",
    LOGIN_PAGE_SUBTITLE: process.env.LOGIN_PAGE_SUBTITLE ?? "Free AI.",
    DISABLE_AUTH: !!process.env.DISABLE_AUTH,
    CHAT_MODELS_FILTER_REGEX:
      process.env.CHAT_MODELS_FILTER_REGEX ?? "^(gpt-[3|4].+|o[1|3|4].+)$",
  },
};

export default env;
