import DateTimePicker from '@/components/ui/DateTimePicker';
import { useState, useEffect, useRef } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, FlatList, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter, useLocalSearchParams } from "expo-router";

/**
 * Record Session Screen
 * 
 * Core feature for tracking counseling sessions with:
 * - Dual timers (Interview Time + Session Time)
 * - Session metadata (type, status, result)
 * - Notes and billable hours
 * - Save to database linked to client and folder
 */
export default function RecordSessionScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { data: user } = trpc.auth.me.useQuery();
  const utils = trpc.useUtils();
  const routeSessionId = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId;
  const routeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const returnToParam = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
  const returnToPath = typeof returnToParam === "string" && returnToParam.length > 0
    ? returnToParam
    : "/(tabs)/sessions";
  const editSessionId = Number.parseInt((routeSessionId || routeId || "") as string, 10);
  const isEditMode = Number.isFinite(editSessionId) && editSessionId > 0;

  // Fetch lookup data
  const { data: sessionTypes } = trpc.sessionTypes.list.useQuery();
  const { data: sessionStatuses } = trpc.sessionStatuses.list.useQuery();
  const { data: sessionResults } = trpc.sessionResults.list.useQuery();
  const { data: clients } = trpc.clients.listAll.useQuery();
  const { data: existingSession, isLoading: existingSessionLoading } = trpc.sessions.get.useQuery(
    { id: editSessionId },
    { enabled: isEditMode }
  );

  // Client selection state
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  
  // Session metadata
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedFolder, setSelectedFolder] = useState<any>(null);
  const [clientFolders, setClientFolders] = useState<any[]>([]);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showFolderEditModal, setShowFolderEditModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<any>(null);
  const [editFolderStartDate, setEditFolderStartDate] = useState("");
  const [editFolderEndDate, setEditFolderEndDate] = useState("");
  const [editFolderStatus, setEditFolderStatus] = useState<"Active" | "Closed" | "On Hold">("Active");
  const [editFolderDescription, setEditFolderDescription] = useState("");
  const [editFolderNotes, setEditFolderNotes] = useState("");
  const [showSessionTypeModal, setShowSessionTypeModal] = useState(false);
  const [showSessionStatusModal, setShowSessionStatusModal] = useState(false);
  const [showSessionResultModal, setShowSessionResultModal] = useState(false);
  const [sessionTypeId, setSessionTypeId] = useState<number | null>(null);
  const [sessionStatusId, setSessionStatusId] = useState<number | null>(null);
  const [sessionResultId, setSessionResultId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [billableHours, setBillableHours] = useState("");
  const [hasLoadedEditData, setHasLoadedEditData] = useState(false);

  // Interview Timer State
  const [interviewRunning, setInterviewRunning] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [interviewSeconds, setInterviewSeconds] = useState(0);
  const [interviewStartTime, setInterviewStartTime] = useState<Date | null>(null);
  const interviewIntervalRef = useRef<any>(null);

  // Session Timer State
  const [sessionRunning, setSessionRunning] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const sessionIntervalRef = useRef<any>(null);

  // Manual time input state with default values
  const [useManualTime, setUseManualTime] = useState(false);
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000);
  
  const [manualInterviewStart, setManualInterviewStart] = useState(new Date(now));
  const [manualInterviewEnd, setManualInterviewEnd] = useState(new Date(thirtyMinutesLater));
  const [manualSessionStart, setManualSessionStart] = useState(new Date(now));
  const [manualSessionEnd, setManualSessionEnd] = useState(new Date(oneHourLater));

  // Picker modal visibility
  const [showPicker, setShowPicker] = useState<{field: null | string, mode: 'date' | 'time'}>({field: null, mode: 'date'});

  // Fetch folders for selected client
  const { data: foldersData, refetch: refetchFolders } = trpc.folders.list.useQuery(
    { clientId: selectedClient?.id || 0 },
    { enabled: !!selectedClient }
  );
  const { data: editingSessionFolder } = trpc.folders.get.useQuery(
    { id: existingSession?.folderId || 0 },
    { enabled: !!existingSession?.folderId }
  );

  // Create folder mutation
  const createFolder = trpc.folders.create.useMutation({
    onSuccess: (newFolder) => {
      setSelectedFolder(newFolder);
      refetchFolders();
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create folder");
    },
  });

  const updateFolder = trpc.folders.update.useMutation({
    onSuccess: async () => {
      await refetchFolders();
      if (editingFolder && selectedFolder?.id === editingFolder.id) {
        setSelectedFolder((prev: any) => prev ? {
          ...prev,
          startDate: editFolderStartDate,
          endDate: editFolderEndDate || null,
          status: editFolderStatus,
          folderDescription: editFolderDescription || null,
          notes: editFolderNotes || null,
        } : prev);
      }
      setShowFolderEditModal(false);
      setEditingFolder(null);
      Alert.alert("Success", "Folder updated successfully.");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to update folder");
    },
  });

  // Filter clients based on search
  const filteredClients = clients?.filter((client: any) =>
    client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.email?.toLowerCase().includes(clientSearch.toLowerCase())
  ) || [];

  // Handle passed client params from navigation
  useEffect(() => {
    if (params.clientId && clients) {
      const clientId = parseInt(params.clientId as string);
      const client = clients.find((c: any) => c.id === clientId);
      if (client) {
        setSelectedClient(client);
      }
    }
  }, [params.clientId, clients]);

  useEffect(() => {
    if (!isEditMode || hasLoadedEditData || !existingSession || !clients) {
      return;
    }

    const matchedClient = clients.find((c: any) => c.id === existingSession.clientId);
    setSelectedClient(
      matchedClient || {
        id: existingSession.clientId,
        name: `Client #${existingSession.clientId}`,
        email: "",
      }
    );

    setSelectedFolder(
      editingSessionFolder
        ? normalizeFolder(editingSessionFolder)
        : {
            id: existingSession.folderId,
            folderNumber: String(existingSession.folderId),
            folderDescription: "",
          }
    );

    setSessionTypeId(existingSession.sessionTypeId ?? null);
    setSessionStatusId(existingSession.sessionStatusId ?? null);
    setSessionResultId(existingSession.sessionResultId ?? null);
    setNotes(existingSession.notes || "");
    setBillableHours(existingSession.billableHours || "");

    const interviewStart = existingSession.interviewStartTime ? new Date(existingSession.interviewStartTime) : null;
    const interviewEnd = existingSession.interviewEndTime ? new Date(existingSession.interviewEndTime) : null;
    const sessionStart = existingSession.sessionStartTime ? new Date(existingSession.sessionStartTime) : null;
    const sessionEnd = existingSession.sessionEndTime ? new Date(existingSession.sessionEndTime) : null;

    if (interviewStart || interviewEnd || sessionStart || sessionEnd) {
      setUseManualTime(true);
    }
    if (interviewStart) setManualInterviewStart(interviewStart);
    if (interviewEnd) setManualInterviewEnd(interviewEnd);
    if (sessionStart) setManualSessionStart(sessionStart);
    if (sessionEnd) setManualSessionEnd(sessionEnd);

    setHasLoadedEditData(true);
  }, [isEditMode, hasLoadedEditData, existingSession, clients, editingSessionFolder]);

  useEffect(() => {
    if (!isEditMode || !editingSessionFolder) {
      return;
    }

    const normalized = normalizeFolder(editingSessionFolder);
    setSelectedFolder((prev: any) => {
      if (!prev) {
        return normalized;
      }
      if (prev.id !== normalized.id) {
        return prev;
      }

      // Merge in full folder metadata when initial edit-mode fallback lacked details.
      return {
        ...prev,
        ...normalized,
      };
    });
  }, [isEditMode, editingSessionFolder]);

  // Update folders when data changes
  useEffect(() => {
    if (foldersData) {
      const normalizedFolders = foldersData.map((folder: any) => normalizeFolder(folder));
      setClientFolders(normalizedFolders);
      
      // If no folders exist, auto-generate a new folder
      if (!isEditMode && normalizedFolders.length === 0 && selectedClient && user?.id) {
        createFolder.mutate({
          clientId: selectedClient.id,
          createdByStaffId: user.id,
          startDate: new Date(),
          status: "Active",
          notes: "Auto-generated folder",
          createdBy: user.id,
          updatedBy: user.id,
        });
      } else if (!selectedFolder && normalizedFolders.length === 1) {
        // Auto-select if only one folder
        setSelectedFolder(normalizedFolders[0]);
      }
    }
  }, [foldersData, selectedClient, user?.id, isEditMode, selectedFolder]);

  // Handler for selecting a client
  const handleSelectClient = (client: any) => {
    setSelectedClient(client);
    setSelectedFolder(null);
    setClientFolders([]);
    setShowClientModal(false);
    setClientSearch("");
  };

  // Handler for selecting a folder
  const handleSelectFolder = (folderItem: any) => {
    setSelectedFolder(normalizeFolder(folderItem));
    setShowFolderModal(false);
  };

  const openFolderEditor = (folderItem: any) => {
    const normalizedFolder = normalizeFolder(folderItem);
    setEditingFolder(normalizedFolder);
    setEditFolderStartDate(formatDateOnly(normalizedFolder.startDate));
    setEditFolderEndDate(normalizedFolder.endDate ? formatDateOnly(normalizedFolder.endDate) : "");
    setEditFolderStatus((normalizedFolder.status || "Active") as "Active" | "Closed" | "On Hold");
    setEditFolderDescription(getFolderDescription(normalizedFolder));
    setEditFolderNotes(normalizedFolder.notes || "");
    setShowFolderEditModal(true);
  };

  const saveFolderEdits = () => {
    if (!editingFolder || !user?.id) {
      Alert.alert("Error", "Unable to update folder right now.");
      return;
    }

    if (!editFolderStartDate) {
      Alert.alert("Validation Error", "Start date is required.");
      return;
    }

    const startDate = parseDateOnly(editFolderStartDate);
    if (!startDate) {
      Alert.alert("Validation Error", "Start date must be in YYYY-MM-DD format.");
      return;
    }

    const endDate = editFolderEndDate ? parseDateOnly(editFolderEndDate) : null;
    if (editFolderEndDate && !endDate) {
      Alert.alert("Validation Error", "End date must be in YYYY-MM-DD format.");
      return;
    }

    if (endDate && endDate < startDate) {
      Alert.alert("Validation Error", "End date must be on or after start date.");
      return;
    }

    updateFolder.mutate({
      id: editingFolder.id,
      startDate,
      endDate: endDate || undefined,
      status: editFolderStatus,
      folderDescription: editFolderDescription.trim() || undefined,
      notes: editFolderNotes.trim() || undefined,
      updatedBy: user.id,
    });
  };

  // Create session mutation
  const scrollViewRef = useRef<any>(null);
  const createSession = trpc.sessions.create.useMutation({
    onSuccess: () => {
      utils.sessions.invalidate();
      // Reset all form state to initial values
      setSelectedClient(null);
      setSelectedFolder(null);
      setClientFolders([]);
      setShowClientModal(false);
      setShowFolderModal(false);
      setShowSessionTypeModal(false);
      setShowSessionStatusModal(false);
      setShowSessionResultModal(false);
      setSessionTypeId(null);
      setSessionStatusId(null);
      setSessionResultId(null);
      setNotes("");
      setBillableHours("");
      setInterviewRunning(false);
      setInterviewEnded(false);
      setInterviewSeconds(0);
      setInterviewStartTime(null);
      setSessionRunning(false);
      setSessionEnded(false);
      setSessionSeconds(0);
      setSessionStartTime(null);
      setUseManualTime(false);
      const now = new Date();
      const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000);
      const oneHourLater = new Date(now.getTime() + 60 * 60000);
      setManualInterviewStart(new Date(now));
      setManualInterviewEnd(new Date(thirtyMinutesLater));
      setManualSessionStart(new Date(now));
      setManualSessionEnd(new Date(oneHourLater));
      // Scroll to top
      if (scrollViewRef.current && scrollViewRef.current.scrollTo) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
      Alert.alert("Success", "Session saved successfully. Ready for a new entry.");
    },
    onError: (error) => {
      console.error("Session creation error:", error);
      const errorMessage = error.message || "Failed to save session";
      Alert.alert("Error", `Failed to save session: ${errorMessage}\n\nPlease check all required fields are filled correctly.`);
    },
  });

  const updateSession = trpc.sessions.update.useMutation({
    onSuccess: () => {
      utils.sessions.invalidate();

      if (Platform.OS === "web") {
        router.replace(returnToPath as any);
        return;
      }

      Alert.alert("Success", "Session updated successfully.", [
        {
          text: "OK",
          onPress: () => router.replace(returnToPath as any),
        },
      ]);
    },
    onError: (error) => {
      console.error("Session update error:", error);
      const errorMessage = error.message || "Failed to update session";
      Alert.alert("Error", `Failed to update session: ${errorMessage}`);
    },
  });

  // Interview Timer Effects
  useEffect(() => {
    if (interviewRunning) {
      interviewIntervalRef.current = setInterval(() => {
        setInterviewSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (interviewIntervalRef.current) {
        clearInterval(interviewIntervalRef.current);
      }
    }
    return () => {
      if (interviewIntervalRef.current) {
        clearInterval(interviewIntervalRef.current);
      }
    };
  }, [interviewRunning]);

  // Session Timer Effects
  useEffect(() => {
    if (sessionRunning) {
      sessionIntervalRef.current = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current);
      }
    }
    return () => {
      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current);
      }
    };
  }, [sessionRunning]);

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const startInterviewTimer = () => {
    if (interviewSeconds === 0) {
      setInterviewStartTime(new Date());
    }
    setInterviewRunning(true);
  };

  const endInterviewTimer = () => {
    setInterviewRunning(false);
    setInterviewEnded(true);
  };

  const resetInterviewTimer = () => {
    setInterviewRunning(false);
    setInterviewEnded(false);
    setInterviewSeconds(0);
    setInterviewStartTime(null);
  };

  const startSessionTimer = () => {
    if (sessionSeconds === 0) {
      setSessionStartTime(new Date());
    }
    setSessionRunning(true);
  };

  const endSessionTimer = () => {
    setSessionRunning(false);
    setSessionEnded(true);
  };

  const resetSessionTimer = () => {
    setSessionRunning(false);
    setSessionEnded(false);
    setSessionSeconds(0);
    setSessionStartTime(null);
  };

  const handleSaveSession = () => {
    // Validation
    if (!selectedClient?.id) {
      Alert.alert("Validation Error", "Please select a client before saving.");
      setShowClientModal(true);
      return;
    }

    if (!selectedFolder?.id) {
      Alert.alert("Validation Error", "Please select a folder before saving.");
      setShowFolderModal(true);
      return;
    }

    if (!sessionTypeId) {
      Alert.alert("Validation Error", "Please select a session type before saving.");
      setShowSessionTypeModal(true);
      return;
    }

    if (!sessionStatusId) {
      Alert.alert("Validation Error", "Please select a session status before saving.");
      setShowSessionStatusModal(true);
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "Staff not authenticated");
      return;
    }

    let interviewStart: Date | undefined;
    let interviewEnd: Date | undefined;
    let sessionStart: Date | undefined;
    let sessionEnd: Date | undefined;
    let scheduledDate: Date | undefined;

    if (useManualTime) {
      // Use manual time input - parse datetime-local format (YYYY-MM-DDTHH:MM)
      interviewStart = manualInterviewStart;
      interviewEnd = manualInterviewEnd;
      sessionStart = manualSessionStart;
      sessionEnd = manualSessionEnd;

      const nowMs = Date.now();
      const futureStartCandidates: Date[] = [];

      const interviewStartIsFuture = !!interviewStart && interviewStart.getTime() > nowMs;
      const sessionStartIsFuture = !!sessionStart && sessionStart.getTime() > nowMs;

      // Start times are optional: if either start is future, schedule using future start(s).
      if (interviewStartIsFuture && interviewStart) {
        futureStartCandidates.push(interviewStart);
        interviewEnd = undefined;
      }
      if (sessionStartIsFuture && sessionStart) {
        futureStartCandidates.push(sessionStart);
        sessionEnd = undefined;
      }

      // If both future, this naturally uses the earlier of the two.
      if (futureStartCandidates.length > 0) {
        scheduledDate = new Date(Math.min(...futureStartCandidates.map((d) => d.getTime())));
      }
    } else {
      // Use timer values
      interviewStart = interviewStartTime || undefined;
      interviewEnd = interviewStartTime && interviewSeconds > 0 
        ? new Date(interviewStartTime.getTime() + interviewSeconds * 1000) 
        : undefined;
      sessionStart = sessionStartTime || undefined;
      sessionEnd = sessionStartTime && sessionSeconds > 0 
        ? new Date(sessionStartTime.getTime() + sessionSeconds * 1000) 
        : undefined;
    }

    const interviewDuration = interviewStart && interviewEnd 
      ? Math.floor((interviewEnd.getTime() - interviewStart.getTime()) / 60000) 
      : undefined;
    const sessionDuration = sessionStart && sessionEnd 
      ? Math.floor((sessionEnd.getTime() - sessionStart.getTime()) / 60000) 
      : undefined;

    const resolvedStaffId = isEditMode
      ? existingSession?.staffId || user.id
      : user.id;

    const sessionData = {
      folderId: selectedFolder.id,
      clientId: selectedClient.id,
      staffId: resolvedStaffId,
      sessionTypeId,
      sessionStatusId,
      sessionResultId: sessionResultId || undefined,
      interviewStartTime: interviewStart,
      interviewEndTime: interviewEnd,
      interviewDuration,
      sessionStartTime: sessionStart,
      sessionEndTime: sessionEnd,
      sessionDuration,
      scheduledDate,
      billableHours: billableHours.trim() || undefined,
      notes: notes.trim() || undefined,
      updatedBy: user.id,
    };

    if (isEditMode) {
      updateSession.mutate({ id: editSessionId, ...sessionData });
      return;
    }

    console.log("Creating session with data:", sessionData);
    createSession.mutate({ ...sessionData, createdBy: user.id });
  };

  const isActiveValue = (value: unknown) => value === 1 || value === "1" || value === true;
  const activeSessionTypes = sessionTypes?.filter((t: any) => isActiveValue(t.isActive)) || [];
  const activeSessionStatuses = sessionStatuses?.filter((s: any) => isActiveValue(s.isActive)) || [];
  const activeSessionResults = sessionResults?.filter((r: any) => isActiveValue(r.isActive)) || [];

  if (isEditMode && existingSessionLoading && !hasLoadedEditData) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (isEditMode && !existingSession) {
    return (
      <ScreenContainer className="items-center justify-center px-6">
        <IconSymbol name="calendar.badge.exclamationmark" size={48} color={colors.muted} />
        <Text className="text-base text-muted text-center mt-3">Session not found.</Text>
        <TouchableOpacity className="mt-4" onPress={() => router.back()}>
          <Text className="text-primary font-semibold">Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="relative min-h-[48px] items-center justify-center">
          <TouchableOpacity onPress={() => router.back()} className="absolute left-0 z-20">
            <Text className="text-3xl font-bold text-foreground">&lt;</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground text-center">
            {isEditMode ? "Edit Session" : "Record Session"}
          </Text>
        </View>
      </View>

      <ScrollView ref={scrollViewRef} className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Client & Folder Selection */}
          <View className="bg-surface border border-border rounded-2xl p-4">
            {selectedClient ? (
              <View>
                <Text className="text-base font-bold text-foreground">Client: {selectedClient.name}</Text>
                
                {/* Folder Selection */}
                {clientFolders.length > 1 ? (
                  <TouchableOpacity 
                    className="mt-2 bg-background border border-border rounded-xl p-3"
                    onPress={() => setShowFolderModal(true)}
                  >
                    <Text className="text-base font-bold text-foreground">
                      {selectedFolder
                        ? `Folder: ${selectedFolder.folderNumber}${getFolderDescription(selectedFolder) ? ` - ${getFolderDescription(selectedFolder)}` : ""}`
                        : "Select a folder"}
                    </Text>
                    {selectedFolder ? (
                      <View className="mt-2 gap-1">
                        <Text className="text-sm font-bold text-foreground">
                          Status: {selectedFolder.status || "-"}   Start: {formatDateOnly(selectedFolder.startDate)}   End: {selectedFolder.endDate ? formatDateOnly(selectedFolder.endDate) : "-"}
                        </Text>
                        {selectedFolder.notes ? (
                          <Text className="text-sm text-muted">Notes: {selectedFolder.notes}</Text>
                        ) : null}
                      </View>
                    ) : null}
                  </TouchableOpacity>
                ) : (
                  <View className="mt-1">
                    <Text className="text-base font-bold text-foreground">
                      {selectedFolder
                        ? `Folder: ${selectedFolder.folderNumber}${getFolderDescription(selectedFolder) ? ` - ${getFolderDescription(selectedFolder)}` : ""}`
                        : "Folder: Generating..."}
                    </Text>
                    {selectedFolder ? (
                      <View className="mt-1 gap-1">
                        <Text className="text-sm font-bold text-foreground">
                          Status: {selectedFolder.status || "-"}   Start: {formatDateOnly(selectedFolder.startDate)}   End: {selectedFolder.endDate ? formatDateOnly(selectedFolder.endDate) : "-"}
                        </Text>
                        {selectedFolder.notes ? (
                          <Text className="text-sm text-muted">Notes: {selectedFolder.notes}</Text>
                        ) : null}
                      </View>
                    ) : null}
                  </View>
                )}
                
                <TouchableOpacity className="mt-2" onPress={() => { setSelectedClient(null); setSelectedFolder(null); setClientFolders([]); }}>
                  <Text className="text-sm text-primary">Change Client</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity className="bg-primary py-3 rounded-xl items-center" onPress={() => setShowClientModal(true)}>
                <Text className="text-background font-semibold">Select Client</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Time Input Mode Toggle */}
          <View className="bg-surface border border-border rounded-2xl p-4">
            <Text className="text-base font-semibold text-foreground mb-2">Time Tracking Method</Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl items-center ${!useManualTime ? 'bg-primary' : 'bg-background border border-border'}`}
                onPress={() => setUseManualTime(false)}
              >
                <Text className={`font-semibold ${!useManualTime ? 'text-background' : 'text-foreground'}`}>Use Timer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl items-center ${useManualTime ? 'bg-primary' : 'bg-background border border-border'}`}
                onPress={() => setUseManualTime(true)}
              >
                <Text className={`font-semibold ${useManualTime ? 'text-background' : 'text-foreground'}`}>Manual Input</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Dual Timers or Manual Input */}
          {!useManualTime ? (
            <View className="bg-surface border border-border rounded-2xl p-4 gap-4">
              {/* Interview Timer */}
              <View>
                <Text className="text-base font-semibold text-foreground mb-2">Interview Time</Text>
                <Text className="text-sm text-muted mb-3">Pre/post activities (travel, prep, documentation)</Text>
                <View className="bg-background rounded-xl p-4 items-center">
                  <Text className="text-4xl font-bold text-foreground mb-4">{formatTime(interviewSeconds)}</Text>
                  <View className="flex-row gap-3">
                    {!interviewEnded ? (
                      <>
                        <TouchableOpacity
                          className="bg-primary px-6 py-3 rounded-xl"
                          onPress={interviewRunning ? endInterviewTimer : startInterviewTimer}
                        >
                          <Text className="text-background font-semibold">{interviewRunning ? "End Timer" : "Start"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="bg-surface border border-border px-6 py-3 rounded-xl"
                          onPress={resetInterviewTimer}
                        >
                          <Text className="text-foreground font-semibold">Reset</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <View className="flex-row items-center gap-2">
                        <Text className="text-success font-semibold">✓ Timer Ended</Text>
                        <TouchableOpacity
                          className="bg-surface border border-border px-4 py-2 rounded-xl"
                          onPress={resetInterviewTimer}
                        >
                          <Text className="text-foreground text-sm">Reset</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Session Timer */}
              <View>
                <Text className="text-base font-semibold text-foreground mb-2">Session Time</Text>
                <Text className="text-sm text-muted mb-3">Actual counseling/therapy time</Text>
                <View className="bg-background rounded-xl p-4 items-center">
                  <Text className="text-4xl font-bold text-primary mb-4">{formatTime(sessionSeconds)}</Text>
                  <View className="flex-row gap-3">
                    {!sessionEnded ? (
                      <>
                        <TouchableOpacity
                          className="bg-primary px-6 py-3 rounded-xl"
                          onPress={sessionRunning ? endSessionTimer : startSessionTimer}
                        >
                          <Text className="text-background font-semibold">{sessionRunning ? "End Timer" : "Start"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="bg-surface border border-border px-6 py-3 rounded-xl"
                          onPress={resetSessionTimer}
                        >
                          <Text className="text-foreground font-semibold">Reset</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <View className="flex-row items-center gap-2">
                        <Text className="text-success font-semibold">✓ Timer Ended</Text>
                        <TouchableOpacity
                          className="bg-surface border border-border px-4 py-2 rounded-xl"
                          onPress={resetSessionTimer}
                        >
                          <Text className="text-foreground text-sm">Reset</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View className="bg-surface border border-border rounded-2xl p-4 gap-4">
              <Text className="text-xs text-muted">
                If a manual start time is in the future, it is treated as scheduled and its end time is ignored.
              </Text>
              {/* Manual Interview Time */}
              <View>
                <Text className="text-base font-semibold text-foreground mb-2">Interview Time (Optional)</Text>
                <View className="gap-2">
                  <View>
                    <Text className="text-sm text-muted mb-1">Start Time</Text>
                    {Platform.OS === 'web' ? (
                      <input
                        type="datetime-local"
                        className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                        value={formatLocalDateTime(manualInterviewStart)}
                        onChange={e => setManualInterviewStart(parseLocalDateTime(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      <TouchableOpacity
                        className="bg-background border border-border rounded-xl px-4 py-3"
                        onPress={() => setShowPicker({field: 'manualInterviewStart', mode: 'date'})}
                      >
                        <Text className="text-base text-foreground">
                          {manualInterviewStart.toLocaleString()}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View>
                    <Text className="text-sm text-muted mb-1">End Time</Text>
                    {Platform.OS === 'web' ? (
                      <input
                        type="datetime-local"
                        className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                        value={formatLocalDateTime(manualInterviewEnd)}
                        onChange={e => setManualInterviewEnd(parseLocalDateTime(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      <TouchableOpacity
                        className="bg-background border border-border rounded-xl px-4 py-3"
                        onPress={() => setShowPicker({field: 'manualInterviewEnd', mode: 'date'})}
                      >
                        <Text className="text-base text-foreground">
                          {manualInterviewEnd.toLocaleString()}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              {/* Manual Session Time */}
              <View>
                <Text className="text-base font-semibold text-foreground mb-2">Session Time (Optional)</Text>
                <View className="gap-2">
                  <View>
                    <Text className="text-sm text-muted mb-1">Start Time</Text>
                    {Platform.OS === 'web' ? (
                      <input
                        type="datetime-local"
                        className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                        value={formatLocalDateTime(manualSessionStart)}
                        onChange={e => setManualSessionStart(parseLocalDateTime(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      <TouchableOpacity
                        className="bg-background border border-border rounded-xl px-4 py-3"
                        onPress={() => setShowPicker({field: 'manualSessionStart', mode: 'date'})}
                      >
                        <Text className="text-base text-foreground">
                          {manualSessionStart.toLocaleString()}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View>
                    <Text className="text-sm text-muted mb-1">End Time</Text>
                    {Platform.OS === 'web' ? (
                      <input
                        type="datetime-local"
                        className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                        value={formatLocalDateTime(manualSessionEnd)}
                        onChange={e => setManualSessionEnd(parseLocalDateTime(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      <TouchableOpacity
                        className="bg-background border border-border rounded-xl px-4 py-3"
                        onPress={() => setShowPicker({field: 'manualSessionEnd', mode: 'date'})}
                      >
                        <Text className="text-base text-foreground">
                          {manualSessionEnd.toLocaleString()}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {/* DateTimePicker Modal */}
                    {showPicker.field && (
                      <DateTimePicker
                        value={(() => {
                          switch (showPicker.field) {
                            case 'manualInterviewStart': return manualInterviewStart;
                            case 'manualInterviewEnd': return manualInterviewEnd;
                            case 'manualSessionStart': return manualSessionStart;
                            case 'manualSessionEnd': return manualSessionEnd;
                            default: return new Date();
                          }
                        })()}
                        mode={showPicker.mode}
                        is24Hour={true}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                          if (event.type === 'dismissed') {
                            setShowPicker({field: null, mode: 'date'});
                            return;
                          }
                          if (selectedDate) {
                            // If picking date, open time picker next
                            if (showPicker.mode === 'date') {
                              setShowPicker({field: showPicker.field, mode: 'time'});
                              // Save date part, keep time from current value
                              const prev = (() => {
                                switch (showPicker.field) {
                                  case 'manualInterviewStart': return manualInterviewStart;
                                  case 'manualInterviewEnd': return manualInterviewEnd;
                                  case 'manualSessionStart': return manualSessionStart;
                                  case 'manualSessionEnd': return manualSessionEnd;
                                  default: return new Date();
                                }
                              })();
                              const merged = new Date(selectedDate);
                              merged.setHours(prev.getHours(), prev.getMinutes());
                              switch (showPicker.field) {
                                case 'manualInterviewStart': setManualInterviewStart(merged); break;
                                case 'manualInterviewEnd': setManualInterviewEnd(merged); break;
                                case 'manualSessionStart': setManualSessionStart(merged); break;
                                case 'manualSessionEnd': setManualSessionEnd(merged); break;
                              }
                            } else {
                              // Save time part, keep date from current value
                              const prev = (() => {
                                switch (showPicker.field) {
                                  case 'manualInterviewStart': return manualInterviewStart;
                                  case 'manualInterviewEnd': return manualInterviewEnd;
                                  case 'manualSessionStart': return manualSessionStart;
                                  case 'manualSessionEnd': return manualSessionEnd;
                                  default: return new Date();
                                }
                              })();
                              const merged = new Date(prev);
                              merged.setHours(selectedDate.getHours(), selectedDate.getMinutes());
                              switch (showPicker.field) {
                                case 'manualInterviewStart': setManualInterviewStart(merged); break;
                                case 'manualInterviewEnd': setManualInterviewEnd(merged); break;
                                case 'manualSessionStart': setManualSessionStart(merged); break;
                                case 'manualSessionEnd': setManualSessionEnd(merged); break;
                              }
                              setShowPicker({field: null, mode: 'date'});
                            }
                          }
                        }}
                      />
                    )}
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Session Metadata */}
          <View className="bg-surface border border-border rounded-2xl p-4 gap-3">
            <Text className="text-base font-semibold text-foreground mb-1">Session Details</Text>

            {/* Session Type */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Session Type *</Text>
              <TouchableOpacity
                className="bg-background border border-border rounded-xl px-4 py-3 flex-row items-center justify-between"
                onPress={() => setShowSessionTypeModal(true)}
              >
                <Text className="text-base text-foreground">
                  {sessionTypeId ? activeSessionTypes.find((t: any) => t.id === sessionTypeId)?.name : "Select session type"}
                </Text>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {/* Session Status */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Session Status *</Text>
              <TouchableOpacity
                className="bg-background border border-border rounded-xl px-4 py-3 flex-row items-center justify-between"
                onPress={() => setShowSessionStatusModal(true)}
              >
                <Text className="text-base text-foreground">
                  {sessionStatusId ? activeSessionStatuses.find((s: any) => s.id === sessionStatusId)?.name : "Select session status"}
                </Text>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {/* Session Result */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Session Result</Text>
              <TouchableOpacity
                className="bg-background border border-border rounded-xl px-4 py-3 flex-row items-center justify-between"
                onPress={() => setShowSessionResultModal(true)}
              >
                <Text className="text-base text-foreground">
                  {sessionResultId ? activeSessionResults.find((r: any) => r.id === sessionResultId)?.name : "Select session result (optional)"}
                </Text>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {/* Billable Hours */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Billable Hours</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="e.g., 1.5"
                placeholderTextColor={colors.muted}
                value={billableHours}
                onChangeText={setBillableHours}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Notes */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Notes</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="Enter session notes"
                placeholderTextColor={colors.muted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className="bg-primary py-4 rounded-full items-center mb-6"
            onPress={handleSaveSession}
            disabled={createSession.isPending || updateSession.isPending}
          >
            {createSession.isPending || updateSession.isPending ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Text className="text-background text-lg font-semibold">
                {isEditMode ? "Update Session" : "Save Session"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Client Selection Modal */}
      <Modal
        visible={showClientModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowClientModal(false)}
      >
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <View className="w-[92%] rounded-2xl p-5" style={{ backgroundColor: colors.background, maxHeight: "82%" }}>
            <View className="relative min-h-[44px] items-center justify-center mb-4">
              <TouchableOpacity onPress={() => setShowClientModal(false)} className="absolute left-0">
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Client</Text>
            </View>

            <View className="mb-4">
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="Search clients..."
                placeholderTextColor={colors.muted}
                value={clientSearch}
                onChangeText={setClientSearch}
                autoFocus
              />
            </View>

            <FlatList
              data={filteredClients}
              keyExtractor={(item: any) => item.id.toString()}
              style={{ maxHeight: 420 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="bg-surface border border-border rounded-xl p-4 mb-3"
                  onPress={() => handleSelectClient(item)}
                >
                  <Text className="text-base font-semibold text-foreground">{item.name}</Text>
                  {item.email && (
                    <Text className="text-sm text-muted mt-1">{item.email}</Text>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="items-center justify-center py-8">
                  <Text className="text-muted">No clients found</Text>
                </View>
              }
            />

            <TouchableOpacity onPress={() => setShowClientModal(false)} className="mt-4">
              <Text className="text-primary font-semibold text-center">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Folder Selection Modal */}
      <Modal
        visible={showFolderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFolderModal(false)}
      >
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <View className="w-[92%] rounded-2xl p-5" style={{ backgroundColor: colors.background, maxHeight: "82%" }}>
            <View className="relative min-h-[44px] items-center justify-center mb-4">
              <TouchableOpacity onPress={() => setShowFolderModal(false)} className="absolute left-0">
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Folder</Text>
            </View>

            <FlatList
              data={clientFolders}
              keyExtractor={(item: any) => item.id.toString()}
              style={{ maxHeight: 460 }}
              renderItem={({ item }) => (
                <View className="bg-surface border border-border rounded-xl p-4 mb-3">
                  <TouchableOpacity onPress={() => handleSelectFolder(item)}>
                    <Text className="text-base font-bold text-foreground">
                      {`Folder: ${item.folderNumber}${getFolderDescription(item) ? ` - ${getFolderDescription(item)}` : ""}`}
                    </Text>
                    <Text className="text-sm font-bold text-foreground mt-1">
                      Status: {item.status || "-"}   Start: {formatDateOnly(item.startDate)}   End: {item.endDate ? formatDateOnly(item.endDate) : "-"}
                    </Text>
                    {item.notes && (
                      <Text className="text-sm text-muted mt-1">Notes: {item.notes}</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity className="mt-3" onPress={() => openFolderEditor(item)}>
                    <Text className="text-primary font-semibold">Edit Folder</Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <View className="items-center justify-center py-8">
                  <Text className="text-muted">No folders found</Text>
                </View>
              }
            />

            <TouchableOpacity onPress={() => setShowFolderModal(false)} className="mt-4">
              <Text className="text-primary font-semibold text-center">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Folder Edit Modal */}
      <Modal
        visible={showFolderEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFolderEditModal(false)}
      >
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <View className="w-[92%] rounded-2xl p-5" style={{ backgroundColor: colors.background, maxHeight: "86%" }}>
            <View className="relative min-h-[44px] items-center justify-center mb-4">
              <TouchableOpacity onPress={() => setShowFolderEditModal(false)} className="absolute left-0">
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">
                Edit Folder {editingFolder?.folderNumber || ""}
              </Text>
            </View>

            <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>
              <View className="gap-3">
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Start Date (YYYY-MM-DD)</Text>
                  <TextInput
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
                    placeholder="2026-03-12"
                    placeholderTextColor={colors.muted}
                    value={editFolderStartDate}
                    onChangeText={setEditFolderStartDate}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">End Date (optional)</Text>
                  <TextInput
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
                    placeholder="2026-03-30"
                    placeholderTextColor={colors.muted}
                    value={editFolderEndDate}
                    onChangeText={setEditFolderEndDate}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Status</Text>
                  <View className="flex-row gap-2">
                    {(["Active", "Closed", "On Hold"] as const).map((status) => (
                      <TouchableOpacity
                        key={status}
                        className={`px-4 py-2 rounded-xl border ${editFolderStatus === status ? "bg-primary border-primary" : "bg-surface border-border"}`}
                        onPress={() => setEditFolderStatus(status)}
                      >
                        <Text className={editFolderStatus === status ? "text-background font-semibold" : "text-foreground font-semibold"}>
                          {status}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Description</Text>
                  <TextInput
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
                    placeholder="Folder description"
                    placeholderTextColor={colors.muted}
                    value={editFolderDescription}
                    onChangeText={setEditFolderDescription}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Notes</Text>
                  <TextInput
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
                    placeholder="Folder notes"
                    placeholderTextColor={colors.muted}
                    value={editFolderNotes}
                    onChangeText={setEditFolderNotes}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </ScrollView>

            <View className="mt-4 gap-2">
              <TouchableOpacity
                className="bg-primary py-3 rounded-xl items-center"
                onPress={saveFolderEdits}
                disabled={updateFolder.isPending}
              >
                {updateFolder.isPending ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Text className="text-background font-semibold">Save Folder Updates</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-surface border border-border py-3 rounded-xl items-center"
                onPress={() => setShowFolderEditModal(false)}
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Session Type Modal */}
      <Modal
        visible={showSessionTypeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSessionTypeModal(false)}
      >
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <View className="w-[92%] rounded-2xl p-5" style={{ backgroundColor: colors.background, maxHeight: "82%" }}>
            <View className="relative min-h-[44px] items-center justify-center mb-4">
              <TouchableOpacity onPress={() => setShowSessionTypeModal(false)} className="absolute left-0">
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Session Type</Text>
            </View>
            <FlatList
              data={activeSessionTypes}
              keyExtractor={(item: any) => item.id.toString()}
              style={{ maxHeight: 460 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="bg-surface border border-border rounded-xl p-4 mb-3"
                  onPress={() => {
                    setSessionTypeId(item.id);
                    setShowSessionTypeModal(false);
                  }}
                >
                  <Text className="text-base font-semibold text-foreground">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowSessionTypeModal(false)} className="mt-4">
              <Text className="text-primary font-semibold text-center">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Session Status Modal */}
      <Modal
        visible={showSessionStatusModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSessionStatusModal(false)}
      >
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <View className="w-[92%] rounded-2xl p-5" style={{ backgroundColor: colors.background, maxHeight: "82%" }}>
            <View className="relative min-h-[44px] items-center justify-center mb-4">
              <TouchableOpacity onPress={() => setShowSessionStatusModal(false)} className="absolute left-0">
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Session Status</Text>
            </View>
            <FlatList
              data={activeSessionStatuses}
              keyExtractor={(item: any) => item.id.toString()}
              style={{ maxHeight: 460 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="bg-surface border border-border rounded-xl p-4 mb-3"
                  onPress={() => {
                    setSessionStatusId(item.id);
                    setShowSessionStatusModal(false);
                  }}
                >
                  <Text className="text-base font-semibold text-foreground">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowSessionStatusModal(false)} className="mt-4">
              <Text className="text-primary font-semibold text-center">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Session Result Modal */}
      <Modal
        visible={showSessionResultModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSessionResultModal(false)}
      >
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <View className="w-[92%] rounded-2xl p-5" style={{ backgroundColor: colors.background, maxHeight: "82%" }}>
            <View className="relative min-h-[44px] items-center justify-center mb-4">
              <TouchableOpacity onPress={() => setShowSessionResultModal(false)} className="absolute left-0">
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Session Result</Text>
            </View>
            <TouchableOpacity
              className="bg-surface border border-border rounded-xl p-4 mb-3"
              onPress={() => {
                setSessionResultId(null);
                setShowSessionResultModal(false);
              }}
            >
              <Text className="text-base font-semibold text-muted">None (Optional)</Text>
            </TouchableOpacity>
            <FlatList
              data={activeSessionResults}
              keyExtractor={(item: any) => item.id.toString()}
              style={{ maxHeight: 420 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="bg-surface border border-border rounded-xl p-4 mb-3"
                  onPress={() => {
                    setSessionResultId(item.id);
                    setShowSessionResultModal(false);
                  }}
                >
                  <Text className="text-base font-semibold text-foreground">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowSessionResultModal(false)} className="mt-4">
              <Text className="text-primary font-semibold text-center">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );

}

// --- Utility functions for local datetime handling (web only) ---
function formatLocalDateTime(date: Date) {
  // Returns yyyy-MM-ddTHH:mm in local time, adjusted for timezone offset
  const pad = (n: number) => n.toString().padStart(2, '0');
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return `${local.getFullYear()}-${pad(local.getMonth()+1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}`;
}

function parseLocalDateTime(value: string) {
  // value is yyyy-MM-ddTHH:mm, interpreted as local time, adjust for timezone offset
  const [datePart, timePart] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  const local = new Date(year, month - 1, day, hour, minute);
  return new Date(local.getTime() + local.getTimezoneOffset() * 60000);
}

function formatDateOnly(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDateOnly(value: string) {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const [year, month, day] = trimmed.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function getFolderDescription(folder: any) {
  return folder?.folderDescription || folder?.folderdescription || "";
}

function normalizeFolder(folder: any) {
  if (!folder) return folder;
  return {
    ...folder,
    folderDescription:
      folder.folderDescription ??
      folder.folderdescription ??
      folder.folder_description ??
      "",
  };
}
