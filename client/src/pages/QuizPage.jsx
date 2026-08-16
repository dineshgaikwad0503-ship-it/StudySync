import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { getSocket } from "../lib/socket.js";
import Leaderboard from "../components/Leaderboard.jsx";

export default function QuizPage() {
  const { groupId, quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [error, setError] = useState("");
  const socket = getSocket();

  useEffect(() => {
    api(`/quizzes/play/${quizId}`).then(setQuiz).catch((e) => setError(e.message));
  }, [quizId]);

  if (error) return <div className="center"><p className="error">{error}</p></div>;
  if (!quiz) return <div className="center muted">Loading quiz…</div>;

  const q = quiz.questions[index];
  const last = index === quiz.questions.length - 1;

  async function submit() {
    const list = quiz.questions.map((_, i) => answers[i] ?? -1);
    const res = await api(`/quizzes/play/${quizId}/submit`, { method: "POST", body: { answers: list } });
    setResult(res);
    socket.emit("quiz:finished", { groupId, quizId });
  }

  if (result) {
    return (
      <main className="page">
        <h1>{quiz.title}</h1>
        <p className="score">You scored {result.correct} / {result.total} · {result.correct * 10} points</p>
        <ul className="review">
          {result.review.map((r, i) => (
            <li key={i} className={r.ok ? "ok" : "bad"}>
              <strong>{r.prompt}</strong>
              <span>{r.ok ? "Correct" : `Correct answer: option ${r.correctIndex + 1}`}</span>
              {r.explanation && <em className="muted">{r.explanation}</em>}
            </li>
          ))}
        </ul>
        <Leaderboard groupId={groupId} socket={socket} />
        <Link className="btn" to={`/groups/${groupId}`}>Back to group</Link>
      </main>
    );
  }

  return (
    <main className="page narrow">
      <h1>{quiz.title}</h1>
      <p className="muted">Question {index + 1} of {quiz.questions.length}</p>

      <div className={`flashcard${flipped ? " flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
        <p>{q.prompt}</p>
      </div>

      <div className="options">
        {q.options.map((opt, i) => (
          <button key={i}
            className={`option${answers[index] === i ? " on" : ""}`}
            onClick={() => setAnswers({ ...answers, [index]: i })}>
            {opt}
          </button>
        ))}
      </div>

      <div className="row between">
        <button className="ghost" disabled={index === 0} onClick={() => { setIndex(index - 1); setFlipped(false); }}>
          Previous
        </button>
        {last ? (
          <button onClick={submit}>Submit quiz</button>
        ) : (
          <button onClick={() => {
            setIndex(index + 1); setFlipped(false);
            socket.emit("quiz:progress", { groupId, quizId, index: index + 1 });
          }}>Next</button>
        )}
      </div>
    </main>
  );
}
