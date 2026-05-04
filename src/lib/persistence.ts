'use client'

/**
 * FridgeMind Zero Persistence Layer
 * Handles "Neural Caching" in LocalStorage when the database node is restricted (RLS).
 */

const STORAGE_KEYS = {
  INVENTORY: 'fridgemind_inventory_cache',
  SHOPPING: 'fridgemind_shopping_cache',
}

export const NeuralCache = {
  getInventory: () => {
    const data = localStorage.getItem(STORAGE_KEYS.INVENTORY)
    return data ? JSON.parse(data) : []
  },
  
  saveInventory: (items: any[]) => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items))
  },

  getShopping: () => {
    const data = localStorage.getItem(STORAGE_KEYS.SHOPPING)
    return data ? JSON.parse(data) : []
  },

  saveShopping: (items: any[]) => {
    localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(items))
  },
  
  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.INVENTORY)
    localStorage.removeItem(STORAGE_KEYS.SHOPPING)
  }
}
