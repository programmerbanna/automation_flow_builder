"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import FlowEditor from "@/components/flow/FlowEditor";
import { automationApi, Automation } from "@/lib/api";
import Link from "next/link";

export default function EditAutomationPage() {
  const { id } = useParams();
  const [automation, setAutomation] = useState<Automation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAutomation = async () => {
      try {
        setLoading(true);
        const response = await automationApi.getById(id as string);
        setAutomation(response.data.data);
      } catch {
        setError("Failed to load automation. It might have been deleted.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAutomation();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold">Fetching your flow...</p>
      </div>
    );
  }

  if (error || !automation) {
    return (
      <div className="bg-rose-50 border border-rose-200 p-8 rounded-2xl text-rose-700 text-center max-w-lg mx-auto mt-20">
        <p className="font-bold text-lg mb-2">Error</p>
        <p className="mb-6">{error}</p>
        <Link
          href="/automations"
          className="bg-rose-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-rose-700 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/automations"
          className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Edit Automation
        </h2>
      </div>

      <FlowEditor initialData={automation} />
    </div>
  );
}
