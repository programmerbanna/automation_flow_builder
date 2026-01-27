"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { automationApi, Automation } from "@/lib/api";
import AutomationTable from "@/components/AutomationTable";

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const response = await automationApi.getAll();
      setAutomations(response.data.data);
      setError(null);
    } catch (err: unknown) {
      console.error("Error fetching automations:", err);
      setError("Failed to load automations. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Automations</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage and monitor your visual email flows</p>
        </div>
        <Link
          href="/automations/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          + New Automation
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold">Waking up the engine...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 p-8 rounded-2xl text-rose-700 text-center">
          <p className="font-bold text-lg mb-2">Oops! Something went wrong</p>
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchAutomations}
            className="bg-rose-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-rose-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <AutomationTable
          automations={automations}
          onRefresh={fetchAutomations}
        />
      )}
    </div>
  );
}
