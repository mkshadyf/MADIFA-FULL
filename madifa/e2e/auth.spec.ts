import { expect, test } from '@playwright/test'

test.describe('Authentication', () => {
  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/auth/login')
  })

  test('should show validation errors on invalid login', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/email is required/i)).toBeVisible()
    await expect(page.getByText(/password is required/i)).toBeVisible()
  })

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/invalid credentials/i)).toBeVisible()
  })

  test('should allow registration with valid data', async ({ page }) => {
    await page.goto('/auth/register')
    await page.getByLabel(/full name/i).fill('Test User')
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/password/i).fill('Test123!@#')
    await page.getByRole('button', { name: /sign up/i }).click()
    await expect(page.getByText(/verification email sent/i)).toBeVisible()
  })
}) 