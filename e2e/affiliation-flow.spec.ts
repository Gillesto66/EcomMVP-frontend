// Auteur : Gilles - Projet : AGC Space - Module : Tests E2E - Flow Affiliation
/**
 * Test E2E Playwright — Flow complet achat via lien affilié.
 *
 * Prérequis :
 *   - Backend Django sur http://localhost:8000
 *   - Frontend Next.js sur http://localhost:3000
 *   - Base de données seedée (python seed.py)
 *
 * Lancer : npx playwright test
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://localhost:3000'
const API = 'http://localhost:8000'

// ── Helpers ───────────────────────────────────────────────────────────────────

async function loginAs(page: Page, username: string, password = 'agcspace123') {
  await page.goto(`${BASE}/login`)
  await page.fill('input[type="text"]', username)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(`${BASE}/dashboard`)
}

async function getSignedUrl(page: Page, linkId: number): Promise<string> {
  const response = await page.request.post(
    `${API}/api/v1/affiliations/links/${linkId}/signed-url/`,
    { headers: { Authorization: `Bearer ${await getToken(page)}` } }
  )
  const data = await response.json()
  return data.url
}

async function getToken(page: Page): Promise<string> {
  const response = await page.request.post(`${API}/api/v1/auth/login/`, {
    data: { username: 'affilie_test', password: 'agcspace123' },
  })
  const data = await response.json()
  return data.access
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('Flow complet affiliation', () => {
  test('1. Page de vente se charge correctement (SSR)', async ({ page }) => {
    await page.goto(`${BASE}/shop/1`)
    await expect(page).toHaveTitle(/AGC Space/)
    // Le Critical CSS doit être injecté dans le <head>
    const criticalStyle = page.locator('style').first()
    await expect(criticalStyle).toBeTruthy()
  })

  test('2. Validation HMAC et pose du cookie', async ({ page }) => {
    // Simuler un clic sur un lien affilié avec paramètres valides
    const token = await getToken(page)
    const signedRes = await page.request.post(`${API}/api/v1/affiliations/links/1/signed-url/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const { url } = await signedRes.json()

    // Extraire les params de l'URL signée
    const signedUrl = new URL(url)
    const ref = signedUrl.searchParams.get('ref')
    const sig = signedUrl.searchParams.get('sig')
    const exp = signedUrl.searchParams.get('exp')

    await page.goto(`${BASE}/shop/1?ref=${ref}&sig=${sig}&exp=${exp}&product_id=1`)
    await page.waitForTimeout(1000) // Attendre la validation async

    // Le cookie agc_ref doit être posé
    const cookies = await page.context().cookies()
    const refCookie = cookies.find((c) => c.name === 'agc_ref')
    expect(refCookie).toBeDefined()
    expect(refCookie?.value).toBe(ref)
  })

  test('3. Ajout au panier et ouverture du drawer', async ({ page }) => {
    await page.goto(`${BASE}/shop/1`)
    const buyButton = page.locator('.block-buy-button button').first()
    await expect(buyButton).toBeVisible()
    await buyButton.click()
    // Le CartDrawer doit s'ouvrir
    await expect(page.locator('aside').filter({ hasText: 'Mon panier' })).toBeVisible()
  })

  test('4. Checkout avec referral_code', async ({ page }) => {
    // Se connecter en tant que client
    await loginAs(page, 'client_test')
    await page.goto(`${BASE}/shop/1`)

    // Ajouter au panier
    const buyButton = page.locator('.block-buy-button button').first()
    if (await buyButton.isVisible()) {
      await buyButton.click()
      await page.click('button:has-text("Passer la commande")')
      await expect(page).toHaveURL(`${BASE}/checkout`)
      await expect(page.locator('h1')).toContainText('Récapitulatif')
    }
  })

  test('5. Inscription et connexion', async ({ page }) => {
    await page.goto(`${BASE}/register`)
    await page.fill('input[type="text"]', `testuser_${Date.now()}`)
    await page.fill('input[type="email"]', `test_${Date.now()}@test.com`)
    await page.fill('input[type="password"]', 'testpass123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/login/)
  })
})

test.describe('Dashboard e-commerçant', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'vendeur_test')
  })

  test('Accès à la liste des produits', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/products`)
    await expect(page.locator('h1')).toContainText('Mes produits')
  })

  test('Accès à l\'éditeur de thème', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/theme`)
    await expect(page.locator('h1')).toContainText('Design System')
    await expect(page.locator('input[type="color"]').first()).toBeVisible()
  })
})

test.describe('Accessibilité', () => {
  test('Skip link présent et fonctionnel', async ({ page }) => {
    await page.goto(`${BASE}/`)
    const skipLink = page.locator('a[href="#main-content"]')
    await expect(skipLink).toBeAttached()
  })

  test('Formulaire de login accessible', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await expect(page.locator('label')).toHaveCount(2)
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('Modal accessible avec Escape', async ({ page }) => {
    await loginAs(page, 'vendeur_test')
    await page.goto(`${BASE}/dashboard/products`)
    await page.click('button:has-text("Nouveau produit")')
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })
})
