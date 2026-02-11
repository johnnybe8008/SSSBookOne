import { useState, useEffect, useRef } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";

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
  const { data: user } = trpc.auth.me.useQuery();
  const utils = trpc.useUtils();

  // Fetch lookup data
  const { data: sessionTypes } = trpc.sessionTypes.list.useQuery();
  const { data: sessionStatuses } = trpc.sessionStatuses.list.useQuery();
  const { data: sessionResults } = trpc.sessionResults.list.useQuery();

  // Session metadata
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [sessionTypeId, setSessionTypeId] = useState<number | null>(null);
  const [sessionStatusId, setSessionStatusId] = useState<number | null>(null);
  const [sessionResultId, setSessionResultId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [billableHours, setBillableHours] = useState("");

  // Interview Timer State
  const [interviewRunning, setInterviewRunning] = useState(false);
  const [interviewSeconds, setInterviewSeconds] = useState(0);
  const [interviewStartTime, setInterviewStartTime] = useState<Date | null>(null);
  const interviewIntervalRef = useRef<any>(null);

  // Session Timer State
  const [sessionRunning, setSessionRunning] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const sessionIntervalRef = useRef<any>(null);

  // Create session mutation
  const createSession = trpc.sessions.create.useMutation({
    onSuccess: () => {
      utils.sessions.invalidate();
      Alert.alert("Success", "Session saved successfully", [
        { text: "OK", onPress: () => router.back() }
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to save session");
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

  const toggleInterviewTimer = () => {
    if (!interviewRunning) {
      if (interviewSeconds === 0) {
        setInterviewStartTime(new Date());
      }
      setInterviewRunning(true);
    } else {
      setInterviewRunning(false);
    }
  };

  const resetInterviewTimer = () => {
    setInterviewRunning(false);
    setInterviewSeconds(0);
    setInterviewStartTime(null);
  };

  const toggleSessionTimer = () => {
    if (!sessionRunning) {
      if (sessionSeconds === 0) {
        setSessionStartTime(new Date());
      }
      setSessionRunning(true);
    } else {
      setSessionRunning(false);
    }
  };

  const resetSessionTimer = () => {
    setSessionRunning(false);
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

    const interviewEndTime = interviewStartTime && interviewSeconds > 0 ? new Date(interviewStartTime.getTime() + interviewSeconds * 1000) : null;
    const sessionEndTime = sessionStartTime && sessionSeconds > 0 ? new Date(sessionStartTime.getTime() + sessionSeconds * 1000) : null;

    createSession.mutate({
      caseId: selectedCase.id,
      clientId: selectedClient.id,
      staffId: user.id,
      sessionTypeId,
      sessionStatusId,
      sessionResultId: sessionResultId || undefined,
      interviewStartTime: interviewStartTime || undefined,
      interviewEndTime: interviewEndTime || undefined,
      interviewDuration: interviewSeconds > 0 ? Math.floor(interviewSeconds / 60) : undefined,
      sessionStartTime: sessionStartTime || undefined,
      sessionEndTime: sessionEndTime || undefined,
      sessionDuration: sessionSeconds > 0 ? Math.floor(sessionSeconds / 60) : undefined,
      billableHours: billableHours.trim() || undefined,
      notes: notes.trim() || undefined,
      createdBy: user.id,
      updatedBy: user.id,
    });
  };

  const activeSessionTypes = sessionTypes?.filter((t: any) => t.isActive === 1) || [];
  const activeSessionStatuses = sessionStatuses?.filter((s: any) => s.isActive === 1) || [];
  const activeSessionResults = sessionResults?.filter((r: any) => r.isActive === 1) || [];

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-foreground">Record Session</Text>
            <Text className="text-sm text-muted mt-1">Track counseling session with dual timers</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Client Selection (Placeholder - will be implemented in Client Management) */}
          <View className="bg-surface border border-border rounded-2xl p-4">
            <Text className="text-base font-semibold text-foreground mb-2">Client & Case</Text>
            {selectedClient ? (
              <View>
                <Text className="text-base text-foreground">{selectedClient.name}</Text>
                <Text className="text-sm text-muted">Case: {selectedCase?.caseNumber || "N/A"}</Text>
                <TouchableOpacity className="mt-2" onPress={() => { setSelectedClient(null); setSelectedCase(null); }}>
                  <Text className="text-sm text-primary">Change Client</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity className="bg-primary py-3 rounded-xl items-center" onPress={() => Alert.alert("Coming Soon", "Client selection will be available after Client Management is implemented")}>
                <Text className="text-background font-semibold">Select Client</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Dual Timers */}
          <View className="bg-surface border border-border rounded-2xl p-4 gap-4">
            {/* Interview Timer */}
            <View>
              <Text className="text-base font-semibold text-foreground mb-2">Interview Time</Text>
              <Text className="text-sm text-muted mb-3">Pre/post activities (travel, prep, documentation)</Text>
              <View className="bg-background rounded-xl p-4 items-center">
                <Text className="text-4xl font-bold text-foreground mb-4">{formatTime(interviewSeconds)}</Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="bg-primary px-6 py-3 rounded-xl"
                    onPress={toggleInterviewTimer}
                  >
                    <Text className="text-background font-semibold">{interviewRunning ? "Pause" : "Start"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-surface border border-border px-6 py-3 rounded-xl"
                    onPress={resetInterviewTimer}
                  >
                    <Text className="text-foreground font-semibold">Reset</Text>
                  </TouchableOpacity>
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
                  <TouchableOpacity
                    className="bg-primary px-6 py-3 rounded-xl"
                    onPress={toggleSessionTimer}
                  >
                    <Text className="text-background font-semibold">{sessionRunning ? "Pause" : "Start"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-surface border border-border px-6 py-3 rounded-xl"
                    onPress={resetSessionTimer}
                  >
                    <Text className="text-foreground font-semibold">Reset</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Session Metadata */}
          <View className="bg-surface border border-border rounded-2xl p-4 gap-3">
            <Text className="text-base font-semibold text-foreground mb-1">Session Details</Text>

            {/* Session Type */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Session Type *</Text>
              <View className="bg-background border border-border rounded-xl overflow-hidden">
                <Picker
                  selectedValue={sessionTypeId}
                  onValueChange={(value: any) => setSessionTypeId(value)}
                  style={{ color: colors.foreground }}
                >
                  <Picker.Item label="Select session type" value={null} />
                  {activeSessionTypes.map((type: any) => (
                    <Picker.Item key={type.id} label={type.name} value={type.id} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Session Status */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Session Status *</Text>
              <View className="bg-background border border-border rounded-xl overflow-hidden">
                <Picker
                  selectedValue={sessionStatusId}
                  onValueChange={(value: any) => setSessionStatusId(value)}
                  style={{ color: colors.foreground }}
                >
                  <Picker.Item label="Select session status" value={null} />
                  {activeSessionStatuses.map((status: any) => (
                    <Picker.Item key={status.id} label={status.name} value={status.id} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Session Result */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Session Result</Text>
              <View className="bg-background border border-border rounded-xl overflow-hidden">
                <Picker
                  selectedValue={sessionResultId}
                  onValueChange={(value: any) => setSessionResultId(value)}
                  style={{ color: colors.foreground }}
                >
                  <Picker.Item label="Select session result (optional)" value={null} />
                  {activeSessionResults.map((result: any) => (
                    <Picker.Item key={result.id} label={result.name} value={result.id} />
                  ))}
                </Picker>
              </View>
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
    </ScreenContainer>
  );
}
