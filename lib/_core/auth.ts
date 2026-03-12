import { SESSION_TOKEN_KEY } from "@/constants/oauth";
export { setStaffInfo } from "./setUserInfo";

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const STAFF_INFO_KEY = "manus-runtime-staff-info";

export async function clearStaffInfo(): Promise<void> {
  try {
    if (Platform.OS === "web") {
      window.localStorage.removeItem(STAFF_INFO_KEY);
    } else {
      await SecureStore.deleteItemAsync(STAFF_INFO_KEY);
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
      // Prefer explicit storage first, then cookie fallbacks.
      const stored = window.localStorage.getItem(SESSION_TOKEN_KEY);
      if (stored) return stored;

      const matchSessionToken = document.cookie.match(/(?:^|; )session_token=([^;]*)/);
      if (matchSessionToken) return decodeURIComponent(matchSessionToken[1]);

      const matchAppSession = document.cookie.match(/(?:^|; )app_session_id=([^;]*)/);
      if (matchAppSession) return decodeURIComponent(matchAppSession[1]);

      return null;
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
    if (Platform.OS === "web") {
      // Keep a local copy so Authorization header can still be sent when cookie access is restricted.
      window.localStorage.setItem(SESSION_TOKEN_KEY, token);
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
    if (Platform.OS === "web") {
      window.localStorage.removeItem(SESSION_TOKEN_KEY);
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
    let info: string | null = null;
    if (Platform.OS === "web") {
      info = window.localStorage.getItem(STAFF_INFO_KEY);
    } else {
      info = await SecureStore.getItemAsync(STAFF_INFO_KEY);
    }
    if (info) {
      return JSON.parse(info);
    }
    return null;
  } catch (error) {
    console.error("[Auth] Failed to get staff info:", error);
    return null;
  }
}
