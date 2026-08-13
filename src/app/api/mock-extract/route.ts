import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // body.file_base64 is provided but we won't parse it in the mock.

    // Return a canned invoice-like extraction for demo purposes.
    const extracted = [
      {
        invoice_number: "INV-2026-0001",
        vendor: "Acme Supplies",
        date: "2026-08-01",
        due_date: "2026-08-31",
        total: 1250.5,
        currency: "USD",
        line_items: [
          { description: "Cleaning services", qty: 1, unit: 1000, amount: 1000 },
          { description: "Supplies", qty: 5, unit: 50.1, amount: 250.5 }
        ]
      }
    ];

    return NextResponse.json(extracted);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
