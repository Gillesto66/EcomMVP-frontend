// Auteur : Gilles - Projet : AGC Space - Module : Builder Logger
// Logging structuré pour le Builder V2 avec contexte complet
import { env } from 'process'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

function getLogLevel(): LogLevel {
  const env_level = typeof window !== 'undefined' 
    ? (window as any)?.NEXT_PUBLIC_BUILDER_LOG_LEVEL 
    : 'info'
  return (env_level as LogLevel) || 'info'
}

function shouldLog(level: LogLevel): boolean {
  if (typeof window === 'undefined') return false // SSR
  const currentLevel = getLogLevel()
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel]
}

interface LogContext {
  action: string
  component?: string
  duration?: number
  value?: unknown
  error?: Error | string
  blockIndex?: number
  blockType?: string
}

function formatLog(level: LogLevel, context: LogContext): void {
  if (!shouldLog(level)) return

  const timestamp = new Date().toISOString()
  const message = `[${timestamp}] [Builder:${context.component || 'Unknown'}] ${context.action}`
  
  const extra = {
    ...(context.duration && { duration: `${context.duration}ms` }),
    ...(context.blockIndex !== undefined && { blockIndex: context.blockIndex }),
    ...(context.blockType && { blockType: context.blockType }),
    ...(context.value !== undefined && { value: context.value }),
    ...(context.error && { error: context.error instanceof Error ? context.error.message : context.error }),
  }

  const logFunc = console[level === 'warn' ? 'warn' : level === 'error' ? 'error' : level === 'debug' ? 'debug' : 'log']
  logFunc(message, Object.keys(extra).length > 0 ? extra : '')
}

export const builderLogger = {
  debug: (context: LogContext) => formatLog('debug', context),
  info: (context: LogContext) => formatLog('info', context),
  warn: (context: LogContext) => formatLog('warn', context),
  error: (context: LogContext) => formatLog('error', context),

  // Alias pour actions courantes
  blockAdded: (index: number, type: string) =>
    formatLog('info', { component: 'BlockEditor', action: 'blockAdded', blockIndex: index, blockType: type }),
  blockRemoved: (index: number) =>
    formatLog('info', { component: 'BlockEditor', action: 'blockRemoved', blockIndex: index }),
  blockMoved: (from: number, to: number) =>
    formatLog('info', { component: 'BlockEditor', action: 'blockMoved', value: `${from} → ${to}` }),
  previewSync: (duration: number, blockCount: number) =>
    formatLog('info', { component: 'Preview', action: 'sync', duration, value: `${blockCount} blocks` }),
  autoSaveStart: () =>
    formatLog('debug', { component: 'BlockEditor', action: 'autoSaveStart' }),
  autoSaveEnd: (duration: number, success: boolean) =>
    formatLog('info', { component: 'BlockEditor', action: 'autoSaveEnd', duration, value: success ? 'success' : 'failed' }),
  editionFormOpen: (blockIndex: number, type: string) =>
    formatLog('debug', { component: 'BlockEditorForm', action: 'formOpen', blockIndex, blockType: type }),
  editionFormSubmit: (blockIndex: number, changes: Record<string, unknown>) =>
    formatLog('info', { component: 'BlockEditorForm', action: 'formSubmit', blockIndex, value: Object.keys(changes) }),
  blockSelected: (blockIndex: number, type: string) =>
    formatLog('debug', { component: 'EnhancedBlockEditor', action: 'blockSelected', blockIndex, blockType: type }),
  propertyChanged: (blockIndex: number, type: string, changes: Record<string, unknown>) =>
    formatLog('info', { component: 'PropertiesPanel', action: 'propertyChanged', blockIndex, blockType: type, value: Object.keys(changes) }),
  performanceWarning: (component: string, duration: number) =>
    formatLog('warn', { component, action: 'performanceWarning', duration, value: `> 300ms` }),
}

export default builderLogger
