function throwIfUnset(name: string) {
  if (!process.env[name]) {
    console.error(`Error: Environment variable '${name}' must be set.`);
    process.exit(1);
  }
}

throwIfUnset("OPENAI_API_KEY");

type Env = {
  private: {
    JWT_SECRET: string;
    JWT_SESSION_EXP_SEC: number;
    JWT_REFRESH_EXP_SEC: number;
    COOKIE_SECRET: string;
    POSTGRES_CONNECTION_STRING: string;
    OPENAI_API_KEY: string;
    OPENAI_BASE_URL: string;
    EMAIL_VALIDATION_REGEX: RegExp;
  };
  public: {
    SITE_TITLE: string;
    LOGIN_PAGE_TITLE: string;
    LOGIN_PAGE_SUBTITLE: string;
    DISABLE_AUTH: boolean;
    CHAT_MODELS_FILTER_REGEX: string;
    TITLE_GENERATION_PROMPT: string;
    THEME_ACCENT_COLOR: string;
    THEME_APPEARANCE: string;
    DISABLE_USER_SET_THEME_ACCENT_COLOR: boolean;
  };
};

/** Allows the environment variable schema to reference itself. */
function genEnv(f: (self: Env) => Env) {
  return f(f(null!));
}

const env = genEnv((self) => ({
  private: {
    JWT_SECRET: process.env.JWT_SECRET ?? "I <3 FOSS!",
    JWT_SESSION_EXP_SEC: 60 * parseInt(process.env.JWT_SESSION_EXP_MIN ?? "5"),
    JWT_REFRESH_EXP_SEC:
      3600 * parseInt(process.env.JWT_REFRESH_EXP_HOUR ?? "168"),
    COOKIE_SECRET: process.env.COOKIE_SECRET ?? self?.private.JWT_SECRET,
    POSTGRES_CONNECTION_STRING:
      process.env.POSTGRES_CONNECTION_STRING ?? "postgres://localhost",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
    EMAIL_VALIDATION_REGEX: new RegExp(
      process.env.EMAIL_VALIDATION_REGEX ??
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/email#basic_validation
        "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$",
    ),
  },
  public: {
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
    THEME_ACCENT_COLOR: process.env.THEME_ACCENT_COLOR ?? "gray",
    THEME_APPEARANCE: process.env.THEME_APPEARANCE ?? "dark",
    DISABLE_USER_SET_THEME_ACCENT_COLOR:
      !!process.env.DISABLE_USER_SET_THEME_ACCENT_COLOR,
  },
}));

export default env;
