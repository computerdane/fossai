import { useContext } from "react";
import { CustomThemeContext, type CustomTheme } from "./CustomThemeContext";
import { Theme } from "@radix-ui/themes";
import { EnvContext } from "./EnvContext";
import { useLocalStorage } from "@uidotdev/usehooks";

export function CustomThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { THEME_ACCENT_COLOR, THEME_APPEARANCE } = useContext(EnvContext);
  const defaultTheme: CustomTheme = {
    accentColor: THEME_ACCENT_COLOR as any,
    appearance: THEME_APPEARANCE as any,
  };
  const [theme, setTheme] = useLocalStorage("theme", defaultTheme);

  return (
    <CustomThemeContext.Provider value={{ theme, setTheme }}>
      <Theme {...theme}>{children}</Theme>
    </CustomThemeContext.Provider>
  );
}
