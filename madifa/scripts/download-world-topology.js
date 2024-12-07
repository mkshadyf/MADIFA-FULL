import fs from 'fs'
import https from 'https'
import path from 'path'

const WORLD_TOPOLOGY_URL = 'https://unpkg.com/world-atlas@2.0.2/countries-110m.json'
const OUTPUT_PATH = path.join(process.cwd(), 'public', 'world-110m.json')

console.log('Downloading world topology data...')

https.get(WORLD_TOPOLOGY_URL, (response) => {
  let data = ''

  response.on('data', (chunk) => {
    data += chunk
  })

  response.on('end', () => {
    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
    fs.writeFileSync(OUTPUT_PATH, data)
    console.log(`World topology data saved to ${OUTPUT_PATH}`)
  })
}).on('error', (error) => {
  console.error('Error downloading world topology data:', error)
  process.exit(1)
}) 