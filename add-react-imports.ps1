Get-ChildItem -Path "src" -Recurse -Include "*.tsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if (!($content -match "import React")) {
        $newContent = "import React from 'react'`n$content"
        Set-Content $_.FullName $newContent
    }
} 