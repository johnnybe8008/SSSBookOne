const fs = require('fs');
const path = require('path');

const routersPath = path.join(__dirname, '../server/routers.ts');
let content = fs.readFileSync(routersPath, 'utf8');

// Define which routers need which permissions
const adminOnlyRouters = [
  'groups', 'teams', 'staff', 'companies', 'divisions', 'departments', 
  'companyTeams', 'fsms', 'sessionTypes', 'sessionStatuses', 'sessionResults'
];

const writeAccessRouters = ['clients', 'cases', 'sessions', 'notifications'];

// Replace protectedProcedure with adminOnlyProcedure for admin-only routers
adminOnlyRouters.forEach(router => {
  // Match create: protectedProcedure
  content = content.replace(
    new RegExp(`(${router}:.*?create: )protectedProcedure`, 's'),
    '$1adminOnlyProcedure'
  );
  // Match update: protectedProcedure
  content = content.replace(
    new RegExp(`(${router}:.*?update: )protectedProcedure`, 's'),
    '$1adminOnlyProcedure'
  );
  // Match delete: protectedProcedure
  content = content.replace(
    new RegExp(`(${router}:.*?delete: )protectedProcedure`, 's'),
    '$1adminOnlyProcedure'
  );
});

// Replace protectedProcedure with writeAccessProcedure for write-access routers
writeAccessRouters.forEach(router => {
  // Match create: protectedProcedure
  content = content.replace(
    new RegExp(`(${router}:.*?create: )protectedProcedure`, 's'),
    '$1writeAccessProcedure'
  );
  // Match update: protectedProcedure
  content = content.replace(
    new RegExp(`(${router}:.*?update: )protectedProcedure`, 's'),
    '$1writeAccessProcedure'
  );
  // Match delete: protectedProcedure
  content = content.replace(
    new RegExp(`(${router}:.*?delete: )protectedProcedure`, 's'),
    '$1writeAccessProcedure'
  );
  // Match bulkUpdate: protectedProcedure (for clients)
  content = content.replace(
    new RegExp(`(${router}:.*?bulkUpdate: )protectedProcedure`, 's'),
    '$1writeAccessProcedure'
  );
});

fs.writeFileSync(routersPath, content);
console.log('✅ Router permissions updated successfully');
