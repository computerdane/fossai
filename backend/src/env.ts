const env = {
  server: {
    JWT_SECRET: process.env.JWT_SECRET ?? "I <3 FOSS!",
  },
  client: {
    SITE_TITLE: process.env.SITE_TITLE ?? "fossai - AI Assistant",
    LOGIN_PAGE_TITLE: process.env.LOGIN_PAGE_TITLE ?? "fossai",
    LOGIN_PAGE_SUBTITLE: process.env.LOGIN_PAGE_SUBTITLE ?? "Free AI.",
  },
};

export default env;
