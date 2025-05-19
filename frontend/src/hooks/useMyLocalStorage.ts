import { useLocalStorage } from "@uidotdev/usehooks";
import { useContext } from "react";
import { AuthContext } from "../context";

export function useMyLocalStorage<T>(key: string, initialValue?: T) {
  const { me } = useContext(AuthContext);

  return useLocalStorage(`${key}_${me.id}`, initialValue);
}
