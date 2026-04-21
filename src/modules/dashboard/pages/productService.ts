// Auteur : Gilles - Projet : AGC Space - Module : Dashboard - ProductService
import apiClient from '@/src/lib/api'
import type { Product, PageTemplate, RenderPayload, Theme } from '@/src/types'

export const productService = {
  async list(): Promise<Product[]> {
    const { data } = await apiClient.get<{ results?: Product[] } | Product[]>('/products/?mine=true')
    if (Array.isArray(data)) return data
    return (data as { results?: Product[] }).results ?? []
  },

  async get(id: number): Promise<Product> {
    const { data } = await apiClient.get<Product>(`/products/${id}/`)
    return data
  },

  async create(payload: Partial<Product>): Promise<Product> {
    const { data } = await apiClient.post<Product>('/products/', payload)
    return data
  },

  async update(id: number, payload: Partial<Product>): Promise<Product> {
    const { data } = await apiClient.patch<Product>(`/products/${id}/`, payload)
    return data
  },

  async getRenderPayload(productId: number): Promise<RenderPayload> {
    const { data } = await apiClient.get<RenderPayload>(`/render/${productId}/`)
    return data
  },

  /** Endpoint builder — crée un template par défaut si absent */
  async getBuilderPayload(productId: number): Promise<RenderPayload> {
    const { data } = await apiClient.get<RenderPayload>(`/builder/${productId}/init/`)
    return data
  },

  async getTheme(): Promise<Theme> {
    const { data } = await apiClient.get<Theme>('/themes/mine/')
    return data
  },

  async updateTheme(variables: Theme['variables']): Promise<Theme> {
    const { data } = await apiClient.post<Theme>('/themes/', { name: 'Mon thème', variables })
    return data
  },

  async listTemplates(): Promise<PageTemplate[]> {
    const { data } = await apiClient.get<PageTemplate[]>('/templates/')
    return data
  },

  async updateTemplate(id: number, config: { blocks: unknown[] }): Promise<PageTemplate> {
    const { data } = await apiClient.patch<PageTemplate>(`/templates/${id}/`, { config })
    return data
  },

  async assignTemplate(templateId: number, productId: number, isActive = true): Promise<void> {
    await apiClient.post(`/templates/${templateId}/assign/`, { product_id: productId, is_active: isActive })
  },
}
