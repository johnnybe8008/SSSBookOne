import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const STAFF_INFO_KEY = "manus-runtime-staff-info";

export async function setStaffInfo(staff: any): Promise<void> {
  try {
    const info = JSON.stringify(staff);
    if (Platform.OS === "web") {
      window.localStorage.setItem(STAFF_INFO_KEY, info);
    } else {
      await SecureStore.setItemAsync(STAFF_INFO_KEY, info);
    }
  } catch (error) {
    console.error("[Auth] Failed to set staff info:", error);
    throw error;
  }
}
