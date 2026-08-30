# VedaAI — AI Assessment Extraction & Answer Mapping

A web app for teachers to upload a question paper and a student's handwritten answer sheet. VedaAI extracts every question, transcribes and matches every handwritten answer back to its question (even out of order or unlabeled), highlights the exact region on the scanned sheet where each answer was written, grades each answer with AI feedback, and lets teachers save graded results to a personal library for later review.

## Live URL / Repo

- Live URL: [vedaai-assessment-mapper-production.up.railway.app](https://vedaai-assessment-mapper-production.up.railway.app)
- GitHub repo: [BUNNY260504/vedaai-assessment-mapper](https://github.com/BUNNY260504/vedaai-assessment-mapper)

## Features

**Upload & extraction**
- Drag-and-drop upload of a question paper and answer sheet, each accepting PDF or image files, multi-page or multi-file
- Async processing with a live status page (extracting → mapping → grading) and clear error states with retry
- Question numbering and labelled sub-parts (`11(a)`, `11(b)`) preserved in original printed order, even across pages

**Question review**
- Left panel lists every extracted question with a status pill (Correct / Partial / Incorrect / Unanswered / Answered, with marks), and an amber "Verify" badge on any answer the AI had to infer rather than match by an explicit label
- Per-question AI feedback, expandable individually or all at once ("Expand all")
- Draggable resize handle between the question list and the answer sheet (min 300px, capped at 70% of the available width) so either pane can be given more room
- "Unmatched Answers" section for handwritten content that couldn't be confidently tied to any question, instead of being force-matched or silently dropped

**Answer sheet viewer**
- Continuous multi-page scroll with an auto-syncing "Page X of Y" indicator and prev/next navigation
- Zoom control
- Selecting a question scrolls to and highlights the exact answer region, color-coded by grading outcome (green/amber/red)
- An explicit "not answered by the student" state instead of a blank or broken highlight when a question has no matching answer

**My Library**
- Save a graded exam with the student's name via a header Save button (guarded on the back button too, so leaving an unsaved result prompts a save first)
- Saving navigates straight to My Library to confirm the save, and lights up a notification bell (with a hover tooltip) that also links back to the library
- Library list persists client-side (localStorage) since there's no database

**Responsive design**
- Full mobile layout: collapsible nav drawer, a Questions/Answer Sheet pill tab switcher in place of the two-pane desktop layout, sidebar collapse-to-icons on desktop with the expand control anchored at the bottom of the rail

## Approach

**Core flow:** Upload → Rasterize → Extract (Gemini) → Map → Grade → Review

1. **Upload** — Teacher uploads a question paper and an answer sheet (PDF and/or images). Files are held entirely in-memory server-side (no disk persistence, no database), keyed by a generated exam id.
2. **Rasterize** — Every uploaded PDF page is rendered to a PNG at ~144 DPI (`pdfjs-dist` + `@napi-rs/canvas`, no native build step required). Plain images are used as-is. This gives every page a stable pixel width/height, which is what the highlight overlay is positioned against later.
3. **Extract questions** — All question paper page images are sent to Gemini in one call. The model returns every question in printed order, with labelled sub-parts (e.g. `11(a)`, `11(b)`) as separate entries, original numbering preserved, plus a normalized bounding box and marks if printed.
4. **Extract answers** — All answer sheet page images are sent to Gemini together with the question list (for matching context only). The model returns every distinct handwritten answer block, the question number it believes it answers (or `null` if it can't be matched), a bounding box per page the answer appears on (so a single answer can span multiple pages), and a transcription used later for grading. Matching happens in three tiers — an explicit label the student wrote (high confidence), an inferred guess from content/position (flagged for review), or no match at all — so uncertain matches are surfaced to the teacher rather than hidden.
5. **Map** — The server matches answers to questions purely by normalized question number, independent of the order either paper is written or read in. Questions with no matching answer are `unanswered`; answers that don't match any known question number are kept in a separate `unmatchedAnswers` list rather than being dropped or force-matched.
6. **Grade** — Question/answer text pairs are sent to Gemini once more for correctness, marks out of the printed (or inferred) max, per-question feedback, and a short overall summary.
7. **Review UI** — Left pane lists questions in original order with status/grade badges; right pane renders the answer sheet page image(s) for the selected question with an overlay box drawn at the extracted bounding box. Clicking a question (or an unmatched answer) scrolls to and highlights the matching region. Unanswered questions show an explicit empty state instead of a highlight.

## Tech stack

- **Backend:** Node.js, Express, Multer (in-memory uploads), `pdfjs-dist` + `@napi-rs/canvas` (PDF→PNG rasterization, no native compile step so it deploys cleanly), `@google/genai` (Gemini SDK). No database — an in-memory `Map` holds exam state for the life of the process, matching the assignment's "no database required" constraint.
- **Frontend:** React 19 (Vite), React Router, Tailwind CSS v4, Axios, lucide-react icons. Built as static assets and served by the same Express process in production (single deployable service, no CORS/two-service coordination needed).

## AI model used

Google **Gemini** (`gemini-3.6-flash` by default, configurable via `GEMINI_MODEL`), via the `@google/genai` SDK, used for three structured JSON calls per exam: question extraction, answer extraction, and grading. Bounding boxes are requested in Gemini's native `[ymin, xmin, ymax, xmax]` normalized-0–1000 spatial format and converted to CSS percentages client-side to draw the highlight — no separate OCR/CV bounding-box library is needed.

## Project structure

```
client/src/
  pages/          HomePage, UploadPage, ProcessingPage, ResultsPage, LibraryPage
  components/      Shell (nav/header), QuestionListItem, AnswerSheetViewer,
                    PageWithHighlight, PageSlider, ZoomControl, SummaryBar,
                    SaveToLibraryModal, FileDropSlot
  lib/             api.js (backend client), library.js (localStorage My Library),
                    PageActionsContext.jsx (lets a page inject header actions/guards)

server/src/
  routes/exam.js              upload, status, result, page-image endpoints
  services/rasterize.js       PDF/image → PNG pages
  services/gemini.js          extractQuestions / extractAnswers / gradeAnswers
  services/mapping.js         answer-to-question matching by number
  services/store.js           in-memory exam store with TTL cleanup
```

## Running locally

```bash
# Backend
cd server
cp .env.example .env   # fill in GEMINI_API_KEY
npm install
npm run dev              # http://localhost:4000 (auto-restarts on change)

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

## Deployment

Deployed on **Railway** via `railway.json` at the repo root, which builds the client, installs server dependencies, and starts the Express server (which serves the built client alongside the API on one port — no database or second service required). A minimal root `package.json` exists purely so Railway's Nixpacks builder detects this as a Node project and provisions a Node runtime, since the real `package.json` files live in `client/` and `server/`. Set `GEMINI_API_KEY` and `GEMINI_MODEL` in the service's Variables tab, and generate a public domain under Settings → Networking.

`render.yaml` is also present for deploying to Render instead, using the same build/start commands as a Blueprint.

## Assumptions & limitations

- **In-memory storage only:** exam data (including page images) lives in the Node process's memory and is cleared on restart, and auto-expired after 2 hours. This matches the assignment's "no database required" note but means the service isn't horizontally scalable as-is and a restart loses in-flight exams.
- **My Library is a client-side bookmark list, not a data store:** saved entries live in the browser's `localStorage` (name, summary, exam id) and link back to the full result by id — once that exam expires from the server's in-memory store (2 hours, or any server restart), the saved entry becomes a dead link rather than a durable record.
- **Single student per run:** the flow is scoped to one question paper + one answer sheet at a time, per the assignment brief (no batch/roster handling).
- **Answer matching is number-based only:** the model reads the question number the student wrote next to their answer; if a student writes no number and no legible cue at all, that answer will land in "unmatched" rather than being guessed into place — this is intentional (matches the "answers that don't match any question" requirement) rather than a bug.
- **Grading is AI-generated and advisory:** marks/feedback are produced by the same LLM and are meant as a fast first pass for the teacher, not an authoritative grade.
- **Bounding box precision** depends on Gemini's spatial grounding for the given scan quality/handwriting; very dense or overlapping handwriting can produce a slightly loose box.
- **Gemini API quota/cost:** a free-tier API key is capped at a small number of requests per day; each exam costs 3 Gemini calls (~$0.01–0.04 total on the paid tier depending on page count). Enabling billing on the Google Cloud project removes the daily cap.
