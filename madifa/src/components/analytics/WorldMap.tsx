import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'

interface WorldMapProps {
  data: Array<{
    id: string
    value: number
  }>
}

interface WorldTopology extends Topology {
  objects: {
    countries: GeometryCollection
  }
}

export function WorldMap({ data }: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    // Set up dimensions
    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight
    const margin = { top: 10, right: 10, bottom: 10, left: 10 }

    // Create color scale
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(data, d => d.value) || 1])

    // Load world topology data
    fetch('/world-110m.json')
      .then(response => response.json())
      .then((worldTopo: WorldTopology) => {
        // Create projection
        const projection = d3.geoMercator()
          .fitSize(
            [width - margin.left - margin.right, height - margin.top - margin.bottom],
            feature(worldTopo, worldTopo.objects.countries)
          )

        // Create path generator
        const path = d3.geoPath().projection(projection)

        // Create SVG
        const svg = d3.select(svgRef.current)
          .attr('width', width)
          .attr('height', height)

        // Create tooltip
        const tooltip = d3.select('body')
          .append('div')
          .attr('class', 'absolute hidden bg-black text-white px-2 py-1 rounded text-sm pointer-events-none')

        // Create map container
        const g = svg.append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`)

        // Draw countries
        g.selectAll('path')
          .data(feature(worldTopo, worldTopo.objects.countries).features)
          .join('path')
          .attr('d', path)
          .attr('fill', d => {
            const countryData = data.find(item => item.id === (d as any).id)
            return countryData ? colorScale(countryData.value) : '#eee'
          })
          .attr('stroke', '#fff')
          .attr('stroke-width', 0.5)
          .on('mouseover', (event, d: any) => {
            const countryData = data.find(item => item.id === d.id)
            if (countryData) {
              tooltip
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY + 10}px`)
                .html(`
                  <div>
                    <div>${d.properties.name}</div>
                    <div>Views: ${countryData.value}</div>
                  </div>
                `)
                .classed('hidden', false)
            }
          })
          .on('mouseout', () => {
            tooltip.classed('hidden', true)
          })

        // Add zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
          .scaleExtent([1, 8])
          .on('zoom', (event) => {
            g.attr('transform', event.transform)
          })

        svg.call(zoom as any)

        // Cleanup
        return () => {
          tooltip.remove()
        }
      })
  }, [data])

  return (
    <div className="w-full h-full">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ minHeight: '300px' }}
        role="presentation"
      />
    </div>
  )
} 