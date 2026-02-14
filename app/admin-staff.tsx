import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { OrganizationalBreadcrumbs } from "@/components/organizational-breadcrumbs";

export default function AdminStaffScreen() {
  const colors = useColors();
  const { data: allStaff, isLoading } = trpc.staff.listAll.useQuery();
  const { data: organizations } = trpc.groups.list.useQuery();
  const { data: staffDepartments } = trpc.staffDepartments.list.useQuery({ organizationId: 0 });
  const { data: teams } = trpc.teams.list.useQuery({ groupId: 0 });

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

        {/* Add New Button */}
        <TouchableOpacity
          onPress={() => router.push("/admin-staff-add" as any)}
          className="bg-primary rounded-lg p-4 mb-4"
        >
          <Text className="text-background font-semibold text-center">+ Add New Staff</Text>
        </TouchableOpacity>

        {/* Staff List */}
        {allStaff && allStaff.length > 0 ? (
          <View className="gap-3">
            {allStaff.map((staff: any) => (
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
