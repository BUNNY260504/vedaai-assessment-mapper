import { useNavigate } from "react-router-dom";
import { GraduationCap, ListChecks, Target, Award, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: ListChecks,
    title: "Extract every question",
    desc: "Every question is pulled out in printed order, including labelled sub-parts like 11(a) and 11(b).",
  },
  {
    icon: Target,
    title: "Map & highlight answers",
    desc: "Handwritten answers are matched to the right question — even written out of order — and highlighted exactly where they appear.",
  },
  {
    icon: Award,
    title: "Instant AI grading",
    desc: "Get marks, correctness, and feedback for every question, plus an overall summary in seconds.",
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-14 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-accent-soft border border-accent/30 flex items-center justify-center mb-5">
          <GraduationCap size={28} className="text-accent" />
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
          Grade smarter with <span className="text-accent">AI-powered</span> answer mapping
        </h1>
        <p className="text-muted text-base max-w-xl mb-10">
          VedaAI reads a question paper and a student&apos;s handwritten answer sheet, matches
          every answer to its question, highlights exactly where it was written, and gives you an
          instant AI-graded summary — so you always know what&apos;s answered, what&apos;s
          missing, and where to focus.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 w-full mb-12 text-left">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-2xl p-5">
              <div className="w-9 h-9 rounded-lg bg-accent-soft flex items-center justify-center mb-3">
                <Icon size={18} className="text-accent" />
              </div>
              <p className="font-semibold text-sm mb-1">{title}</p>
              <p className="text-xs text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/upload")}
          className="flex items-center gap-2 rounded-full bg-ink text-white text-sm font-medium px-6 py-3 hover:opacity-90 transition"
        >
          Upload Question Paper &amp; Answer Sheet
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
