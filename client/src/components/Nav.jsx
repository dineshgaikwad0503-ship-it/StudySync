import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="nav">
      <Link to="/" className="brand">Study<span>Sync</span></Link>
      <nav>
        <Link to="/tutors">Find a tutor</Link>
        {user ? (
          <>
            <Link to="/">My groups</Link>
            <button className="ghost" onClick={() => { logout(); navigate("/login"); }}>
              Log out
            </button>
          </>
        ) : (
          <Link to="/login">Log in</Link>
        )}
      </nav>
    </header>
  );
}
