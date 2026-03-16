import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";
import * as DocumentPicker from "expo-document-picker";

/**
 * Admin - Client CSV Import
 * 
 * Allows admin staff to bulk import clients from CSV files.
 */
export default function AdminCSVImportClientsScreen() {
  const colors = useColors();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { staff } = useAuth();
  const [csvText, setCsvText] = useState("");
  const [importResult, setImportResult] = useState<any>(null);
  const [showHelp, setShowHelp] = useState(false);

  const importMutation = trpc.auth.importClients.useMutation({
    onSuccess: (result) => {
      setImportResult(result);
      if (result.success) {
        // Invalidate all client queries to refresh data
        utils.clients.invalidate();
        
        const errorSummary = result.errors && result.errors.length > 0
          ? `\n\nErrors encountered:\n${result.errors.slice(0, 5).join('\n')}${result.errors.length > 5 ? `\n... and ${result.errors.length - 5} more` : ''}`
          : '';
        
        Alert.alert(
          "Success",
          `${result.message}${errorSummary}`,
          [
            {
              text: "OK",
              onPress: () => {
                setCsvText("");
                setImportResult(null);
              },
            },
          ]
        );
      } else {
        const errorSummary = result.errors && result.errors.length > 0
          ? `\n\n${result.errors.slice(0, 5).join('\n')}${result.errors.length > 5 ? `\n... and ${result.errors.length - 5} more` : ''}`
          : '';
        Alert.alert("Import Failed", `${result.message}${errorSummary}`);
      }
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to import CSV");
    },
  });

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/comma-separated-values",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const response = await fetch(file.uri);
        const text = await response.text();
        setCsvText(text);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to read file");
    }
  };

  const handleImport = () => {
    if (!csvText.trim()) {
      Alert.alert("Validation Error", "Please provide CSV data");
      return;
    }

    importMutation.mutate({ csvText });
  };

  const sampleCSV = `Name,Email,HomePhone,MobilePhone,WorkPhone,Address,Occupation,Title,DateOfBirth,Company,Department,Team,ReferralSourceType,ReferralSourceId
"John Smith","john@example.com","555-0100","555-0101","","123 Main St","Engineer","Senior Engineer","1989-03-12","ABC Corp","Enterprise Sales","Team A","fsm","1"
"Jane Doe","jane@example.com","555-0200","","","456 Oak Ave","Manager","Project Manager","1982-11-04","ABC Corp","Enterprise Sales","Team B","staff","2"`;

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Text className="text-3xl font-bold text-foreground">&lt;</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Client CSV Import</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* CSV Format Help (Expandable) */}
          <TouchableOpacity
            className="bg-primary/10 border border-primary rounded-2xl p-4"
            onPress={() => setShowHelp(!showHelp)}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <IconSymbol name="doc.fill" size={24} color={colors.primary} />
                <Text className="text-lg font-semibold text-foreground">CSV Format Guide</Text>
              </View>
              <IconSymbol 
                name={showHelp ? "chevron.down" : "chevron.right"} 
                size={20} 
                color={colors.primary} 
              />
            </View>
            {showHelp && (
              <View className="mt-4 pt-4 border-t border-primary/30 gap-4">
                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">📋 Required Columns</Text>
                  <View className="bg-background rounded-xl p-3">
                    <Text className="text-xs font-mono text-foreground">Name,Company,Department</Text>
                  </View>
                  <Text className="text-xs text-muted mt-2">Name, Company, and Department are required. Team is optional.</Text>
                </View>

                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">📝 Optional Columns</Text>
                  <Text className="text-sm text-muted leading-relaxed">Email, HomePhone, MobilePhone, WorkPhone, Address, Occupation, Title, DateOfBirth, Team, ReferralSourceType, ReferralSourceId</Text>
                </View>

                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">✅ Key Points</Text>
                  <Text className="text-sm text-muted leading-relaxed">• Uses Company → Department → Team schema{"\n"}• No Division field{"\n"}• Missing company/department/team are auto-created{"\n"}• Duplicates (same name + company + department) are skipped{"\n"}• ReferralSourceType: fsm, staff, or client</Text>
                </View>

                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">💡 Example Row</Text>
                  <View className="bg-background rounded-xl p-3">
                    <Text className="text-xs font-mono text-foreground">John Smith,john@example.com,,,555-0101,123 Main St,Engineer,Senior Engineer,1989-03-12,ABC Corp,Enterprise Sales,Team A,fsm,1</Text>
                  </View>
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* Sample CSV */}
          <View className="bg-surface border border-border rounded-2xl p-5">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-foreground">Sample CSV</Text>
              <TouchableOpacity
                onPress={() => setCsvText(sampleCSV)}
                className="bg-success px-3 py-1 rounded-full"
              >
                <Text className="text-xs font-semibold text-background">Use Sample</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={true} className="bg-background rounded-xl p-3">
              <Text className="text-xs font-mono text-foreground">{sampleCSV}</Text>
            </ScrollView>
          </View>

          {/* File Upload */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Upload CSV File</Text>
            <TouchableOpacity
              className="bg-primary/10 border-2 border-dashed border-primary py-4 rounded-xl items-center"
              onPress={handlePickFile}
            >
              <IconSymbol name="doc.fill" size={32} color={colors.primary} />
              <Text className="text-sm text-primary font-medium mt-2">Select CSV File</Text>
            </TouchableOpacity>
          </View>

          {/* CSV Text Input */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Or Paste CSV Data</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl p-4 text-sm text-foreground font-mono min-h-[200px]"
              placeholder="Paste your CSV data here..."
              placeholderTextColor={colors.muted}
              value={csvText}
              onChangeText={setCsvText}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />
          </View>

          {/* Import Result */}
          {importResult && (
            <View className={`rounded-2xl p-5 ${importResult.success ? 'bg-success/10 border border-success' : 'bg-error/10 border border-error'}`}>
              <Text className={`text-lg font-semibold mb-2 ${importResult.success ? 'text-success' : 'text-error'}`}>
                {importResult.success ? '✓ Import Complete' : '✗ Import Failed'}
              </Text>
              <Text className="text-sm text-foreground mb-3">{importResult.message}</Text>
              {importResult.clientsCreated > 0 && (
                <Text className="text-sm text-success">• {importResult.clientsCreated} client(s) created</Text>
              )}
              {importResult.clientsSkipped > 0 && (
                <Text className="text-sm text-warning">• {importResult.clientsSkipped} client(s) skipped</Text>
              )}
              {importResult.errors && importResult.errors.length > 0 && (
                <View className="mt-3 pt-3 border-t border-border">
                  <Text className="text-sm font-semibold text-foreground mb-2">Errors:</Text>
                  {importResult.errors.slice(0, 5).map((error: string, index: number) => (
                    <Text key={index} className="text-xs text-error mb-1">• {error}</Text>
                  ))}
                  {importResult.errors.length > 5 && (
                    <Text className="text-xs text-muted mt-1">... and {importResult.errors.length - 5} more errors</Text>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Import Button */}
          <TouchableOpacity
            className="bg-primary py-4 rounded-full items-center"
            onPress={handleImport}
            disabled={importMutation.isPending || !csvText.trim()}
          >
            {importMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Text className="text-background text-lg font-bold">Import Clients</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
