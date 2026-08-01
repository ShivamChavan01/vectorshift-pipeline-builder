// resultStore.js — UI state for the submit-result modal

import { create } from 'zustand';

export const useResultStore = create((set) => ({
  isOpen: false,
  result: null,
  error: null,
  showResult: (result) => set({ isOpen: true, result, error: null }),
  showError: (error) => set({ isOpen: true, error, result: null }),
  close: () => set({ isOpen: false, result: null, error: null }),
}));
