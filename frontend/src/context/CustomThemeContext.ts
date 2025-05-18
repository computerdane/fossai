import type { ThemeOwnProps } from "@radix-ui/themes/components/theme.props";
import { createContext } from "react";

export type CustomTheme = {
  accentColor: ThemeOwnProps["accentColor"];
  appearance: "light" | "dark";
};

export const CustomThemeContext = createContext<{
  theme: CustomTheme;
  setTheme: React.Dispatch<React.SetStateAction<CustomTheme>>;
}>(null!);
