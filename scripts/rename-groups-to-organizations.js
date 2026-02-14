const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/admin-organizations.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Rename variables and functions
const replacements = [
  // State variables
  ['expandedGroupId', 'expandedOrganizationId'],
  ['setExpandedGroupId', 'setExpandedOrganizationId'],
  ['isAddingGroup', 'isAddingOrganization'],
  ['setIsAddingGroup', 'setIsAddingOrganization'],
  ['newGroupName', 'newOrganizationName'],
  ['setNewGroupName', 'setNewOrganizationName'],
  ['newGroupDescription', 'newOrganizationDescription'],
  ['setNewGroupDescription', 'setNewOrganizationDescription'],
  
  // Mutations and functions
  ['createGroup', 'createOrganization'],
  ['deleteGroup', 'deleteOrganization'],
  ['handleCreateGroup', 'handleCreateOrganization'],
  ['handleDeleteGroup', 'handleDeleteOrganization'],
  ['toggleGroup', 'toggleOrganization'],
  
  // Query parameters
  ['groupId:', 'organizationId:'],
  
  // UI text
  ['Add New Group', 'Add New Organization'],
  ['Enter group name', 'Enter organization name'],
  ['group name', 'organization name'],
  ['Group created successfully', 'Organization created successfully'],
  ['Group deleted successfully', 'Organization deleted successfully'],
  ['Failed to create group', 'Failed to create organization'],
  ['Failed to delete group', 'Failed to delete organization'],
  ['Delete Group', 'Delete Organization'],
  
  // Comments
  ['// Fetch all groups', '// Fetch all organizations'],
  ['// Fetch teams for expanded group', '// Fetch departments for expanded organization'],
  ['// Create group mutation', '// Create organization mutation'],
  ['// Delete group mutation', '// Delete organization mutation'],
  ['{/* Add New Group Form */', '{/* Add New Organization Form */}'],
  ['{/* Groups List */', '{/* Organizations List */}'],
];

replacements.forEach(([find, replace]) => {
  content = content.split(find).join(replace);
});

// Also need to update the data variable names
content = content.replace(/const { data: groups/g, 'const { data: organizations');
content = content.replace(/groups\?\.map/g, 'organizations?.map');
content = content.replace(/\(group:/g, '(organization:');
content = content.replace(/group\.id/g, 'organization.id');
content = content.replace(/group\.name/g, 'organization.name');
content = content.replace(/group\.description/g, 'organization.description');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Successfully renamed Groups to Organizations in admin-organizations.tsx');
