import { createSession } from "./server/db";

async function testSessionCreation() {
  try {
    console.log("Testing session creation API...");
    
    const testData = {
      folderId: 1,
      clientId: 1,
      staffId: 1,
      sessionTypeId: 1,
      sessionStatusId: 1,
      sessionResultId: undefined,
      interviewStartTime: new Date(),
      interviewEndTime: new Date(Date.now() + 3600000),
      interviewDuration: 60,
      sessionStartTime: new Date(),
      sessionEndTime: new Date(Date.now() + 3600000),
      sessionDuration: 60,
      billableHours: "1.0",
      notes: "Test session",
      createdBy: 1,
      updatedBy: 1,
    };
    
    console.log("Test data:", JSON.stringify(testData, null, 2));
    
    const sessionId = await createSession(testData);
    console.log("✅ Session created successfully with ID:", sessionId);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating session:", error);
    process.exit(1);
  }
}

testSessionCreation();
