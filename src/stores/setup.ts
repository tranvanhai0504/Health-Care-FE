import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SetupState {
  step: number;
  userInfo: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    dateOfBirth?: string;
    gender?: string;
    occupation?: string;
    password?: string;
  };
  setStep: (step: number) => void;
  setUserInfo: (info: Partial<SetupState['userInfo']>) => void;
  reset: () => void;
}

export const useSetupStore = create<SetupState>()(
  persist(
    (set) => ({
      step: 1,
      userInfo: {},
      setStep: (step) => set({ step }),
      setUserInfo: (info) => set((state) => ({ userInfo: { ...state.userInfo, ...info } })),
      reset: () => set({ step: 1, userInfo: {} }),
    }),
    {
      name: 'setup-storage', // name of the item in storage
      partialize: (state) => ({ step: state.step, userInfo: state.userInfo }),
    }
  )
); 