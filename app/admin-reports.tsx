import { useState, useMemo } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Modal, Alert, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

type DateRangeType = "weekly" | "monthly" | "ytd" | "custom";

/**
 * Admin - Reports & Analytics Dashboard
 * 
 * Displays key metrics and analytics with filters:
 * - Date range filters (Weekly, Monthly, YTD, Custom)
 * - Organizational filters (Company, Division, Department)
 * - Organizational hierarchy chart
 * - Client distribution across departments
 * - Session completion rates by FSM
 * - Export to PDF/CSV
 */
export default function AdminReportsScreen() {
  const colors = useColors();
  const router = useRouter();

  // Filter state
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>("monthly");
  const [customStartDate, setCustomStartDate] = useState(new Date());
  const [customEndDate, setCustomEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(0);
  const [selectedDivisionId, setSelectedDivisionId] = useState<number>(0);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number>(0);
  const [showHierarchyChart, setShowHierarchyChart] = useState(false);

  // Fetch all data for analytics
  const { data: clients, isLoading: loadingClients } = trpc.clients.list.useQuery({ departmentId: 0 });
  const { data: sessions, isLoading: loadingSessions } = trpc.sessions.listByCase.useQuery({ caseId: 0 });
  const { data: companies, isLoading: loadingCompanies } = trpc.companies.list.useQuery();
  const { data: divisions, isLoading: loadingDivisions } = trpc.divisions.list.useQuery({ companyId: 0 });
  const { data: departments, isLoading: loadingDepartments } = trpc.departments.list.useQuery({ divisionId: 0 });
  const { data: companyTeams, isLoading: loadingCompanyTeams } = trpc.companyTeams.list.useQuery({ departmentId: 0 });
  const { data: fsms, isLoading: loadingFsms } = trpc.fsms.list.useQuery();
  const { data: staff, isLoading: loadingStaff } = trpc.staff.list.useQuery({ teamId: 0 });

  const isLoading = loadingClients || loadingSessions || loadingCompanies || loadingDivisions || loadingDepartments || loadingCompanyTeams || loadingFsms || loadingStaff;

  // Calculate date range
  const dateRange = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    switch (dateRangeType) {
      case "weekly":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "monthly":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "ytd":
        startDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
        break;
      case "custom":
        startDate = customStartDate;
        endDate = customEndDate;
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate };
  }, [dateRangeType, customStartDate, customEndDate]);

  // Filter data based on date range and organizational filters
  const filteredClients = useMemo(() => {
    let filtered = clients || [];

    // Filter by organization
    if (selectedCompanyId > 0) {
      filtered = filtered.filter((c: any) => c.companyId === selectedCompanyId);
    }
    if (selectedDivisionId > 0) {
      filtered = filtered.filter((c: any) => c.divisionId === selectedDivisionId);
    }
    if (selectedDepartmentId > 0) {
      filtered = filtered.filter((c: any) => c.departmentId === selectedDepartmentId);
    }

    // Filter by date (createdAt)
    filtered = filtered.filter((c: any) => {
      const createdAt = new Date(c.createdAt);
      return createdAt >= dateRange.startDate && createdAt <= dateRange.endDate;
    });

    return filtered;
  }, [clients, selectedCompanyId, selectedDivisionId, selectedDepartmentId, dateRange]);

  const filteredSessions = useMemo(() => {
    let filtered = sessions || [];

    // Filter by date (sessionDate)
    filtered = filtered.filter((s: any) => {
      const sessionDate = new Date(s.sessionDate);
      return sessionDate >= dateRange.startDate && sessionDate <= dateRange.endDate;
    });

    return filtered;
  }, [sessions, dateRange]);

  // Calculate analytics from filtered data
  const totalClients = filteredClients.length;
  const totalSessions = filteredSessions.length;
  const totalCompanies = companies?.length || 0;
  const totalDivisions = divisions?.length || 0;
  const totalDepartments = departments?.length || 0;
  const totalFsms = fsms?.length || 0;
  const totalStaff = staff?.length || 0;

  // Client distribution by department
  const clientsByDepartment = departments?.map((dept: any) => ({
    departmentId: dept.id,
    departmentName: dept.name,
    divisionId: dept.divisionId,
    clientCount: filteredClients.filter((c: any) => c.departmentId === dept.id).length,
  })).sort((a, b) => b.clientCount - a.clientCount) || [];

  // Session completion rates by FSM
  const sessionsByFsm = fsms?.map((fsm: any) => {
    const fsmSessions = filteredSessions.filter((s: any) => s.fsmId === fsm.id);
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
    fsm: filteredClients.filter((c: any) => c.referralSourceType === "fsm").length,
    staff: filteredClients.filter((c: any) => c.referralSourceType === "staff").length,
    client: filteredClients.filter((c: any) => c.referralSourceType === "client").length,
    none: filteredClients.filter((c: any) => !c.referralSourceType).length,
  };

  // Session status distribution
  const sessionsByStatus = {
    scheduled: filteredSessions.filter((s: any) => s.status === "Scheduled").length,
    completed: filteredSessions.filter((s: any) => s.status === "Completed").length,
    cancelled: filteredSessions.filter((s: any) => s.status === "Cancelled").length,
    noShow: filteredSessions.filter((s: any) => s.status === "No Show").length,
  };

  // Build hierarchy data
  const hierarchyData = useMemo(() => {
    return companies?.map((company: any) => {
      const companyDivisions = divisions?.filter((d: any) => d.companyId === company.id) || [];
      const companyClientCount = filteredClients.filter((c: any) => c.companyId === company.id).length;

      return {
        id: company.id,
        name: company.name,
        clientCount: companyClientCount,
        divisions: companyDivisions.map((division: any) => {
          const divisionDepartments = departments?.filter((d: any) => d.divisionId === division.id) || [];
          const divisionClientCount = filteredClients.filter((c: any) => c.divisionId === division.id).length;

          return {
            id: division.id,
            name: division.name,
            clientCount: divisionClientCount,
            departments: divisionDepartments.map((department: any) => {
              const departmentTeams = companyTeams?.filter((t: any) => t.departmentId === department.id) || [];
              const departmentClientCount = filteredClients.filter((c: any) => c.departmentId === department.id).length;

              return {
                id: department.id,
                name: department.name,
                clientCount: departmentClientCount,
                teams: departmentTeams.map((team: any) => ({
                  id: team.id,
                  name: team.name,
                  clientCount: 0, // Teams don't directly have clients in current schema
                })),
              };
            }),
          };
        }),
      };
    }) || [];
  }, [companies, divisions, departments, companyTeams, filteredClients]);

  // Export functions
  const handleExportCSV = () => {
    Alert.alert("Export CSV", "CSV export functionality will generate a downloadable file with all analytics data.");
  };

  const handleExportPDF = () => {
    Alert.alert("Export PDF", "PDF export functionality will generate a formatted report with charts and metrics.");
  };

  // Filter divisions based on selected company
  const filteredDivisions = useMemo(() => {
    if (selectedCompanyId === 0) return divisions || [];
    return divisions?.filter((d: any) => d.companyId === selectedCompanyId) || [];
  }, [divisions, selectedCompanyId]);

  // Filter departments based on selected division
  const filteredDepartments = useMemo(() => {
    if (selectedDivisionId === 0) return departments || [];
    return departments?.filter((d: any) => d.divisionId === selectedDivisionId) || [];
  }, [departments, selectedDivisionId]);

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">Reports & Analytics</Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleExportCSV}
              className="bg-success/10 border border-success rounded-full px-3 py-2"
            >
              <Text className="text-xs font-semibold text-success">CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleExportPDF}
              className="bg-error/10 border border-error rounded-full px-3 py-2"
            >
              <Text className="text-xs font-semibold text-error">PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-sm text-muted mt-4">Loading analytics...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Filters Section */}
          <View className="px-6 py-4 bg-surface border-b border-border">
            <Text className="text-sm font-semibold text-foreground mb-3">Filters</Text>
            
            {/* Date Range Filters */}
            <View className="mb-4">
              <Text className="text-xs text-muted mb-2">Date Range</Text>
              <View className="flex-row flex-wrap gap-2">
                <TouchableOpacity
                  onPress={() => setDateRangeType("weekly")}
                  className={`px-4 py-2 rounded-full border ${dateRangeType === "weekly" ? "bg-primary border-primary" : "bg-background border-border"}`}
                >
                  <Text className={`text-sm font-medium ${dateRangeType === "weekly" ? "text-background" : "text-foreground"}`}>
                    Weekly
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setDateRangeType("monthly")}
                  className={`px-4 py-2 rounded-full border ${dateRangeType === "monthly" ? "bg-primary border-primary" : "bg-background border-border"}`}
                >
                  <Text className={`text-sm font-medium ${dateRangeType === "monthly" ? "text-background" : "text-foreground"}`}>
                    Monthly
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setDateRangeType("ytd")}
                  className={`px-4 py-2 rounded-full border ${dateRangeType === "ytd" ? "bg-primary border-primary" : "bg-background border-border"}`}
                >
                  <Text className={`text-sm font-medium ${dateRangeType === "ytd" ? "text-background" : "text-foreground"}`}>
                    YTD
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setDateRangeType("custom")}
                  className={`px-4 py-2 rounded-full border ${dateRangeType === "custom" ? "bg-primary border-primary" : "bg-background border-border"}`}
                >
                  <Text className={`text-sm font-medium ${dateRangeType === "custom" ? "text-background" : "text-foreground"}`}>
                    Custom
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Custom Date Pickers */}
              {dateRangeType === "custom" && (
                <View className="mt-3 gap-2">
                  <TouchableOpacity
                    onPress={() => setShowStartPicker(true)}
                    className="bg-background border border-border rounded-lg px-4 py-3"
                  >
                    <Text className="text-xs text-muted mb-1">Start Date</Text>
                    <Text className="text-sm text-foreground">{customStartDate.toLocaleDateString()}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowEndPicker(true)}
                    className="bg-background border border-border rounded-lg px-4 py-3"
                  >
                    <Text className="text-xs text-muted mb-1">End Date</Text>
                    <Text className="text-sm text-foreground">{customEndDate.toLocaleDateString()}</Text>
                  </TouchableOpacity>

                  {showStartPicker && (
                    <DateTimePicker
                      value={customStartDate}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(event, date) => {
                        setShowStartPicker(Platform.OS === "ios");
                        if (date) setCustomStartDate(date);
                      }}
                    />
                  )}
                  {showEndPicker && (
                    <DateTimePicker
                      value={customEndDate}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(event, date) => {
                        setShowEndPicker(Platform.OS === "ios");
                        if (date) setCustomEndDate(date);
                      }}
                    />
                  )}
                </View>
              )}
            </View>

            {/* Organizational Filters */}
            <View>
              <Text className="text-xs text-muted mb-2">Organization</Text>
              <View className="gap-2">
                <View className="bg-background border border-border rounded-lg overflow-hidden">
                  <Picker
                    selectedValue={selectedCompanyId}
                    onValueChange={(value: number) => {
                      setSelectedCompanyId(value);
                      setSelectedDivisionId(0);
                      setSelectedDepartmentId(0);
                    }}
                  >
                    <Picker.Item label="All Companies" value={0} />
                    {companies?.map((company: any) => (
                      <Picker.Item key={company.id} label={company.name} value={company.id} />
                    ))}
                  </Picker>
                </View>

                {selectedCompanyId > 0 && (
                  <View className="bg-background border border-border rounded-lg overflow-hidden">
                    <Picker
                      selectedValue={selectedDivisionId}
                      onValueChange={(value: number) => {
                        setSelectedDivisionId(value);
                        setSelectedDepartmentId(0);
                      }}
                    >
                      <Picker.Item label="All Divisions" value={0} />
                      {filteredDivisions.map((division: any) => (
                        <Picker.Item key={division.id} label={division.name} value={division.id} />
                      ))}
                    </Picker>
                  </View>
                )}

                {selectedDivisionId > 0 && (
                  <View className="bg-background border border-border rounded-lg overflow-hidden">
                    <Picker
                      selectedValue={selectedDepartmentId}
                      onValueChange={(value: number) => setSelectedDepartmentId(value)}
                    >
                      <Picker.Item label="All Departments" value={0} />
                      {filteredDepartments.map((department: any) => (
                        <Picker.Item key={department.id} label={department.name} value={department.id} />
                      ))}
                    </Picker>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View className="px-6 py-4 gap-6">
            {/* Organizational Hierarchy Chart Button */}
            <TouchableOpacity
              onPress={() => setShowHierarchyChart(true)}
              className="bg-primary/10 border border-primary rounded-2xl p-4 flex-row items-center justify-between"
            >
              <View className="flex-1">
                <Text className="text-lg font-semibold text-primary">Organizational Hierarchy</Text>
                <Text className="text-sm text-muted mt-1">View complete structure with client counts</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.primary} />
            </TouchableOpacity>

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

      {/* Organizational Hierarchy Modal */}
      <Modal
        visible={showHierarchyChart}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHierarchyChart(false)}
      >
        <ScreenContainer className="flex-1">
          <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-foreground">Organizational Hierarchy</Text>
              <TouchableOpacity onPress={() => setShowHierarchyChart(false)}>
                <Text className="text-lg font-semibold text-primary">Done</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
            <View className="gap-4">
              {hierarchyData.map((company) => (
                <View key={company.id} className="bg-surface border border-border rounded-2xl p-4">
                  {/* Company Level */}
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-bold text-foreground">{company.name}</Text>
                    <View className="bg-primary/10 border border-primary rounded-full px-3 py-1">
                      <Text className="text-sm font-semibold text-primary">{company.clientCount} clients</Text>
                    </View>
                  </View>

                  {/* Divisions */}
                  {company.divisions.map((division) => (
                    <View key={division.id} className="ml-4 mt-2 border-l-2 border-border pl-4">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-base font-semibold text-foreground">{division.name}</Text>
                        <View className="bg-success/10 border border-success rounded-full px-2 py-1">
                          <Text className="text-xs font-semibold text-success">{division.clientCount}</Text>
                        </View>
                      </View>

                      {/* Departments */}
                      {division.departments.map((department) => (
                        <View key={department.id} className="ml-4 mt-1 border-l-2 border-border pl-4">
                          <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-sm font-medium text-foreground">{department.name}</Text>
                            <View className="bg-warning/10 border border-warning rounded-full px-2 py-1">
                              <Text className="text-xs font-semibold text-warning">{department.clientCount}</Text>
                            </View>
                          </View>

                          {/* Teams */}
                          {department.teams.length > 0 && (
                            <View className="ml-4 mt-1">
                              {department.teams.map((team) => (
                                <Text key={team.id} className="text-xs text-muted">• {team.name}</Text>
                              ))}
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </ScreenContainer>
      </Modal>
    </ScreenContainer>
  );
}
