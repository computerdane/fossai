import { useContext, useEffect } from "react";
import { CustomThemeContext, type CustomTheme } from "./CustomThemeContext";
import { Theme } from "@radix-ui/themes";
import { EnvContext } from "./EnvContext";
import { useLocalStorage } from "@uidotdev/usehooks";

export function CustomThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const env = useContext(EnvContext);
  const defaultTheme: CustomTheme = {
    accentColor: env.THEME_ACCENT_COLOR as any,
    appearance: env.THEME_APPEARANCE as any,
  };
  const [theme, setTheme] = useLocalStorage("theme", defaultTheme);

  useEffect(() => {
    if (env.DISABLE_USER_SET_THEME_ACCENT_COLOR) {
      setTheme((t) => ({ ...t, accentColor: defaultTheme.accentColor }));
    }
  }, []);

  return (
    <CustomThemeContext.Provider value={{ theme, setTheme }}>
      <Theme {...theme} className="transition-colors">
        {children}
      </Theme>
    </CustomThemeContext.Provider>
  );
}
