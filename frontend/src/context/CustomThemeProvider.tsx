import { useContext, useState } from "react";
import { CustomThemeContext, type CustomTheme } from "./CustomThemeContext";
import { Theme } from "@radix-ui/themes";
import { EnvContext } from "./EnvContext";

export function CustomThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { THEME_ACCENT_COLOR, THEME_APPEARANCE } = useContext(EnvContext);

  const [theme, setTheme] = useState<CustomTheme>({
    accentColor: THEME_ACCENT_COLOR as any,
    appearance: THEME_APPEARANCE as any,
  });

  return (
    <CustomThemeContext.Provider value={{ theme, setTheme }}>
      <Theme {...theme}>{children}</Theme>
    </CustomThemeContext.Provider>
  );
}
