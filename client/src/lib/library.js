const STORAGE_KEY = "vedaai_library";

export function getLibrary() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLibrary(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function findLibraryEntry(examId) {
  return getLibrary().find((e) => e.examId === examId) || null;
}

export function saveToLibrary({ examId, studentName, summary }) {
  const entries = getLibrary();
  const index = entries.findIndex((e) => e.examId === examId);
  const entry = { examId, studentName, summary: summary || null, savedAt: Date.now() };
  if (index >= 0) {
    entries[index] = entry;
  } else {
    entries.unshift(entry);
  }
  writeLibrary(entries);
  return entry;
}
