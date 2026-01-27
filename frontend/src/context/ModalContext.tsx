"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import Modal from "@/components/ui/Modal";

interface ModalOptions {
  title: string;
  message: string;
  type: "confirm" | "prompt";
  placeholder?: string;
  defaultValue?: string;
  onConfirm: (value?: string) => void;
  onCancel: () => void;
}

interface ModalContextType {
  confirm: (title: string, message: string) => Promise<boolean>;
  prompt: (title: string, message: string, placeholder?: string, defaultValue?: string) => Promise<string | null>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [activeModal, setActiveModal] = useState<ModalOptions | null>(null);

  const confirm = useCallback((title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setActiveModal({
        title,
        message,
        type: "confirm",
        onConfirm: () => {
          setActiveModal(null);
          resolve(true);
        },
        onCancel: () => {
          setActiveModal(null);
          resolve(false);
        },
      });
    });
  }, []);

  const prompt = useCallback((title: string, message: string, placeholder?: string, defaultValue?: string): Promise<string | null> => {
    return new Promise((resolve) => {
      setActiveModal({
        title,
        message,
        type: "prompt",
        placeholder,
        defaultValue,
        onConfirm: (value) => {
          setActiveModal(null);
          resolve(value || "");
        },
        onCancel: () => {
          setActiveModal(null);
          resolve(null);
        },
      });
    });
  }, []);

  return (
    <ModalContext.Provider value={{ confirm, prompt }}>
      {children}
      {activeModal && <Modal {...activeModal} onClose={() => setActiveModal(null)} />}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
