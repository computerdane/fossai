import { useState } from "react";
import { CustomThemeContext, type CustomTheme } from "./CustomThemeContext";
import { Theme } from "@radix-ui/themes";

export function CustomThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<CustomTheme>({
    accentColor: "gray",
    appearance: "dark",
  });

  return (
    <CustomThemeContext.Provider value={{ theme, setTheme }}>
      <Theme {...theme}>{children}</Theme>
    </CustomThemeContext.Provider>
  );
}
