import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export async function uploadExam({ questionFiles, answerFiles }, onProgress) {
  const form = new FormData();
  questionFiles.forEach((f) => form.append("questionPaper", f));
  answerFiles.forEach((f) => form.append("answerSheet", f));
  const res = await api.post("/exams", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
    },
  });
  return res.data; // { id }
}

export async function getExamStatus(id) {
  const res = await api.get(`/exams/${id}/status`);
  return res.data;
}

export async function getExamResult(id) {
  const res = await api.get(`/exams/${id}/result`);
  return res.data;
}

export function pageImageUrl(examId, side, index) {
  return `/api/exams/${examId}/pages/${side}/${index}`;
}
