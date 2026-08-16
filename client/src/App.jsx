import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Nav from "./components/Nav.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import GroupPage from "./pages/GroupPage.jsx";
import StudyRoom from "./pages/StudyRoom.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import TutorPage from "./pages/TutorPage.jsx";
import JoinPage from "./pages/JoinPage.jsx";

function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center muted">Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Private><Dashboard /></Private>} />
        <Route path="/join/:code" element={<Private><JoinPage /></Private>} />
        <Route path="/groups/:groupId" element={<Private><GroupPage /></Private>} />
        <Route path="/groups/:groupId/room" element={<Private><StudyRoom /></Private>} />
        <Route path="/groups/:groupId/quiz/:quizId" element={<Private><QuizPage /></Private>} />
        <Route path="/tutors" element={<Marketplace />} />
        <Route path="/tutors/:tutorId" element={<Private><TutorPage /></Private>} />
        <Route path="*" element={<div className="center muted">Page not found</div>} />
      </Routes>
    </>
  );
}
