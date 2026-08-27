# VedaAI — AI Assessment Extraction & Answer Mapping

A web app for teachers to upload a question paper and a student's handwritten answer sheet, automatically extract questions and answers, map answers to questions, highlight the exact answer region on the sheet, and grade the results with AI feedback.

## Live URL / Repo

- Live URL: _add after deployment_
- GitHub repo: _add after pushing_

## Approach

**Core flow:** Upload → Rasterize → Extract (Gemini) → Map → Grade → Review

1. **Upload** — Teacher uploads a question paper and an answer sheet (PDF and/or images). Files are held entirely in-memory server-side (no disk persistence, no database), keyed by a generated exam id.
2. **Rasterize** — Every uploaded PDF page is rendered to a PNG at ~144 DPI (`pdfjs-dist` + `@napi-rs/canvas`, no native build step required). Plain images are used as-is. This gives every page a stable pixel width/height, which is what the highlight overlay is positioned against later.
3. **Extract questions** — All question paper page images are sent to Gemini in one call. The model returns every question in printed order, with labelled sub-parts (e.g. `11(a)`, `11(b)`) as separate entries, original numbering preserved, plus a normalized bounding box and marks if printed.
4. **Extract answers** — All answer sheet page images are sent to Gemini together with the question list (for matching context only). The model returns every distinct handwritten answer block, the question number it believes it answers (or `null` if it can't be matched), a bounding box per page the answer appears on (so a single answer can span multiple pages), and a transcription used later for grading.
5. **Map** — The server matches answers to questions purely by normalized question number, independent of the order either paper is written or read in. Questions with no matching answer are `unanswered`; answers that don't match any known question number are kept in a separate `unmatchedAnswers` list rather than being dropped or force-matched.
6. **Grade** — Question/answer text pairs are sent to Gemini once more for correctness, marks out of the printed (or inferred) max, per-question feedback, and a short overall summary.
7. **Review UI** — Left pane lists questions in original order with status/grade badges; right pane renders the answer sheet page image(s) for the selected question with an overlay box drawn at the extracted bounding box. Clicking a question (or an unmatched answer) updates the highlighted region. Unanswered questions show an explicit empty state instead of a highlight.

## Tech stack

- **Backend:** Node.js, Express, Multer (in-memory uploads), `pdfjs-dist` + `@napi-rs/canvas` (PDF→PNG rasterization, no native compile step so it deploys cleanly), `@google/genai` (Gemini SDK). No database — an in-memory `Map` holds exam state for the life of the process, matching the assignment's "no database required" constraint.
- **Frontend:** React (Vite), React Router, Tailwind CSS, Axios. Built as static assets and served by the same Express process in production (single deployable service, no CORS/two-service coordination needed).

## AI model used

Google **Gemini** (`gemini-3.6-flash` by default, configurable via `GEMINI_MODEL`), via the `@google/genai` SDK, used for three structured JSON calls per exam: question extraction, answer extraction, and grading. Bounding boxes are requested in Gemini's native `[ymin, xmin, ymax, xmax]` normalized-0–1000 spatial format and converted to CSS percentages client-side to draw the highlight — no separate OCR/CV bounding-box library is needed.

## Running locally

```bash
# Backend
cd server
cp .env.example .env   # fill in GEMINI_API_KEY
npm install
npm start               # http://localhost:4000

# Frontend (separate terminal)
cd client
npm install
npm run dev              # http://localhost:5173, proxies /api to :4000
```

For a single-process production build:

```bash
cd client && npm install && npm run build
cd ../server && npm install && npm start   # serves client/dist + API on one port
```

## Assumptions & limitations

- **In-memory storage only:** exam data (including page images) lives in the Node process's memory and is cleared on restart, and auto-expired after 2 hours. This matches the assignment's "no database required" note but means the service isn't horizontally scalable as-is and a restart loses in-flight exams.
- **Single student per run:** the flow is scoped to one question paper + one answer sheet at a time, per the assignment brief (no batch/roster handling).
- **Answer matching is number-based only:** the model reads the question number the student wrote next to their answer; if a student writes no number and no legible cue at all, that answer will land in "unmatched" rather than being guessed into place — this is intentional (matches the "answers that don't match any question" requirement) rather than a bug.
- **Grading is AI-generated and advisory:** marks/feedback are produced by the same LLM and are meant as a fast first pass for the teacher, not an authoritative grade.
- **Bounding box precision** depends on Gemini's spatial grounding for the given scan quality/handwriting; very dense or overlapping handwriting can produce a slightly loose box.
- **Free-tier rate limits** apply to the Gemini API key used; very large multi-page uploads may hit per-minute quota on the free tier.
