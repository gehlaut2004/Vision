function generateUsername(name, enrollment) {
  const base = name.toLowerCase().split(" ")[0];
  const suffix = enrollment.slice(-4);
  return `${base}${suffix}`;
}

function generatePassword() {
  return Math.random().toString(36).slice(2, 10); // 8-char alphanumeric
}

module.exports = { generateUsername, generatePassword };
