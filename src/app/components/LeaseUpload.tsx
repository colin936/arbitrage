"use client";

import { useState } from "react";

export default function LeaseUpload() {
  const [ownerFile, setOwnerFile] = useState<File | null>(null);
  const [customerFile, setCustomerFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [extracted, setExtracted] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleOwnerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOwnerFile(event.target.files?.[0] ?? null);
    setMessage("");
  };

  const handleCustomerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerFile(event.target.files?.[0] ?? null);
    setMessage("");
  };

  const uploadFile = async (file: File, leaseType: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("leaseType", leaseType);

    setIsUploading(true);
    setMessage("Uploading file...");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Upload failed");
      }

      setMessage(`Upload succeeded: ${result.path || file.name}`);
      setExtracted(result.extracted_data ?? null);
    } catch (error: any) {
      setMessage(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const saveDraft = async (draftData: any) => {
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch("/api/leases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftData)
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Save failed");
      setSaveResult({ ok: true, data: json.data });
    } catch (err: any) {
      setSaveResult({ ok: false, error: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card upload-card">
      <div className="section-heading">
        <div>
          <h2>Upload new lease file</h2>
          <p className="section-description">
            Add new owner or customer lease documents to the system here.
          </p>
        </div>
      </div>

      <div className="upload-grid">
        <div className="upload-section">
          <label className="file-label">Owner lease file</label>
          <input type="file" accept=".csv,.xlsx,.xls,.pdf" onChange={handleOwnerChange} />
          {ownerFile && <p className="file-name">Selected: {ownerFile.name}</p>}
          <button
            type="button"
            className="primary-button"
            disabled={!ownerFile || isUploading}
            onClick={() => ownerFile && uploadFile(ownerFile, "owner")}
          >
            Upload owner lease
          </button>
        </div>

        <div className="upload-section">
          <label className="file-label">Customer lease file</label>
          <input type="file" accept=".csv,.xlsx,.xls,.pdf" onChange={handleCustomerChange} />
          {customerFile && <p className="file-name">Selected: {customerFile.name}</p>}
          <button
            type="button"
            className="primary-button"
            disabled={!customerFile || isUploading}
            onClick={() => customerFile && uploadFile(customerFile, "customer")}
          >
            Upload customer lease
          </button>
        </div>
      </div>

      {message && <p className="upload-message">{message}</p>}
      {extracted && (
        <div className="extracted-preview">
          <h3>Extracted data</h3>
          <pre style={{ whiteSpace: "pre-wrap", maxHeight: 300, overflow: "auto" }}>
            {JSON.stringify(extracted, null, 2)}
          </pre>
          <div style={{ marginTop: 8 }}>
            <button
              className="primary-button"
              disabled={saving}
              onClick={() => {
                // Use first extracted object if array
                const payload = Array.isArray(extracted) ? extracted[0] : extracted;
                saveDraft(payload);
              }}
            >
              {saving ? "Saving..." : "Save as lease draft"}
            </button>
            {saveResult && (
              <div style={{ marginTop: 8 }}>
                {saveResult.ok ? (
                  <span>Saved draft (id: {saveResult.data?.[0]?.id ?? "?"})</span>
                ) : (
                  <span style={{ color: "#c00" }}>Save failed: {saveResult.error}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
