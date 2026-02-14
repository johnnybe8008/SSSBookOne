const mysql = require('mysql2/promise');

async function updateSessionStaff() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'doh_book_one'
  });

  try {
    // Get all current staff IDs
    const [staff] = await connection.execute('SELECT id, name FROM staff ORDER BY id');
    
    console.log('\n📋 Current Staff:');
    staff.forEach(s => console.log(`  - ID ${s.id}: ${s.name}`));
    
    if (staff.length === 0) {
      console.log('\n❌ No staff found in database');
      return;
    }

    // Get count of sessions with non-existent staff IDs
    const [oldSessions] = await connection.execute(
      'SELECT COUNT(*) as count FROM sessions WHERE staffId NOT IN (SELECT id FROM staff)'
    );
    
    console.log(`\n🔍 Found ${oldSessions[0].count} sessions with invalid staff IDs`);
    
    if (oldSessions[0].count === 0) {
      console.log('✅ All sessions already have valid staff IDs');
      return;
    }

    // Distribute sessions evenly among staff
    const staffIds = staff.map(s => s.id);
    
    // Get all sessions with invalid staff IDs
    const [sessions] = await connection.execute(
      'SELECT id FROM sessions WHERE staffId NOT IN (SELECT id FROM staff) ORDER BY id'
    );
    
    console.log(`\n🔄 Updating ${sessions.length} sessions...`);
    
    // Update each session with a staff ID (round-robin distribution)
    let updated = 0;
    for (let i = 0; i < sessions.length; i++) {
      const sessionId = sessions[i].id;
      const staffId = staffIds[i % staffIds.length];
      
      await connection.execute(
        'UPDATE sessions SET staffId = ? WHERE id = ?',
        [staffId, sessionId]
      );
      updated++;
    }
    
    console.log(`✅ Updated ${updated} sessions`);
    
    // Show distribution
    console.log('\n📊 Session distribution by staff:');
    const [distribution] = await connection.execute(`
      SELECT s.id, s.name, COUNT(ses.id) as sessionCount
      FROM staff s
      LEFT JOIN sessions ses ON s.id = ses.staffId
      GROUP BY s.id, s.name
      ORDER BY s.id
    `);
    
    distribution.forEach(d => {
      console.log(`  - ${d.name} (ID ${d.id}): ${d.sessionCount} sessions`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

updateSessionStaff();
