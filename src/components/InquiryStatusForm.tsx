"use client";

import { useState } from "react";

const STATUS_LABEL: Record<string, string> = {
  NEW: "Nouvelle",
  CONTACTED: "Contactée",
  CLOSED: "Clôturée",
};

export function InquiryStatusForm({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value }),
    });
    setSaving(false);
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="rounded-lg border border-[#e5e5e5] px-2 py-1 text-xs"
      >
        {Object.entries(STATUS_LABEL).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={save}
        disabled={saving || value === status}
        className="rounded-lg bg-[#f47b00] px-2 py-1 text-xs font-semibold text-white disabled:opacity-40"
      >
        {saving ? "…" : "OK"}
      </button>
    </div>
  );
}
