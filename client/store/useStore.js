/**
 * Store — Backward Compatibility Layer
 * Re-exports useAuthStore as useStore for any remaining imports.
 */
import { useAuthStore } from "./useAuthStore";

// Map old useStore API to new useAuthStore
export const useStore = useAuthStore;
