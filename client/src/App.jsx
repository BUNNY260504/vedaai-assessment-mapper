import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import ProcessingPage from "./pages/ProcessingPage.jsx";
import ResultsPage from "./pages/ResultsPage.jsx";
import LibraryPage from "./pages/LibraryPage.jsx";
import Shell from "./components/Shell.jsx";
import { PageActionsProvider } from "./lib/PageActionsContext.jsx";

export default function App() {
  return (
    <PageActionsProvider>
      <Shell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/exams/:id/processing" element={<ProcessingPage />} />
          <Route path="/exams/:id" element={<ResultsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
    </PageActionsProvider>
  );
}
