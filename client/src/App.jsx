import { Routes, Route, Navigate } from "react-router-dom";
import UploadPage from "./pages/UploadPage.jsx";
import ProcessingPage from "./pages/ProcessingPage.jsx";
import ResultsPage from "./pages/ResultsPage.jsx";
import Shell from "./components/Shell.jsx";

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/exams/:id/processing" element={<ProcessingPage />} />
        <Route path="/exams/:id" element={<ResultsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
