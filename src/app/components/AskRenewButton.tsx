"use client";
import React, { useState } from "react";

export default function AskRenewButton({ clientName, address, endDate }: { clientName: string; address: string; endDate: string; }) {
  const [status, setStatus] = useState("idle");

  const handleAsk = async () => {
    const message = `Hi ${clientName},\n\nThis is a quick question: would you like to renew the lease for ${address} which ends on ${endDate}?\n\nPlease reply yes/no and preferred term.`;
    try {
      await navigator.clipboard.writeText(message);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <button type="button" className="btn small" onClick={handleAsk}>
      {status === "copied" ? "Copied" : status === "error" ? "Error" : "Ask now"}
    </button>
  );
}
