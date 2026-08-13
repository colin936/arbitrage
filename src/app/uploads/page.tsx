import React from "react";
import { supabase } from "@lib/supabaseClient";

const BUCKET = "lease-uploads";

export default async function UploadsPage() {
  const { data, error } = await supabase
    .from("lease_uploads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <section className="card">
        <h2>Recent uploads</h2>
        <p>Error loading uploads: {error.message}</p>
      </section>
    );
  }

  const rows = Array.isArray(data) ? data : [];

  const withUrls = await Promise.all(
    rows.map(async (row: any) => {
      let storage_url = null;
      let extracted_url = null;

      try {
        if (row.storage_path) {
          const { data: s, error: su } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(row.storage_path, 60 * 60);
          if (!su && s) storage_url = s.signedUrl || null;
        }
      } catch (e) {
        console.warn("signed storage url error", e);
      }

      try {
        if (row.extracted_path) {
          const { data: x, error: xe } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(row.extracted_path, 60 * 60);
          if (!xe && x) extracted_url = x.signedUrl || null;
        }
      } catch (e) {
        console.warn("signed extracted url error", e);
      }

      return { ...row, storage_url, extracted_url };
    })
  );

  return (
    <section className="card">
      <h2>Recent uploads</h2>
      {withUrls.length === 0 && <p>No uploads yet.</p>}
      {withUrls.map((row: any) => (
        <div key={row.id} className="upload-row">
          <h3>{row.file_name} — {row.lease_type}</h3>
          <div>
            <strong>Status:</strong> {row.status || "unknown"} — <strong>Count:</strong> {row.extracted_count ?? 0}
          </div>
          <div style={{ marginTop: 8 }}>
            {row.storage_url ? (
              <a href={row.storage_url} target="_blank" rel="noreferrer">Download file</a>
            ) : (
              <span>{row.storage_path || "no storage path"}</span>
            )}
            {' '}
            {row.extracted_url ? (
              <a href={row.extracted_url} target="_blank" rel="noreferrer">Download extracted JSON</a>
            ) : null}
          </div>

          <div style={{ marginTop: 12 }}>
            <details>
              <summary>Extracted JSON preview</summary>
              <pre style={{ whiteSpace: "pre-wrap", maxHeight: 400, overflow: "auto" }}>{JSON.stringify(row.extracted_data ?? row.extracted, null, 2)}</pre>
            </details>
          </div>

        </div>
      ))}
    </section>
  );
}
