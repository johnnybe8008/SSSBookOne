import DateTimePicker from "@/components/ui/DateTimePicker";
import { useState, useMemo, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Modal, Alert, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
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
  const [selectedStaffId, setSelectedStaffId] = useState<number>(0);
  const [showHierarchyChart, setShowHierarchyChart] = useState(false);

  // Fetch all data for analytics
  const { data: clients, isLoading: loadingClients } = trpc.clients.listAll.useQuery();
  const { data: sessions, isLoading: loadingSessions } = trpc.sessions.listAll.useQuery();

  // Debug logging
  useEffect(() => {
    console.log('[AdminReports] Clients data:', clients?.length || 0, 'items');
    console.log('[AdminReports] Sessions data:', sessions?.length || 0, 'items');
    console.log('[AdminReports] Loading states - clients:', loadingClients, 'sessions:', loadingSessions);
  }, [clients, sessions, loadingClients, loadingSessions]);
  const { data: companies, isLoading: loadingCompanies } = trpc.companies.list.useQuery();
  const { data: divisions, isLoading: loadingDivisions } = trpc.divisions.listAll.useQuery();
  const { data: departments, isLoading: loadingDepartments } = trpc.departments.listAll.useQuery();
  const { data: companyTeams, isLoading: loadingCompanyTeams } = trpc.companyTeams.listAll.useQuery();
  const { data: fsms, isLoading: loadingFsms } = trpc.fsms.list.useQuery();
  const { data: staff, isLoading: loadingStaff } = trpc.staff.listAll.useQuery();

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

    // Filter by organization hierarchy
    if (selectedCompanyId > 0) {
      // Get all divisions in the selected company
      const companyDivisionIds = divisions?.filter((d: any) => d.companyId === selectedCompanyId).map((d: any) => d.id) || [];
      // Get all departments in those divisions
      const companyDepartmentIds = departments?.filter((d: any) => companyDivisionIds.includes(d.divisionId)).map((d: any) => d.id) || [];
      // Filter clients by those departments
      filtered = filtered.filter((c: any) => companyDepartmentIds.includes(c.departmentId));
    }
    if (selectedDivisionId > 0) {
      // Get all departments in the selected division
      const divisionDepartmentIds = departments?.filter((d: any) => d.divisionId === selectedDivisionId).map((d: any) => d.id) || [];
      // Filter clients by those departments
      filtered = filtered.filter((c: any) => divisionDepartmentIds.includes(c.departmentId));
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
  }, [clients, divisions, departments, selectedCompanyId, selectedDivisionId, selectedDepartmentId, dateRange]);

  const filteredSessions = useMemo(() => {
    let filtered = sessions || [];

    // Filter by date (use scheduledDate, or sessionStartTime if scheduled date is null)
    filtered = filtered.filter((s: any) => {
      const sessionDate = s.scheduledDate ? new Date(s.scheduledDate) : (s.sessionStartTime ? new Date(s.sessionStartTime) : null);
      if (!sessionDate) return false; // Skip sessions with no date
      return sessionDate >= dateRange.startDate && sessionDate <= dateRange.endDate;
    });

    // Filter by organizational hierarchy (only include sessions for filtered clients)
    const filteredClientIds = new Set(filteredClients.map((c: any) => c.id));
    filtered = filtered.filter((s: any) => filteredClientIds.has(s.clientId));

    // Filter by staff member
    if (selectedStaffId > 0) {
      filtered = filtered.filter((s: any) => s.staffId === selectedStaffId);
    }

    return filtered;
  }, [sessions, dateRange, filteredClients, selectedStaffId]);

  // Calculate analytics from filtered data
  const totalClients = filteredClients.length;
  const totalSessions = filteredSessions.length;
  
  // Filter organizational counts based on selected filters
  const filteredDivisions = useMemo(() => {
    if (selectedCompanyId > 0) {
      return divisions?.filter((d: any) => d.companyId === selectedCompanyId) || [];
    }
    return divisions || [];
  }, [divisions, selectedCompanyId]);

  const filteredDepartments = useMemo(() => {
    if (selectedDivisionId > 0) {
      return departments?.filter((d: any) => d.divisionId === selectedDivisionId) || [];
    }
    if (selectedCompanyId > 0) {
      const companyDivisionIds = divisions?.filter((d: any) => d.companyId === selectedCompanyId).map((d: any) => d.id) || [];
      return departments?.filter((d: any) => companyDivisionIds.includes(d.divisionId)) || [];
    }
    return departments || [];
  }, [departments, divisions, selectedCompanyId, selectedDivisionId]);

  const totalCompanies = selectedCompanyId > 0 ? 1 : (companies?.length || 0);
  const totalDivisions = filteredDivisions.length;
  const totalDepartments = filteredDepartments.length;
  const totalFsms = fsms?.length || 0;
  const totalStaff = staff?.length || 0;

  // Client distribution by department
  const clientsByDepartment = (departments?.map((dept: any) => ({
    departmentId: dept.id,
    departmentName: dept.name,
    divisionId: dept.divisionId,
    clientCount: filteredClients.filter((c: any) => c.departmentId === dept.id).length,
  })) || []).sort((a, b) => b.clientCount - a.clientCount);

  // Session completion rates by FSM
  const sessionsByFsm = (fsms?.map((fsm: any) => {
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
  }) || []).sort((a, b) => b.totalSessions - a.totalSessions);

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
    if (!companies || !divisions || !departments || !companyTeams) return [];
    
    const hierarchy = companies.map((company: any) => {
      const companyDivisions = divisions?.filter((d: any) => d.companyId === company.id) || [];
      
      // Count clients by traversing: company -> divisions -> departments -> clients
      const companyDepartmentIds = companyDivisions.flatMap((div: any) => 
        departments?.filter((dept: any) => dept.divisionId === div.id).map((dept: any) => dept.id) || []
      );
      const companyClientCount = filteredClients.filter((c: any) => companyDepartmentIds.includes(c.departmentId)).length;

      return {
        id: company.id,
        name: company.name,
        clientCount: companyClientCount,
        divisions: companyDivisions.map((division: any) => {
          const divisionDepartments = departments?.filter((d: any) => d.divisionId === division.id) || [];
          
          // Count clients by traversing: division -> departments -> clients
          const divisionDepartmentIds = divisionDepartments.map((dept: any) => dept.id);
          const divisionClientCount = filteredClients.filter((c: any) => divisionDepartmentIds.includes(c.departmentId)).length;

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
    });

    // Filter out companies with 0 clients when filters are applied
    const hasFilters = selectedCompanyId > 0 || selectedDivisionId > 0 || selectedDepartmentId > 0 || selectedStaffId > 0;
    if (hasFilters) {
      return hierarchy
        .filter(company => company.clientCount > 0)
        .map(company => ({
          ...company,
          divisions: company.divisions
            .filter(division => division.clientCount > 0)
            .map(division => ({
              ...division,
              departments: division.departments.filter(dept => dept.clientCount > 0)
            }))
        }));
    }

    return hierarchy;
  }, [companies, divisions, departments, companyTeams, filteredClients, selectedCompanyId, selectedDivisionId, selectedDepartmentId]);

  // Export functions
  const handleExportCSV = async () => {
    try {
      // Generate CSV content
      const csvLines: string[] = [];

      // Header with filter information
      csvLines.push("DoH Book One - Reports & Analytics Export");
      csvLines.push(`Generated: ${new Date().toLocaleString()}`);
      csvLines.push("");
      csvLines.push("Filter Settings:");
      csvLines.push(`Date Range: ${dateRangeType.toUpperCase()}`);
      csvLines.push(`Start Date: ${dateRange.startDate.toLocaleDateString()}`);
      csvLines.push(`End Date: ${dateRange.endDate.toLocaleDateString()}`);
      
      const selectedCompany = companies?.find((c: any) => c.id === selectedCompanyId);
      const selectedDivision = divisions?.find((d: any) => d.id === selectedDivisionId);
      const selectedDepartment = departments?.find((d: any) => d.id === selectedDepartmentId);
      const selectedStaff = staff?.find((s: any) => s.id === selectedStaffId);
      
      csvLines.push(`Company: ${selectedCompany?.name || "All Companies"}`);
      csvLines.push(`Division: ${selectedDivision?.name || "All Divisions"}`);
      csvLines.push(`Department: ${selectedDepartment?.name || "All Departments"}`);
      csvLines.push(`Staff Member: ${selectedStaff?.name || "All Staff"}`);
      csvLines.push("");
      csvLines.push("");

      // Overview metrics
      csvLines.push("OVERVIEW METRICS");
      csvLines.push("Metric,Value");
      csvLines.push(`Total Clients,${totalClients}`);
      csvLines.push(`Total Sessions,${totalSessions}`);
      csvLines.push(`Total Companies,${totalCompanies}`);
      csvLines.push(`Total Divisions,${totalDivisions}`);
      csvLines.push(`Total Departments,${totalDepartments}`);
      csvLines.push(`Total FSMs,${totalFsms}`);
      csvLines.push(`Total Staff,${totalStaff}`);
      csvLines.push("");
      csvLines.push("");

      // Client distribution by department
      csvLines.push("CLIENT DISTRIBUTION BY DEPARTMENT");
      csvLines.push("Department,Client Count,Percentage");
      clientsByDepartment.forEach((dept) => {
        const percentage = totalClients > 0 ? ((dept.clientCount / totalClients) * 100).toFixed(1) : "0";
        csvLines.push(`"${dept.departmentName}",${dept.clientCount},${percentage}%`);
      });
      csvLines.push("");
      csvLines.push("");

      // Session completion rates by FSM
      csvLines.push("SESSION COMPLETION RATES BY FSM");
      csvLines.push("FSM Name,Total Sessions,Completed Sessions,Completion Rate");
      sessionsByFsm.forEach((fsm) => {
        csvLines.push(`"${fsm.fsmName}",${fsm.totalSessions},${fsm.completedSessions},${fsm.completionRate}%`);
      });
      csvLines.push("");
      csvLines.push("");

      // Client referral sources
      csvLines.push("CLIENT REFERRAL SOURCES");
      csvLines.push("Referral Source,Count");
      csvLines.push(`Referred by FSM,${clientsByReferralSource.fsm}`);
      csvLines.push(`Referred by Staff,${clientsByReferralSource.staff}`);
      csvLines.push(`Referred by Client,${clientsByReferralSource.client}`);
      csvLines.push(`No Referral Source,${clientsByReferralSource.none}`);
      csvLines.push("");
      csvLines.push("");

      // Session status distribution
      csvLines.push("SESSION STATUS DISTRIBUTION");
      csvLines.push("Status,Count");
      csvLines.push(`Scheduled,${sessionsByStatus.scheduled}`);
      csvLines.push(`Completed,${sessionsByStatus.completed}`);
      csvLines.push(`Cancelled,${sessionsByStatus.cancelled}`);
      csvLines.push(`No Show,${sessionsByStatus.noShow}`);
      csvLines.push("");
      csvLines.push("");

      // Organizational utilization
      csvLines.push("ORGANIZATIONAL UTILIZATION");
      csvLines.push("Metric,Value");
      csvLines.push(`Avg Clients per Department,${totalDepartments > 0 ? (totalClients / totalDepartments).toFixed(1) : "0"}`);
      csvLines.push(`Avg Sessions per FSM,${totalFsms > 0 ? (totalSessions / totalFsms).toFixed(1) : "0"}`);
      csvLines.push(`Avg Clients per Company,${totalCompanies > 0 ? (totalClients / totalCompanies).toFixed(1) : "0"}`);
      csvLines.push("");
      csvLines.push("");

      // Organizational hierarchy
      csvLines.push("ORGANIZATIONAL HIERARCHY");
      csvLines.push("Company,Division,Department,Company Team,Client Count");
      hierarchyData.forEach((company) => {
        company.divisions.forEach((division) => {
          division.departments.forEach((department) => {
            if (department.teams.length > 0) {
              department.teams.forEach((team) => {
                csvLines.push(`"${company.name}","${division.name}","${department.name}","${team.name}",${department.clientCount}`);
              });
            } else {
              csvLines.push(`"${company.name}","${division.name}","${department.name}",,${department.clientCount}`);
            }
          });
        });
      });

      // Join all lines with newline
      const csvContent = csvLines.join("\n");

      // Create file path
      const fileName = `DoH_Analytics_${dateRangeType}_${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Write CSV file
      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      // Share the file
      if (Platform.OS === "web") {
        // For web, create a download link
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        Alert.alert("Success", "CSV file downloaded successfully!");
      } else {
        // For mobile, use sharing
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "text/csv",
            dialogTitle: "Export Analytics Report",
            UTI: "public.comma-separated-values-text",
          });
        } else {
          Alert.alert("Success", `CSV file saved to: ${fileUri}`);
        }
      }
    } catch (error) {
      console.error("CSV Export Error:", error);
      Alert.alert("Export Failed", "Failed to export CSV file. Please try again.");
    }
  };

  const handleExportPDF = () => {
    Alert.alert("Export PDF", "PDF export functionality will generate a formatted report with charts and metrics.");
  };

  // Divisions and departments are already filtered above for analytics

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Text className="text-3xl font-bold text-foreground">&lt;</Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold text-foreground">Reports & Analytics</Text>
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

                {/* Staff Filter */}
                <View className="mt-4">
                  <Text className="text-xs text-muted mb-2">Staff Member</Text>
                  <View className="bg-background border border-border rounded-lg overflow-hidden">
                    <Picker
                      selectedValue={selectedStaffId}
                      onValueChange={(value: number) => setSelectedStaffId(value)}
                    >
                      <Picker.Item label="All Staff" value={0} />
                      {staff?.map((s: any) => (
                        <Picker.Item key={s.id} label={s.name} value={s.id} />
                      ))}
                    </Picker>
                  </View>
                </View>
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
