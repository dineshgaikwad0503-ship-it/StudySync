import { useEffect, useRef, useState } from "react";
import { api, fileUrl } from "../lib/api.js";

/** Group-private resource repository backed by S3 (presigned downloads). */
export default function FileDrive({ groupId }) {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const load = () => api(`/resources/${groupId}`).then(setFiles).catch((e) => setError(e.message));
  useEffect(() => { load(); }, [groupId]);

  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      await api(`/resources/${groupId}`, { method: "POST", form });
      inputRef.current.value = "";
      load();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  async function open(id) {
    const { url } = await api(`/resources/file/${id}`);
    window.open(fileUrl(url), "_blank", "noopener");
  }

  async function remove(id) {
    await api(`/resources/file/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <section className="card">
      <div className="row between">
        <h3>Resource hub</h3>
        <label className="btn secondary">
          {busy ? "Uploading…" : "Upload PDF / image"}
          <input ref={inputRef} type="file" hidden onChange={upload}
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt" />
        </label>
      </div>
      {error && <p className="error">{error}</p>}
      {files.length === 0 ? (
        <p className="muted">No shared files yet.</p>
      ) : (
        <ul className="files">
          {files.map((f) => (
            <li key={f._id}>
              <button className="link" onClick={() => open(f._id)}>{f.filename}</button>
              <span className="muted small">
                {(f.size / 1024).toFixed(0)} KB · {f.uploadedBy?.name}
              </span>
              <button className="ghost small" onClick={() => remove(f._id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
