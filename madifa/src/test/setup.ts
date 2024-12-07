/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'

// Mock window.fetch
const originalFetch = global.fetch
global.fetch = vi.fn()

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

// Restore fetch after all tests
afterAll(() => {
  global.fetch = originalFetch
})

// Mock fetch response for world topology data
beforeAll(() => {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url.includes('world-110m.json')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          type: 'Topology',
          objects: {
            countries: {
              type: 'GeometryCollection',
              geometries: []
            }
          },
          arcs: [],
          transform: {
            scale: [1, 1],
            translate: [0, 0]
          }
        })
      })
    }
    return originalFetch(url)
  })
}) 