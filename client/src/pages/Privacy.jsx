import React from 'react';
export default function Privacy() {
 return <section className="page-shell"><div className="container py-5">
  <span className="text-primary fw-semibold">StudySync</span>
  <h1 className="display-6 fw-bold">Privacy</h1>
  <p className="text-muted">StudySync privacy experience.</p>
  <div className="row g-4 mt-2">
   <div className="col-lg-8"><div className="card border-0 shadow-sm p-4">
    <h3>Privacy workspace</h3><p>Collaborative learning tools, resources, activity and progress data appear here.</p>
    <div className="row g-3"><div className="col-md-4"><div className="stat-card"><b>128</b><span>learners</span></div></div>
    <div className="col-md-4"><div className="stat-card"><b>42</b><span>resources</span></div></div>
    <div className="col-md-4"><div className="stat-card"><b>89%</b><span>progress</span></div></div></div>
   </div></div>
   <div className="col-lg-4"><div className="card border-0 shadow-sm p-4"><h5>Quick actions</h5>
    <button className="btn btn-primary w-100 mb-2">Open Study Room</button>
    <button className="btn btn-outline-primary w-100 mb-2">View Resources</button>
    <button className="btn btn-outline-dark w-100">Create Quiz</button>
   </div></div>
  </div>
 </div></section>
}
