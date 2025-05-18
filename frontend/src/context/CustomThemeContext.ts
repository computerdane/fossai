import { createContext } from "react";

// prettier-ignore
export const accentColors = ['gray', 'gold', 'bronze', 'brown', 'yellow', 'amber', 'orange', 'tomato', 'red', 'ruby', 'crimson', 'pink', 'plum', 'purple', 'violet', 'iris', 'indigo', 'blue', 'cyan', 'teal', 'jade', 'green', 'grass', 'lime', 'mint', 'sky'] as const;

type AccentColor = (typeof accentColors)[number];

export type CustomTheme = {
  accentColor: AccentColor;
  appearance: "light" | "dark";
};

export const CustomThemeContext = createContext<{
  theme: CustomTheme;
  setTheme: React.Dispatch<React.SetStateAction<CustomTheme>>;
}>(null!);
