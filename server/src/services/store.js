const exams = new Map();

export function createExam(id) {
  const exam = {
    id,
    status: "uploaded",
    error: null,
    questionPages: [],
    answerPages: [],
    questions: [],
    answers: [],
    mapping: [],
    grading: null,
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

setInterval(() => {
  const cutoff = Date.now() - 2 * 60 * 60 * 1000;
  for (const [id, exam] of exams) {
    if (exam.createdAt < cutoff) exams.delete(id);
  }
}, 30 * 60 * 1000).unref();
