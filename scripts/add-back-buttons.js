const fs = require('fs');
const path = require('path');

const adminScreens = [
  'admin-companies.tsx',
  'admin-csv-import-clients.tsx',
  'admin-csv-import.tsx',
  'admin-departments.tsx',
  'admin-divisions.tsx',
  'admin-fsms.tsx',
  'admin-lookup-org.tsx',
  'admin-lookup-tables.tsx',
  'admin-organizations.tsx',
  'admin-reports.tsx',
  'admin-reset-database.tsx',
  'admin-templates.tsx',
  'admin-users.tsx'
];

const backButtonComponent = `        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-2 mb-4"
        >
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          <Text className="text-primary text-base font-semibold">Back</Text>
        </TouchableOpacity>

`;

adminScreens.forEach(screen => {
  const filePath = path.join(__dirname, '../app', screen);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipped ${screen} (file not found)`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if back button already exists
  if (content.includes('Back Button') || content.includes('router.back()')) {
    console.log(`✓ ${screen} already has back button`);
    return;
  }
  
  // Add IconSymbol import if missing
  if (!content.includes('IconSymbol')) {
    content = content.replace(
      /from "@\/components\/screen-container";/,
      'from "@/components/screen-container";\nimport { IconSymbol } from "@/components/ui/icon-symbol";'
    );
  }
  
  // Add useColors import if missing
  if (!content.includes('useColors')) {
    content = content.replace(
      /from "@\/hooks\/use-colors";/,
      'from "@/hooks/use-colors";'
    );
    if (!content.includes('import { useColors }')) {
      content = content.replace(
        /from "@\/components\/ui\/icon-symbol";/,
        'from "@/components/ui/icon-symbol";\nimport { useColors } from "@/hooks/use-colors";'
      );
    }
  }
  
  // Add colors hook if missing
  if (!content.includes('const colors = useColors()')) {
    content = content.replace(
      /(export default function \w+\(\) \{)/,
      '$1\n  const colors = useColors();'
    );
  }
  
  // Add back button after <ScrollView> or first element in ScreenContainer
  content = content.replace(
    /(<ScrollView[^>]*>)\s*(\{\/\* Header \*\/|<View|<Text)/,
    `$1\n${backButtonComponent}$2`
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Added back button to ${screen}`);
});

console.log('\n✨ Done!');
