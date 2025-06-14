type VarDef<T> = {
  value: T;
  parser?: (v: string) => T;
  description: string;
};

const boolParser = (v: string) => !!v;

type PrivateDef = {
  PRIVATE_CONFIG_FILE: VarDef<string | undefined>;
  PUBLIC_CONFIG_FILE: VarDef<string | undefined>;
  PORT: VarDef<number>;
  COOKIE_SECRET: VarDef<string>;
  JWT_SECRET: VarDef<string>;
  JWT_SESSION_EXP_SEC: VarDef<number>;
  JWT_REFRESH_EXP_SEC: VarDef<number>;
  POSTGRES_CONNECTION_STRING: VarDef<string>;
  OPENAI_API_KEY: VarDef<string>;
  OPENAI_BASE_URL: VarDef<string>;
  EMAIL_VALIDATION_REGEX: VarDef<string>;
  CORS_ORIGIN: VarDef<string[]>;
};
type PublicDef = {
  SITE_TITLE: VarDef<string>;
  LOGIN_PAGE_TITLE: VarDef<string>;
  LOGIN_PAGE_SUBTITLE: VarDef<string>;
  DISABLE_AUTH: VarDef<boolean>;
  CHAT_MODELS_FILTER_REGEX: VarDef<string>;
  TITLE_GENERATION_PROMPT: VarDef<string>;
  THEME_ACCENT_COLOR: VarDef<string>;
  THEME_APPEARANCE: VarDef<string>;
  DISABLE_USER_SET_THEME_ACCENT_COLOR: VarDef<boolean>;
};

export const privateDef: PrivateDef = {
  PRIVATE_CONFIG_FILE: {
    value: undefined,
    description:
      "JSON file to load configuration from. Options in the config file override environment variables. Private config only.",
  },
  PUBLIC_CONFIG_FILE: {
    value: undefined,
    description:
      "JSON file to load configuration from. Options in the config file override environment variables. Public config only.",
  },
  PORT: {
    value: 3000,
    parser: parseInt,
    description: "Port to serve the backend on",
  },
  COOKIE_SECRET: {
    value: "I <3 FOSS!",
    description: "Secret key used to sign cookies",
  },
  JWT_SECRET: {
    value: "I <3 FOSS!",
    description: "Secret key used to sign JWT tokens",
  },
  JWT_SESSION_EXP_SEC: {
    value: 5 * 60,
    parser: parseInt,
    description: "JWT session token expiration time (seconds)",
  },
  JWT_REFRESH_EXP_SEC: {
    value: 24 * 60 * 60,
    parser: parseInt,
    description: "JWT refresh token expiration time (seconds)",
  },
  POSTGRES_CONNECTION_STRING: {
    value: "postgres:///fossai",
    description: "PostgreSQL connection string WITH the database name",
  },
  OPENAI_API_KEY: {
    value: "",
    description: "OpenAI API key",
  },
  OPENAI_BASE_URL: {
    value: "https://api.openai.com/v1",
    description: "Base URL of OpenAI API endpoint",
  },
  EMAIL_VALIDATION_REGEX: {
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/email#basic_validation
    value:
      "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$",
    description: "Regex used to validate emails",
  },
  CORS_ORIGIN: {
    value: ["http://localhost:5173"],
    parser: (v) => v.split(" "),
    description: "Space-separated list of frontend URL(s)",
  },
};
export const publicDef: PublicDef = {
  SITE_TITLE: {
    value: "fossai - AI Assistant",
    description: "Title of the site (in the browser tab)",
  },
  LOGIN_PAGE_TITLE: {
    value: "fossai",
    description: "Content of the main heading on the login page",
  },
  LOGIN_PAGE_SUBTITLE: {
    value: "Free Ai.",
    description: "Content of the secondary heading on the login page",
  },
  DISABLE_AUTH: {
    value: false,
    parser: boolParser,
    description:
      "[UNSAFE] Completely disables all authentication and runs the app in single-user mode",
  },
  CHAT_MODELS_FILTER_REGEX: {
    value: "^(gpt-[3|4].+|o[1|3|4].+)$",
    description: "Filter to apply to model list from OpenAI API",
  },
  TITLE_GENERATION_PROMPT: {
    value: `
You are going to generate a brief chat title for a new chat with an AI
assistant. Include one emoji at the start of the title. Here are some examples:

- ⛈️ Weather forecast this week
- 👔 How to tie a tie
- ✈️ Cool facts about airplanes
- 👋 Friendly greeting

Ensure the title is a summary of the chat message, and make sure it is as
accurate as possible, without anything made-up or inferred about the message.
Here is the messsage: `,
    description:
      "The prompt used to generate titles when a user makes a new chat",
  },
  THEME_ACCENT_COLOR: {
    value: "gray",
    description:
      "Default accent color to use throughout the UI. Choose a color from https://www.radix-ui.com/colors",
  },
  THEME_APPEARANCE: {
    value: "dark",
    description: "Set default theme to 'dark' or 'light'",
  },
  DISABLE_USER_SET_THEME_ACCENT_COLOR: {
    value: false,
    description:
      "Prevent users from choosing their own accent color (sorry, but you are lame if you enable this)",
  },
};

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

const privateEntries = Object.entries(privateDef) as Entries<PrivateDef>;
const publicEntries = Object.entries(publicDef) as Entries<PublicDef>;

const env = {
  private: Object.fromEntries(
    privateEntries.map(([name, { parser, value }]) => {
      const v = process.env[name];
      return [name, v ? (parser ? parser(v) : v) : value];
    }),
  ) as { [K in keyof PrivateDef]: PrivateDef[K]["value"] },
  public: Object.fromEntries(
    publicEntries.map(([name, { parser, value }]) => {
      const v = process.env[name];
      return [name, v ? (parser ? parser(v) : v) : value];
    }),
  ) as { [K in keyof PublicDef]: PublicDef[K]["value"] },
};

type PrivateEnv = typeof env.private;
export type PublicEnv = typeof env.public;

if (env.private.PRIVATE_CONFIG_FILE) {
  const config = (await Bun.file(
    env.private.PRIVATE_CONFIG_FILE,
  ).json()) as PrivateEnv;
  env.private = { ...env.private, ...config };
}
if (env.private.PUBLIC_CONFIG_FILE) {
  const config = (await Bun.file(
    env.private.PUBLIC_CONFIG_FILE,
  ).json()) as PublicEnv;
  env.public = { ...env.public, ...config };
}

if (!env.private.OPENAI_API_KEY) {
  console.error("Option OPENAI_API_KEY must be set!");
  process.exit(1);
}

export default env;
