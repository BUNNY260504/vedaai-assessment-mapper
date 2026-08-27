const exams = new Map();

export function createExam(id) {
  const exam = {
    id,
    status: "uploaded", // uploaded -> extracting -> mapping -> grading -> done -> error
    error: null,
    questionPages: [], // [{ index, width, height, buffer }]
    answerPages: [],
    questions: [], // [{ id, number, text, page, bbox, marks }]
    answers: [], // [{ id, matchedQuestionNumber, regions: [{page, bbox}], text, confidence }]
    mapping: [], // [{ questionId, answerId | null, status }]
    grading: null, // { perQuestion: [...], summary: {...} }
    createdAt: Date.now(),
  };
  exams.set(id, exam);
  return exam;
}

export function getExam(id) {
  return exams.get(id);
}

export function updateExam(id, patch) {
  const exam = exams.get(id);
  if (!exam) return null;
  Object.assign(exam, patch);
  return exam;
}

// Basic cleanup: drop exams older than 2 hours to bound memory use.
setInterval(() => {
  const cutoff = Date.now() - 2 * 60 * 60 * 1000;
  for (const [id, exam] of exams) {
    if (exam.createdAt < cutoff) exams.delete(id);
  }
}, 30 * 60 * 1000).unref();
