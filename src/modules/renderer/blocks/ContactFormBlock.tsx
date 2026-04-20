// Auteur : Gilles - Projet : AGC Space - Module : Renderer - ContactFormBlock
'use client'
import type { Block } from '@/src/types'
import { useState, memo, useCallback } from 'react'

interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'textarea' | 'phone'
  required?: boolean
}

interface Props { block: Block }

const ContactFormBlock = memo(function ContactFormBlock({ block }: Props) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  // Default fields
  const defaultFields: FormField[] = [
    { name: 'name', label: 'Nom', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Téléphone', type: 'phone' },
    { name: 'message', label: 'Message', type: 'textarea', required: true },
  ]

  const fields = block.formFields ? JSON.parse(block.formFields as string) : defaultFields

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    // Validate required fields
    const allValid = fields.every((field: FormField) => {
      if (field.required && !formData[field.name]) {
        return false
      }
      return true
    })

    if (allValid) {
      setSubmitted(true)
      setFormData({})
      setTimeout(() => setSubmitted(false), 5000)
    }
  }, [fields, formData])

  if (submitted) {
    return (
      <div className="block-contact-form w-full max-w-md mx-auto p-8 text-center bg-green-50 border border-green-200 rounded-lg">
        <div className="text-green-700">
          <p className="text-lg font-bold mb-2">✓ Merci !</p>
          <p>Votre message a été envoyé avec succès. Nous vous répondrons bientôt.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="block-contact-form w-full max-w-md mx-auto px-4 py-8">
      {block.title && (
        <h2 className="text-2xl font-bold mb-6 text-center">{block.title}</h2>
      )}
      {typeof block.description === 'string' && block.description && (
        <p className="text-gray-600 text-center mb-6">{block.description}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field: FormField) => (
          <div key={field.name}>
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                required={field.required}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={field.label}
              />
            ) : (
              <input
                id={field.name}
                type={field.type}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                required={field.required}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={field.label}
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Envoyer le formulaire"
        >
          Envoyer
        </button>
      </form>
    </div>
  )
})

ContactFormBlock.displayName = 'ContactFormBlock'

export default ContactFormBlock