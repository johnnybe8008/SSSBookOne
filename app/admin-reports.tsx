import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

/**
 * Admin - Reports & Analytics Dashboard
 * 
 * Displays key metrics and analytics:
 * - Client distribution across departments
 * - Session completion rates by FSM
 * - Organizational utilization metrics
 */
export default function AdminReportsScreen() {
  const colors = useColors();
  const router = useRouter();

  // Fetch all data for analytics
  const { data: clients, isLoading: loadingClients } = trpc.clients.list.useQuery({ departmentId: 0 });
  const { data: sessions, isLoading: loadingSessions } = trpc.sessions.listByCase.useQuery({ caseId: 0 });
  const { data: companies, isLoading: loadingCompanies } = trpc.companies.list.useQuery();
  const { data: divisions, isLoading: loadingDivisions } = trpc.divisions.list.useQuery({ companyId: 0 });
  const { data: departments, isLoading: loadingDepartments } = trpc.departments.list.useQuery({ divisionId: 0 });
  const { data: fsms, isLoading: loadingFsms } = trpc.fsms.list.useQuery();
  const { data: staff, isLoading: loadingStaff } = trpc.staff.list.useQuery({ teamId: 0 });

  const isLoading = loadingClients || loadingSessions || loadingCompanies || loadingDivisions || loadingDepartments || loadingFsms || loadingStaff;

  // Calculate analytics
  const totalClients = clients?.length || 0;
  const totalSessions = sessions?.length || 0;
  const totalCompanies = companies?.length || 0;
  const totalDivisions = divisions?.length || 0;
  const totalDepartments = departments?.length || 0;
  const totalFsms = fsms?.length || 0;
  const totalStaff = staff?.length || 0;

  // Client distribution by department
  const clientsByDepartment = departments?.map((dept: any) => ({
    departmentName: dept.name,
    clientCount: clients?.filter((c: any) => c.departmentId === dept.id).length || 0,
  })).sort((a, b) => b.clientCount - a.clientCount) || [];

  // Session completion rates by FSM
  const sessionsByFsm = fsms?.map((fsm: any) => {
    const fsmSessions = sessions?.filter((s: any) => s.fsmId === fsm.id) || [];
    const completedSessions = fsmSessions.filter((s: any) => s.status === "Completed").length;
    const totalFsmSessions = fsmSessions.length;
    const completionRate = totalFsmSessions > 0 ? (completedSessions / totalFsmSessions) * 100 : 0;

    return {
      fsmName: fsm.name,
      totalSessions: totalFsmSessions,
      completedSessions,
      completionRate: completionRate.toFixed(1),
    };
  }).sort((a, b) => b.totalSessions - a.totalSessions) || [];

  // Client referral sources
  const clientsByReferralSource = {
    fsm: clients?.filter((c: any) => c.referralSourceType === "fsm").length || 0,
    staff: clients?.filter((c: any) => c.referralSourceType === "staff").length || 0,
    client: clients?.filter((c: any) => c.referralSourceType === "client").length || 0,
    none: clients?.filter((c: any) => !c.referralSourceType).length || 0,
  };

  // Session status distribution
  const sessionsByStatus = {
    scheduled: sessions?.filter((s: any) => s.status === "Scheduled").length || 0,
    completed: sessions?.filter((s: any) => s.status === "Completed").length || 0,
    cancelled: sessions?.filter((s: any) => s.status === "Cancelled").length || 0,
    noShow: sessions?.filter((s: any) => s.status === "No Show").length || 0,
  };

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">Reports & Analytics</Text>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-sm text-muted mt-4">Loading analytics...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
          <View className="gap-6">
            {/* Overview Cards */}
            <View className="gap-4">
              <Text className="text-xl font-bold text-foreground">Overview</Text>
              <View className="flex-row flex-wrap gap-3">
                <View className="flex-1 min-w-[45%] bg-primary/10 border border-primary rounded-2xl p-4">
                  <Text className="text-3xl font-bold text-primary">{totalClients}</Text>
                  <Text className="text-sm text-muted mt-1">Total Clients</Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-success/10 border border-success rounded-2xl p-4">
                  <Text className="text-3xl font-bold text-success">{totalSessions}</Text>
                  <Text className="text-sm text-muted mt-1">Total Sessions</Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-surface border border-border rounded-2xl p-4">
                  <Text className="text-3xl font-bold text-foreground">{totalCompanies}</Text>
                  <Text className="text-sm text-muted mt-1">Companies</Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-surface border border-border rounded-2xl p-4">
                  <Text className="text-3xl font-bold text-foreground">{totalDivisions}</Text>
                  <Text className="text-sm text-muted mt-1">Divisions</Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-surface border border-border rounded-2xl p-4">
                  <Text className="text-3xl font-bold text-foreground">{totalDepartments}</Text>
                  <Text className="text-sm text-muted mt-1">Departments</Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-surface border border-border rounded-2xl p-4">
                  <Text className="text-3xl font-bold text-foreground">{totalFsms}</Text>
                  <Text className="text-sm text-muted mt-1">FSMs</Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-surface border border-border rounded-2xl p-4">
                  <Text className="text-3xl font-bold text-foreground">{totalStaff}</Text>
                  <Text className="text-sm text-muted mt-1">Staff</Text>
                </View>
              </View>
            </View>

            {/* Client Distribution by Department */}
            <View className="bg-surface border border-border rounded-2xl p-5">
              <Text className="text-lg font-semibold text-foreground mb-4">Client Distribution by Department</Text>
              {clientsByDepartment.length === 0 ? (
                <Text className="text-sm text-muted">No departments found</Text>
              ) : (
                <View className="gap-3">
                  {clientsByDepartment.slice(0, 10).map((dept, index) => (
                    <View key={index} className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-sm text-foreground font-medium">{dept.departmentName}</Text>
                        <View className="h-2 bg-background rounded-full mt-2 overflow-hidden">
                          <View 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: totalClients > 0 ? `${((dept.clientCount / totalClients) * 100).toFixed(0)}%` : '0%' } as any}
                          />
                        </View>
                      </View>
                      <Text className="text-lg font-bold text-primary ml-4">{dept.clientCount}</Text>
                    </View>
                  ))}
                  {clientsByDepartment.length > 10 && (
                    <Text className="text-xs text-muted mt-2">... and {clientsByDepartment.length - 10} more departments</Text>
                  )}
                </View>
              )}
            </View>

            {/* Session Completion Rates by FSM */}
            <View className="bg-surface border border-border rounded-2xl p-5">
              <Text className="text-lg font-semibold text-foreground mb-4">Session Completion Rates by FSM</Text>
              {sessionsByFsm.length === 0 ? (
                <Text className="text-sm text-muted">No FSMs found</Text>
              ) : (
                <View className="gap-3">
                  {sessionsByFsm.slice(0, 10).map((fsm, index) => (
                    <View key={index} className="border-b border-border pb-3">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-sm text-foreground font-medium flex-1">{fsm.fsmName}</Text>
                        <Text className="text-lg font-bold text-success">{fsm.completionRate}%</Text>
                      </View>
                      <View className="flex-row items-center gap-4">
                        <Text className="text-xs text-muted">Total: {fsm.totalSessions}</Text>
                        <Text className="text-xs text-success">Completed: {fsm.completedSessions}</Text>
                      </View>
                      <View className="h-2 bg-background rounded-full mt-2 overflow-hidden">
                        <View 
                          className="h-full bg-success rounded-full" 
                          style={{ width: `${fsm.completionRate}%` as any }}
                        />
                      </View>
                    </View>
                  ))}
                  {sessionsByFsm.length > 10 && (
                    <Text className="text-xs text-muted mt-2">... and {sessionsByFsm.length - 10} more FSMs</Text>
                  )}
                </View>
              )}
            </View>

            {/* Client Referral Sources */}
            <View className="bg-surface border border-border rounded-2xl p-5">
              <Text className="text-lg font-semibold text-foreground mb-4">Client Referral Sources</Text>
              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-foreground">Referred by FSM</Text>
                  <Text className="text-lg font-bold text-primary">{clientsByReferralSource.fsm}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-foreground">Referred by Staff</Text>
                  <Text className="text-lg font-bold text-success">{clientsByReferralSource.staff}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-foreground">Referred by Client</Text>
                  <Text className="text-lg font-bold text-warning">{clientsByReferralSource.client}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-foreground">No Referral Source</Text>
                  <Text className="text-lg font-bold text-muted">{clientsByReferralSource.none}</Text>
                </View>
              </View>
            </View>

            {/* Session Status Distribution */}
            <View className="bg-surface border border-border rounded-2xl p-5">
              <Text className="text-lg font-semibold text-foreground mb-4">Session Status Distribution</Text>
              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-foreground">Scheduled</Text>
                  <Text className="text-lg font-bold text-primary">{sessionsByStatus.scheduled}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-foreground">Completed</Text>
                  <Text className="text-lg font-bold text-success">{sessionsByStatus.completed}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-foreground">Cancelled</Text>
                  <Text className="text-lg font-bold text-warning">{sessionsByStatus.cancelled}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-foreground">No Show</Text>
                  <Text className="text-lg font-bold text-error">{sessionsByStatus.noShow}</Text>
                </View>
              </View>
            </View>

            {/* Organizational Utilization */}
            <View className="bg-surface border border-border rounded-2xl p-5">
              <Text className="text-lg font-semibold text-foreground mb-4">Organizational Utilization</Text>
              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-foreground">Avg Clients per Department</Text>
                  <Text className="text-lg font-bold text-primary">
                    {totalDepartments > 0 ? (totalClients / totalDepartments).toFixed(1) : '0'}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-foreground">Avg Sessions per FSM</Text>
                  <Text className="text-lg font-bold text-success">
                    {totalFsms > 0 ? (totalSessions / totalFsms).toFixed(1) : '0'}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-foreground">Avg Clients per Company</Text>
                  <Text className="text-lg font-bold text-warning">
                    {totalCompanies > 0 ? (totalClients / totalCompanies).toFixed(1) : '0'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
