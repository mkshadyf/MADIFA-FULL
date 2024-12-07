import { render, screen } from '@testing-library/react'
import { WorldMap } from './WorldMap'

describe('WorldMap', () => {
  const mockData = [
    { id: 'US', value: 100 },
    { id: 'GB', value: 50 }
  ]

  it('renders without crashing', () => {
    render(<WorldMap data={mockData} />)
    expect(screen.getByRole('presentation')).toBeInTheDocument()
  })

  it('has correct dimensions', () => {
    render(<WorldMap data={mockData} />)
    const svg = screen.getByRole('presentation')
    expect(svg).toHaveClass('w-full h-full')
    expect(svg).toHaveStyle({ minHeight: '300px' })
  })
}) 