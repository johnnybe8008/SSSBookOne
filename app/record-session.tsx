import { useState, useEffect, useRef } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, FlatList, Platform } from "react-native";
import { Platform as RNPlatform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
 * - Save to database linked to client and case
 */
export default function RecordSessionScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { data: user } = trpc.auth.me.useQuery();
  const utils = trpc.useUtils();

  // Fetch lookup data
  const { data: sessionTypes } = trpc.sessionTypes.list.useQuery();
  const { data: sessionStatuses } = trpc.sessionStatuses.list.useQuery();
  const { data: sessionResults } = trpc.sessionResults.list.useQuery();
  const { data: clients } = trpc.clients.listAll.useQuery();

  // Client selection state
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  
  // Session metadata
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [clientCases, setClientCases] = useState<any[]>([]);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showSessionTypeModal, setShowSessionTypeModal] = useState(false);
  const [showSessionStatusModal, setShowSessionStatusModal] = useState(false);
  const [showSessionResultModal, setShowSessionResultModal] = useState(false);
  const [sessionTypeId, setSessionTypeId] = useState<number | null>(null);
  const [sessionStatusId, setSessionStatusId] = useState<number | null>(null);
  const [sessionResultId, setSessionResultId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [billableHours, setBillableHours] = useState("");

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

  // Helper function to format date for datetime-local input
  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

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

  // Fetch cases for selected client
  const { data: casesData, refetch: refetchCases } = trpc.cases.list.useQuery(
    { clientId: selectedClient?.id || 0 },
    { enabled: !!selectedClient }
  );

  // Create case mutation
  const createCase = trpc.cases.create.useMutation({
    onSuccess: (newCase) => {
      setSelectedCase(newCase);
      refetchCases();
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create case");
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

  // Update cases when data changes
  useEffect(() => {
    if (casesData) {
      setClientCases(casesData);
      
      // If no cases exist, auto-generate a new case
      if (casesData.length === 0 && selectedClient && user?.id) {
        const caseNumber = `CASE-${selectedClient.id}-${Date.now()}`;
        createCase.mutate({
          caseNumber,
          clientId: selectedClient.id,
          createdByStaffId: user.id,
          startDate: new Date(),
          status: "Active",
          notes: "Auto-generated case",
          createdBy: user.id,
          updatedBy: user.id,
        });
      } else if (casesData.length === 1) {
        // Auto-select if only one case
        setSelectedCase(casesData[0]);
      }
    }
  }, [casesData, selectedClient, user?.id]);

  // Handler for selecting a client
  const handleSelectClient = (client: any) => {
    setSelectedClient(client);
    setSelectedCase(null);
    setClientCases([]);
    setShowClientModal(false);
    setClientSearch("");
  };

  // Handler for selecting a case
  const handleSelectCase = (caseItem: any) => {
    setSelectedCase(caseItem);
    setShowCaseModal(false);
  };

  // Create session mutation
  const scrollViewRef = useRef<any>(null);
  const createSession = trpc.sessions.create.useMutation({
    onSuccess: () => {
      utils.sessions.invalidate();
      // Reset all form state to initial values
      setSelectedClient(null);
      setSelectedCase(null);
      setClientCases([]);
      setShowClientModal(false);
      setShowCaseModal(false);
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
    if (!selectedClient || !selectedCase) {
      Alert.alert("Validation Error", "Please select a client and case");
      return;
    }
    if (!sessionTypeId || !sessionStatusId) {
      Alert.alert("Validation Error", "Please select session type and status");
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    let interviewStart: Date | undefined;
    let interviewEnd: Date | undefined;
    let sessionStart: Date | undefined;
    let sessionEnd: Date | undefined;

    if (useManualTime) {
      // Use manual time input - parse datetime-local format (YYYY-MM-DDTHH:MM)
      interviewStart = manualInterviewStart;
      interviewEnd = manualInterviewEnd;
      sessionStart = manualSessionStart;
      sessionEnd = manualSessionEnd;
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

    const sessionData = {
      caseId: selectedCase.id,
      clientId: selectedClient.id,
      staffId: user.id,
      sessionTypeId,
      sessionStatusId,
      sessionResultId: sessionResultId || undefined,
      interviewStartTime: interviewStart,
      interviewEndTime: interviewEnd,
      interviewDuration,
      sessionStartTime: sessionStart,
      sessionEndTime: sessionEnd,
      sessionDuration,
      billableHours: billableHours.trim() || undefined,
      notes: notes.trim() || undefined,
      createdBy: user.id,
      updatedBy: user.id,
    };

    console.log("Creating session with data:", sessionData);
    createSession.mutate(sessionData);
  };

  const activeSessionTypes = sessionTypes?.filter((t: any) => t.isActive === 1) || [];
  const activeSessionStatuses = sessionStatuses?.filter((s: any) => s.isActive === 1) || [];
  const activeSessionResults = sessionResults?.filter((r: any) => r.isActive === 1) || [];

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border" style={{ position: 'relative' }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, backgroundColor: '#e0e0e0', borderRadius: 16, padding: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.primary, fontFamily: 'inherit', lineHeight: 32 }}>&lt;</Text>
        </TouchableOpacity>
        <View className="flex-row items-center justify-center">
          <View>
            <Text className="text-2xl font-bold text-foreground">Record Session</Text>
            <Text className="text-sm text-muted mt-1">Track counseling session with dual timers</Text>
          </View>
        </View>
      </View>

      <ScrollView ref={scrollViewRef} className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Client & Case Selection */}
          <View className="bg-surface border border-border rounded-2xl p-4">
            <Text className="text-base font-semibold text-foreground mb-2">Client & Case</Text>
            {selectedClient ? (
              <View>
                <Text className="text-base text-foreground">{selectedClient.name}</Text>
                
                {/* Case Selection */}
                {clientCases.length > 1 ? (
                  <TouchableOpacity 
                    className="mt-2 bg-background border border-border rounded-xl p-3"
                    onPress={() => setShowCaseModal(true)}
                  >
                    <Text className="text-sm text-muted">Case:</Text>
                    <Text className="text-base text-foreground">
                      {selectedCase ? selectedCase.caseNumber : "Select a case"}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text className="text-sm text-muted mt-1">
                    Case: {selectedCase?.caseNumber || "Generating..."}
                  </Text>
                )}
                
                <TouchableOpacity className="mt-2" onPress={() => { setSelectedClient(null); setSelectedCase(null); setClientCases([]); }}>
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
              {/* Manual Interview Time */}
              <View>
                <Text className="text-base font-semibold text-foreground mb-2">Interview Time (Optional)</Text>
                <View className="gap-2">
                  <View>
                    <Text className="text-sm text-muted mb-1">Start Time</Text>
                    {RNPlatform.OS === 'web' ? (
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
                    {RNPlatform.OS === 'web' ? (
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
                    {RNPlatform.OS === 'web' ? (
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
                    {RNPlatform.OS === 'web' ? (
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
            disabled={createSession.isPending}
          >
            {createSession.isPending ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Text className="text-background text-lg font-semibold">Save Session</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Client Selection Modal */}
      <Modal
        visible={showClientModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowClientModal(false)}
      >
        <ScreenContainer>
          <View className="flex-1 p-4">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-foreground">Select Client</Text>
              <TouchableOpacity onPress={() => setShowClientModal(false)}>
                <Text className="text-primary font-semibold">Done</Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
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

            {/* Client List */}
            <FlatList
              data={filteredClients}
              keyExtractor={(item: any) => item.id.toString()}
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
          </View>
        </ScreenContainer>
      </Modal>

      {/* Case Selection Modal */}
      <Modal
        visible={showCaseModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCaseModal(false)}
      >
        <ScreenContainer>
          <View className="flex-1 p-4">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-foreground">Select Case</Text>
              <TouchableOpacity onPress={() => setShowCaseModal(false)}>
                <Text className="text-primary font-semibold">Done</Text>
              </TouchableOpacity>
            </View>

            {/* Case List */}
            <FlatList
              data={clientCases}
              keyExtractor={(item: any) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="bg-surface border border-border rounded-xl p-4 mb-3"
                  onPress={() => handleSelectCase(item)}
                >
                  <Text className="text-base font-semibold text-foreground">{item.caseNumber}</Text>
                  <Text className="text-sm text-muted mt-1">Status: {item.status}</Text>
                  {item.notes && (
                    <Text className="text-sm text-muted mt-1">{item.notes}</Text>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="items-center justify-center py-8">
                  <Text className="text-muted">No cases found</Text>
                </View>
              }
            />
          </View>
        </ScreenContainer>
      </Modal>

      {/* Session Type Modal */}
      <Modal
        visible={showSessionTypeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSessionTypeModal(false)}
      >
        <ScreenContainer>
          <View className="flex-1 p-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-foreground">Select Session Type</Text>
              <TouchableOpacity onPress={() => setShowSessionTypeModal(false)}>
                <Text className="text-primary font-semibold">Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={activeSessionTypes}
              keyExtractor={(item: any) => item.id.toString()}
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
          </View>
        </ScreenContainer>
      </Modal>

      {/* Session Status Modal */}
      <Modal
        visible={showSessionStatusModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSessionStatusModal(false)}
      >
        <ScreenContainer>
          <View className="flex-1 p-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-foreground">Select Session Status</Text>
              <TouchableOpacity onPress={() => setShowSessionStatusModal(false)}>
                <Text className="text-primary font-semibold">Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={activeSessionStatuses}
              keyExtractor={(item: any) => item.id.toString()}
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
          </View>
        </ScreenContainer>
      </Modal>

      {/* Session Result Modal */}
      <Modal
        visible={showSessionResultModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSessionResultModal(false)}
      >
        <ScreenContainer>
          <View className="flex-1 p-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-foreground">Select Session Result</Text>
              <TouchableOpacity onPress={() => setShowSessionResultModal(false)}>
                <Text className="text-primary font-semibold">Done</Text>
              </TouchableOpacity>
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
          </View>
        </ScreenContainer>
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
