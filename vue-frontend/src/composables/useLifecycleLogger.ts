import { onBeforeMount, onMounted, onBeforeUnmount } from 'vue'
import type { LifecycleLoggerOptions } from '@/types/user.types'

export function useLifecycleLogger(options: LifecycleLoggerOptions = {}) {
  const componentName = options.componentName || 'UnknownComponent'
  const logMountTime = options.logMountTime ?? true

  let mountStartTime: number

  const log = (phase: string, message?: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString()
    const emoji = getPhaseEmoji(phase)

    console.group(`${emoji} [${componentName}] ${phase} - ${timestamp}`)

    if (message) {
      console.log(`📝 ${message}`)
    }

    if (data) {
      console.log('📊 Data:', data)
    }

    console.groupEnd()
  }

  const getPhaseEmoji = (phase: string): string => {
    const emojiMap: Record<string, string> = {
      beforeMount: '🚀',
      mounted: '✅',
      unmounted: '💀',
    }
    return emojiMap[phase] || '📍'
  }

  onBeforeMount(() => {
    mountStartTime = performance.now()
    log('beforeMount', 'Component is about to mount', {})
  })

  onMounted(() => {
    const mountTime = logMountTime ? performance.now() - mountStartTime : 0
    log('mounted', 'Component mounted successfully', {
      mountTime: logMountTime ? `${mountTime.toFixed(2)}ms` : undefined,
    })
  })

  onBeforeUnmount(() => {
    log('beforeUnmount', 'Component is about to unmount', {
      reason: 'Component cleanup initiated',
    })
  })

  const logCustomEvent = (eventName: string, data?: any) => {
    log(eventName, `Custom event: ${eventName}`, data)
  }

  const logError = (error: Error | string, context?: string) => {
    const errorMessage = error instanceof Error ? error.message : error
    console.group(`❌ [${componentName}] Error - ${new Date().toLocaleTimeString()}`)
    console.error('🚨 Error:', errorMessage)
    if (context) {
      console.log('📝 Context:', context)
    }
    if (error instanceof Error && error.stack) {
      console.log('📚 Stack:', error.stack)
    }
    console.groupEnd()
  }

  const logPerformance = (label: string, operation: () => void | Promise<void>) => {
    return async () => {
      const startTime = performance.now()
      console.time(`⏱️ [${componentName}] ${label}`)

      try {
        await operation()
      } finally {
        const endTime = performance.now()
        console.timeEnd(`⏱️ [${componentName}] ${label}`)
        console.log(`📊 [${componentName}] ${label} took ${(endTime - startTime).toFixed(2)}ms`)
      }
    }
  }

  return {
    logCustomEvent,
    logError,
    logPerformance,
    componentName,
  }
}
