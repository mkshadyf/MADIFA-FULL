#!/bin/bash

# Build the production web app
npm run build

# Generate Android app using Bubblewrap
bubblewrap build

# Sign the APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ./android/keystore.jks \
  ./android/app/build/outputs/bundle/release/app-release.aab \
  madifa-key

# Zipalign the APK
zipalign -v 4 ./android/app/build/outputs/bundle/release/app-release.aab ./android/app/build/outputs/bundle/release/madifa.aab 