// Simple hook for Jotai state management
import { useAtom } from 'jotai'
import { messageAtom } from './states'

// Simple message hook
export const useMessage = () => useAtom(messageAtom)