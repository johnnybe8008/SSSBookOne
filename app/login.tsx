import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import * as Auth from "@/lib/_core/auth";

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
      
      if (result.success && result.user) {
        // Store user info using Auth helpers
        const userInfo: Auth.User = {
          id: result.user.id,
          openId: result.user.openId || `email-${result.user.id}`,
          name: result.user.name,
          email: result.user.email,
          loginMethod: "email-password",
          lastSignedIn: new Date(),
        };
        
        await Auth.setUserInfo(userInfo);
        // For native, we also need a session token (use a mock token for now)
        await Auth.setSessionToken(`session-${result.user.id}-${Date.now()}`);
        
        // Navigate to home
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid email or password");
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
              placeholder="admin@dohbookone.com"
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

          <View className="mt-6 p-4 bg-surface rounded-lg border border-border">
            <Text className="text-xs text-muted text-center">
              Default Admin Account{"\n"}
              Email: admin@dohbookone.com{"\n"}
              Password: password
            </Text>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
