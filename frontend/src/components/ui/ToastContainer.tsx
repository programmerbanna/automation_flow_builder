"use client";

import React from "react";
import { ToastType } from "@/context/ToastContext";

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

const Toast = ({ id, message, type, onClose }: ToastProps) => {
  const bgColor = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-rose-50 border-rose-200 text-rose-800",
    info: "bg-indigo-50 border-indigo-200 text-indigo-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
  }[type];

  const icon = {
    success: (
      <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  }[type];

  return (
    <div
      className={`relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md ${bgColor} animate-slide-in-right transform transition-all duration-300 hover:scale-102 pointer-events-auto`}
    >
      <div className="shrink-0">{icon}</div>
      <p className="text-sm font-bold tracking-tight">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="ml-auto p-1 hover:bg-black/5 rounded-lg transition-colors"
      >
        <svg className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-black/10 w-full">
        <div
          className="h-full bg-current opacity-20 animate-timeout"
          style={{ animationDuration: '5000ms' }}
        />
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: { id: string; message: string; type: ToastType }[];
  removeToast: (id: string) => void;
}

const ToastContainer = ({ toasts, removeToast }: ToastContainerProps) => {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={removeToast} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
