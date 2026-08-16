import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";

const blank = () => ({ prompt: "", options: ["", "", "", ""], correctIndex: 0 });

export default function QuizBuilder({ groupId }) {
  const [quizzes, setQuizzes] = useState([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([blank()]);
  const [error, setError] = useState("");

  const load = () => api(`/quizzes/${groupId}`).then(setQuizzes).catch(() => {});
  useEffect(() => { load(); }, [groupId]);

  function update(i, patch) {
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }

  async function save(e) {
    e.preventDefault();
    try {
      await api(`/quizzes/${groupId}`, { method: "POST", body: { title, mode: "mcq", questions } });
      setTitle(""); setQuestions([blank()]); setOpen(false); load();
    } catch (err) { setError(err.message); }
  }

  return (
    <section className="card">
      <div className="row between">
        <h3>Quizzes & flashcards</h3>
        <button className="secondary" onClick={() => setOpen(!open)}>
          {open ? "Cancel" : "New quiz"}
        </button>
      </div>

      {open && (
        <form className="quiz-form" onSubmit={save}>
          <input placeholder="Quiz title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          {questions.map((q, i) => (
            <div className="qblock" key={i}>
              <input placeholder={`Question ${i + 1}`} value={q.prompt}
                onChange={(e) => update(i, { prompt: e.target.value })} required />
              <div className="grid two">
                {q.options.map((opt, oi) => (
                  <label key={oi} className="opt">
                    <input type="radio" name={`c${i}`} checked={q.correctIndex === oi}
                      onChange={() => update(i, { correctIndex: oi })} />
                    <input placeholder={`Option ${oi + 1}`} value={opt}
                      onChange={(e) => update(i, {
                        options: q.options.map((o, x) => (x === oi ? e.target.value : o)),
                      })} required />
                  </label>
                ))}
              </div>
            </div>
          ))}
          {error && <p className="error">{error}</p>}
          <div className="row">
            <button type="button" className="ghost" onClick={() => setQuestions([...questions, blank()])}>
              + Add question
            </button>
            <button>Save quiz</button>
          </div>
        </form>
      )}

      {quizzes.length === 0 ? (
        <p className="muted">No quizzes yet.</p>
      ) : (
        <ul className="files">
          {quizzes.map((q) => (
            <li key={q._id}>
              <Link to={`/groups/${groupId}/quiz/${q._id}`}>{q.title}</Link>
              <span className="muted small">{q.questions.length} questions · by {q.createdBy?.name}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
