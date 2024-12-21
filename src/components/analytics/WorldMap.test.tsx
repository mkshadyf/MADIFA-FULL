import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Selection } from 'd3-selection'
import type { Feature, FeatureCollection } from 'geojson'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { WorldMap } from './WorldMap'

// Define proper types for props and data
interface WorldMapProps {
  width: number
  height: number
  data: readonly CountryData[]
  onCountryClick?: (countryCode: string) => void
  colorScale: (value: number) => string
  tooltipContent?: (country: string) => string
}

interface CountryData {
  readonly code: string
  readonly value: number
  readonly name: string
}

// Mock D3 with proper typing
const createMockSelection = (): Partial<
  Selection<SVGElement, unknown, null, undefined>
> => ({
  attr: vi.fn().mockReturnThis(),
  append: vi.fn().mockReturnThis(),
  selectAll: vi.fn().mockReturnThis(),
  data: vi.fn().mockReturnThis(),
  join: vi.fn().mockReturnThis(),
  style: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  call: vi.fn().mockReturnThis(),
})

// Mock GeoJSON data
const createMockGeoJSON = (): FeatureCollection => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
            [0, 0],
          ],
        ],
      },
      properties: {
        name: 'Test Country',
        id: 'TST',
      },
    },
  ],
})

// Mock props
const createMockProps = (): WorldMapProps => ({
  width: 800,
  height: 600,
  data: [{ code: 'TST', value: 100, name: 'Test Country' }] as const,
  onCountryClick: vi.fn(),
  colorScale: (value: number) => `rgb(0, 0, ${value})`,
  tooltipContent: (country: string) => `Country: ${country}`,
})

// Mock fetch response
const createMockResponse = (data: FeatureCollection): Response =>
  ({
    ok: true,
    json: () => Promise.resolve(data),
  }) as Response

describe('WorldMap', () => {
  let mockProps: WorldMapProps
  let mockSelection: Partial<Selection<SVGElement, unknown, null, undefined>>
  let mockGeoJSON: FeatureCollection
  let globalFetch: typeof fetch

  beforeEach(() => {
    vi.clearAllMocks()
    mockProps = createMockProps()
    mockSelection = createMockSelection()
    mockGeoJSON = createMockGeoJSON()
    globalFetch = global.fetch
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = globalFetch
  })

  it('renders with correct dimensions', () => {
    const mockData = [{ id: 'TST', value: 100 }]
    render(<WorldMap {...mockProps} data={mockData} />)
    const svg = screen.getByRole('img', { name: /world map visualization/i })
    expect(svg).toHaveAttribute('width', String(mockProps.width))
    expect(svg).toHaveAttribute('height', String(mockProps.height))
  })

  it('loads and displays world map data', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createMockResponse(mockGeoJSON))
    global.fetch = fetchMock

    render(
      <WorldMap
        width={mockProps.width}
        height={mockProps.height}
        data={[{ id: 'TST', value: 100 }]}
        onCountryClick={mockProps.onCountryClick}
        colorScale={mockProps.colorScale}
        tooltipContent={mockProps.tooltipContent}
      />
    )

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('world-110m.json')
      )
      expect(
        screen.queryByText(/error loading map data/i)
      ).not.toBeInTheDocument()
    })
  })

  it('handles loading errors gracefully', async () => {
    const error = new Error('Failed to load map data')
    const fetchMock = vi.fn().mockRejectedValueOnce(error)
    global.fetch = fetchMock

    render(
      <WorldMap
        width={mockProps.width}
        height={mockProps.height}
        data={[{ id: 'TST', value: 100 }]}
        onCountryClick={mockProps.onCountryClick}
        colorScale={mockProps.colorScale}
        tooltipContent={mockProps.tooltipContent}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/error loading map data/i)).toBeInTheDocument()
    })
  })

  it('applies color scale correctly', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createMockResponse(mockGeoJSON))
    global.fetch = fetchMock

    render(
      <WorldMap
        width={mockProps.width}
        height={mockProps.height}
        data={[{ id: 'TST', value: 100 }]}
        onCountryClick={mockProps.onCountryClick}
        colorScale={mockProps.colorScale}
        tooltipContent={mockProps.tooltipContent}
      />
    )

    await waitFor(() => {
      const path = screen.getByTestId('country-TST')
      expect(path).toHaveAttribute('fill', mockProps.colorScale(100))
    })
  })

  it('handles country click events', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createMockResponse(mockGeoJSON))
    global.fetch = fetchMock

    render(
      <WorldMap
        width={mockProps.width}
        height={mockProps.height}
        data={[{ id: 'TST', value: 100 }]}
        onCountryClick={mockProps.onCountryClick}
        colorScale={mockProps.colorScale}
        tooltipContent={mockProps.tooltipContent}
      />
    )

    await waitFor(() => {
      const path = screen.getByTestId('country-TST')
      fireEvent.click(path)
      expect(mockProps.onCountryClick).toHaveBeenCalledWith('TST')
    })
  })

  it('displays tooltips on hover', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createMockResponse(mockGeoJSON))
    global.fetch = fetchMock

    render(
      <WorldMap
        width={mockProps.width}
        height={mockProps.height}
        data={[{ id: 'TST', value: 100 }]}
        onCountryClick={mockProps.onCountryClick}
        colorScale={mockProps.colorScale}
        tooltipContent={mockProps.tooltipContent}
      />
    )

    await waitFor(() => {
      const path = screen.getByTestId('country-TST')
      fireEvent.mouseEnter(path)
      expect(screen.getByText(/country: test country/i)).toBeInTheDocument()
      fireEvent.mouseLeave(path)
      expect(
        screen.queryByText(/country: test country/i)
      ).not.toBeInTheDocument()
    })
  })

  it('handles missing data gracefully', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      createMockResponse({
        type: 'FeatureCollection',
        features: [],
      })
    )
    global.fetch = fetchMock

    render(
      <WorldMap
        width={mockProps.width}
        height={mockProps.height}
        data={[{ id: 'TST', value: 100 }]}
        onCountryClick={mockProps.onCountryClick}
        colorScale={mockProps.colorScale}
        tooltipContent={mockProps.tooltipContent}
      />
    )

    await waitFor(() => {
      expect(
        screen.queryByText(/error loading map data/i)
      ).not.toBeInTheDocument()
      expect(
        screen.getByRole('img', { name: /world map/i })
      ).toBeInTheDocument()
    })
  })
})
