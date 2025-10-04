// Simple hook for Jotai state management
import { useAtom } from 'jotai'
import { messageAtom } from './states'
import { newAtom } from './states'

// Simple message hook
export const useMessage = () => useAtom(messageAtom)
export const useNew = () => useAtom(newAtom)
