import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ConsultationService } from '@/types';

export interface ServiceListItem {
  service: ConsultationService;
  addedAt: Date;
}

interface ServiceListState {
  items: ServiceListItem[];
  isOpen: boolean;
  addService: (service: ConsultationService) => void;
  removeService: (serviceId: string) => void;
  clearList: () => void;
  toggleList: () => void;
  setListOpen: (isOpen: boolean) => void;
  getTotalServices: () => number;
  getTotalPrice: () => number;
}

export const useServiceList = create<ServiceListState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addService: (service: ConsultationService) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.service._id === service._id
          );

          if (existingItem) {
            // If service already exists, don't add it again
            return state;
          } else {
            // Add new service to list
            return {
              items: [
                ...state.items,
                {
                  service,
                  addedAt: new Date(),
                },
              ],
            };
          }
        });
      },

      removeService: (serviceId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.service._id !== serviceId),
        }));
      },

      clearList: () => {
        set({ items: [] });
      },

      toggleList: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      setListOpen: (isOpen: boolean) => {
        set({ isOpen });
      },

      getTotalServices: () => {
        return get().items.length;
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.service.price,
          0
        );
      },
    }),
    {
      name: 'service-list-storage',
      partialize: (state) => ({
        items: state.items,
        // Don't persist isOpen state
      }),
    }
  )
); 