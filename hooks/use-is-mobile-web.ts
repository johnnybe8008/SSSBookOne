import { Platform, useWindowDimensions } from "react-native";

export function useIsMobileWeb() {
  const { width } = useWindowDimensions();

  if (Platform.OS !== "web" || typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent || "";
  const mobileAgent =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const hasTouchPoints = typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1;

  return mobileAgent || (hasTouchPoints && width < 900);
}
