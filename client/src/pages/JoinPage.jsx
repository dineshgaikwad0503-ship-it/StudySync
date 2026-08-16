import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";

export default function JoinPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/groups/join/${code}`, { method: "POST" })
      .then((g) => navigate(`/groups/${g._id}`, { replace: true }))
      .catch((e) => setError(e.message));
  }, [code, navigate]);

  return <div className="center">{error ? <p className="error">{error}</p> : <p className="muted">Joining group…</p>}</div>;
}
