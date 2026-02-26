import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

type TabType = "divisions" | "departments" | "companyTeams";

/**
 * Admin - View Organizational Hierarchy
 * 
 * View-only screen showing all:
 * - Divisions (with auto-generated codes like DIV-001)
 * - Departments (with auto-generated codes like DEPT-001)
 * - Company Teams (with auto-generated codes like CTEAM-001)
 * 
 * Management is done via Companies → Divisions → Departments → Company Teams navigation
 */
export default function AdminHierarchyScreen() {
  const colors = useColors();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("divisions");

  // Fetch all data - note: passing 0 to get ALL items across all parents
  const { data: companies } = trpc.companies.list.useQuery();
  const { data: allDivisions, isLoading: divisionsLoading } = trpc.divisions.list.useQuery({ companyId: 0 });
  const { data: allDepartments, isLoading: departmentsLoading } = trpc.departments.list.useQuery({ divisionId: 0 });
  const { data: allCompanyTeams, isLoading: teamsLoading } = trpc.companyTeams.list.useQuery({ departmentId: 0 });

  const isLoading = divisionsLoading || departmentsLoading || teamsLoading;

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">Organizational Hierarchy</Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg ${activeTab === "divisions" ? "bg-primary" : "bg-surface"}`}
            onPress={() => setActiveTab("divisions")}
          >
            <Text className={`text-center font-semibold ${activeTab === "divisions" ? "text-background" : "text-foreground"}`}>
              Divisions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg ${activeTab === "departments" ? "bg-primary" : "bg-surface"}`}
            onPress={() => setActiveTab("departments")}
          >
            <Text className={`text-center font-semibold ${activeTab === "departments" ? "text-background" : "text-foreground"}`}>
              Departments
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg ${activeTab === "companyTeams" ? "bg-primary" : "bg-surface"}`}
            onPress={() => setActiveTab("companyTeams")}
          >
            <Text className={`text-center font-semibold ${activeTab === "companyTeams" ? "text-background" : "text-foreground"}`}>
              Teams
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        {activeTab === "divisions" && (
          <DivisionsTab
            divisions={allDivisions || []}
            companies={companies || []}
            colors={colors}
            router={router}
            isLoading={isLoading}
          />
        )}
        {activeTab === "departments" && (
          <DepartmentsTab
            departments={allDepartments || []}
            allDivisions={allDivisions || []}
            companies={companies || []}
            colors={colors}
            router={router}
            isLoading={isLoading}
          />
        )}
        {activeTab === "companyTeams" && (
          <CompanyTeamsTab
            companyTeams={allCompanyTeams || []}
            allDepartments={allDepartments || []}
            allDivisions={allDivisions || []}
            companies={companies || []}
            colors={colors}
            router={router}
            isLoading={isLoading}
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

// Divisions Tab Component
function DivisionsTab({ divisions, companies, colors, router, isLoading }: any) {
  if (isLoading) {
    return (
      <View className="items-center justify-center py-12">
        <Text className="text-muted">Loading divisions...</Text>
      </View>
    );
  }

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-foreground">All Divisions ({divisions.length})</Text>
        <TouchableOpacity onPress={() => router.push("/admin-companies" as any)}>
          <Text className="text-sm text-primary">Manage via Companies</Text>
        </TouchableOpacity>
      </View>

      {divisions.length > 0 ? (
        divisions.map((division: any) => {
          const company = companies.find((c: any) => c.id === division.companyId);
          return (
            <View key={division.id} className="bg-surface border border-border rounded-2xl p-4">
              <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-3">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">{division.code}</Text>
                      <Text className="text-lg font-semibold text-foreground">{division.name}</Text>
                    </View>
                    <Text className="text-xs text-muted">ID: {division.id}</Text>
                  {company && (
                    <Text className="text-xs text-muted mt-2">Company: {company.name}</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => router.push(`/admin-divisions?companyId=${division.companyId}&companyName=${encodeURIComponent(company?.name || "Company")}` as any)}
                >
                  <IconSymbol name="chevron.right" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      ) : (
        <View className="bg-surface border border-border rounded-2xl p-6 items-center">
          <Text className="text-base text-muted text-center mb-3">No divisions yet.</Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-full"
            onPress={() => router.push("/admin-companies" as any)}
          >
            <Text className="text-background font-semibold">Go to Companies</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// Departments Tab Component
function DepartmentsTab({ departments, allDivisions, companies, colors, router, isLoading }: any) {
  if (isLoading) {
    return (
      <View className="items-center justify-center py-12">
        <Text className="text-muted">Loading departments...</Text>
      </View>
    );
  }

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-foreground">All Departments ({departments.length})</Text>
        <TouchableOpacity onPress={() => router.push("/admin-companies" as any)}>
          <Text className="text-sm text-primary">Manage via Divisions</Text>
        </TouchableOpacity>
      </View>

      {departments.length > 0 ? (
        departments.map((department: any) => {
          const division = allDivisions.find((d: any) => d.id === department.divisionId);
          const company = companies.find((c: any) => c.id === division?.companyId);
          return (
            <View key={department.id} className="bg-surface border border-border rounded-2xl p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">{department.code}</Text>
                    <Text className="text-lg font-semibold text-foreground">{department.name}</Text>
                  </View>
                  <Text className="text-xs text-muted">ID: {department.id}</Text>
                  {division && company && (
                    <Text className="text-xs text-muted mt-2">
                      {company.name} → {division.name}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => router.push(`/admin-departments?divisionId=${department.divisionId}&divisionName=${encodeURIComponent(division?.name || "Division")}` as any)}
                >
                  <IconSymbol name="chevron.right" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      ) : (
        <View className="bg-surface border border-border rounded-2xl p-6 items-center">
          <Text className="text-base text-muted text-center mb-3">No departments yet.</Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-full"
            onPress={() => router.push("/admin-companies" as any)}
          >
            <Text className="text-background font-semibold">Go to Companies</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// Company Teams Tab Component
function CompanyTeamsTab({ companyTeams, allDepartments, allDivisions, companies, colors, router, isLoading }: any) {
  if (isLoading) {
    return (
      <View className="items-center justify-center py-12">
        <Text className="text-muted">Loading company teams...</Text>
      </View>
    );
  }

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-foreground">All Company Teams ({companyTeams.length})</Text>
        <TouchableOpacity onPress={() => router.push("/admin-companies" as any)}>
          <Text className="text-sm text-primary">Manage via Departments</Text>
        </TouchableOpacity>
      </View>

      {companyTeams.length > 0 ? (
        companyTeams.map((team: any) => {
          const department = allDepartments.find((d: any) => d.id === team.departmentId);
          const division = allDivisions.find((d: any) => d.id === department?.divisionId);
          const company = companies.find((c: any) => c.id === division?.companyId);
          return (
            <View key={team.id} className="bg-surface border border-border rounded-2xl p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">{team.code}</Text>
                    <Text className="text-lg font-semibold text-foreground">{team.name}</Text>
                  </View>
                  <Text className="text-xs text-muted">ID: {team.id}</Text>
                  {department && division && company && (
                    <Text className="text-xs text-muted mt-2">
                      {company.name} → {division.name} → {department.name}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          );
        })
      ) : (
        <View className="bg-surface border border-border rounded-2xl p-6 items-center">
          <Text className="text-base text-muted text-center mb-3">No company teams yet.</Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-full"
            onPress={() => router.push("/admin-companies" as any)}
          >
            <Text className="text-background font-semibold">Go to Companies</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
