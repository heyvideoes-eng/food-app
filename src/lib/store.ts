import { create } from 'zustand'

interface AppState {
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
  currentChatSessionId: string | null
  setCurrentChatSessionId: (id: string | null) => void
  selectedIngredientIds: string[]
  toggleSelectedIngredient: (id: string) => void
  clearSelectedIngredients: () => void
  isAddModalOpen: boolean
  setIsAddModalOpen: (open: boolean) => void
  whatsappNumber: string
  setWhatsappNumber: (num: string) => void
}

export const useStore = create<AppState>((set) => ({
  viewMode: 'grid',
  setViewMode: (mode) => set({ viewMode: mode }),
  currentChatSessionId: null,
  setCurrentChatSessionId: (id) => set({ currentChatSessionId: id }),
  selectedIngredientIds: [],
  toggleSelectedIngredient: (id) => set((state) => ({
    selectedIngredientIds: state.selectedIngredientIds.includes(id)
      ? state.selectedIngredientIds.filter(i => i !== id)
      : [...state.selectedIngredientIds, id]
  })),
  clearSelectedIngredients: () => set({ selectedIngredientIds: [] }),
  isAddModalOpen: false,
  setIsAddModalOpen: (open) => set({ isAddModalOpen: open }),
  whatsappNumber: typeof window !== 'undefined' ? localStorage.getItem('fridgemind_whatsapp') || '' : '',
  setWhatsappNumber: (num) => {
    if (typeof window !== 'undefined') localStorage.setItem('fridgemind_whatsapp', num)
    set({ whatsappNumber: num })
  }
}))
