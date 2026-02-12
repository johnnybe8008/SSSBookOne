import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";

/**
 * Admin - CSV Import
 * 
 * Allows admin users to bulk import organizational structures from CSV files.
 * 
 * CSV Format:
 * companyName,companyAddress,companyPhone,companyEmail,divisionName,divisionDescription,departmentName,departmentDescription,teamName,teamDescription
 */
export default function AdminCSVImportScreen() {
  const colors = useColors();
  const router = useRouter();
  const utils = trpc.useUtils();
  const [csvText, setCsvText] = useState("");
  const [importResult, setImportResult] = useState<any>(null);
  const [showHelp, setShowHelp] = useState(false);

  const importMutation = trpc.auth.importCSV.useMutation({
    onSuccess: (result) => {
      setImportResult(result);
      if (result.success) {
        // Invalidate all organizational queries to refresh data
        utils.companies.invalidate();
        utils.divisions.invalidate();
        utils.departments.invalidate();
        utils.companyTeams.invalidate();
        
        Alert.alert(
          "Success",
          result.message,
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
        Alert.alert("Import Failed", result.message);
      }
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to import CSV");
    },
  });

  const handleImport = () => {
    if (!csvText.trim()) {
      Alert.alert("Validation Error", "Please paste CSV data or upload a file");
      return;
    }

    Alert.alert(
      "Confirm Import",
      "This will create new companies, divisions, departments, and teams from the CSV data. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          onPress: () => {
            importMutation.mutate({ csvText });
          },
        },
      ]
    );
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/csv",
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        // Read file content
        const response = await fetch(file.uri);
        const text = await response.text();
        setCsvText(text);
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to read file: " + error.message);
    }
  };

  const sampleCSV = `companyName,companyAddress,companyPhone,companyEmail,divisionName,divisionDescription,departmentName,departmentDescription,teamName,teamDescription
"Acme Corp","123 Main St","555-1234","info@acme.com","Sales Division","Sales operations","Sales Dept","Main sales department","Team A","Sales team A"
"Acme Corp","","","","Sales Division","","Sales Dept","","Team B","Sales team B"
"Acme Corp","","","","Operations Division","Operations management","Ops Dept","Operations department","",""
"Beta Inc","456 Oak Ave","555-5678","contact@beta.com","Engineering","Engineering division","Dev Team","Development","",""`;

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">CSV Import</Text>
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
                    <Text className="text-xs font-mono text-foreground">Company,Division,Department,CompanyTeam</Text>
                  </View>
                </View>

                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">✅ Key Points</Text>
                  <Text className="text-sm text-muted leading-relaxed">• Use names, not IDs - the system creates entities automatically{"\n"}• Case-insensitive matching{"\n"}• Empty divisions/departments/teams are allowed{"\n"}• Duplicates are automatically skipped</Text>
                </View>

                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">📝 Example Row</Text>
                  <View className="bg-background rounded-xl p-3">
                    <Text className="text-xs font-mono text-foreground">ABC Corp,Sales,Enterprise,Team A</Text>
                  </View>
                  <Text className="text-xs text-muted mt-2">Creates: Company "ABC Corp" → Division "Sales" → Department "Enterprise" → Team "Team A"</Text>
                </View>

                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">💡 Tips</Text>
                  <Text className="text-sm text-muted leading-relaxed">• Import organizational structure before importing clients{"\n"}• Use consistent naming across rows{"\n"}• Check the sample template below for reference</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* Instructions */}
          <View className="bg-surface border border-border rounded-2xl p-5">
            <Text className="text-lg font-semibold text-foreground mb-3">CSV Format</Text>
            <Text className="text-sm text-muted leading-relaxed mb-3">
              Your CSV file must include the following columns (in this exact order):
            </Text>
            <View className="bg-background rounded-xl p-3 mb-3">
              <Text className="text-xs font-mono text-foreground">
                companyName, companyAddress, companyPhone, companyEmail,{"\n"}
                divisionName, divisionDescription,{"\n"}
                departmentName, departmentDescription,{"\n"}
                teamName, teamDescription
              </Text>
            </View>
            <Text className="text-sm text-muted leading-relaxed">
              • <Text className="font-semibold">companyName</Text> is required{"\n"}
              • Other fields are optional{"\n"}
              • Use empty strings ("") for optional fields{"\n"}
              • Multiple rows with the same company name will add to that company
            </Text>
          </View>

          {/* Sample CSV */}
          <View className="bg-success/10 border border-success rounded-2xl p-5">
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
              <Text className="text-base font-semibold text-primary mt-2">Choose CSV File</Text>
              <Text className="text-sm text-muted mt-1">or paste CSV data below</Text>
            </TouchableOpacity>
          </View>

          {/* CSV Text Input */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">CSV Data</Text>
            <TextInput
              className="bg-background border border-border rounded-xl px-4 py-3 text-sm font-mono text-foreground min-h-[200px]"
              placeholder="Paste CSV data here..."
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
            <View className={`border-2 rounded-2xl p-5 ${importResult.success ? 'bg-success/10 border-success' : 'bg-error/10 border-error'}`}>
              <Text className={`text-lg font-bold mb-2 ${importResult.success ? 'text-success' : 'text-error'}`}>
                {importResult.success ? "✓ Import Successful" : "✗ Import Failed"}
              </Text>
              <Text className="text-base text-foreground mb-3">{importResult.message}</Text>
              
              {importResult.stats && (
                <View className="bg-background rounded-xl p-3 gap-2">
                  <Text className="text-sm text-foreground">• Companies created: {importResult.stats.companiesCreated}</Text>
                  <Text className="text-sm text-foreground">• Divisions created: {importResult.stats.divisionsCreated}</Text>
                  <Text className="text-sm text-foreground">• Departments created: {importResult.stats.departmentsCreated}</Text>
                  <Text className="text-sm text-foreground">• Teams created: {importResult.stats.teamsCreated}</Text>
                </View>
              )}

              {importResult.errors && importResult.errors.length > 0 && (
                <View className="bg-error/10 rounded-xl p-3 mt-3">
                  <Text className="text-sm font-semibold text-error mb-2">Errors:</Text>
                  {importResult.errors.map((error: string, index: number) => (
                    <Text key={index} className="text-xs text-foreground">• {error}</Text>
                  ))}
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
              <Text className="text-background text-lg font-bold">Import CSV</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
