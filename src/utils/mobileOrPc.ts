import { ref, onMounted, onUnmounted } from 'vue'

export function useResponsive() {
  const isDesktop = ref(false)

  const checkScreenSize = () => {
    isDesktop.value = window.innerWidth > 900
  }

  onMounted(() => {
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkScreenSize)
  })

  return { isDesktop }
}