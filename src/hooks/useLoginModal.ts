"use client";

import { useLoginModalStore } from "@/stores/login-modal";

export function useLoginModal() {
  const { 
    isOpen, 
    afterLoginCallback,
    openModal,
    closeModal,
    setAfterLoginCallback
  } = useLoginModalStore();

  const executeAfterLogin = () => {
    if (afterLoginCallback) {
      afterLoginCallback();
      setAfterLoginCallback(null);
    }
  };

  return {
    isOpen,
    openModal,
    closeModal,
    executeAfterLogin
  };
} 