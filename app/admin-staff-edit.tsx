import { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";

export default function AdminStaffEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const staffId = id ? parseInt(id) : 0;

  const { data: staff, isLoading } = trpc.staff.get.useQuery({ id: staffId });
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isVipRated, setIsVipRated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (staff) {
      setName(staff.name);
      setEmail(staff.email || "");
      setIsVipRated(staff.isVipRated === 1);
      setIsAdmin(staff.isAdmin === 1);
    }
  }, [staff]);

  const utils = trpc.useUtils();
  const updateStaff = trpc.staff.update.useMutation({
    onSuccess: () => {
      utils.staff.listAll.invalidate();
      utils.staff.get.invalidate({ id: staffId });
      Alert.alert("Success", "Staff member updated successfully");
      router.back();
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to update staff member");
    },
  });

  const deleteStaff = trpc.staff.delete.useMutation({
    onSuccess: () => {
      utils.staff.listAll.invalidate();
      Alert.alert("Success", "Staff member deleted successfully");
      router.back();
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to delete staff member");
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a name");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Please enter an email");
      return;
    }

    updateStaff.mutate({
      id: staffId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      isVipRated: isVipRated ? 1 : 0,
      isAdmin: isAdmin ? 1 : 0,
      updatedBy: 1, // Admin user
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Staff Member",
      `Are you sure you want to delete ${staff?.name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteStaff.mutate({ id: staffId }),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <ScreenContainer className="p-4">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text className="mt-4 text-muted">Loading staff...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!staff) {
    return (
      <ScreenContainer className="p-4">
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground text-lg">Staff member not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-primary rounded-lg px-6 py-3"
          >
            <Text className="text-background font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Edit Staff</Text>
          <Text className="text-sm text-muted mt-1">Update staff member information</Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          {/* Name */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter full name"
              className="bg-surface border border-border rounded-lg p-3 text-foreground"
              placeholderTextColor="#9BA1A6"
            />
          </View>

          {/* Email */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Email *</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-surface border border-border rounded-lg p-3 text-foreground"
              placeholderTextColor="#9BA1A6"
            />
          </View>

          {/* Staff ID (read-only) */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Staff ID</Text>
            <View className="bg-surface border border-border rounded-lg p-3">
              <Text className="text-muted">{staff.id}</Text>
            </View>
          </View>

          {/* VIP Toggle */}
          <TouchableOpacity
            onPress={() => setIsVipRated(!isVipRated)}
            className="bg-surface border border-border rounded-lg p-4"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">VIP Rated</Text>
                <Text className="text-sm text-muted mt-1">
                  Can create cases for VIP clients
                </Text>
              </View>
              <View
                className={`w-12 h-7 rounded-full p-1 ${
                  isVipRated ? "bg-warning" : "bg-border"
                }`}
              >
                <View
                  className={`w-5 h-5 rounded-full bg-background ${
                    isVipRated ? "ml-auto" : ""
                  }`}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Admin Toggle */}
          <TouchableOpacity
            onPress={() => setIsAdmin(!isAdmin)}
            className="bg-surface border border-border rounded-lg p-4"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">Admin Access</Text>
                <Text className="text-sm text-muted mt-1">
                  Full access to all admin functions
                </Text>
              </View>
              <View
                className={`w-12 h-7 rounded-full p-1 ${
                  isAdmin ? "bg-error" : "bg-border"
                }`}
              >
                <View
                  className={`w-5 h-5 rounded-full bg-background ${
                    isAdmin ? "ml-auto" : ""
                  }`}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View className="gap-3 mt-8 mb-8">
          <TouchableOpacity
            onPress={handleSave}
            disabled={updateStaff.isPending}
            className={`rounded-lg p-4 ${
              updateStaff.isPending ? "bg-muted" : "bg-success"
            }`}
          >
            {updateStaff.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-background font-semibold text-center text-lg">
                Save Changes
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            disabled={updateStaff.isPending || deleteStaff.isPending}
            className="bg-surface border border-border rounded-lg p-4"
          >
            <Text className="text-foreground font-semibold text-center text-lg">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            disabled={updateStaff.isPending || deleteStaff.isPending}
            className={`rounded-lg p-4 ${
              deleteStaff.isPending ? "bg-muted" : "bg-error"
            }`}
          >
            {deleteStaff.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-background font-semibold text-center text-lg">
                Delete Staff Member
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
