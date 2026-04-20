// Auteur : Gilles - Projet : AGC Space - Module : Renderer - ComponentMap
import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import type { Block, Product } from '@/src/types'

export interface BlockComponentProps {
  block: Block
  product?: Product
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COMPONENT_MAP: Record<string, ComponentType<any>> = {
  hero:                    dynamic(() => import('./blocks/HeroBlock'),                    { ssr: true, suspense: true }),
  features:                dynamic(() => import('./blocks/FeaturesBlock'),                { ssr: true, suspense: true }),
  testimonials:            dynamic(() => import('./blocks/TestimonialsBlock'),            { ssr: true, suspense: true }),
  social_proof:            dynamic(() => import('./blocks/SocialProofBlock'),             { ssr: false, suspense: true }),
  countdown:               dynamic(() => import('./blocks/CountdownBlock'),               { ssr: false, suspense: true }),
  stock_status:            dynamic(() => import('./blocks/StockStatusBlock'),             { ssr: true, suspense: true }),
  buy_button:              dynamic(() => import('./blocks/BuyButtonBlock'),               { ssr: false, suspense: true }),
  text:                    dynamic(() => import('./blocks/TextBlock'),                  { ssr: true, suspense: true }),
  image:                   dynamic(() => import('./blocks/ImageBlock'),                   { ssr: true, suspense: true }),
  video:                   dynamic(() => import('./blocks/VideoBlock'),                   { ssr: false, suspense: true }),
  image_gallery:           dynamic(() => import('./blocks/ImageGalleryBlock'),            { ssr: true, suspense: true }),
  video_embed:             dynamic(() => import('./blocks/VideoEmbedBlock'),              { ssr: true, suspense: true }),
  faq_accordion:           dynamic(() => import('./blocks/FAQAccordionBlock'),            { ssr: true, suspense: true }),
  cta_banner:              dynamic(() => import('./blocks/CTABannerBlock'),               { ssr: true, suspense: true }),
  testimonials_carousel:   dynamic(() => import('./blocks/TestimonialsCarouselBlock'),    { ssr: true, suspense: true }),
  pricing_table:           dynamic(() => import('./blocks/PricingTableBlock'),            { ssr: true, suspense: true }),
  contact_form:            dynamic(() => import('./blocks/ContactFormBlock'),             { ssr: false, suspense: true }),
}

export default COMPONENT_MAP
