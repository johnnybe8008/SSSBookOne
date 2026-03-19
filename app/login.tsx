import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { setStaffInfo, setSessionToken } from "@/lib/_core/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [requiresPasswordReset, setRequiresPasswordReset] = useState(false);

  const loginMutation = trpc.auth.login.useMutation();
  const passwordResetStateQuery = trpc.auth.passwordResetState.useQuery(
    { email: email.trim().toLowerCase() },
    {
      enabled: false,
      retry: false,
    }
  );
  const completeForcedPasswordResetMutation = trpc.auth.completeForcedPasswordReset.useMutation();

  const syncPasswordResetState = async (nextEmail?: string) => {
    const lookupEmail = (nextEmail ?? email).trim().toLowerCase();

    if (!lookupEmail || !lookupEmail.includes("@")) {
      setRequiresPasswordReset(false);
      return;
    }

    try {
      const result = await passwordResetStateQuery.refetch();
      setRequiresPasswordReset(!!result.data?.mustChangePassword);
    } catch {
      setRequiresPasswordReset(false);
    }
  };

  const handleLogin = async () => {
    setLoginError("");
    if (requiresPasswordReset) {
      if (!email || !password || !confirmPassword) {
        setLoginError("Please fill in all password reset fields");
        return;
      }

      if (password !== confirmPassword) {
        setLoginError("New passwords do not match");
        return;
      }

      if (password.length < 6) {
        setLoginError("Password must be at least 6 characters long");
        return;
      }

      setLoading(true);
      try {
        await completeForcedPasswordResetMutation.mutateAsync({
          email: email.trim().toLowerCase(),
          newPassword: password,
        });
        setPassword("");
        setConfirmPassword("");
        setRequiresPasswordReset(false);
        Alert.alert("Success", "Password updated. Please sign in with your new password.");
      } catch (error: any) {
        setLoginError(error.message || "Failed to change password");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email || !password) {
      setLoginError("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      if (result.success && result.staff) {
        // Store the real session token from backend
        if (result.sessionToken) {
          await setSessionToken(result.sessionToken);
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
          }
        } catch (err) {
          console.error('[Login] Failed to fetch staff info from backend:', err);
        }
        router.replace("/(tabs)");
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
              onChangeText={(value) => {
                setEmail(value);
                if (!value.trim()) {
                  setRequiresPasswordReset(false);
                  setPassword("");
                  setConfirmPassword("");
                }
              }}
              onBlur={() => syncPasswordResetState()}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="username"
              importantForAutofill="yes"
              editable={!loading}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-foreground mb-2">
              {requiresPasswordReset ? "New Password" : "Password"}
            </Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder={requiresPasswordReset ? "Enter your new password" : "Enter your password"}
              placeholderTextColor="#9BA1A6"
              value={password}
              onChangeText={setPassword}
              autoComplete="current-password"
              autoCorrect={false}
              secureTextEntry
              textContentType="password"
              importantForAutofill="yes"
              editable={!loading}
            />
          </View>

          {requiresPasswordReset && (
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Confirm New Password</Text>
              <TextInput
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholder="Re-enter your new password"
                placeholderTextColor="#9BA1A6"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCorrect={false}
                secureTextEntry
                textContentType="password"
                editable={!loading}
              />
            </View>
          )}

          <TouchableOpacity
            className="bg-primary rounded-lg py-4 mt-4"
            onPress={handleLogin}
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-background text-center font-semibold text-lg">
                {requiresPasswordReset ? "Save New Password" : "Sign In"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}
