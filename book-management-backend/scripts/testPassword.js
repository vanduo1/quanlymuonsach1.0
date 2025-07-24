const bcrypt = require("bcryptjs");

async function testPassword() {
  const password = "admin123";
  const hash = await bcrypt.hash(password, 10);
  console.log("Hash:", hash);

  // Test với hash cũ
  const oldHash =
    "$2a$10$TmvyH1AoyDqRmQ4yjEoYoO.XbCfn4XRIqcQY1tKFOYu5m6rRZtYSO";
  const isValid = await bcrypt.compare(password, oldHash);
  console.log("Valid with old hash:", isValid);

  // Test với hash mới
  const isValidNewHash = await bcrypt.compare(password, hash);
  console.log("Valid with new hash:", isValidNewHash);
}

testPassword();
