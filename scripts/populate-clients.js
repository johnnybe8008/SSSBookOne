const mysql = require('mysql2/promise');

const CLIENT_NAMES = [
  "John Smith", "Maria Garcia", "James Johnson", "Patricia Brown", "Robert Jones",
  "Jennifer Davis", "Michael Miller", "Linda Wilson", "William Moore", "Elizabeth Taylor",
  "David Anderson", "Barbara Thomas", "Richard Jackson", "Susan White", "Joseph Harris",
  "Jessica Martin", "Thomas Thompson", "Sarah Garcia", "Charles Martinez", "Karen Robinson",
  "Christopher Clark", "Nancy Rodriguez", "Daniel Lewis", "Lisa Lee", "Matthew Walker",
  "Betty Hall", "Anthony Allen", "Margaret Young", "Mark Hernandez", "Sandra King",
  "Donald Wright", "Ashley Lopez", "Steven Hill", "Kimberly Scott", "Paul Green",
  "Emily Adams", "Andrew Baker", "Donna Gonzalez", "Joshua Nelson", "Michelle Carter",
  "Kenneth Mitchell", "Carol Perez", "Kevin Roberts", "Amanda Turner", "Brian Phillips",
  "Melissa Campbell", "George Parker", "Deborah Evans", "Ronald Edwards", "Stephanie Collins",
  "Timothy Stewart", "Rebecca Sanchez", "Jason Morris", "Laura Rogers", "Jeffrey Reed",
  "Cynthia Cook", "Ryan Morgan", "Kathleen Bell", "Jacob Murphy", "Amy Bailey"
];

const DEPARTMENTS = [201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212];

async function populateClients() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    console.log('Creating 60 clients (IDs 501-560)...');
    
    const values = [];
    for (let i = 0; i < 60; i++) {
      const clientId = 501 + i;
      const name = CLIENT_NAMES[i];
      const departmentId = DEPARTMENTS[i % DEPARTMENTS.length];
      
      values.push(`(${clientId}, ${departmentId}, '${name}', 'Active', NOW(), 1, NOW(), 1)`);
    }
    
    const sql = `
      INSERT INTO clients (id, departmentId, name, status, createdAt, createdBy, updatedAt, updatedBy)
      VALUES ${values.join(',\n')}
    `;
    
    await conn.query(sql);
    console.log('✅ Successfully created 60 clients');
    
    const [count] = await conn.query('SELECT COUNT(*) as count FROM clients');
    console.log(`Total clients in database: ${count[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await conn.end();
  }
}

populateClients();
