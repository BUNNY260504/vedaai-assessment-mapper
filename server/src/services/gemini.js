import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

function imageParts(pages) {
  return pages.map((p, i) => ({
    inlineData: {
      mimeType: p.mime,
      data: p.buffer.toString("base64"),
    },
  }));
}

function pageLabelParts(pages) {
  // Interleave a text label before each image so the model can cite page indices reliably.
  const parts = [];
  pages.forEach((p, i) => {
    parts.push({ text: `--- PAGE ${i} ---` });
    parts.push({
      inlineData: { mimeType: p.mime, data: p.buffer.toString("base64") },
    });
  });
  return parts;
}

async function callGemini({ systemInstruction, parts, schema }) {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0,
    },
  });
  return response.text;
}

// Gemini's JSON mode is very reliable but occasionally truncates or wraps output
// (e.g. on transient errors); one retry avoids failing an entire exam over a blip.
async function generateJson({ systemInstruction, parts, schema }) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    const text = await callGemini({ systemInstruction, parts, schema });
    try {
      return JSON.parse(text);
    } catch (e) {
      lastError = new Error(`Gemini returned invalid JSON: ${text?.slice(0, 500)}`);
    }
  }
  throw lastError;
}

const BBOX_SCHEMA = {
  type: "ARRAY",
  items: { type: "NUMBER" },
  minItems: 4,
  maxItems: 4,
  description: "[ymin, xmin, ymax, xmax] normalized 0-1000",
};

const QUESTIONS_SCHEMA = {
  type: "OBJECT",
  properties: {
    questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          number: { type: "STRING" },
          text: { type: "STRING" },
          page: { type: "INTEGER" },
          bbox: BBOX_SCHEMA,
          marks: { type: "NUMBER" },
        },
        required: ["number", "text", "page", "bbox"],
      },
    },
  },
  required: ["questions"],
};

const ANSWERS_SCHEMA = {
  type: "OBJECT",
  properties: {
    answers: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          matchedQuestionNumber: { type: "STRING", nullable: true },
          matchMethod: {
            type: "STRING",
            enum: ["label", "inferred", "none"],
            description:
              "'label' = student explicitly wrote the question number/cue next to this answer. 'inferred' = no explicit label was found; the match is a best guess from content and/or position. 'none' = matchedQuestionNumber is null.",
          },
          regions: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                page: { type: "INTEGER" },
                bbox: BBOX_SCHEMA,
              },
              required: ["page", "bbox"],
            },
          },
          transcribedText: { type: "STRING" },
          confidence: { type: "NUMBER" },
        },
        required: ["regions", "transcribedText", "confidence", "matchMethod"],
      },
    },
  },
  required: ["answers"],
};

const GRADING_SCHEMA = {
  type: "OBJECT",
  properties: {
    perQuestion: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          number: { type: "STRING" },
          status: {
            type: "STRING",
            enum: ["correct", "partial", "incorrect", "unanswered", "ungraded"],
          },
          marksAwarded: { type: "NUMBER" },
          maxMarks: { type: "NUMBER" },
          feedback: { type: "STRING" },
        },
        required: ["number", "status", "marksAwarded", "maxMarks", "feedback"],
      },
    },
    overallFeedback: { type: "STRING" },
  },
  required: ["perQuestion", "overallFeedback"],
};

export async function extractQuestions(questionPages) {
  const parts = [
    {
      text: "Extract every question from this question paper in printed order.",
    },
    ...pageLabelParts(questionPages),
  ];
  const result = await generateJson({
    systemInstruction: `You are an exam question extraction engine. Given page images of a question paper (labelled "--- PAGE n ---", 0-indexed), extract EVERY question in the exact printed order.
Rules:
- Treat labelled sub-parts as SEPARATE entries. Example: "11 (a)" and "11 (b)" must be two entries with number "11(a)" and "11(b)".
- Preserve original numbering exactly as printed (e.g. "1", "2.", "Q3", "11(a)") but normalize to a clean form without trailing punctuation, e.g. "1", "2", "Q3", "11(a)".
- "text" is the full question text (instructions, sub-text, options for MCQs) excluding the number itself.
- "page" is the 0-indexed page number where the question STARTS.
- "bbox" is [ymin, xmin, ymax, xmax] normalized 0-1000 tightly bounding the question's text block on that page (number + text).
- "marks" is the marks allotted if printed/inferable, otherwise omit.
- Do not skip any question, including ones without explicit numbering if they are clearly part of the sequence.
- Output strict JSON matching the schema. No commentary.`,
    parts,
    schema: QUESTIONS_SCHEMA,
  });
  return result.questions || [];
}

