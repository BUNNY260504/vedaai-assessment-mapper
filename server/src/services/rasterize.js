import { createRequire } from "module";
import path from "path";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const require = createRequire(import.meta.url);
const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve(
  "pdfjs-dist/legacy/build/pdf.worker.mjs"
);

// Needed so pdf.js can substitute glyphs for PDFs that reference the standard
// 14 fonts without embedding them (common for PDFs not exported from a word processor).
// pdf.js's Node fetch path reads this as a plain filesystem path (not a file:// URL).
const STANDARD_FONT_DATA_URL =
  path.join(path.dirname(require.resolve("pdfjs-dist/package.json")), "standard_fonts") + "/";

const RENDER_SCALE = 2.0; // ~144 DPI, good balance of legibility vs payload size

class NodeCanvasFactory {
  create(width, height) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");
    return { canvas, context };
  }
  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }
  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

async function rasterizePdf(buffer) {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    canvasFactory: new NodeCanvasFactory(),
    disableFontFace: true,
    isEvalSupported: false,
    standardFontDataUrl: STANDARD_FONT_DATA_URL,
  });
  const pdf = await loadingTask.promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: RENDER_SCALE });
    const factory = new NodeCanvasFactory();
    const canvasAndContext = factory.create(viewport.width, viewport.height);
    await page.render({
      canvasContext: canvasAndContext.context,
      viewport,
      canvasFactory: factory,
    }).promise;
    const pngBuffer = canvasAndContext.canvas.toBuffer("image/png");
    pages.push({
      width: Math.round(viewport.width),
      height: Math.round(viewport.height),
      buffer: pngBuffer,
      mime: "image/png",
    });
    factory.destroy(canvasAndContext);
  }
  return pages;
}

async function rasterizeImage(buffer, mime) {
  const img = await loadImage(buffer);
  return [
    {
      width: img.width,
      height: img.height,
      buffer,
      mime: mime || "image/png",
    },
  ];
}

export async function rasterizeFile(file) {
  if (file.mimetype === "application/pdf") {
    return rasterizePdf(file.buffer);
  }
  if (file.mimetype.startsWith("image/")) {
    return rasterizeImage(file.buffer, file.mimetype);
  }
  throw new Error(`Unsupported file type: ${file.mimetype}`);
}
