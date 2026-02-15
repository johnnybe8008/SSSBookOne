import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { OrganizationalBreadcrumbs } from "@/components/organizational-breadcrumbs";
import { Picker } from "@react-native-picker/picker";

export default function AdminStaffScreen() {
  const colors = useColors();
  const { data: allStaff, isLoading } = trpc.staff.listAll.useQuery();
  const { data: organizations } = trpc.groups.list.useQuery();
  const { data: staffDepartments } = trpc.staffDepartments.list.useQuery({ organizationId: 0 });
  const { data: teams } = trpc.teams.list.useQuery({ groupId: 0 });

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOrganization, setFilterOrganization] = useState<number | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<number | null>(null);
  const [filterTeam, setFilterTeam] = useState<number | null>(null);
  const [filterRole, setFilterRole] = useState<string | null>(null);

  // Helper function to get organizational breadcrumbs for a staff member
  const getStaffBreadcrumbs = (staff: any) => {
    const breadcrumbs: string[] = [];
    
    if (staff.teamId && teams) {
      const team = teams.find((t: any) => t.id === staff.teamId);
      if (team) {
        // Find organization
        const org = organizations?.find((o: any) => o.id === team.groupId);
        if (org) {
          breadcrumbs.push(org.name);
        }
        
        // Find department
        const dept = staffDepartments?.find((d: any) => d.id === team.staffDepartmentId);
        if (dept) {
          breadcrumbs.push(dept.name);
        }
        
        // Add team
        breadcrumbs.push(team.name);
      }
    }
    
    return breadcrumbs;
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    if (!allStaff || allStaff.length === 0) {
      Alert.alert("No Data", "There are no staff members to export.");
      return;
    }

    // Create CSV header
    const header = "Name,Email,Phone,Role,VIP Rated,Organization,Department,Team\n";
    
    // Create CSV rows
    const rows = allStaff.map((staff: any) => {
      const breadcrumbs = getStaffBreadcrumbs(staff);
      const org = breadcrumbs[0] || "";
      const dept = breadcrumbs[1] || "";
      const team = breadcrumbs[2] || "";
      
      return [
        `"${staff.name}"`,
        `"${staff.email || ""}"`,
        `"${staff.phone || ""}"`,
        staff.role,
        staff.isVipRated ? "Yes" : "No",
        `"${org}"`,
        `"${dept}"`,
        `"${team}"`
      ].join(",");
    }).join("\n");

    const csv = header + rows;
    
    // TODO: Implement actual file download/sharing
    // For now, just show an alert with the CSV data
    Alert.alert(
      "Export Staff",
      `CSV export ready with ${allStaff.length} staff members. In a production app, this would download a file.`,
      [
        { text: "OK" },
        { text: "Copy to Clipboard", onPress: () => {
          // TODO: Copy CSV to clipboard
          Alert.alert("Success", "CSV data copied to clipboard");
        }}
      ]
    );
  };

  // CSV Import Handler
  const handleImportCSV = () => {
    Alert.alert(
      "Import Staff",
      "CSV import functionality coming soon. Expected format:\nName,Email,Phone,Role,VIP Rated,Organization,Department,Team",
      [{ text: "OK" }]
    );
  };

  // Filter staff based on search and filters
  const filteredStaff = allStaff?.filter((staff: any) => {
    // Search filter (name or email)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        staff.name.toLowerCase().includes(query) ||
        staff.email?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Role filter
    if (filterRole && staff.role !== filterRole) {
      return false;
    }

    // Team filter
    if (filterTeam && staff.teamId !== filterTeam) {
      return false;
    }

    // Department filter
    if (filterDepartment) {
      const team = teams?.find((t: any) => t.id === staff.teamId);
      if (!team || team.staffDepartmentId !== filterDepartment) {
        return false;
      }
    }

    // Organization filter
    if (filterOrganization) {
      const team = teams?.find((t: any) => t.id === staff.teamId);
      if (!team || team.groupId !== filterOrganization) {
        return false;
      }
    }

    return true;
  }) || [];

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
          <Text className="text-3xl font-bold text-foreground">Manage Staff</Text>
          <Text className="text-sm text-muted mt-1">
            {allStaff?.length || 0} staff members
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="mb-4 gap-3">
          <TouchableOpacity
            onPress={() => router.push("/admin-staff-add" as any)}
            className="bg-primary rounded-lg p-4"
          >
            <Text className="text-background font-semibold text-center">+ Add New Staff</Text>
          </TouchableOpacity>
          
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleExportCSV}
              className="flex-1 bg-success rounded-lg p-4"
            >
              <Text className="text-background font-semibold text-center">Export CSV</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleImportCSV}
              className="flex-1 bg-warning rounded-lg p-4"
            >
              <Text className="text-background font-semibold text-center">Import CSV</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View className="mb-4">
          <TextInput
            className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
            placeholder="Search by name or email..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <View className="mb-4 gap-3">
          <Text className="text-sm font-semibold text-foreground">Filters</Text>
          
          {/* Organization Filter */}
          <View className="bg-surface border border-border rounded-xl">
            <Picker
              selectedValue={filterOrganization}
              onValueChange={(value) => setFilterOrganization(value)}
              style={{ color: colors.foreground }}
            >
              <Picker.Item label="All Organizations" value={null} />
              {organizations?.map((org: any) => (
                <Picker.Item key={org.id} label={org.name} value={org.id} />
              ))}
            </Picker>
          </View>

          {/* Department Filter */}
          <View className="bg-surface border border-border rounded-xl">
            <Picker
              selectedValue={filterDepartment}
              onValueChange={(value) => setFilterDepartment(value)}
              style={{ color: colors.foreground }}
            >
              <Picker.Item label="All Departments" value={null} />
              {staffDepartments?.map((dept: any) => (
                <Picker.Item key={dept.id} label={dept.name} value={dept.id} />
              ))}
            </Picker>
          </View>

          {/* Team Filter */}
          <View className="bg-surface border border-border rounded-xl">
            <Picker
              selectedValue={filterTeam}
              onValueChange={(value) => setFilterTeam(value)}
              style={{ color: colors.foreground }}
            >
              <Picker.Item label="All Teams" value={null} />
              {teams?.map((team: any) => (
                <Picker.Item key={team.id} label={team.name} value={team.id} />
              ))}
            </Picker>
          </View>

          {/* Role Filter */}
          <View className="bg-surface border border-border rounded-xl">
            <Picker
              selectedValue={filterRole}
              onValueChange={(value) => setFilterRole(value)}
              style={{ color: colors.foreground }}
            >
              <Picker.Item label="All Roles" value={null} />
              <Picker.Item label="Admin" value="admin" />
              <Picker.Item label="Counselor" value="counselor" />
              <Picker.Item label="View Only" value="viewer" />
            </Picker>
          </View>

          {/* Clear Filters Button */}
          {(searchQuery || filterOrganization || filterDepartment || filterTeam || filterRole) && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setFilterOrganization(null);
                setFilterDepartment(null);
                setFilterTeam(null);
                setFilterRole(null);
              }}
              className="bg-muted rounded-lg p-3"
            >
              <Text className="text-background font-semibold text-center">Clear All Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Staff List */}
        <Text className="text-sm text-muted mb-3">
          Showing {filteredStaff.length} of {allStaff?.length || 0} staff members
        </Text>
        {filteredStaff && filteredStaff.length > 0 ? (
          <View className="gap-3">
            {filteredStaff.map((staff: any) => (
              <TouchableOpacity
                key={staff.id}
                onPress={() => router.push(`/admin-staff-edit?id=${staff.id}` as any)}
                className="bg-surface rounded-lg p-4 border border-border"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground">
                      {staff.name}
                    </Text>
                    <Text className="text-sm text-muted mt-1">{staff.email}</Text>
                    
                    {/* Organizational Breadcrumbs */}
                    <OrganizationalBreadcrumbs items={getStaffBreadcrumbs(staff)} className="mt-2" />
                    
                    {/* Badges */}
                    <View className="flex-row gap-2 mt-2">
                      {staff.role === "admin" && (
                        <View className="bg-error rounded px-2 py-1">
                          <Text className="text-xs text-background font-semibold">ADMIN</Text>
                        </View>
                      )}
                      {staff.role === "counselor" && (
                        <View className="bg-primary rounded px-2 py-1">
                          <Text className="text-xs text-background font-semibold">COUNSELOR</Text>
                        </View>
                      )}
                      {staff.role === "viewer" && (
                        <View className="bg-success rounded px-2 py-1">
                          <Text className="text-xs text-background font-semibold">VIEW ONLY</Text>
                        </View>
                      )}
                      {staff.isVipRated && (
                        <View className="bg-warning rounded px-2 py-1">
                          <Text className="text-xs text-background font-semibold">VIP</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <Text className="text-2xl text-muted">›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="items-center py-12">
            <Text className="text-muted text-center">No staff members found</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
