// Auteur : Gilles - Projet : AGC Space - Module : Renderer - FAQAccordionBlock
'use client'
import type { Block } from '@/src/types'
import { cn } from '@/src/lib/utils'
import { useState, memo } from 'react'

interface Props { block: Block }

const FAQAccordionBlock = memo(function FAQAccordionBlock({ block }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)
  const items = (block.items as string[]) || []

  if (!items || items.length === 0) {
    return (
      <div className="block-faq-accordion w-full max-w-2xl mx-auto p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-gray-500">
          <p className="text-lg font-medium">Questions fréquentes</p>
          <p className="text-sm">Ajoutez des questions (une par ligne avec "?" pour la séparer)</p>
        </div>
      </div>
    )
  }

  // Parse items: supporte le format objet {question, answer} ET le format string "question? réponse"
  const faqs = items.map(item => {
    if (typeof item === 'string') {
      const [question, answer] = item.split('?').map(s => s.trim())
      return { question: question + '?', answer: answer || '' }
    }
    // Format objet
    const obj = item as Record<string, unknown>
    return {
      question: String(obj.question ?? ''),
      answer: String(obj.answer ?? ''),
    }
  })

  return (
    <div className="block-faq-accordion w-full max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">{block.title || 'Questions fréquentes'}</h2>
      <div className="space-y-2">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
              className={cn(
                'w-full px-6 py-4 text-left font-medium flex items-center justify-between hover:bg-gray-50 transition-colors',
                expandedIndex === idx ? 'bg-blue-50 text-blue-900' : 'bg-white text-gray-900'
              )}
              aria-expanded={expandedIndex === idx}
              aria-controls={`faq-${idx}`}
            >
              <span>{faq.question}</span>
              <span className={cn(
                'transition-transform',
                expandedIndex === idx ? 'rotate-180' : ''
              )}>
                ▼
              </span>
            </button>
            {expandedIndex === idx && (
              <div id={`faq-${idx}`} className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
})

FAQAccordionBlock.displayName = 'FAQAccordionBlock'

export default FAQAccordionBlock