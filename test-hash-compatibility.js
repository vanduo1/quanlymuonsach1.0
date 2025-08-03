const bcrypt = require('bcryptjs');

async function testHashCompatibility() {
  console.log('🔧 TESTING HASH COMPATIBILITY');
  console.log('================================');
  
  const password = 'admin123';
  const storedHash = '$2a$10$TmvyH1AoyDqRmQ4yjEoYoO.XbCfn4XRIqcQY1tKFOYu5m6rRZtYSO';
  
  console.log('Password to test:', password);
  console.log('Stored hash:', storedHash);
  
  // Test different bcrypt versions/salts
  const testHashes = [
    await bcrypt.hash(password, 10),
    await bcrypt.hash(password, '$2a$10$TmvyH1AoyDqRmQ4yjEoYoO'),
  ];
  
  console.log('\n🔍 GENERATED HASHES:');
  testHashes.forEach((hash, i) => {
    console.log(`Hash ${i + 1}:`, hash);
  });
  
  console.log('\n🧪 COMPARISON RESULTS:');
  console.log('Stored hash vs password:', await bcrypt.compare(password, storedHash));
  
  // Try to manually recreate the exact hash
  console.log('\n🔧 MANUAL HASH RECREATION:');
  try {
    // Try with exact salt from stored hash
    const salt = storedHash.substring(0, 29); // Extract salt part
    console.log('Extracted salt:', salt);
    
    const recreatedHash = await bcrypt.hash(password, salt);
    console.log('Recreated hash:', recreatedHash);
    console.log('Matches stored?:', recreatedHash === storedHash);
    console.log('Compare recreated:', await bcrypt.compare(password, recreatedHash));
  } catch (error) {
    console.log('Manual recreation error:', error.message);
  }
}

testHashCompatibility().catch(console.error);
