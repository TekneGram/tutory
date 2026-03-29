function normalizeFilename(filename) {
  return String(filename || '').replace(/\\/g, '/');
}

function isTestFile(filename) {
  const normalized = normalizeFilename(filename);
  return (
    normalized.includes('/__tests__/') ||
    normalized.endsWith('.test.ts') ||
    normalized.endsWith('.test.tsx') ||
    normalized.endsWith('.spec.ts') ||
    normalized.endsWith('.spec.tsx')
  );
}

module.exports = {
  normalizeFilename,
  isTestFile,
};
