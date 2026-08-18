const BASE="/api";
export async function apiRequest(path,options={}){const r=await fetch(`${BASE}/${path}`,{...options});if(!r.ok)throw Error("Request failed");return r.json()}
