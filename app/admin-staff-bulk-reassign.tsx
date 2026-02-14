import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { OrganizationalBreadcrumbs } from "@/components/organizational-breadcrumbs";

export default function AdminStaffBulkReassignScreen() {
  const colors = useColors();
  
  // Filters for source staff
  const [filterOrgId, setFilterOrgId] = useState<number | null>(null);
  const [filterDeptId, setFilterDeptId] = useState<number | null>(null);
  const [filterTeamId, setFilterTeamId] = useState<number | null>(null);
  
  // Destination organization
  const [destOrgId, setDestOrgId] = useState<number | null>(null);
  const [destDeptId, setDestDeptId] = useState<number | null>(null);
  const [destTeamId, setDestTeamId] = useState<number | null>(null);
  
  // Selected staff
  const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);

  // Fetch organizational data
  const { data: organizations } = trpc.groups.list.useQuery();
  const { data: filterDepartments } = trpc.staffDepartments.list.useQuery(
    { organizationId: filterOrgId || 0 },
    { enabled: !!filterOrgId }
  );
  const { data: filterTeams } = trpc.teams.list.useQuery(
    { groupId: filterOrgId || 0 },
    { enabled: !!filterOrgId }
  );
  const { data: destDepartments } = trpc.staffDepartments.list.useQuery(
    { organizationId: destOrgId || 0 },
    { enabled: !!destOrgId }
  );
  const { data: destTeams } = trpc.teams.list.useQuery(
    { groupId: destOrgId || 0 },
    { enabled: !!destOrgId }
  );

  // Fetch all staff
  const { data: allStaff, isLoading } = trpc.staff.listAll.useQuery();

  // Filter staff based on selected filters
  const filteredStaff = allStaff?.filter((staff: any) => {
    if (!filterOrgId && !filterDeptId && !filterTeamId) return true;
    
    if (filterTeamId && staff.teamId === filterTeamId) return true;
    
    // If filtering by org or dept, need to check team's org/dept
    if (filterOrgId || filterDeptId) {
      const team = filterTeams?.find((t: any) => t.id === staff.teamId);
      if (!team) return false;
      
      if (filterDeptId && team.staffDepartmentId !== filterDeptId) return false;
      if (filterOrgId && team.groupId !== filterOrgId) return false;
      
      return true;
    }
    
    return false;
  });

  const utils = trpc.useUtils();
  const bulkUpdateStaff = trpc.staff.bulkUpdate.useMutation({
    onSuccess: () => {
      utils.staff.listAll.invalidate();
      Alert.alert("Success", `${selectedStaffIds.length} staff members reassigned successfully`);
      setSelectedStaffIds([]);
      router.back();
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to reassign staff members");
    },
  });

  const toggleStaffSelection = (staffId: number) => {
    if (selectedStaffIds.includes(staffId)) {
      setSelectedStaffIds(selectedStaffIds.filter(id => id !== staffId));
    } else {
      setSelectedStaffIds([...selectedStaffIds, staffId]);
    }
  };

  const handleBulkReassign = () => {
    if (selectedStaffIds.length === 0) {
      Alert.alert("Error", "Please select at least one staff member");
      return;
    }
    if (!destTeamId) {
      Alert.alert("Error", "Please select a destination team");
      return;
    }

    Alert.alert(
      "Confirm Bulk Reassignment",
      `Reassign ${selectedStaffIds.length} staff member(s) to the selected team?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reassign",
          onPress: () => {
            bulkUpdateStaff.mutate({
              staffIds: selectedStaffIds,
              teamId: destTeamId,
              updatedBy: 1, // Admin user
            });
          },
        },
      ]
    );
  };

  const getStaffBreadcrumbs = (staff: any) => {
    const breadcrumbs: string[] = [];
    
    if (staff.teamId && filterTeams) {
      const team = filterTeams.find((t: any) => t.id === staff.teamId);
      if (team) {
        const org = organizations?.find((o: any) => o.id === team.groupId);
        if (org) breadcrumbs.push(org.name);
        
        const dept = filterDepartments?.find((d: any) => d.id === team.staffDepartmentId);
        if (dept) breadcrumbs.push(dept.name);
        
        breadcrumbs.push(team.name);
      }
    }
    
    return breadcrumbs;
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

  return (
    <ScreenContainer className="p-4">
      <ScrollView>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-2 mb-4"
        >
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          <Text className="text-primary text-base font-semibold">Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Bulk Staff Reassignment</Text>
          <Text className="text-sm text-muted mt-1">
            Reassign multiple staff members to a different team
          </Text>
        </View>

        {/* Source Filters */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Filter Staff (Source)</Text>
          
          {/* Organization Filter */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Organization</Text>
            <View className="bg-surface border border-border rounded-lg">
              <Picker
                selectedValue={filterOrgId}
                onValueChange={(value) => {
                  setFilterOrgId(value);
                  setFilterDeptId(null);
                  setFilterTeamId(null);
                }}
                style={{ color: colors.foreground }}
              >
                <Picker.Item label="All Organizations" value={null} />
                {organizations?.map((org: any) => (
                  <Picker.Item key={org.id} label={org.name} value={org.id} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Department Filter */}
          {filterOrgId && (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Department</Text>
              <View className="bg-surface border border-border rounded-lg">
                <Picker
                  selectedValue={filterDeptId}
                  onValueChange={(value) => {
                    setFilterDeptId(value);
                    setFilterTeamId(null);
                  }}
                  style={{ color: colors.foreground }}
                >
                  <Picker.Item label="All Departments" value={null} />
                  {filterDepartments?.map((dept: any) => (
                    <Picker.Item key={dept.id} label={dept.name} value={dept.id} />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          {/* Team Filter */}
          {filterOrgId && (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Team</Text>
              <View className="bg-surface border border-border rounded-lg">
                <Picker
                  selectedValue={filterTeamId}
                  onValueChange={setFilterTeamId}
                  style={{ color: colors.foreground }}
                >
                  <Picker.Item label="All Teams" value={null} />
                  {filterTeams?.filter((t: any) => !filterDeptId || t.staffDepartmentId === filterDeptId).map((team: any) => (
                    <Picker.Item key={team.id} label={team.name} value={team.id} />
                  ))}
                </Picker>
              </View>
            </View>
          )}
        </View>

        {/* Staff Selection */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">
            Select Staff ({selectedStaffIds.length} selected)
          </Text>
          
          {filteredStaff && filteredStaff.length > 0 ? (
            <View className="gap-2">
              {filteredStaff.map((staff: any) => (
                <TouchableOpacity
                  key={staff.id}
                  onPress={() => toggleStaffSelection(staff.id)}
                  className={`rounded-lg p-4 border ${
                    selectedStaffIds.includes(staff.id)
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface"
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">
                        {staff.name}
                      </Text>
                      <Text className="text-sm text-muted mt-1">{staff.email}</Text>
                      <OrganizationalBreadcrumbs items={getStaffBreadcrumbs(staff)} className="mt-2" />
                    </View>
                    <View
                      className={`w-6 h-6 rounded border-2 items-center justify-center ${
                        selectedStaffIds.includes(staff.id)
                          ? "border-primary bg-primary"
                          : "border-border"
                      }`}
                    >
                      {selectedStaffIds.includes(staff.id) && (
                        <Text className="text-background text-xs font-bold">✓</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="items-center py-8 bg-surface rounded-lg">
              <Text className="text-muted text-center">
                {filterOrgId || filterDeptId || filterTeamId
                  ? "No staff members match the selected filters"
                  : "Select filters to view staff members"}
              </Text>
            </View>
          )}
        </View>

        {/* Destination Selection */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Destination Team</Text>
          
          {/* Organization */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Organization *</Text>
            <View className="bg-surface border border-border rounded-lg">
              <Picker
                selectedValue={destOrgId}
                onValueChange={(value) => {
                  setDestOrgId(value);
                  setDestDeptId(null);
                  setDestTeamId(null);
                }}
                style={{ color: colors.foreground }}
              >
                <Picker.Item label="Select Organization" value={null} />
                {organizations?.map((org: any) => (
                  <Picker.Item key={org.id} label={org.name} value={org.id} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Department */}
          {destOrgId && (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Department *</Text>
              <View className="bg-surface border border-border rounded-lg">
                <Picker
                  selectedValue={destDeptId}
                  onValueChange={(value) => {
                    setDestDeptId(value);
                    setDestTeamId(null);
                  }}
                  style={{ color: colors.foreground }}
                >
                  <Picker.Item label="Select Department" value={null} />
                  {destDepartments?.map((dept: any) => (
                    <Picker.Item key={dept.id} label={dept.name} value={dept.id} />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          {/* Team */}
          {destDeptId && (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Team *</Text>
              <View className="bg-surface border border-border rounded-lg">
                <Picker
                  selectedValue={destTeamId}
                  onValueChange={setDestTeamId}
                  style={{ color: colors.foreground }}
                >
                  <Picker.Item label="Select Team" value={null} />
                  {destTeams?.filter((t: any) => t.staffDepartmentId === destDeptId).map((team: any) => (
                    <Picker.Item key={team.id} label={team.name} value={team.id} />
                  ))}
                </Picker>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="gap-3 mt-4 mb-8">
          <TouchableOpacity
            onPress={handleBulkReassign}
            disabled={bulkUpdateStaff.isPending || selectedStaffIds.length === 0 || !destTeamId}
            className={`rounded-lg p-4 ${
              bulkUpdateStaff.isPending || selectedStaffIds.length === 0 || !destTeamId
                ? "bg-muted"
                : "bg-primary"
            }`}
          >
            {bulkUpdateStaff.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-background font-semibold text-center text-lg">
                Reassign {selectedStaffIds.length} Staff Member{selectedStaffIds.length !== 1 ? "s" : ""}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            disabled={bulkUpdateStaff.isPending}
            className="bg-surface border border-border rounded-lg p-4"
          >
            <Text className="text-foreground font-semibold text-center text-lg">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
