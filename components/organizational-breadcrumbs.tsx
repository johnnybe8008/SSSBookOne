import { View, Text } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface OrganizationalBreadcrumbsProps {
  items: string[];
  className?: string;
}

/**
 * Displays organizational hierarchy as breadcrumbs
 * Example: "Counseling Services → Mental Health Dept → Crisis Team"
 */
export function OrganizationalBreadcrumbs({ items, className }: OrganizationalBreadcrumbsProps) {
  const colors = useColors();

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <View className={`flex-row items-center flex-wrap ${className || ""}`}>
      {items.map((item, index) => (
        <View key={index} className="flex-row items-center">
          <Text className="text-sm text-muted">{item}</Text>
          {index < items.length - 1 && (
            <Text className="text-sm text-muted mx-2">→</Text>
          )}
        </View>
      ))}
    </View>
  );
}
