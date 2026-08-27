function normalizeNumber(n) {
  return String(n || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[.)]+$/, "");
}

// Matches answers to questions by normalized question number.
// Returns { questions: [...withAnswer], unmatchedAnswers: [...] }
export function mapAnswersToQuestions(questions, answers) {
  const byNumber = new Map();
  for (const a of answers) {
    if (!a.matchedQuestionNumber) continue;
    const key = normalizeNumber(a.matchedQuestionNumber);
    if (!byNumber.has(key)) byNumber.set(key, []);
    byNumber.get(key).push(a);
  }

  const usedAnswerIds = new Set();
  const mappedQuestions = questions.map((q) => {
    const key = normalizeNumber(q.number);
    const candidates = byNumber.get(key) || [];
    const answer = candidates[0] || null;
    if (answer) usedAnswerIds.add(answer.id);
    return {
      ...q,
      answer: answer || null,
      status: answer ? "answered" : "unanswered",
    };
  });

  const unmatchedAnswers = answers.filter((a) => !usedAnswerIds.has(a.id));

  return { questions: mappedQuestions, unmatchedAnswers };
}
