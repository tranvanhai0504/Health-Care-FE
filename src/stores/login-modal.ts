import { create } from 'zustand';

interface LoginModalState {
  isOpen: boolean;
  afterLoginCallback: (() => void) | null;
  
  openModal: (options?: { afterLogin?: () => void }) => void;
  closeModal: () => void;
  setAfterLoginCallback: (callback: (() => void) | null) => void;
}

export const useLoginModalStore = create<LoginModalState>()((set) => ({
  isOpen: false,
  afterLoginCallback: null,

  openModal: (options) => set({ 
    isOpen: true,
    afterLoginCallback: options?.afterLogin || null 
  }),

  closeModal: () => set({ isOpen: false }),
  
  setAfterLoginCallback: (callback) => set({ afterLoginCallback: callback }),
})); 