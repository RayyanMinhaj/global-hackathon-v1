// Global state management with Jotai
import { atom } from 'jotai'

// Types
export interface User {
  id: string
  name: string
  email: string
}

export interface DataItem {
  id: string
  name: string
  [key: string]: unknown
}

export interface Notification {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  id: string
}

// User-related atoms
export const userAtom = atom<User | null>(null)
export const isAuthenticatedAtom = atom<boolean>(false)

// UI state atoms
export const isLoadingAtom = atom<boolean>(false)
export const themeAtom = atom<'light' | 'dark'>('light')
export const sidebarOpenAtom = atom<boolean>(false)

// Navigation atoms
export const currentPageAtom = atom<string>('home')
export const breadcrumbsAtom = atom<string[]>([])

// Data atoms (example for your project)
export const dataAtom = atom<DataItem[]>([])
export const selectedItemAtom = atom<DataItem | null>(null)

// Notification/Alert atoms
export const notificationAtom = atom<Notification | null>(null)

// Search/Filter atoms
export const searchQueryAtom = atom<string>('')
export const filtersAtom = atom<Record<string, string | number | boolean>>({})

// Derived atoms (computed values)
export const filteredDataAtom = atom((get) => {
  const data = get(dataAtom)
  const searchQuery = get(searchQueryAtom)
  const filters = get(filtersAtom)
  
  return data.filter(item => {
    // Apply search and filters logic here
    if (searchQuery && !JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    // Apply other filters
    for (const [key, value] of Object.entries(filters)) {
      if (value && item[key] !== value) {
        return false
      }
    }
    
    return true
  })
})

// Action atoms (for complex state updates)
export const loginAtom = atom(
  null,
  (_get, set, userInfo: User) => {
    set(userAtom, userInfo)
    set(isAuthenticatedAtom, true)
  }
)

export const logoutAtom = atom(
  null,
  (_get, set) => {
    set(userAtom, null)
    set(isAuthenticatedAtom, false)
  }
)

export const showNotificationAtom = atom(
  null,
  (_get, set, notification: { type: 'success' | 'error' | 'warning' | 'info'; message: string }) => {
    const id = Math.random().toString(36).substr(2, 9)
    set(notificationAtom, { ...notification, id })
    
    // Auto-clear notification after 5 seconds
    setTimeout(() => {
      set(notificationAtom, null)
    }, 5000)
  }
)
