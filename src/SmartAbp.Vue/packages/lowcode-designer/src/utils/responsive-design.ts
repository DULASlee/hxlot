import { ref } from "vue"

export function useResponsive() {
  const isMobile = ref(false)
  // TODO: Add actual responsive logic, e.g., using window.matchMedia
  return { isMobile }
}
