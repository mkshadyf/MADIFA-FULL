import React from "react"
import { useEffect, useRef, type FC } from 'react'
import { geoPath, geoMercator } from 'd3-geo'
import { select } from 'd3-selection'
import {
  type Feature,
  type FeatureCollection,
  type GeoJsonProperties,
  type Geometry,
} from 'geojson'
import * as topojson from 'topojson-client'
import { type GeometryCollection, type Topology } from 'topojson-specification'

import * as d3 from 'd3'

interface WorldMapProps {
  data: Array<{
    id: string
    value: number
  }>
  width?: number
  height?: number
  colorScale?: (value: number) => string
  onCountryClick?: (countryCode: string) => void
  tooltipContent?: (country: string) => string
}

interface CountryFeature extends Feature<Geometry, GeoJsonProperties> {
  id?: string
}

interface CountryTopology extends Topology {
  objects: {
    countries: GeometryCollection
  }
}

export const WorldMap: FC<WorldMapProps> = ({
  data,
  width = 960,
  height = 500,
  colorScale: customColorScale,
  onCountryClick,
  tooltipContent,
}) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const renderMap = async () => {
      if (!svgRef.current) return

      const svg = select(svgRef.current)
      svg.selectAll('*').remove()

      const projection = geoMercator()
        .scale(width / 2 / Math.PI)
        .translate([width / 2, height / 2])

      const path = geoPath().projection(projection)

      try {
        // Load world map data
        const topology = await d3.json<CountryTopology>('/world-110m.json')
        if (!topology?.objects?.countries) return

        const countries = topojson.feature(
          topology,
          topology.objects.countries
        ) as FeatureCollection<Geometry, GeoJsonProperties>

        // Create color scale
        const values = data.map(d => d.value)
        const defaultColorScale = d3
          .scaleSequential()
          .domain([Math.min(...values), Math.max(...values)])
          .interpolator(d3.interpolateBlues)

        const finalColorScale = customColorScale || defaultColorScale

        // Draw map
        const paths = svg
          .selectAll<SVGPathElement, CountryFeature>('path')
          .data(countries.features)
          .enter()
          .append('path')
          .attr('d', d => path(d) || '')
          .attr('fill', d => {
            const countryData = data.find(item => item.id === d.id)
            return countryData ? finalColorScale(countryData.value) : '#ccc'
          })
          .attr('stroke', '#fff')
          .attr('stroke-width', 0.5)

        if (onCountryClick) {
          paths.style('cursor', 'pointer').on('click', (event, d) => {
            if (d.id) onCountryClick(d.id as string)
          })
        }

        // Add tooltips
        paths.append('title').text(d => {
          const countryData = data.find(item => item.id === d.id)
          const countryName = d.properties?.name || 'Unknown'

          if (tooltipContent && countryData) {
            return tooltipContent(countryName)
          }

          return countryData
            ? `${countryName}: ${countryData.value}`
            : countryName
        })
      } catch (error) {
          console.error('Error loading or rendering map:', error)
      }
    }

    void renderMap()
  }, [data, width, height, customColorScale, onCountryClick, tooltipContent])

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto max-w-full"
      role="img"
      aria-label="World map visualization"
    />
  )
}

export default WorldMap
