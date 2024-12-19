#!/bin/bash

# Update LoadingSpinner imports
find src -type f -name "*.tsx" -exec sed -i 's/import Loading from.*loading.*/import { LoadingSpinner } from "@\/components\/ui\/LoadingSpinner"/' {} \;
find src -type f -name "*.tsx" -exec sed -i 's/import { Loading } from.*loading.*/import { LoadingSpinner } from "@\/components\/ui\/LoadingSpinner"/' {} \;
find src -type f -name "*.tsx" -exec sed -i 's/import LoadingState from.*loading-state.*/import { LoadingSpinner } from "@\/components\/ui\/LoadingSpinner"/' {} \;

# Update Button imports
find src -type f -name "*.tsx" -exec sed -i 's/import { Button } from.*[Bb]utton.*/import { Button } from "@\/components\/ui\/button"/' {} \;
find src -type f -name "*.tsx" -exec sed -i 's/import Button from.*[Bb]utton.*/import { Button } from "@\/components\/ui\/button"/' {} \;

# Update AuthProvider imports
find src -type f -name "*.tsx" -exec sed -i 's/import { useAuth } from.*[Aa]uth[Pp]rovider.*/import { useAuth } from "@\/providers\/AuthProvider"/' {} \;
find src -type f -name "*.tsx" -exec sed -i 's/import { AuthProvider } from.*[Aa]uth[Pp]rovider.*/import { AuthProvider } from "@\/providers\/AuthProvider"/' {} \; 