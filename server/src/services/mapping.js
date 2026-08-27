const REVIEW_CONFIDENCE_THRESHOLD = 0.6;

function normalizeNumber(n) {
  return String(n || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[.)]+$/, "");
}

function candidateRank(a) {
  // Prefer explicit labels over inferred guesses, then higher confidence.
  const methodScore = a.matchMethod === "label" ? 1 : 0;
  return methodScore * 10 + (a.confidence ?? 0);
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
  for (const candidates of byNumber.values()) {
    candidates.sort((a, b) => candidateRank(b) - candidateRank(a));
  }

  const usedAnswerIds = new Set();
  const mappedQuestions = questions.map((q) => {
    const key = normalizeNumber(q.number);
    const candidates = byNumber.get(key) || [];
    const answer = candidates[0] || null;
    if (answer) usedAnswerIds.add(answer.id);
    const needsReview =
      !!answer &&
      (answer.matchMethod === "inferred" ||
        (answer.confidence ?? 1) < REVIEW_CONFIDENCE_THRESHOLD);
    return {
      ...q,
      answer: answer || null,
      status: answer ? "answered" : "unanswered",
      needsReview,
    };
  });

  const unmatchedAnswers = answers.filter((a) => !usedAnswerIds.has(a.id));

  return { questions: mappedQuestions, unmatchedAnswers };
}
