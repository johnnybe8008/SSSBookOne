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

  const loginMutation = trpc.auth.login.useMutation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      console.log('[Login] Mutation result:', result);
      if (result.success && result.staff) {
        // Store staff info using Auth helpers
        const staffInfo = {
          id: result.staff.id,
          name: result.staff.name,
          email: result.staff.email,
          phone: result.staff.phone,
          role: result.staff.role,
          lastSignedIn: result.staff.lastSignedIn,
        };
        await setStaffInfo(staffInfo);
        console.log('[Login] Staff info set:', staffInfo);
        // Store the real session token from backend
        if (result.sessionToken) {
          await setSessionToken(result.sessionToken);
          console.log('[Login] Session token set:', result.sessionToken);
          // Set session token as cookie for web
          // On web, do not set or read session_token cookie from JS. Backend handles session via HttpOnly cookie.
        }
        // Check if staff must change password
        if (result.staff.mustChangePassword === 1) {
          console.log('[Login] Navigating to change-password');
          router.replace("/change-password" as any);
          console.log('[Login] router.replace to /change-password called');
        } else {
          console.log('[Login] Navigating to home');
          router.replace("/(tabs)");
          console.log('[Login] router.replace to /(tabs) called');
        }
      }
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid email or password");
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
