import { create } from 'zustand';

export const useWishlistStore = create((set, get) => ({
  ids: [],
  setIds: (ids) => set({ ids }),
  toggle: (bookId) => {
    const ids = get().ids;
    set({ ids: ids.includes(bookId) ? ids.filter((id) => id !== bookId) : [...ids, bookId] });
  },
  isWishlisted: (bookId) => get().ids.includes(bookId),
}));
