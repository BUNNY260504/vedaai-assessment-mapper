import { Router } from "express";
import multer from "multer";
import { v4 as uuid } from "uuid";
import { rasterizeFile } from "../services/rasterize.js";
import { extractQuestions, extractAnswers, gradeAnswers } from "../services/gemini.js";
import { mapAnswersToQuestions } from "../services/mapping.js";
import { createExam, getExam, updateExam } from "../services/store.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 20 },
});

const router = Router();

router.post(
  "/",
  upload.fields([
    { name: "questionPaper", maxCount: 10 },
    { name: "answerSheet", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const questionFiles = req.files?.questionPaper;
      const answerFiles = req.files?.answerSheet;
      if (!questionFiles?.length || !answerFiles?.length) {
        return res
          .status(400)
          .json({ error: "Both questionPaper and answerSheet files are required." });
      }

      const id = uuid();
      const exam = createExam(id);

      const questionPages = (
        await Promise.all(questionFiles.map((f) => rasterizeFile(f)))
      ).flat();
      const answerPages = (
        await Promise.all(answerFiles.map((f) => rasterizeFile(f)))
      ).flat();

      updateExam(id, { questionPages, answerPages, status: "extracting" });

      res.status(202).json({ id });

      processExam(id).catch((err) => {
        console.error(`Exam ${id} processing failed:`, err);
        updateExam(id, { status: "error", error: err.message });
      });
    } catch (err) {
      console.error("Upload failed:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

async function processExam(id) {
  const exam = getExam(id);
  if (!exam) return;

  updateExam(id, { status: "extracting" });
  const rawQuestions = await extractQuestions(exam.questionPages);
  const questions = rawQuestions.map((q) => ({ ...q, id: uuid() }));

  const rawAnswers = await extractAnswers(exam.answerPages, questions);
  const answers = rawAnswers.map((a) => ({ ...a, id: uuid() }));

  updateExam(id, { status: "mapping", questions, answers });

  const { questions: mappedQuestions, unmatchedAnswers } = mapAnswersToQuestions(
    questions,
    answers
  );

  updateExam(id, { status: "grading", questions: mappedQuestions, unmatchedAnswers });

  const mappedPairs = mappedQuestions.map((q) => ({ question: q, answer: q.answer }));
  let grading = null;
  try {
    grading = await gradeAnswers(questions, mappedPairs);
  } catch (err) {
    console.error(`Exam ${id} grading failed (non-fatal):`, err);
  }

  let finalQuestions = mappedQuestions;
  let summary = null;
  if (grading) {
    const byNumber = new Map(
      grading.perQuestion.map((g) => [normalize(g.number), g])
    );
    finalQuestions = mappedQuestions.map((q) => {
      const g = byNumber.get(normalize(q.number));
      return g
        ? {
            ...q,
            grading: {
              status: g.status,
              marksAwarded: g.marksAwarded,
              maxMarks: g.maxMarks,
              feedback: g.feedback,
            },
          }
        : q;
    });

    const answered = finalQuestions.filter((q) => q.status === "answered");
    const totalMarks = finalQuestions.reduce(
      (sum, q) => sum + (q.grading?.marksAwarded ?? 0),
      0
    );
    const maxMarks = finalQuestions.reduce(
      (sum, q) => sum + (q.grading?.maxMarks ?? 0),
      0
    );
    summary = {
      totalQuestions: finalQuestions.length,
      answeredCount: answered.length,
      unansweredCount: finalQuestions.length - answered.length,
      correctCount: finalQuestions.filter((q) => q.grading?.status === "correct").length,
      partialCount: finalQuestions.filter((q) => q.grading?.status === "partial").length,
      incorrectCount: finalQuestions.filter((q) => q.grading?.status === "incorrect").length,
      totalMarks,
      maxMarks,
      overallFeedback: grading.overallFeedback,
    };
  }

  updateExam(id, {
    status: "done",
    questions: finalQuestions,
    summary,
  });
}

function normalize(n) {
  return String(n || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[.)]+$/, "");
}

router.get("/:id/status", (req, res) => {
  const exam = getExam(req.params.id);
  if (!exam) return res.status(404).json({ error: "Not found" });
  res.json({ status: exam.status, error: exam.error });
});

router.get("/:id/result", (req, res) => {
  const exam = getExam(req.params.id);
  if (!exam) return res.status(404).json({ error: "Not found" });

  res.json({
    id: exam.id,
    status: exam.status,
    error: exam.error,
    questionPageCount: exam.questionPages.length,
    answerPageCount: exam.answerPages.length,
    questionPages: exam.questionPages.map((p, i) => ({
      index: i,
      width: p.width,
      height: p.height,
    })),
    answerPages: exam.answerPages.map((p, i) => ({
      index: i,
      width: p.width,
      height: p.height,
    })),
    questions: exam.questions || [],
    unmatchedAnswers: exam.unmatchedAnswers || [],
    summary: exam.summary || null,
  });
});

router.get("/:id/pages/:side/:index", (req, res) => {
  const exam = getExam(req.params.id);
  if (!exam) return res.status(404).end();
  const pages = req.params.side === "question" ? exam.questionPages : exam.answerPages;
  const page = pages?.[Number(req.params.index)];
  if (!page) return res.status(404).end();
  res.setHeader("Content-Type", page.mime);
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(page.buffer);
});

export default router;
