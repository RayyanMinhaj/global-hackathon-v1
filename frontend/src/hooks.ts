// Utility hooks for Jotai state management
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  userAtom,
  isAuthenticatedAtom,
  isLoadingAtom,
  themeAtom,
  sidebarOpenAtom,
  currentPageAtom,
  breadcrumbsAtom,
  dataAtom,
  selectedItemAtom,
  notificationAtom,
  searchQueryAtom,
  filtersAtom,
  filteredDataAtom,
  loginAtom,
  logoutAtom,
  showNotificationAtom
} from './states'

// User hooks
export const useUser = () => useAtomValue(userAtom)
export const useIsAuthenticated = () => useAtomValue(isAuthenticatedAtom)
export const useLogin = () => useSetAtom(loginAtom)
export const useLogout = () => useSetAtom(logoutAtom)

// UI hooks
export const useLoading = () => useAtom(isLoadingAtom)
export const useTheme = () => useAtom(themeAtom)
export const useSidebar = () => useAtom(sidebarOpenAtom)

// Navigation hooks
export const useCurrentPage = () => useAtom(currentPageAtom)
export const useBreadcrumbs = () => useAtom(breadcrumbsAtom)

// Data hooks
export const useData = () => useAtom(dataAtom)
export const useFilteredData = () => useAtomValue(filteredDataAtom)
export const useSelectedItem = () => useAtom(selectedItemAtom)

// Search/Filter hooks
export const useSearchQuery = () => useAtom(searchQueryAtom)
export const useFilters = () => useAtom(filtersAtom)

// Notification hooks
export const useNotification = () => useAtomValue(notificationAtom)
export const useShowNotification = () => useSetAtom(showNotificationAtom)

// Compound hooks for common patterns
export const useAuth = () => {
  const user = useUser()
  const isAuthenticated = useIsAuthenticated()
  const login = useLogin()
  const logout = useLogout()
  
  return {
    user,
    isAuthenticated,
    login,
    logout
  }
}

export const useAppData = () => {
  const [data, setData] = useData()
  const [searchQuery, setSearchQuery] = useSearchQuery()
  const [filters, setFilters] = useFilters()
  const filteredData = useFilteredData()
  const [selectedItem, setSelectedItem] = useSelectedItem()
  
  return {
    data,
    setData,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    filteredData,
    selectedItem,
    setSelectedItem
  }
}