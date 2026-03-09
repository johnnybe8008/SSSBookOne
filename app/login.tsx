import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { setStaffInfo, setSessionToken } from "@/lib/_core/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const loginMutation = trpc.auth.login.useMutation();

  const handleLogin = async () => {
    setLoginError("");
    if (!email || !password) {
      setLoginError("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      console.log('[Login] Mutation result:', result);
      if (result.success && result.staff) {
        // Store the real session token from backend
        if (result.sessionToken) {
          await setSessionToken(result.sessionToken);
          console.log('[Login] Session token set:', result.sessionToken);
        }
        // Always fetch staff info from backend after login
        try {
          const apiBaseUrl = (await import("@/constants/oauth")).getApiBaseUrl();
          const url = `${apiBaseUrl}/api/trpc/auth.me`;
          // Always refresh session token before fetching staff info
          const sessionToken = await (await import("@/lib/_core/auth")).getSessionToken();
          const res = await fetch(url, {
            credentials: "include",
            headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
          });
          const data = await res.json();
          const backendStaff = data?.result?.data?.json?.staff || data?.result?.data?.json || data?.result?.data || data?.result;
          if (backendStaff && backendStaff.id) {
            await setStaffInfo(backendStaff);
            console.log('[Login] Staff info set from backend:', backendStaff);
          }
        } catch (err) {
          console.error('[Login] Failed to fetch staff info from backend:', err);
        }
        // Check if staff must change password
        if (result.staff.mustChangePassword === 1) {
          router.replace("/change-password" as any);
        } else {
          router.replace("/(tabs)");
        }
      } else {
        setLoginError("Invalid email or password");
      }
    } catch (error: any) {
      setLoginError(error.message || "Invalid email or password");
      console.error('[Login] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-6 justify-center">
      <View className="max-w-md w-full self-center">
        <Text className="text-3xl font-bold text-foreground mb-2 text-center">Welcome Back</Text>
        <Text className="text-base text-muted mb-8 text-center">
          Sign in to access your counseling sessions
        </Text>

        {loginError ? (
          <Text style={{ color: 'red', marginBottom: 12, textAlign: 'center' }}>{loginError}</Text>
        ) : null}
        <View className="gap-4">
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">Email</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="Enter your email"
              placeholderTextColor="#9BA1A6"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-foreground mb-2">Password</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="Enter your password"
              placeholderTextColor="#9BA1A6"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            className="bg-primary rounded-lg py-4 mt-4"
            onPress={handleLogin}
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-background text-center font-semibold text-lg">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}
