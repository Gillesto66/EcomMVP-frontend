'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

const formattingButtons = [
  { label: 'Gras', command: 'bold' },
  { label: 'Italique', command: 'italic' },
  { label: 'Souligné', command: 'underline' },
]

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const [html, setHtml] = useState(value)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialisation une seule fois au mount
  useEffect(() => {
    if (!isInitialized && editorRef.current) {
      editorRef.current.innerHTML = value || '<p><br></p>'
      setHtml(value)
      setIsInitialized(true)
    }
  }, []) // Dépendances vides = une seule fois au mount

  // Mettre à jour le contenu UNIQUEMENT si la valeur externe a changé et que l'éditeur n'a pas le focus
  useEffect(() => {
    if (isInitialized && value !== html && editorRef.current !== document.activeElement) {
      editorRef.current!.innerHTML = value || '<p><br></p>'
      setHtml(value)
    }
  }, [value, isInitialized, html])

  const execCommand = useCallback((command: string) => {
    document.execCommand(command, false)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      setHtml(content)
      onChange(content)
    }
  }, [onChange])

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {formattingButtons.map((button) => (
          <button
            key={button.command}
            type="button"
            onClick={() => execCommand(button.command)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {button.label}
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="min-h-[160px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-6 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        role="textbox"
        aria-multiline="true"
      />
    </div>
  )
}
