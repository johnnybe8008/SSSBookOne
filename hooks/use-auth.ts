import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";


type UseAuthOptions = {
  autoFetch?: boolean;
};

export function useAuth(options?: UseAuthOptions) {
  const { autoFetch = true } = options ?? {};
  const [staff, setStaff] = useState<Auth.Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // Debug log for staff state
  useEffect(() => {
    if (staff === null) {
      console.warn("[DEBUG useAuth] staff state CLEARED", {
        staff,
        loading,
        error,
        sessionToken: typeof Auth.getSessionToken === 'function' ? Auth.getSessionToken() : undefined,
      });
    } else {
      console.log("[DEBUG useAuth] staff state", staff);
    }
  }, [staff, loading, error]);

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Always validate session with backend on web
      let backendStaff = null;
      if (Platform.OS === "web") {
        try {
          const { getApiBaseUrl } = await import("@/constants/oauth");
          const apiBaseUrl = getApiBaseUrl();
          const url = `${apiBaseUrl}/api/trpc/auth.me`;
          const sessionToken = typeof Auth.getSessionToken === 'function' ? await Auth.getSessionToken() : undefined;
          const res = await fetch(url, {
            credentials: "include",
            headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
          });
          const data = await res.json();
          console.log("[DEBUG useAuth] /auth.me raw response", data);
          // Try to extract staff record from typical TRPC response
          let staffFromBackend = null;
          if (data?.result?.data) {
            staffFromBackend = data.result.data;
            console.log("[DEBUG useAuth] staffFromBackend (result.data)", staffFromBackend);
          } else if (data?.staff) {
            staffFromBackend = data.staff;
            console.log("[DEBUG useAuth] staffFromBackend (staff)", staffFromBackend);
          } else {
            staffFromBackend = data;
            console.log("[DEBUG useAuth] staffFromBackend (fallback)", staffFromBackend);
          }
          backendStaff = staffFromBackend;
        } catch (err) {
          console.error("[useAuth] Backend /auth.me error:", err);
        }
      }
      if (backendStaff && backendStaff.id) {
        console.log("[DEBUG useAuth] backendStaff found", backendStaff);
        setStaff(backendStaff);
        await Auth.setStaffInfo?.(backendStaff);
        return;
      }
      // Fallback to localStorage for native or if backend fails
      const cachedStaff = await Auth.getStaffInfo();
      console.log("[DEBUG useAuth] cachedStaff", cachedStaff);
      if (cachedStaff) {
        setStaff(cachedStaff);
      } else {
        console.warn("[DEBUG useAuth] staff state CLEARED in fetchStaff", {
          cachedStaff,
          sessionToken: typeof Auth.getSessionToken === 'function' ? await Auth.getSessionToken() : undefined,
        });
        setStaff(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch staff");
      console.error("[useAuth] fetchStaff error:", error);
      setError(error);
      console.warn("[DEBUG useAuth] staff state CLEARED in fetchStaff error", {
        error,
        sessionToken: typeof Auth.getSessionToken === 'function' ? await Auth.getSessionToken() : undefined,
      });
      setStaff(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await Api.logout();
    } catch (err) {
      console.error("[Auth] Logout API call failed:", err);
    } finally {
      await Auth.removeSessionToken();
      await Auth.clearStaffInfo();
      setStaff(null);
      setError(null);
    }
  }, []);

  const isAuthenticated = useMemo(() => Boolean(staff), [staff]);

  useEffect(() => {
    if (autoFetch) {
      Auth.getStaffInfo().then((cachedStaff) => {
        if (cachedStaff) {
          setStaff(cachedStaff);
          setLoading(false);
        } else {
          fetchStaff();
        }
      });
    } else {
      setLoading(false);
    }
  }, [autoFetch, fetchStaff]);

  useEffect(() => {
  }, [staff, loading, isAuthenticated, error]);

  return {
    staff,
    loading,
    error,
    isAuthenticated,
    refresh: fetchStaff,
    logout,
  };
}
