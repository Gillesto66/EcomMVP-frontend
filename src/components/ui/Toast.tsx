'use client'
// Auteur : Gilles - Projet : AGC Space - Module : UI - Toast
// Notifications légères sans dépendance externe
import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/src/lib/utils'

type ToastType = 'success' | 'error' | 'info'

interface ToastMessage { id: number; message: string; type: ToastType }

let _addToast: ((msg: string, type?: ToastType) => void) | null = null

export function toast(message: string, type: ToastType = 'success') {
  _addToast?.(message, type)
}

const ICONS = { success: '✅', error: '❌', info: 'ℹ️' }
const STYLES = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])

  useEffect(() => { _addToast = addToast }, [addToast])

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className={cn('flex items-center gap-2 px-4 py-3 rounded-theme border shadow-md text-sm font-medium pointer-events-auto animate-in slide-in-from-right', STYLES[t.type])}>
          <span>{ICONS[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
