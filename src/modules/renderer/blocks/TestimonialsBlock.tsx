// Auteur : Gilles - Projet : AGC Space - Module : Renderer - TestimonialsBlock
import type { Block } from '@/src/types'

interface Testimonial { author: string; text: string; rating?: number }
interface Props { block: Block }

export default function TestimonialsBlock({ block }: Props) {
  const items = (block.items as unknown as Testimonial[]) ?? [
    {
      author: 'Client 1',
      text: 'Excellent produit !',
      rating: 5,
    },
  ]

  if (items.length === 0) return null

  return (
    <div className="block-testimonials py-8">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Ce qu&apos;ils en disent</h2>
      <div className="flex flex-wrap gap-4 justify-center">
        {items.map((t, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-theme p-5 max-w-xs shadow-sm">
            {t.rating && <p className="text-yellow-400 mb-2">{'★'.repeat(t.rating)}</p>}
            <p className="text-gray-700 text-sm italic mb-3">&ldquo;{t.text}&rdquo;</p>
            <p className="text-gray-500 text-xs font-medium">— {t.author}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
