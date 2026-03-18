import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Modal, TextInput, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { useStaffRole } from "@/hooks/use-staff-role";
import { useRouter } from "expo-router";

/**
 * Sessions Screen (Sessions Tab)
 * 
 * Displays:
 * - Filter bar for date range, status, type
 * - Scrollable list of session cards
 * - Edit indicators for sessions within 48-hour window
 */
export default function SessionsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { staff } = useAuth();
  const { isAdmin } = useStaffRole();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatusIds, setSelectedStatusIds] = useState<number[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<number[]>([]);
  const [selectedFolderIds, setSelectedFolderIds] = useState<number[]>([]);
  const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);
  const [summaryOnly, setSummaryOnly] = useState(false);
  const [showStatusFilterModal, setShowStatusFilterModal] = useState(false);
  const [showClientFilterModal, setShowClientFilterModal] = useState(false);
  const [showFolderFilterModal, setShowFolderFilterModal] = useState(false);
  const [showStaffFilterModal, setShowStaffFilterModal] = useState(false);
  const [statusSearch, setStatusSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [folderSearch, setFolderSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");

  // Get sessions: all for admin, only own for staff
  const { data: sessions, isLoading: sessionsLoading } = isAdmin
    ? trpc.sessions.listAll.useQuery()
    : trpc.sessions.listByStaff.useQuery(
        { staffId: staff?.id || 0 },
        { enabled: !!staff?.id }
      );

  // Get session types and statuses for filtering
  const { data: sessionTypes } = trpc.sessionTypes.list.useQuery();
  const { data: sessionStatuses } = trpc.sessionStatuses.list.useQuery();
  const { data: allClients } = trpc.clients.listAll.useQuery(undefined, { enabled: isAdmin });
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

  const filteredSessions = useMemo(() => {
    const source = sessions || [];
    return source.filter((session: any) => {
      if (selectedStatusIds.length > 0 && !selectedStatusIds.includes(session.sessionStatusId)) {
        return false;
      }
      if (isAdmin && selectedClientIds.length > 0 && !selectedClientIds.includes(session.clientId)) {
        return false;
      }
      if (isAdmin && selectedFolderIds.length > 0 && !selectedFolderIds.includes(session.folderId)) {
        return false;
      }
      if (isAdmin && selectedStaffIds.length > 0 && !selectedStaffIds.includes(session.staffId)) {
        return false;
      }
      return true;
    });
  }, [sessions, selectedStatusIds, isAdmin, selectedClientIds, selectedFolderIds, selectedStaffIds]);

  const sortedFilteredSessions = useMemo(() => {
    return [...filteredSessions].sort((a: any, b: any) => {
      const aName = (a.clientName || "").toLowerCase();
      const bName = (b.clientName || "").toLowerCase();
      const byName = aName.localeCompare(bName);
      if (byName !== 0) return byName;

      // Secondary sort keeps newest first within same client.
      return new Date(b.sessionStartTime || b.createdAt).getTime() - new Date(a.sessionStartTime || a.createdAt).getTime();
    });
  }, [filteredSessions]);

  const hasAnyFilter =
    selectedStatusIds.length > 0 ||
    (isAdmin && (selectedClientIds.length > 0 || selectedFolderIds.length > 0 || selectedStaffIds.length > 0));
  const PICKER_MAX_ROWS = 8;
  const PICKER_ROW_HEIGHT = 40;
  const pickerMaxHeight = PICKER_MAX_ROWS * PICKER_ROW_HEIGHT;

  const toggleClientFilter = (id: number) => {
    setSelectedClientIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((v) => v !== id);
      }
      return [...prev, id];
    });
  };

  const toggleFolderFilter = (id: number) => {
    setSelectedFolderIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((v) => v !== id);
      }
      return [...prev, id];
    });
  };

  const toggleStatusFilter = (id: number) => {
    setSelectedStatusIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((v) => v !== id);
      }
      return [...prev, id];
    });
  };

  const toggleStaffFilter = (id: number) => {
    setSelectedStaffIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((v) => v !== id);
      }
      return [...prev, id];
    });
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

  useEffect(() => {
    if (!isAdmin) return;
    setSelectedFolderIds((prev) => prev.filter((id) => folderOptions.some((folder: any) => folder.id === id)));
  }, [isAdmin, folderOptions]);

  const getSessionTypeLabel = (session: any) => {
    if (session?.sessionTypeName) return session.sessionTypeName;
    return sessionTypes?.find((t) => t.id === session.sessionTypeId)?.name || `Type #${session.sessionTypeId}`;
  };

  const getSessionStatusLabel = (session: any) => {
    if (session?.sessionStatusName) return session.sessionStatusName;
    return sessionStatuses?.find((s) => s.id === session.sessionStatusId)?.name || `Status #${session.sessionStatusId}`;
  };

  const getFolderLabel = (session: any) => {
    const folderNumber = session?.folderNumber || session?.folderId;
    const description = (session?.folderDescription || "").trim();
    if (description) {
      return `Folder #${folderNumber} ${description}`;
    }
    return `Folder #${folderNumber}`;
  };

  const getScheduledDateTime = (session: any) => (session.scheduledDate ? new Date(session.scheduledDate) : null);

  const getSessionStartDateTime = (session: any) => (session.sessionStartTime ? new Date(session.sessionStartTime) : null);

  const isScheduledSession = (session: any) => {
    const scheduled = getScheduledDateTime(session);
    if (!scheduled) return false;
    const start = getSessionStartDateTime(session);
    if (!start) return true;
    return scheduled.getTime() >= start.getTime();
  };

  const getScheduledDateTimeLabel = (session: any) => {
    const dt = getScheduledDateTime(session);
    if (!dt) return "-";
    return `${dt.toLocaleDateString()} ${dt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  };

  const getStartDateTime = (session: any) => {
    return getSessionStartDateTime(session) || getScheduledDateTime(session) || null;
  };

  const getStartDateLabel = (session: any) => {
    const dt = getStartDateTime(session);
    return dt ? new Date(dt).toLocaleDateString() : "-";
  };

  const getStartTimeLabel = (session: any) => {
    const dt = getStartDateTime(session);
    return dt ? new Date(dt).toLocaleTimeString() : "-";
  };

  const getElapsedLabel = (session: any) => {
    let minutes = typeof session.sessionDuration === "number" ? session.sessionDuration : undefined;

    if (minutes === undefined && session.sessionStartTime && session.sessionEndTime) {
      const start = new Date(session.sessionStartTime).getTime();
      const end = new Date(session.sessionEndTime).getTime();
      if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
        minutes = Math.floor((end - start) / 60000);
      }
    }

    if (minutes === undefined) return "-";
    const hours = Math.floor(minutes / 60);
    const rem = minutes % 60;
    return hours > 0 ? `${hours}h ${rem}m` : `${rem}m`;
  };

  const getSummaryDateSegment = (session: any) => {
    if (isScheduledSession(session)) {
      return `Scheduled: ${getScheduledDateTimeLabel(session)}`;
    }
    return `Start: ${getStartDateLabel(session)} | Elapsed: ${getElapsedLabel(session)}`;
  };

  const getStatusColor = (statusId: number) => {
    // This is a simplified version - in production, map statusId to actual status name
    const statusColors: { [key: number]: string } = {
      1: colors.primary, // Scheduled
      2: colors.warning, // In Progress
      3: colors.success, // Completed
      4: colors.muted, // Cancelled
      5: colors.error, // No-show
    };
    return statusColors[statusId] || colors.muted;
  };

  return (
    <ScreenContainer className="flex-1">
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-foreground">Sessions</Text>
          <TouchableOpacity
            className="flex-row items-center gap-2 px-4 py-2 bg-surface rounded-full border border-border"
            onPress={() => setShowFilters(!showFilters)}
          >
            <IconSymbol name="line.3.horizontal.decrease" size={18} color={colors.foreground} />
            <Text className="text-sm font-medium text-foreground">Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Panel (collapsed by default) */}
      {showFilters && (
        <View className="px-6 py-4 bg-surface border-b border-border">
          {hasAnyFilter && (
            <View className="flex-row justify-end mb-3">
              <TouchableOpacity
                className="px-4 py-2 bg-background rounded-full border border-border"
                onPress={clearAllFilters}
              >
                <Text className="text-sm font-medium text-foreground">Clear All</Text>
              </TouchableOpacity>
            </View>
          )}

          {isAdmin && (
            <View className="mb-4 gap-3">
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Filter by Staff</Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="flex-1 px-4 py-2 bg-background rounded-full border border-border"
                    onPress={() => setShowStaffFilterModal(true)}
                  >
                    <Text className="text-sm font-medium text-foreground">
                      {selectedStaffIds.length > 0
                        ? `${selectedStaffIds.length} staff selected`
                        : "No staff filter"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="px-4 py-2 bg-background rounded-full border border-border"
                    onPress={() => setSelectedStaffIds([])}
                  >
                    <Text className="text-sm font-medium text-foreground">Clear</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Filter by Clients</Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="flex-1 px-4 py-2 bg-background rounded-full border border-border"
                    onPress={() => setShowClientFilterModal(true)}
                  >
                    <Text className="text-sm font-medium text-foreground">
                      {selectedClientIds.length > 0
                        ? `${selectedClientIds.length} client(s) selected`
                        : "No client filter"}
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
                      if (selectedClientIds.length === 0) {
                        return;
                      }
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
                  <TouchableOpacity
                    className="px-4 py-2 bg-background rounded-full border border-border"
                    onPress={() => setSelectedFolderIds([])}
                  >
                    <Text className="text-sm font-medium text-foreground">Clear</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Filter by Status</Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 px-4 py-2 bg-background rounded-full border border-border"
                onPress={() => setShowStatusFilterModal(true)}
              >
                <Text className="text-sm font-medium text-foreground">
                  {selectedStatusIds.length > 0
                    ? `${selectedStatusIds.length} status(es) selected`
                    : "No status filter"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 bg-background rounded-full border border-border"
                onPress={() => setSelectedStatusIds([])}
              >
                <Text className="text-sm font-medium text-foreground">Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Add Session Button at Top */}
      <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
        <TouchableOpacity className="flex-row items-center" onPress={() => setSummaryOnly((prev) => !prev)}>
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              borderWidth: 2,
              borderColor: summaryOnly ? colors.primary : "#ccc",
              backgroundColor: summaryOnly ? colors.primary : "#fff",
              marginRight: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {summaryOnly ? <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>✓</Text> : null}
          </View>
          <Text className="text-sm font-medium text-foreground">Summary</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-primary w-12 h-12 rounded-full items-center justify-center shadow-lg"
          onPress={() => router.push("/record-session" as any)}
          style={{ elevation: 8 }}
        >
          <IconSymbol name="plus.circle.fill" size={28} color={colors.background} />
        </TouchableOpacity>
      </View>

      {/* Session List */}
      <View className="flex-1">
        <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 24, paddingTop: 16 }}>
          {sessionsLoading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : sortedFilteredSessions.length > 0 ? (
            summaryOnly ? (
              <View className="bg-surface rounded-2xl border border-border overflow-hidden">
                {sortedFilteredSessions.map((session: any, index: number) => {
                  const canEdit = session.completedAt
                    ? (new Date().getTime() - new Date(session.completedAt).getTime()) / (1000 * 60 * 60) <= 48
                    : true;
                  const isLast = index === sortedFilteredSessions.length - 1;

                  return (
                    <View key={session.id} className={`px-4 py-3 ${isLast ? "" : "border-b border-border"}`}>
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1 pr-3">
                          <Text className="text-base font-semibold text-foreground">
                            {session.clientName || `Client #${session.clientId}`}
                          </Text>
                          <Text className="text-sm text-muted mt-1" numberOfLines={1}>
                            {getFolderLabel(session)} | {getSummaryDateSegment(session)}
                          </Text>
                        </View>
                        <View className="items-end">
                          {canEdit ? (
                            <TouchableOpacity
                              onPress={() =>
                                router.push({
                                  pathname: `/edit-session/${session.id}` as any,
                                  params: { returnTo: "/(tabs)/sessions" },
                                } as any)
                              }
                            >
                              <Text className="text-sm font-semibold text-primary">Edit</Text>
                            </TouchableOpacity>
                          ) : (
                            <Text className="text-xs font-medium text-muted">Locked</Text>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View className="gap-4">
                {sortedFilteredSessions.map((session: any) => {
                  const canEdit = session.completedAt
                    ? (new Date().getTime() - new Date(session.completedAt).getTime()) / (1000 * 60 * 60) <= 48
                    : true;

                  return (
                    <TouchableOpacity
                      key={session.id}
                      className="bg-surface rounded-2xl p-5 border border-border"
                      activeOpacity={1}
                    >
                      {/* Header with Client and Edit Indicator */}
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1">
                          <Text className="text-lg font-semibold text-foreground">
                            {session.clientName || `Client #${session.clientId}`}
                          </Text>
                          <Text className="text-sm text-muted mt-1">{getFolderLabel(session)}</Text>
                        </View>
                        <View className="items-end">
                          {canEdit ? (
                            <TouchableOpacity
                              onPress={() =>
                                router.push({
                                  pathname: `/edit-session/${session.id}` as any,
                                  params: { returnTo: "/(tabs)/sessions" },
                                } as any)
                              }
                            >
                              <Text className="text-sm font-semibold text-primary">Edit</Text>
                            </TouchableOpacity>
                          ) : (
                            <Text className="text-xs font-medium text-muted">Locked</Text>
                          )}
                        </View>
                      </View>

                      {/* Session Type and Status */}
                      <View className="flex-row items-center gap-2 mb-3">
                        <View className="px-3 py-1 bg-background rounded-full border border-border">
                          <Text className="text-xs font-medium text-foreground">{getSessionTypeLabel(session)}</Text>
                        </View>
                        <View
                          className="px-3 py-1 rounded-full"
                          style={{ backgroundColor: `${getStatusColor(session.sessionStatusId)}20` }}
                        >
                          <Text
                            className="text-xs font-medium"
                            style={{ color: getStatusColor(session.sessionStatusId) }}
                          >
                            {getSessionStatusLabel(session)}
                          </Text>
                        </View>
                      </View>

                      {/* Date and Time */}
                      {isScheduledSession(session) ? (
                        <View className="flex-row items-center gap-2 mb-3">
                          <IconSymbol name="calendar" size={14} color={colors.muted} />
                          <Text className="text-sm text-muted">Scheduled: {getScheduledDateTimeLabel(session)}</Text>
                        </View>
                      ) : (
                        <View className="flex-row items-center gap-4 mb-3">
                          <View className="flex-row items-center gap-2">
                            <IconSymbol name="calendar" size={14} color={colors.muted} />
                            <Text className="text-sm text-muted">Start: {getStartDateLabel(session)}</Text>
                          </View>
                          <View className="flex-row items-center gap-2">
                            <IconSymbol name="clock.fill" size={14} color={colors.muted} />
                            <Text className="text-sm text-muted">Elapsed: {getElapsedLabel(session)}</Text>
                          </View>
                        </View>
                      )}

                      {/* Billable Hours */}
                      {session.billableHours && (
                        <View className="pt-3 border-t border-border">
                          <Text className="text-sm text-muted">
                            Billable Hours: <Text className="font-semibold text-primary">{session.billableHours} hrs</Text>
                          </Text>
                        </View>
                      )}

                      {/* Notes Preview */}
                      {session.notes && (
                        <View className="pt-3 border-t border-border mt-3">
                          <Text className="text-sm text-muted" numberOfLines={2}>
                            {session.notes}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )
          ) : (
            <View className="items-center justify-center py-12">
              <IconSymbol name="calendar" size={48} color={colors.muted} />
              <Text className="text-base text-muted text-center mt-4">
                {(sessions?.length || 0) > 0 && hasAnyFilter
                  ? "No sessions match current filters"
                  : isAdmin
                  ? "No sessions recorded yet"
                  : "No sessions found for your account"}
              </Text>
              <Text className="text-sm text-muted text-center mt-2">
                {(sessions?.length || 0) > 0 && hasAnyFilter
                  ? "Adjust filters or clear them to see more sessions."
                  : isAdmin
                  ? "Start by recording your first session"
                  : "Only sessions assigned to your staff ID appear here."}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <Modal
        visible={showStaffFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStaffFilterModal(false)}
      >
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

            <View
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: "#f5f8fa", maxHeight: pickerMaxHeight, marginBottom: 4 }}
            >
              <ScrollView>
                {filteredStaffOptions.length === 0 ? (
                  <View className="px-3 py-3">
                    <Text className="text-sm" style={{ color: colors.muted }}>No staff found.</Text>
                  </View>
                ) : (
                  filteredStaffOptions.map((item: any) => {
                    const checked = selectedStaffIds.includes(item.id);
                    return (
                      <TouchableOpacity
                        key={String(item.id)}
                        className="flex-row items-center px-3"
                        style={{ minHeight: PICKER_ROW_HEIGHT }}
                        onPress={() => toggleStaffFilter(item.id)}
                      >
                        <View
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            borderWidth: 2,
                            borderColor: checked ? colors.primary : "#ccc",
                            backgroundColor: checked ? colors.primary : "#fff",
                            marginRight: 10,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {checked ? <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>✓</Text> : null}
                        </View>
                        <Text className="text-sm text-foreground" numberOfLines={1}>
                          {item.name}
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

      <Modal
        visible={showStatusFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatusFilterModal(false)}
      >
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

            <View
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: "#f5f8fa", maxHeight: pickerMaxHeight, marginBottom: 4 }}
            >
              <ScrollView>
                {filteredStatusOptions.length === 0 ? (
                  <View className="px-3 py-3">
                    <Text className="text-sm" style={{ color: colors.muted }}>No statuses found.</Text>
                  </View>
                ) : (
                  filteredStatusOptions.map((status: any) => {
                    const checked = selectedStatusIds.includes(status.id);
                    return (
                      <TouchableOpacity
                        key={String(status.id)}
                        className="flex-row items-center px-3"
                        style={{ minHeight: PICKER_ROW_HEIGHT }}
                        onPress={() => toggleStatusFilter(status.id)}
                      >
                        <View
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            borderWidth: 2,
                            borderColor: checked ? colors.primary : "#ccc",
                            backgroundColor: checked ? colors.primary : "#fff",
                            marginRight: 10,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {checked ? <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>✓</Text> : null}
                        </View>
                        <Text className="text-sm text-foreground" numberOfLines={1}>
                          {status.name}
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

      <Modal
        visible={showClientFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowClientFilterModal(false)}
      >
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

            <View
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: "#f5f8fa", maxHeight: pickerMaxHeight, marginBottom: 4 }}
            >
              <ScrollView>
                {filteredClientOptions.length === 0 ? (
                  <View className="px-3 py-3">
                    <Text className="text-sm" style={{ color: colors.muted }}>No clients found.</Text>
                  </View>
                ) : (
                  filteredClientOptions.map((item: any) => {
                    const checked = selectedClientIds.includes(item.id);
                    return (
                      <TouchableOpacity
                        key={String(item.id)}
                        className="flex-row items-center px-3"
                        style={{ minHeight: PICKER_ROW_HEIGHT }}
                        onPress={() => toggleClientFilter(item.id)}
                      >
                        <View
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            borderWidth: 2,
                            borderColor: checked ? colors.primary : "#ccc",
                            backgroundColor: checked ? colors.primary : "#fff",
                            marginRight: 10,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {checked ? <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>✓</Text> : null}
                        </View>
                        <Text className="text-sm text-foreground" numberOfLines={1}>
                          {item.name}
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

      <Modal
        visible={showFolderFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFolderFilterModal(false)}
      >
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

            <View
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: "#f5f8fa", maxHeight: pickerMaxHeight, marginBottom: 4 }}
            >
              <ScrollView>
                {filteredFolderOptions.length === 0 ? (
                  <View className="px-3 py-3">
                    <Text className="text-sm" style={{ color: colors.muted }}>No folders available.</Text>
                  </View>
                ) : (
                  filteredFolderOptions.map((item: any) => {
                    const checked = selectedFolderIds.includes(item.id);
                    const description = item.folderDescription ? ` ${item.folderDescription}` : "";
                    return (
                      <TouchableOpacity
                        key={String(item.id)}
                        className="flex-row items-center px-3"
                        style={{ minHeight: PICKER_ROW_HEIGHT }}
                        onPress={() => toggleFolderFilter(item.id)}
                      >
                        <View
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            borderWidth: 2,
                            borderColor: checked ? colors.primary : "#ccc",
                            backgroundColor: checked ? colors.primary : "#fff",
                            marginRight: 10,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
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
