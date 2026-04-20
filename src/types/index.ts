// Auteur : Gilles - Projet : AGC Space - Module : Types globaux

export type UserRole = 'ecommercant' | 'client' | 'affilie'

export interface User {
  id: number
  username: string
  email: string
  phone?: string
  avatar?: string
  roles: { id: number; name: UserRole }[]
  created_at: string
}

export interface Product {
  id: number
  owner: number
  owner_username: string
  name: string
  description: string
  price: string
  sku: string
  is_digital: boolean
  is_active: boolean
  stock: number
  views_count: number
  category: string
  image_main_url?: string | null
  image_secondary_1_url?: string | null
  image_secondary_2_url?: string | null
  created_at: string
  updated_at: string
}

export interface ThemeVariables {
  primary_color?: string
  secondary_color?: string
  background_color?: string
  text_color?: string
  font_family?: string
  font_size_base?: string
  border_radius?: string
  spacing_unit?: string
  button_color?: string
}

export interface Theme {
  id: number
  name: string
  variables: ThemeVariables
  css_preview: string
  updated_at: string
}

// ── Blocs du Smart Builder ────────────────────────────────────────────────────

export type BlockType =
  | 'hero'
  | 'features'
  | 'testimonials'
  | 'social_proof'
  | 'countdown'
  | 'stock_status'
  | 'buy_button'
  | 'text'
  | 'image'
  | 'video'
  | 'image_gallery'
  | 'video_embed'
  | 'faq_accordion'
  | 'cta_banner'
  | 'testimonials_carousel'
  | 'pricing_table'
  | 'contact_form'

export interface BlockVisibility {
  stock_min?: number
  stock_max?: number
  mobile?: boolean
  desktop?: boolean
}

export interface BlockTracking {
  event: string
  [key: string]: unknown
}

export interface SocialProofData {
  total_sold: number
  buyer_count: number
  period_days: number
}

export interface CountdownData {
  deadline_iso: string
  seconds_remaining: number
  is_expired: boolean
}

export interface StockStatusData {
  stock: number
  label: string
  level: 'ok' | 'low' | 'out'
}

export interface Block {
  type: BlockType
  visibility?: BlockVisibility
  tracking?: BlockTracking
  affiliate_aware?: boolean
  action?: string
  // Données injectées par le backend
  data?: SocialProofData | CountdownData | StockStatusData
  // Props spécifiques par type
  text?: string
  richText?: string
  subtitle?: string
  title?: string
  image?: string
  label?: string
  icon?: string
  alt?: string
  caption?: string
  style?: string
  gridLayout?: string
  items?: unknown[]
  backgroundColor?: string
  textColor?: string
  padding?: number
  margin?: number
  borderRadius?: number
  hoverEffect?: boolean
  hideMobile?: boolean
  hideDesktop?: boolean
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  affiliate?: boolean
  endDate?: string
  showProgress?: boolean
  urgentThreshold?: number
  duration_hours?: number
  ctaText?: string
  ctaLink?: string
  formFields?: string
  animation?: string
  cssOverride?: string
  video?: string
  poster?: string
  [key: string]: unknown
}

export interface PageTemplate {
  id: number
  name: string
  config: { blocks: Block[] }
  critical_css: string
  created_by: number
  created_by_username: string
  is_public: boolean
  product_count: number
  created_at: string
  updated_at: string
}

export interface RenderPayload {
  product: Product
  theme: Theme | Record<string, never>
  template: { id: number; name: string }
  blocks: Block[]
  critical_css: string
  /** Paramètres globaux de la page (SEO, background) */
  page_settings?: PageSettings
  meta: {
    product_id: number
    template_id: number
    tracking_events: BlockTracking[]
    affiliate_aware_blocks: string[]
  }
}

/** Paramètres globaux de la page de vente */
export interface PageSettings {
  /** Couleur ou gradient CSS du fond de page. Ex: '#f8fafc' ou 'linear-gradient(135deg,#667eea,#764ba2)' */
  background_color?: string
  background_type?: 'color' | 'gradient' | 'image'
  background_image?: string
  /** SEO */
  seo_title?: string
  seo_description?: string
  seo_og_image?: string
}

// ── Affiliation ───────────────────────────────────────────────────────────────

export interface AffiliationLink {
  id: number
  product: number
  product_name: string
  affiliate: number
  affiliate_username: string
  commission_rate: string
  commission_display: string
  tracking_code: string
  is_active: boolean
  affiliate_url: string
  created_at: string
}

export interface AffiliationValidation {
  valid: boolean
  tracking_code?: string
  affiliate?: string
  product_id?: number
  commission_rate?: string
  cookie?: {
    cookie_name: string
    tracking_code: string
    expires_at: number
    cookie_max_age: number
  }
  reason?: string
}

export interface Commission {
  id: number
  order_id: number
  product_name: string
  affiliate_username: string
  order_total: string
  commission_rate: string
  commission_display: string
  amount: string
  status: 'pending' | 'validated' | 'paid' | 'cancelled'
  created_at: string
  updated_at: string
}

// ── Commandes ─────────────────────────────────────────────────────────────────

export interface OrderItem {
  id: number
  product: number
  product_name: string
  quantity: number
  unit_price: string
  subtotal: string
}

export interface Order {
  id: number
  order_number: string
  customer: number
  customer_username: string
  referral_code?: string
  status: 'pending' | 'paid' | 'cancelled' | 'refunded'
  total: string
  items: OrderItem[]
  commission?: {
    id: number
    amount: string
    rate: string
    status: string
    affiliate: string
  } | null
  stripe_payment_intent_id?: string | null
  paid_at?: string | null
  created_at: string
  updated_at: string
}

/** Vue vendeur — commande contenant ses produits */
export interface VendeurOrder {
  id: number
  order_number: string
  customer_username: string
  status: 'pending' | 'paid' | 'cancelled' | 'refunded'
  total: string
  items: OrderItem[]
  commission?: { id: number; amount: string; status: string; affiliate: string } | null
  paid_at?: string | null
  created_at: string
}

/** Affilié vu par le vendeur */
export interface VendeurAffiliate {
  link_id: number
  affiliate_username: string
  product_name: string
  product_id: number
  commission_rate: string
  commission_display: string
  is_active: boolean
  clicks_count: number
  total_commissions: number
  total_earned: string
  pending_amount: string
  created_at: string
}

/** Commission vue par le vendeur */
export interface VendeurCommission {
  id: number
  order_number: string
  product_name: string
  affiliate_username: string
  order_total: string
  commission_rate: string
  commission_display: string
  amount: string
  status: 'pending' | 'validated' | 'paid' | 'cancelled'
  validated_at?: string | null
  created_at: string
}

// ── Panier (état local Zustand) ───────────────────────────────────────────────

export interface CartItem {
  product: Product
  quantity: number
}

export interface AuthTokens {
  access: string
  refresh: string
}
