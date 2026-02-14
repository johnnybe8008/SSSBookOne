import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

/**
 * Admin - Manage Organizations (Staff Structure)
 * 
 * Allows admin users to:
 * - View all organizations
 * - Add new organizations
 * - View departments within organizations
 * - Add departments to organizations
 * - View teams within departments
 * - Add teams to departments
 * - Delete organizations, departments, and teams
 */
export default function AdminOrganizationsScreen() {
  const colors = useColors();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: user } = trpc.auth.me.useQuery();

  const [isAddingOrganization, setIsAddingOrganization] = useState(false);
  const [newOrganizationName, setNewOrganizationName] = useState("");
  const [newOrganizationDescription, setNewOrganizationDescription] = useState("");

  const [expandedOrganizationId, setExpandedOrganizationId] = useState<number | null>(null);
  const [isAddingTeam, setIsAddingTeam] = useState<number | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");

  // Fetch all organizations
  const { data: organizations, isLoading } = trpc.groups.list.useQuery();

  // Fetch departments for expanded organization
  const { data: teams } = trpc.teams.list.useQuery(
    { groupId: expandedOrganizationId || 0 },
    { enabled: expandedOrganizationId !== null }
  );

  // Create organization mutation
  const createOrganization = trpc.groups.create.useMutation({
    onSuccess: () => {
      utils.groups.invalidate();
      setIsAddingOrganization(false);
      setNewOrganizationName("");
      setNewOrganizationDescription("");
      Alert.alert("Success", "Organization created successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create organization");
    },
  });

  // Create team mutation
  const createTeam = trpc.teams.create.useMutation({
    onSuccess: () => {
      utils.teams.invalidate();
      setIsAddingTeam(null);
      setNewTeamName("");
      setNewTeamDescription("");
      Alert.alert("Success", "Team created successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create team");
    },
  });

  // Delete organization mutation
  const deleteOrganization = trpc.groups.delete.useMutation({
    onSuccess: () => {
      utils.groups.invalidate();
      Alert.alert("Success", "Organization deleted successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to delete organization");
    },
  });

  // Delete team mutation
  const deleteTeam = trpc.teams.delete.useMutation({
    onSuccess: () => {
      utils.teams.invalidate();
      Alert.alert("Success", "Team deleted successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to delete team");
    },
  });

  const handleCreateOrganization = () => {
    if (!newOrganizationName.trim()) {
      Alert.alert("Validation Error", "Please enter organization name");
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    createOrganization.mutate({
      name: newOrganizationName.trim(),
      description: newOrganizationDescription.trim() || undefined,
      createdBy: user.id,
      updatedBy: user.id,
    });
  };

  const handleCreateTeam = (organizationId: number) => {
    if (!newTeamName.trim()) {
      Alert.alert("Validation Error", "Please enter team name");
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    createTeam.mutate({
      groupId: expandedOrganizationId!,
      name: newTeamName.trim(),
      description: newTeamDescription.trim() || undefined,
      createdBy: user.id,
      updatedBy: user.id,
    });
  };

  const handleDeleteOrganization = (id: number, name: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete "${name}"? This will also delete all associated teams and staff.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteOrganization.mutate({ id }),
        },
      ]
    );
  };

  const handleDeleteTeam = (id: number, name: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete "${name}"? This will also delete all associated staff.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTeam.mutate({ id }),
        },
      ]
    );
  };

  const toggleOrganization = (organizationId: number) => {
    setExpandedOrganizationId(expandedOrganizationId === organizationId ? null : organizationId);
    setIsAddingTeam(null);
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">Manage Organizations</Text>
        </View>
        <TouchableOpacity onPress={() => setIsAddingOrganization(!isAddingOrganization)}>
          <IconSymbol name={isAddingOrganization ? "xmark.circle.fill" : "plus.circle.fill"} size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Add New Organization Form */}
          {isAddingOrganization && (
            <View className="bg-surface border border-primary rounded-2xl p-4 gap-3">
              <Text className="text-lg font-semibold text-foreground">Add New Organization</Text>
              
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Group Name *</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Enter organization name"
                  placeholderTextColor={colors.muted}
                  value={newOrganizationName}
                  onChangeText={setNewOrganizationName}
                  autoCapitalize="words"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Description</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Enter description (optional)"
                  placeholderTextColor={colors.muted}
                  value={newOrganizationDescription}
                  onChangeText={setNewOrganizationDescription}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                className="bg-primary py-3 rounded-full items-center"
                onPress={handleCreateOrganization}
                disabled={createOrganization.isPending}
              >
                {createOrganization.isPending ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Text className="text-background font-semibold">Create Group</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Organizations List */}
          <Text className="text-lg font-semibold text-foreground mt-2">All Organizations ({organizations?.length || 0})</Text>
          
          {organizations && organizations.length > 0 ? (
            organizations.map((organization: any) => (
              <View key={organization.id} className="bg-surface border border-border rounded-2xl overflow-hidden">
                {/* Group Header */}
                <TouchableOpacity
                  className="p-4 flex-row items-center justify-between"
                  onPress={() => toggleOrganization(organization.id)}
                >
                  <View className="flex-1 mr-3">
                    <Text className="text-lg font-semibold text-foreground">{organization.name}</Text>
                    <Text className="text-xs text-muted mt-1">ID: {organization.id}</Text>
                    {organization.description && (
                      <Text className="text-sm text-muted mt-1">{organization.description}</Text>
                    )}
                  </View>
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteOrganization(organization.id, organization.name);
                      }}
                      disabled={deleteOrganization.isPending}
                    >
                      <IconSymbol name="trash" size={22} color={colors.error} />
                    </TouchableOpacity>
                    <IconSymbol 
                      name={expandedOrganizationId === organization.id ? "chevron.down" : "chevron.right"} 
                      size={24} 
                      color={colors.muted} 
                    />
                  </View>
                </TouchableOpacity>

                {/* Teams List (when expanded) */}
                {expandedOrganizationId === organization.id && (
                  <View className="border-t border-border bg-background/50 p-4">
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-base font-semibold text-foreground">Teams</Text>
                      <TouchableOpacity onPress={() => setIsAddingTeam(isAddingTeam === organization.id ? null : organization.id)}>
                        <IconSymbol 
                          name={isAddingTeam === organization.id ? "xmark.circle.fill" : "plus.circle.fill"} 
                          size={24} 
                          color={colors.primary} 
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Add Team Form */}
                    {isAddingTeam === organization.id && (
                      <View className="bg-surface border border-primary rounded-xl p-3 gap-2 mb-3">
                        <TextInput
                          className="bg-background border border-border rounded-lg px-3 py-2 text-base text-foreground"
                          placeholder="Team name"
                          placeholderTextColor={colors.muted}
                          value={newTeamName}
                          onChangeText={setNewTeamName}
                          autoCapitalize="words"
                        />
                        <TextInput
                          className="bg-background border border-border rounded-lg px-3 py-2 text-base text-foreground"
                          placeholder="Description (optional)"
                          placeholderTextColor={colors.muted}
                          value={newTeamDescription}
                          onChangeText={setNewTeamDescription}
                          multiline
                          numberOfLines={2}
                          textAlignVertical="top"
                        />
                        <TouchableOpacity
                          className="bg-primary py-2 rounded-lg items-center"
                          onPress={() => handleCreateTeam(organization.id)}
                          disabled={createTeam.isPending}
                        >
                          {createTeam.isPending ? (
                            <ActivityIndicator size="small" color={colors.background} />
                          ) : (
                            <Text className="text-background font-semibold text-sm">Add Team</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Teams */}
                    {teams && teams.length > 0 ? (
                      <View className="gap-2">
                        {teams.map((team: any) => (
                          <View key={team.id} className="bg-surface border border-border rounded-xl p-3 flex-row items-start justify-between">
                            <View className="flex-1 mr-2">
                              <Text className="text-base font-medium text-foreground">{team.name}</Text>
                              <Text className="text-xs text-muted mt-1">ID: {team.id}</Text>
                              {team.description && (
                                <Text className="text-sm text-muted mt-1">{team.description}</Text>
                              )}
                            </View>
                            <TouchableOpacity
                              onPress={() => handleDeleteTeam(team.id, team.name)}
                              disabled={deleteTeam.isPending}
                            >
                              <IconSymbol name="trash" size={20} color={colors.error} />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text className="text-sm text-muted text-center py-3">No teams yet. Add one above.</Text>
                    )}
                  </View>
                )}
              </View>
            ))
          ) : (
            <View className="bg-surface border border-border rounded-2xl p-6 items-center">
              <Text className="text-base text-muted text-center">No groups yet. Add your first group above.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
