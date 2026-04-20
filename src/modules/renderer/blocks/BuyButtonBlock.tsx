'use client'
// Auteur : Gilles - Projet : AGC Space - Module : Renderer - BuyButtonBlock
// Affiliate Aware : détecte le cookie agc_ref et l'envoie avec la commande
import { useCartStore } from '@/src/modules/cart/store/cartStore'
import { useAffiliationStore } from '@/src/modules/affiliation/store/affiliationStore'
import type { Block, Product } from '@/src/types'
import { cn } from '@/src/lib/utils'
import { formatPrice } from '@/src/lib/utils'

interface Props { block: Block; product: Product }

export default function BuyButtonBlock({ block, product }: Props) {
  const { addItem } = useCartStore()
  const { trackingCode } = useAffiliationStore()

  const label = (block.label as string) ?? 'Acheter maintenant'
  const icon = (block.icon as string) || ''
  const isOutOfStock = !product.is_digital && product.stock === 0

  const handleClick = () => {
    if (isOutOfStock) return
    addItem(product)
    // Le tracking_code sera envoyé lors du checkout
    if (trackingCode) {
      console.info('[AGC] Affiliation tracking_code présent :', trackingCode)
    }
    // Scroll vers le checkout ou ouvrir le panier
    window.dispatchEvent(new CustomEvent('agc:open-cart'))
  }

  const buttonVariant = block.style === 'secondary'
    ? 'bg-slate-800 text-white hover:bg-slate-700'
    : block.style === 'outline'
      ? 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white'
      : 'bg-primary text-white hover:opacity-90'

  return (
    <div className="block-buy-button flex flex-col items-center gap-3 py-4">
      <button
        onClick={handleClick}
        disabled={isOutOfStock}
        className={cn(
          'inline-flex items-center justify-center gap-2 px-8 py-4 rounded-theme font-bold text-lg transition-all shadow-lg',
          buttonVariant,
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'
        )}
      >
        {icon && <span aria-hidden="true">{icon}</span>}
        {isOutOfStock ? 'Rupture de stock' : label}
      </button>
      <p className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</p>
      {block.affiliate && !isOutOfStock && (
        <p className="text-xs text-blue-700">Affiliation activée pour ce bouton</p>
      )}
      {block.action === 'display_alert' && !isOutOfStock && (
        <p className="text-xs text-gray-500">⚡ Commande sécurisée — Livraison rapide</p>
      )}
    </div>
  )
}
