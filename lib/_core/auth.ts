import { SESSION_TOKEN_KEY } from "@/constants/oauth";
export { setStaffInfo } from "./setUserInfo";

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const STAFF_INFO_KEY = "manus-runtime-staff-info";

export async function clearStaffInfo(): Promise<void> {
  try {
    if (Platform.OS === "web") {
      window.localStorage.removeItem(STAFF_INFO_KEY);
      console.log("[Auth] Staff info cleared from localStorage");
    } else {
      await SecureStore.deleteItemAsync(STAFF_INFO_KEY);
      console.log("[Auth] Staff info cleared from SecureStore");
    }
  } catch (error) {
    console.error("[Auth] Failed to clear staff info:", error);
    throw error;
  }
}

export type Staff = {
  id: number;
  name: string | null;
  email: string | null;
  role: string | null;
  lastSignedIn: Date;
  // Add any other staff fields needed
};


export async function getSessionToken(): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      // Read session_token from cookies
      const match = document.cookie.match(/(?:^|; )session_token=([^;]*)/);
      const token = match ? decodeURIComponent(match[1]) : null;
      console.log("[Auth] Web session token from cookie:", token);
      return token;
    }
    // Use SecureStore for native
    const token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
    console.log(
      "[Auth] Session token retrieved from SecureStore:",
      token ? `present (${token.substring(0, 20)}...)` : "missing",
    );
    return token;
  } catch (error) {
    console.error("[Auth] Failed to get session token:", error);
    return null;
  }
}

export async function setSessionToken(token: string): Promise<void> {
  try {
    // Web platform uses cookie-based auth, no manual token management needed
    if (Platform.OS === "web") {
      console.log("[Auth] Web platform uses cookie-based auth, skipping token storage");
      return;
    }

    // Use SecureStore for native
    console.log("[Auth] Setting session token...", token.substring(0, 20) + "...");
    await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
    console.log("[Auth] Session token stored in SecureStore successfully");
  } catch (error) {
    console.error("[Auth] Failed to set session token:", error);
    throw error;
  }
}

export async function removeSessionToken(): Promise<void> {
  try {
    // Web platform uses cookie-based auth, logout is handled by server clearing cookie
    if (Platform.OS === "web") {
      console.log("[Auth] Web platform uses cookie-based auth, skipping token removal");
      return;
    }

    // Use SecureStore for native
    console.log("[Auth] Removing session token...");
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
    console.log("[Auth] Session token removed from SecureStore successfully");
  } catch (error) {
    console.error("[Auth] Failed to remove session token:", error);
  }
}

export async function getStaffInfo(): Promise<Staff | null> {
  try {
    // ...existing code...
  } catch (error) {
    console.error("[Auth] Failed to get staff info:", error);
    return null;
  }
}
