import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { supabase } from "@lib/supabaseClient";

export const config = {
  api: {
    bodyParser: false
  }
};

function getUploadBucket() {
  return "lease-uploads";
}

async function ensureBucket() {
  const bucket = getUploadBucket();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    throw listError;
  }

  const exists = buckets?.some((item: any) => item.name === bucket);
  if (!exists) {
    const { error: createError } = await supabase.storage.createBucket(bucket, { public: false });
    if (createError) {
      throw createError;
    }
  }
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9_.-]/g, "_");
}

async function parseLeaseFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const lowercaseName = file.name.toLowerCase();

  if (lowercaseName.endsWith(".csv") || file.type.includes("csv")) {
    const text = buffer.toString("utf-8");
    const result = Papa.parse(text, { header: true, skipEmptyLines: true });
    return result.data;
  }

  if (lowercaseName.endsWith(".xlsx") || lowercaseName.endsWith(".xls")) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheet = workbook.SheetNames[0];
    if (!firstSheet) {
      return [];
    }
    return XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { defval: null });
  }

  if (lowercaseName.endsWith(".json") || file.type.includes("json")) {
    const text = buffer.toString("utf-8");
    try {
      return JSON.parse(text);
    } catch {
      return [];
    }
  }

  // PDF extraction: send PDF bytes to a server-side extraction API (configured via env)
  if (lowercaseName.endsWith(".pdf") || file.type.includes("pdf")) {
    try {
      return await extractPdf(buffer);
    } catch (err) {
      console.warn("PDF extraction failed:", err);
      return [];
    }
  }

  return [];
}

async function extractPdf(buffer: Buffer) {
  const apiUrl = process.env.CLAUDE_API_URL || process.env.EXTRACTOR_URL;
  const apiKey = process.env.CLAUDE_API_KEY || process.env.EXTRACTOR_KEY;

  if (!apiUrl || !apiKey) {
    // No extraction service configured; return empty so UI can still store the file.
    console.warn("No PDF extraction service configured (CLAUDE_API_URL / CLAUDE_API_KEY)");
    return [];
  }

  const b64 = buffer.toString("base64");

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        // The extraction service should accept a base64 payload and return JSON
        // in the shape of an array of lease objects, or an object with `extracted`.
        file_base64: b64,
        filename: "upload.pdf",
        prompt: "Extract lease fields (tenant, start_date, end_date, notice_period_days, rent, deposit, property_id, operator_id) and return a JSON array of lease objects."
      })
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn("Extraction service error:", res.status, text);
      return [];
    }

    const json = await res.json();

    if (Array.isArray(json)) return json;
    if (Array.isArray(json.extracted)) return json.extracted;
    if (json.data && Array.isArray(json.data)) return json.data;
    if (typeof json.text === "string") {
      try {
        return JSON.parse(json.text);
      } catch {
        return [{ text: json.text }];
      }
    }

    return [];
  } catch (error) {
    console.warn("Error calling extraction service:", error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");
  const leaseType = formData.get("leaseType");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!leaseType || typeof leaseType !== "string") {
    return NextResponse.json({ error: "No lease type provided" }, { status: 400 });
  }

  try {
    await ensureBucket();
  } catch (error: any) {
    return NextResponse.json({ error: `Failed to ensure storage bucket: ${error.message || error}` }, { status: 500 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const bucketName = getUploadBucket();
  const timestamp = Date.now();
  const sanitized = sanitizeFilename(file.name);
  const filePath = `${leaseType}/${timestamp}-${sanitized}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const extracted = await parseLeaseFile(file);
  const extractedPath = `${leaseType}/${timestamp}-${sanitized}.json`;
  const jsonBuffer = Buffer.from(JSON.stringify(extracted, null, 2), "utf-8");

  const { error: extractedError } = await supabase.storage
    .from(bucketName)
    .upload(extractedPath, jsonBuffer, { contentType: "application/json", upsert: true });

  if (extractedError) {
    return NextResponse.json({ error: extractedError.message }, { status: 500 });
  }

  const metadata = {
    lease_type: leaseType,
    file_name: file.name,
    storage_path: filePath,
    extracted_path: extractedPath,
    status: "processed",
    extracted_count: Array.isArray(extracted) ? extracted.length : 0,
    extracted_data: extracted
  };

  const { error: metaError } = await supabase.from("lease_uploads").insert([metadata]);
  if (metaError) {
    // If the table does not exist, continue and still return success for file storage.
    console.warn("lease_uploads table absent or insert failed", metaError.message);
  }

  return NextResponse.json({
    ...metadata,
    storage_url: `${bucketName}/${filePath}`
  });
}
