import { useMemo, useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Modal, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { useStaffRole } from "@/hooks/use-staff-role";

/**
 * Reports Screen (Reports Tab)
 * 
 * Displays:
 * - Report type selector
 * - Date range picker with presets
 * - Summary metrics cards
 * - Data visualization (charts)
 * - Export options
 */
export default function ReportsScreen() {
  const colors = useColors();
  const { staff } = useAuth();
  const { isAdmin } = useStaffRole();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");
  const [selectedStatusIds, setSelectedStatusIds] = useState<number[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<number[]>([]);
  const [selectedFolderIds, setSelectedFolderIds] = useState<number[]>([]);
  const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);
  const [showStatusFilterModal, setShowStatusFilterModal] = useState(false);
  const [showClientFilterModal, setShowClientFilterModal] = useState(false);
  const [showFolderFilterModal, setShowFolderFilterModal] = useState(false);
  const [showStaffFilterModal, setShowStaffFilterModal] = useState(false);
  const [statusSearch, setStatusSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [folderSearch, setFolderSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const staffId = staff?.id || 0;
  const PICKER_MAX_ROWS = 8;
  const PICKER_ROW_HEIGHT = 40;
  const pickerMaxHeight = PICKER_MAX_ROWS * PICKER_ROW_HEIGHT;

  // Calculate date range based on selected period
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();

    switch (selectedPeriod) {
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  const { data: allSessions, isLoading: sessionsLoading } = trpc.sessions.listAll.useQuery(undefined, {
    enabled: !!staffId,
  });
  const { data: sessionStatuses } = trpc.sessionStatuses.list.useQuery();
  const { data: allClients } = trpc.clients.listAll.useQuery(undefined, { enabled: !!staffId });
  const { data: allFolders } = trpc.folders.listAll.useQuery(undefined, { enabled: isAdmin });
  const { data: allStaff } = trpc.staff.listAll.useQuery(undefined, { enabled: isAdmin });

  const isActiveValue = (value: unknown) => value === 1 || value === "1" || value === true;
  const activeSessionStatuses = sessionStatuses?.filter((s: any) => isActiveValue(s.isActive)) || [];

  const filteredStatusOptions = useMemo(() => {
    const query = statusSearch.trim().toLowerCase();
    if (!query) return activeSessionStatuses;
    return activeSessionStatuses.filter((status: any) => (status.name || "").toLowerCase().includes(query));
  }, [activeSessionStatuses, statusSearch]);

  const filteredClientOptions = useMemo(() => {
    const query = clientSearch.trim().toLowerCase();
    const source = allClients || [];
    if (!query) return source;
    return source.filter((client: any) => {
      const name = (client.name || "").toLowerCase();
      const email = (client.email || "").toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [allClients, clientSearch]);

  const filteredStaffOptions = useMemo(() => {
    const query = staffSearch.trim().toLowerCase();
    const source = allStaff || [];
    if (!query) return source;
    return source.filter((member: any) => {
      const name = (member.name || "").toLowerCase();
      const email = (member.email || "").toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [allStaff, staffSearch]);

  const folderOptions = useMemo(() => {
    const source = allFolders || [];
    if (selectedClientIds.length === 0) return [];
    return source.filter((folder: any) => selectedClientIds.includes(folder.clientId));
  }, [allFolders, selectedClientIds]);

  const filteredFolderOptions = useMemo(() => {
    const query = folderSearch.trim().toLowerCase();
    if (!query) return folderOptions;
    return folderOptions.filter((folder: any) => {
      const clientName = (folder.clientName || "").toLowerCase();
      const folderNumber = String(folder.folderNumber || "").toLowerCase();
      const description = (folder.folderDescription || "").toLowerCase();
      return clientName.includes(query) || folderNumber.includes(query) || description.includes(query);
    });
  }, [folderOptions, folderSearch]);

  const clientNameById = useMemo(
    () => new Map<number, string>((allClients || []).map((c: any) => [Number(c.id), c.name || ""])),
    [allClients]
  );

  const getClientLabel = (session: any) => {
    const fromSession = (session?.clientName || "").trim();
    if (fromSession) return fromSession;
    const fromLookup = (clientNameById.get(Number(session?.clientId)) || "").trim();
    return fromLookup || `Client #${session?.clientId}`;
  };

  const getEffectiveSessionDate = (session: any): Date | null => {
    const candidate = session.sessionStartTime || session.completedAt || session.scheduledDate || session.createdAt;
    if (!candidate) return null;
    const dt = new Date(candidate);
    return Number.isNaN(dt.getTime()) ? null : dt;
  };

  const getSessionDurationMinutes = (session: any): number => {
    if (typeof session.sessionDuration === "number" && Number.isFinite(session.sessionDuration)) {
      return session.sessionDuration;
    }
    if (session.sessionStartTime && session.sessionEndTime) {
      const start = new Date(session.sessionStartTime).getTime();
      const end = new Date(session.sessionEndTime).getTime();
      if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
        return Math.round((end - start) / (1000 * 60));
      }
    }
    return 0;
  };

  const getSessionHours = (session: any): number => {
    const raw = session.billableHours;
    if (raw !== null && raw !== undefined) {
      const match = String(raw).trim().match(/\d+(?:\.\d+)?/);
      if (match) {
        const parsed = Number(match[0]);
        if (Number.isFinite(parsed)) return parsed;
      }
    }
    return getSessionDurationMinutes(session) / 60;
  };

  const passesNonDateFilters = (session: any) => {
    if (!isAdmin && Number(session.staffId) !== Number(staffId)) {
      return false;
    }
    if (isAdmin && selectedStaffIds.length > 0 && !selectedStaffIds.includes(session.staffId)) {
      return false;
    }
    if (selectedStatusIds.length > 0 && !selectedStatusIds.includes(session.sessionStatusId)) {
      return false;
    }
    if (isAdmin && selectedClientIds.length > 0 && !selectedClientIds.includes(session.clientId)) {
      return false;
    }
    if (isAdmin && selectedFolderIds.length > 0 && !selectedFolderIds.includes(session.folderId)) {
      return false;
    }
    return true;
  };

  const filteredSessions = useMemo(() => {
    if (!allSessions || !staffId) return [];
    return allSessions
      .filter((s: any) => passesNonDateFilters(s))
      .filter((s: any) => {
        const dt = getEffectiveSessionDate(s);
        return !!dt && dt >= startDate && dt <= endDate;
      })
      .sort((a: any, b: any) => {
        const aTime = getEffectiveSessionDate(a)?.getTime() || 0;
        const bTime = getEffectiveSessionDate(b)?.getTime() || 0;
        return bTime - aTime;
      });
  }, [allSessions, staffId, startDate, endDate, isAdmin, selectedStaffIds, selectedStatusIds, selectedClientIds, selectedFolderIds]);

  const currentDate = new Date();
  const currentMonthHours = useMemo(() => {
    if (!allSessions || !staffId) return 0;
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
    const total = allSessions
      .filter((s: any) => passesNonDateFilters(s))
      .filter((s: any) => {
        const dt = getEffectiveSessionDate(s);
        return !!dt && dt >= monthStart && dt <= monthEnd;
      })
      .reduce((sum: number, s: any) => sum + getSessionHours(s), 0);
    return Number(total.toFixed(2));
  }, [allSessions, staffId, currentDate, isAdmin, selectedStaffIds, selectedStatusIds, selectedClientIds, selectedFolderIds]);

  const averageSessionDuration = filteredSessions.length
    ? filteredSessions.reduce((sum: number, s: any) => sum + getSessionDurationMinutes(s), 0) / filteredSessions.length
    : 0;

  const reportHours = useMemo(
    () => Number(filteredSessions.reduce((sum: number, s: any) => sum + getSessionHours(s), 0).toFixed(2)),
    [filteredSessions]
  );
  const isLoading = sessionsLoading;
  const hasAnyFilter =
    selectedStatusIds.length > 0 ||
    (isAdmin && (selectedStaffIds.length > 0 || selectedClientIds.length > 0 || selectedFolderIds.length > 0));

  const toggleStatusFilter = (id: number) => {
    setSelectedStatusIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const toggleClientFilter = (id: number) => {
    setSelectedClientIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const toggleFolderFilter = (id: number) => {
    setSelectedFolderIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const toggleStaffFilter = (id: number) => {
    setSelectedStaffIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const clearAllFilters = () => {
    setSelectedStatusIds([]);
    setSelectedClientIds([]);
    setSelectedFolderIds([]);
    setSelectedStaffIds([]);
    setStatusSearch("");
    setClientSearch("");
    setFolderSearch("");
    setStaffSearch("");
  };

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-foreground">Reports</Text>
            <Text className="text-sm text-muted mt-1">Billable hours and activity summary</Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center gap-2 px-4 py-2 bg-surface rounded-full border border-border"
            onPress={() => setShowFilters(!showFilters)}
          >
            <IconSymbol name="line.3.horizontal.decrease" size={18} color={colors.foreground} />
            <Text className="text-sm font-medium text-foreground">Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showFilters && (
        <View className="px-6 py-4 bg-surface border-b border-border gap-3">
          {hasAnyFilter && (
            <View className="flex-row justify-end">
              <TouchableOpacity
                className="px-4 py-2 bg-background rounded-full border border-border"
                onPress={clearAllFilters}
              >
                <Text className="text-sm font-medium text-foreground">Clear All</Text>
              </TouchableOpacity>
            </View>
          )}

          {isAdmin && (
            <>
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Filter by Staff</Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity className="flex-1 px-4 py-2 bg-background rounded-full border border-border" onPress={() => setShowStaffFilterModal(true)}>
                    <Text className="text-sm font-medium text-foreground">
                      {selectedStaffIds.length > 0 ? `${selectedStaffIds.length} staff selected` : "No staff filter"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border" onPress={() => setSelectedStaffIds([])}>
                    <Text className="text-sm font-medium text-foreground">Clear</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Filter by Clients</Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity className="flex-1 px-4 py-2 bg-background rounded-full border border-border" onPress={() => setShowClientFilterModal(true)}>
                    <Text className="text-sm font-medium text-foreground">
                      {selectedClientIds.length > 0 ? `${selectedClientIds.length} client(s) selected` : "No client filter"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="px-4 py-2 bg-background rounded-full border border-border"
                    onPress={() => {
                      setSelectedClientIds([]);
                      setSelectedFolderIds([]);
                    }}
                  >
                    <Text className="text-sm font-medium text-foreground">Clear</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Filter by Folders</Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className={`flex-1 px-4 py-2 rounded-full border ${selectedClientIds.length > 0 ? "bg-background border-border" : "bg-surface border-border"}`}
                    onPress={() => {
                      if (selectedClientIds.length === 0) return;
                      setShowFolderFilterModal(true);
                    }}
                  >
                    <Text className="text-sm font-medium text-foreground">
                      {selectedClientIds.length === 0
                        ? "Select client(s) first"
                        : selectedFolderIds.length > 0
                        ? `${selectedFolderIds.length} folder(s) selected`
                        : "No folder filter"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border" onPress={() => setSelectedFolderIds([])}>
                    <Text className="text-sm font-medium text-foreground">Clear</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Filter by Status</Text>
            <View className="flex-row gap-2">
              <TouchableOpacity className="flex-1 px-4 py-2 bg-background rounded-full border border-border" onPress={() => setShowStatusFilterModal(true)}>
                <Text className="text-sm font-medium text-foreground">
                  {selectedStatusIds.length > 0 ? `${selectedStatusIds.length} status(es) selected` : "No status filter"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border" onPress={() => setSelectedStatusIds([])}>
                <Text className="text-sm font-medium text-foreground">Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 24, paddingTop: 16 }}>
        {/* Period Selector */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-3">Time Period</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl border ${
                selectedPeriod === "week" ? "bg-primary border-primary" : "bg-surface border-border"
              }`}
              onPress={() => setSelectedPeriod("week")}
            >
              <Text
                className={`text-center font-medium ${
                  selectedPeriod === "week" ? "text-background" : "text-foreground"
                }`}
              >
                This Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl border ${
                selectedPeriod === "month" ? "bg-primary border-primary" : "bg-surface border-border"
              }`}
              onPress={() => setSelectedPeriod("month")}
            >
              <Text
                className={`text-center font-medium ${
                  selectedPeriod === "month" ? "text-background" : "text-foreground"
                }`}
              >
                This Month
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl border ${
                selectedPeriod === "year" ? "bg-primary border-primary" : "bg-surface border-border"
              }`}
              onPress={() => setSelectedPeriod("year")}
            >
              <Text
                className={`text-center font-medium ${
                  selectedPeriod === "year" ? "text-background" : "text-foreground"
                }`}
              >
                This Year
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* Summary Metrics */}
            <View className="gap-4 mb-6">
              {/* Total Sessions */}
              <View className="bg-surface rounded-2xl p-6 border border-border">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-medium text-muted">Total Sessions</Text>
                  <IconSymbol name="calendar" size={20} color={colors.primary} />
                </View>
                <Text className="text-3xl font-bold text-foreground">{filteredSessions.length}</Text>
                <Text className="text-xs text-muted mt-1">
                  {selectedPeriod === "week" ? "Last 7 days" : selectedPeriod === "month" ? "Last 30 days" : "Last 365 days"}
                </Text>
              </View>

              {/* Total Billable Hours */}
              <View className="bg-surface rounded-2xl p-6 border border-border">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-medium text-muted">Total Billable Hours</Text>
                  <IconSymbol name="clock.fill" size={20} color={colors.success} />
                </View>
                <Text className="text-3xl font-bold text-foreground">
                  {reportHours.toFixed(2)}
                </Text>
                <Text className="text-xs text-muted mt-1">Hours billed in selected period</Text>
              </View>

              {/* Average Session Duration */}
              <View className="bg-surface rounded-2xl p-6 border border-border">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-medium text-muted">Average Duration</Text>
                  <IconSymbol name="chart.bar.fill" size={20} color={colors.warning} />
                </View>
                <Text className="text-3xl font-bold text-foreground">{averageSessionDuration.toFixed(0)}</Text>
                <Text className="text-xs text-muted mt-1">Minutes per session</Text>
              </View>
            </View>

            {/* Current Month Summary */}
            <View className="bg-primary/10 rounded-2xl p-6 border border-primary/30 mb-6">
              <Text className="text-sm font-semibold text-primary mb-2">Current Month Progress</Text>
              <Text className="text-2xl font-bold text-foreground">{currentMonthHours.toFixed(2)} hrs</Text>
              <Text className="text-sm text-muted mt-1">
                {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </Text>
            </View>

            {/* Recent Sessions List */}
            {filteredSessions.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-foreground mb-4">Recent Sessions</Text>
                <View className="gap-3">
                  {filteredSessions.slice(0, 10).map((session: any) => (
                    <View
                      key={session.id}
                      className="bg-surface rounded-xl p-4 border border-border flex-row items-center justify-between"
                    >
                      <View className="flex-1">
                        <Text className="text-base font-medium text-foreground">{getClientLabel(session)}</Text>
                        <Text className="text-sm text-muted mt-1">
                          {session.completedAt ? new Date(session.completedAt).toLocaleDateString() : "Not completed"}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-lg font-bold text-primary">{String(session.billableHours || "0.00")}</Text>
                        <Text className="text-xs text-muted">hours</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Export Button */}
            <TouchableOpacity
              className="bg-surface py-4 rounded-xl border border-border items-center flex-row justify-center gap-2"
              onPress={() => {
                // Export report functionality
                alert("Export functionality will be implemented");
              }}
            >
              <IconSymbol name="paperplane.fill" size={20} color={colors.foreground} />
              <Text className="text-base font-semibold text-foreground">Export Report</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <Modal visible={showStatusFilterModal} transparent animationType="fade" onRequestClose={() => setShowStatusFilterModal(false)}>
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <View className="w-[92%] rounded-2xl p-5" style={{ backgroundColor: colors.background, maxHeight: "82%" }}>
            <View className="relative min-h-[44px] items-center justify-center mb-3">
              <TouchableOpacity onPress={() => setShowStatusFilterModal(false)} className="absolute left-0">
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Statuses</Text>
            </View>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground mb-3"
              placeholder="Search statuses..."
              placeholderTextColor={colors.muted}
              value={statusSearch}
              onChangeText={setStatusSearch}
            />
            <View className="rounded-xl overflow-hidden" style={{ backgroundColor: "#f5f8fa", maxHeight: pickerMaxHeight, marginBottom: 4 }}>
              <ScrollView>
                {filteredStatusOptions.length === 0 ? (
                  <View className="px-3 py-3"><Text className="text-sm" style={{ color: colors.muted }}>No statuses found.</Text></View>
                ) : (
                  filteredStatusOptions.map((item: any) => {
                    const checked = selectedStatusIds.includes(item.id);
                    return (
                      <TouchableOpacity key={String(item.id)} className="flex-row items-center px-3" style={{ minHeight: PICKER_ROW_HEIGHT }} onPress={() => toggleStatusFilter(item.id)}>
                        <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: checked ? colors.primary : "#ccc", backgroundColor: checked ? colors.primary : "#fff", marginRight: 10, justifyContent: "center", alignItems: "center" }}>
                          {checked ? <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>✓</Text> : null}
                        </View>
                        <Text className="text-sm text-foreground" numberOfLines={1}>{item.name}</Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showStaffFilterModal} transparent animationType="fade" onRequestClose={() => setShowStaffFilterModal(false)}>
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <View className="w-[92%] rounded-2xl p-5" style={{ backgroundColor: colors.background, maxHeight: "82%" }}>
            <View className="relative min-h-[44px] items-center justify-center mb-3">
              <TouchableOpacity onPress={() => setShowStaffFilterModal(false)} className="absolute left-0">
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Staff</Text>
            </View>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground mb-3"
              placeholder="Search staff..."
              placeholderTextColor={colors.muted}
              value={staffSearch}
              onChangeText={setStaffSearch}
            />
            <View className="rounded-xl overflow-hidden" style={{ backgroundColor: "#f5f8fa", maxHeight: pickerMaxHeight, marginBottom: 4 }}>
              <ScrollView>
                {filteredStaffOptions.length === 0 ? (
                  <View className="px-3 py-3"><Text className="text-sm" style={{ color: colors.muted }}>No staff found.</Text></View>
                ) : (
                  filteredStaffOptions.map((item: any) => {
                    const checked = selectedStaffIds.includes(item.id);
                    return (
                      <TouchableOpacity key={String(item.id)} className="flex-row items-center px-3" style={{ minHeight: PICKER_ROW_HEIGHT }} onPress={() => toggleStaffFilter(item.id)}>
                        <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: checked ? colors.primary : "#ccc", backgroundColor: checked ? colors.primary : "#fff", marginRight: 10, justifyContent: "center", alignItems: "center" }}>
                          {checked ? <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>✓</Text> : null}
                        </View>
                        <Text className="text-sm text-foreground" numberOfLines={1}>{item.name}</Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showClientFilterModal} transparent animationType="fade" onRequestClose={() => setShowClientFilterModal(false)}>
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <View className="w-[92%] rounded-2xl p-5" style={{ backgroundColor: colors.background, maxHeight: "82%" }}>
            <View className="relative min-h-[44px] items-center justify-center mb-3">
              <TouchableOpacity onPress={() => setShowClientFilterModal(false)} className="absolute left-0">
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Clients</Text>
            </View>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground mb-3"
              placeholder="Search clients..."
              placeholderTextColor={colors.muted}
              value={clientSearch}
              onChangeText={setClientSearch}
            />
            <View className="rounded-xl overflow-hidden" style={{ backgroundColor: "#f5f8fa", maxHeight: pickerMaxHeight, marginBottom: 4 }}>
              <ScrollView>
                {filteredClientOptions.length === 0 ? (
                  <View className="px-3 py-3"><Text className="text-sm" style={{ color: colors.muted }}>No clients found.</Text></View>
                ) : (
                  filteredClientOptions.map((item: any) => {
                    const checked = selectedClientIds.includes(item.id);
                    return (
                      <TouchableOpacity key={String(item.id)} className="flex-row items-center px-3" style={{ minHeight: PICKER_ROW_HEIGHT }} onPress={() => toggleClientFilter(item.id)}>
                        <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: checked ? colors.primary : "#ccc", backgroundColor: checked ? colors.primary : "#fff", marginRight: 10, justifyContent: "center", alignItems: "center" }}>
                          {checked ? <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>✓</Text> : null}
                        </View>
                        <Text className="text-sm text-foreground" numberOfLines={1}>{item.name}</Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showFolderFilterModal} transparent animationType="fade" onRequestClose={() => setShowFolderFilterModal(false)}>
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <View className="w-[92%] rounded-2xl p-5" style={{ backgroundColor: colors.background, maxHeight: "82%" }}>
            <View className="relative min-h-[44px] items-center justify-center mb-3">
              <TouchableOpacity onPress={() => setShowFolderFilterModal(false)} className="absolute left-0">
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Folders</Text>
            </View>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground mb-3"
              placeholder="Search folders..."
              placeholderTextColor={colors.muted}
              value={folderSearch}
              onChangeText={setFolderSearch}
            />
            <View className="rounded-xl overflow-hidden" style={{ backgroundColor: "#f5f8fa", maxHeight: pickerMaxHeight, marginBottom: 4 }}>
              <ScrollView>
                {filteredFolderOptions.length === 0 ? (
                  <View className="px-3 py-3"><Text className="text-sm" style={{ color: colors.muted }}>No folders found.</Text></View>
                ) : (
                  filteredFolderOptions.map((item: any) => {
                    const checked = selectedFolderIds.includes(item.id);
                    const description = item.folderDescription ? ` ${item.folderDescription}` : "";
                    return (
                      <TouchableOpacity key={String(item.id)} className="flex-row items-center px-3" style={{ minHeight: PICKER_ROW_HEIGHT }} onPress={() => toggleFolderFilter(item.id)}>
                        <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: checked ? colors.primary : "#ccc", backgroundColor: checked ? colors.primary : "#fff", marginRight: 10, justifyContent: "center", alignItems: "center" }}>
                          {checked ? <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>✓</Text> : null}
                        </View>
                        <Text className="text-sm text-foreground flex-1" numberOfLines={1}>
                          {item.clientName || `Client #${item.clientId}`}, Fldr: {item.folderNumber}{description}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
