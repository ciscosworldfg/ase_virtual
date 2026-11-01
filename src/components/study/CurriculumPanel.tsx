import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { courses } from "@/lib/learning/curriculum";

const STORAGE_KEY = "aise-virtual-curriculum-progress-v1";

function readCompleted(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function CurriculumPanel() {
  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [lessonIndex, setLessonIndex] = useState(0);
  const [completed, setCompleted] = useState<string[]>(readCompleted);
  const [showAnswer, setShowAnswer] = useState(false);

  const filtered = useMemo(
    () => courses.filter((course) => `${course.id} ${course.title} ${course.level}`.toLowerCase().includes(search.toLowerCase())),
    [search],
  );
  const course = courses.find((item) => item.id === courseId) ?? courses[0];
  const lesson = course?.lessons[lessonIndex];
  const key = course ? `${course.id}:${lessonIndex}` : "";
  const done = completed.includes(key);
  const totalLessons = courses.reduce((sum, item) => sum + item.lessons.length, 0);

  function markComplete() {
    if (!key || done) return;
    setCompleted((previous) => {
      const next = [...previous, key];
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Local storage is optional. */ }
      return next;
    });
  }

  function chooseCourse(id: string) {
    setCourseId(id);
    setLessonIndex(0);
    setShowAnswer(false);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-tech text-signal">A1–A8 · Structured learning</p>
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide">Course curriculum</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">15 course-level pathways with instructor explanations, practical activities, knowledge checks and local lesson tracking.</p>
        </div>
        <div className="panel-instrument px-4 py-3">
          <div className="readout text-xl text-primary">{completed.length}/{totalLessons}</div>
          <div className="label-tech">Lessons completed</div>
        </div>
      </div>

      <label className="flex items-center gap-2 rounded-sm border border-border bg-panel px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input className="min-w-0 flex-1 bg-transparent text-sm outline-none" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a course, system or level…" />
        <span className="label-tech">{filtered.length} PATHWAYS</span>
      </label>

      <div className="grid gap-4 lg:grid-cols-[minmax(15rem,0.8fr)_minmax(0,1.5fr)]">
        <aside className="space-y-2">
          {filtered.map((item) => {
            const count = item.lessons.filter((_, index) => completed.includes(`${item.id}:${index}`)).length;
            return (
              <button key={item.id} onClick={() => chooseCourse(item.id)} className={`w-full rounded-sm border p-3 text-left transition-colors ${course?.id === item.id ? "border-primary bg-accent" : "border-border bg-panel hover:bg-accent"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="label-tech text-signal">{item.id.split("-")[0]}</span>
                  <span className="label-tech">{item.level}</span>
                </div>
                <div className="mt-1 text-sm font-semibold">{item.title.replace(`${item.id.split("-")[0]} · `, "")}</div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{count}/{item.lessons.length} lessons</span>
                  <span>{Math.round((count / item.lessons.length) * 100)}%</span>
                </div>
                <div className="mt-1 h-1 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(count / item.lessons.length) * 100}%` }} /></div>
              </button>
            );
          })}
          {filtered.length === 0 && <p className="rounded-sm border border-border p-4 text-sm text-muted-foreground">No matching course pathways.</p>}
        </aside>

        {course && lesson ? (
          <article className="panel-instrument min-w-0 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="label-tech text-signal">{course.id.split("-")[0]} · {course.level}</span>
              <span className="label-tech">LESSON {lessonIndex + 1} OF {course.lessons.length}</span>
            </div>
            <h3 className="mt-2 font-display text-2xl font-bold uppercase">{lesson.title}</h3>
            <div className="mt-5 rounded-sm border border-border bg-panel p-4">
              <p className="label-tech text-signal">Learning objective</p>
              <p className="mt-2 text-sm">{lesson.objective}</p>
            </div>
            <div className="mt-4">
              <p className="label-tech text-signal">Instructor walkthrough</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{lesson.explanation}</p>
            </div>
            <div className="mt-4 rounded-sm border border-border bg-panel p-4">
              <p className="label-tech text-signal">Practical activity</p>
              <p className="mt-2 text-sm">{lesson.activity}</p>
              {lesson.challenge && <p className="mt-2 text-xs text-muted-foreground">Competency challenge: {lesson.challenge}</p>}
            </div>
            <div className="mt-4 rounded-sm border border-primary/40 p-4">
              <p className="label-tech text-signal">Knowledge check</p>
              <p className="mt-2 text-sm font-semibold">{lesson.check}</p>
              {showAnswer ? <p className="mt-3 rounded-sm bg-panel p-3 text-sm text-muted-foreground">{lesson.answer}</p> : <button onClick={() => setShowAnswer(true)} className="mt-3 rounded-sm border border-border px-3 py-2 text-xs font-semibold hover:bg-accent">Reveal instructor answer</button>}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button disabled={lessonIndex === 0} onClick={() => { setLessonIndex((value) => Math.max(0, value - 1)); setShowAnswer(false); }} className="inline-flex items-center gap-1 rounded-sm border border-border px-3 py-2 text-xs disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Previous</button>
                <button disabled={lessonIndex >= course.lessons.length - 1} onClick={() => { setLessonIndex((value) => Math.min(course.lessons.length - 1, value + 1)); setShowAnswer(false); }} className="inline-flex items-center gap-1 rounded-sm border border-border px-3 py-2 text-xs disabled:opacity-40">Next <ChevronRight className="h-4 w-4" /></button>
              </div>
              <button onClick={markComplete} disabled={done} className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-60">
                <CheckCircle2 className="h-4 w-4" /> {done ? "Lesson completed" : "Mark lesson complete"}
              </button>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><BookOpen className="h-4 w-4" /> Progress is stored locally in this browser. Cross-device account sync is not enabled by this module.</p>
          </article>
        ) : (
          <div className="panel-instrument p-8 text-sm text-muted-foreground">Choose a course pathway to begin.</div>
        )}
      </div>
    </section>
  );
}
