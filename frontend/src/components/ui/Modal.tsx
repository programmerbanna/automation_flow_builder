"use client";

import React, { useState, useEffect, useRef } from "react";

interface ModalProps {
  title: string;
  message: string;
  type: "confirm" | "prompt";
  placeholder?: string;
  defaultValue?: string;
  onConfirm: (value?: string) => void;
  onCancel: () => void;
  onClose: () => void;
}

const Modal = ({
  title,
  message,
  type,
  placeholder,
  defaultValue = "",
  onConfirm,
  onCancel,
}: ModalProps) => {
  const [inputValue, setInputValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (type === "prompt" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [type]);

  const handleConfirm = () => {
    if (type === "prompt") {
      onConfirm(inputValue);
    } else {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-zoom-in">
        <div className="p-8">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-slate-500 font-medium mb-6">
            {message}
          </p>

          {type === "prompt" && (
            <div className="mb-6">
              <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-800 placeholder-slate-400"
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 px-4 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${
                title.toLowerCase().includes("delete")
                  ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
              }`}
            >
              {type === "prompt" ? "Continue" : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