export async function extractAnswers(answerPages, questions) {
  const questionList = questions
    .map((q) => `${q.number}: ${q.text.slice(0, 120)}`)
    .join("\n");
  const parts = [
    {
      text: `Here is the list of questions from the question paper (for matching reference only):\n${questionList}\n\nNow extract every distinct answer block from the student's handwritten answer sheet pages below.`,
    },
    ...pageLabelParts(answerPages),
  ];
  const result = await generateJson({
    systemInstruction: `You are a handwritten answer-sheet extraction engine. Handwriting quality varies a lot — some students write neatly and label every answer, others scrawl, skip labels, cross things out, or squeeze corrections into margins. Do your best with all of these. Given page images of a student's answer sheet (labelled "--- PAGE n ---", 0-indexed) and a reference list of question numbers, identify every distinct answer block written by the student, in the order they appear on the pages (which may be out of order relative to the question paper).

Matching rules (try in this order):
1. LABEL MATCH: look for a label the student wrote (e.g. "Q11(a)", "11 a)", "Ans 3", "3)"). If found and it matches an entry in the reference list, set matchedQuestionNumber to that entry's exact format, matchMethod "label", and confidence 0.85-1.0.
2. INFERRED MATCH: if there is no label, but the answer's content clearly matches the subject of one specific unanswered question in the reference list (e.g. it works through the exact calculation or definition that question asks for), AND/OR its position on the page follows logically after an already-matched answer in printed sequence, set matchedQuestionNumber to your best guess, matchMethod "inferred", and a HONEST confidence between 0.3 and 0.7 reflecting how sure you really are. Never report high confidence for a guess.
3. NO MATCH: if you cannot find a label and cannot reasonably infer the question from content or position, set matchedQuestionNumber to null, matchMethod "none", confidence 0.

Other rules:
- If a single answer's handwriting continues across multiple pages (no new question number/topic starts in between), represent it as ONE answer entry with multiple entries in "regions" (one per page it spans).
- "regions[].page" is the 0-indexed page number, "regions[].bbox" is [ymin, xmin, ymax, xmax] normalized 0-1000 tightly bounding that portion of the answer's handwriting on that page (draw it around what is legible even if some words inside aren't).
- "transcribedText" is your best-effort transcription of the handwritten answer (used for grading later), in the student's language. Transcribe everything you can read; for genuinely illegible words use "[illegible]" inline rather than guessing content that changes the meaning. Ignore crossed-out/struck-through text in the transcription (the student rejected it) unless nothing else is legible.
- Do not invent answers that are not present. Do not merge two different questions' answers into one entry.
- Output strict JSON matching the schema. No commentary.`,
    parts,
    schema: ANSWERS_SCHEMA,
  });
  return result.answers || [];
}

export async function gradeAnswers(questions, mappedPairs) {
  const payload = mappedPairs.map((pair) => ({
    number: pair.question.number,
    questionText: pair.question.text,
    maxMarks: pair.question.marks ?? null,
    studentAnswer: pair.answer ? pair.answer.transcribedText : null,
  }));
  const parts = [
    {
      text: `Grade the following question/answer pairs. If studentAnswer is null, the question is unanswered (status "unanswered", marksAwarded 0). If maxMarks is null, infer a reasonable maxMarks (default 5) and grade proportionally. Data:\n${JSON.stringify(
        payload,
        null,
        2
      )}`,
    },
  ];
  const result = await generateJson({
    systemInstruction: `You are a fair, encouraging exam grader. For each question/answer pair, assess correctness of the student's answer against the question, award marks out of maxMarks, and give brief constructive feedback (1-2 sentences). Status must be one of: correct, partial, incorrect, unanswered. Also provide a short overall feedback summary across all questions (2-4 sentences, encouraging tone, mention strengths and areas to improve). Output strict JSON matching the schema. No commentary.`,
    parts,
    schema: GRADING_SCHEMA,
  });
  return result;
}
