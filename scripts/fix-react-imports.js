const fs = require('fs')
const path = require('path')

function removeUnnecessaryReactImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  
  // Remove standalone React imports
  const updatedContent = content
    .replace(/^import React from ['"]react['"][\r\n]*/gm, '')
    .replace(/^import React, /gm, 'import ')
    .replace(/, React([,}])/g, '$1')
    .replace(/^import { (.*), React } from ['"]react['"][\r\n]*/gm, 'import { $1 } from "react"\n')
    .replace(/^import \{ React \} from ['"]react['"][\r\n]*/gm, '')

  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent)
    console.log(`Updated ${filePath}`)
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir)
  
  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory()) {
      processDirectory(fullPath)
    } else if (
      stat.isFile() && 
      (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))
    ) {
      removeUnnecessaryReactImports(fullPath)
    }
  }
}

// Start processing from src directory
processDirectory(path.join(process.cwd(), 'src')) 