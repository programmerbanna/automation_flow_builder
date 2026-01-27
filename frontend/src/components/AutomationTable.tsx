"use client";

import React, { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { useModal } from "@/context/ModalContext";
import Link from "next/link";
import { automationApi, Automation } from "@/lib/api";

interface AutomationTableProps {
  automations: Automation[];
  onRefresh: () => void;
}

const AutomationTable: React.FC<AutomationTableProps> = ({
  automations,
  onRefresh,
}) => {
  const { showToast } = useToast();
  const { confirm, prompt } = useModal();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm(
      "Delete Automation",
      `Are you sure you want to delete "${name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setLoadingId(id);
      await automationApi.delete(id);
      showToast("Automation deleted successfully", "success");
      onRefresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || error.message
          : "Failed to delete automation";
      showToast(message, "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleTestRun = async (id: string) => {
    const email = await prompt(
      "Start Test Run",
      "Enter the recipient email address for this automation test flow:",
      "email@example.com"
    );

    if (!email || !email.trim()) return;

    try {
      setLoadingId(id);
      const response = await automationApi.startTest(id, email.trim());
      showToast(
        `Test run started! ID: ${response.data.data.testRunId}`,
        "success",
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || error.message
          : "Failed to start test run";
      showToast(message, "error");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
              Created At
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {automations.map((automation) => (
            <tr
              key={automation._id}
              className="hover:bg-slate-50 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-slate-900">
                  {automation.name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-500">
                  {new Date(automation.createdAt).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                <Link
                  href={`/automations/${automation._id}`}
                  className="text-indigo-600 hover:text-indigo-900 font-bold"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleTestRun(automation._id)}
                  disabled={!!loadingId}
                  className="text-emerald-600 hover:text-emerald-900 font-bold disabled:opacity-50"
                >
                  Test
                </button>
                <button
                  onClick={() => handleDelete(automation._id, automation.name)}
                  disabled={!!loadingId}
                  className="text-rose-600 hover:text-rose-900 font-bold disabled:opacity-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {automations.length === 0 && (
            <tr>
              <td
                colSpan={3}
                className="px-6 py-12 text-center text-slate-500 italic"
              >
                No automations found. Create your first one!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AutomationTable;
