# Video Player

## Overview
The Video Player is a core component of the Madifa platform, responsible for delivering video content to users with a rich set of features including playback controls, quality selection, analytics tracking, and offline support.

## Implementation

### Component Structure
The Video Player follows a compound component pattern with the following structure:

```
VideoPlayer/
├── index.tsx             # Main component export
├── BufferingIndicator.tsx # Loading indicator
├── QualitySelector.tsx   # Video quality selection
├── ThumbnailPreview.tsx  # Preview thumbnails on hover
├── useVideoPlayer.ts     # Player logic hook
├── VideoControls.tsx     # Player controls UI
└── VimeoPlayer.tsx       # Vimeo integration
```

The main component aggregates these subcomponents to create a cohesive player experience.

### State Management
Video player state is managed through a combination of:

1. **Local Component State**: For UI-specific states
2. **Custom Hook**: `useVideoPlayer.ts` encapsulates player logic
3. **Global Store**: `usePlayerStore` in `src/lib/store/index.ts` for persistent preferences

```typescript
// Store definition
export const usePlayerStore = create<PlayerState>()(
  persist(
    set => ({
      volume: 1,
      muted: false,
      playbackRate: 1,
      setVolume: volume => set({ volume }),
      setMuted: muted => set({ muted }),
      setPlaybackRate: playbackRate => set({ playbackRate }),
    }),
    {
      name: 'player-storage',
      version: 1,
    }
  )
)
```

### Integration with Vimeo
The player integrates with Vimeo using the official SDK (`@vimeo/player`). This integration is encapsulated in the `VimeoPlayer.tsx` component and related services.

### Analytics
Video playback analytics are tracked using:

1. **useVideoAnalytics.ts**: Tracks playback events
2. **Vimeo Analytics API**: Leverages Vimeo's built-in analytics
3. **Custom event tracking**: Captures user interactions

### Keyboard Controls
The player supports keyboard controls for accessibility and improved UX:

1. Space: Play/Pause
2. Left/Right arrows: Seek backward/forward
3. Up/Down arrows: Volume control
4. F: Fullscreen toggle
5. M: Mute toggle

These controls are implemented in the `useVideoKeyboard.ts` hook.

### Offline Support
The player supports offline viewing for downloaded content:

1. **Detection**: Checks if video is available offline
2. **Fallback**: Uses local file if available
3. **Storage management**: Respects quota limitations

## Usage
The Video Player can be used in several contexts:

```jsx
// Basic usage
<VideoPlayer videoId="123456" />

// With additional options
<VideoPlayer 
  videoId="123456"
  autoplay={true}
  startTime={30}
  onEnded={handleVideoEnd}
/>

// With analytics
<VideoPlayer 
  videoId="123456"
  trackAnalytics={true}
  userId="user-123"
/>
```

## Configuration
The player supports the following configuration options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| videoId | string | required | Vimeo video ID |
| autoplay | boolean | false | Automatically start playback |
| muted | boolean | false | Start with audio muted |
| loop | boolean | false | Loop playback |
| controls | boolean | true | Show player controls |
| startTime | number | 0 | Start time in seconds |
| quality | string | 'auto' | Video quality ('auto', '1080p', etc.) |

## Future Improvements

1. **Adaptive Streaming**: Implement better bandwidth adaptation
2. **Interactive Features**: Add support for interactive elements
3. **Multiple Audio Tracks**: Support for different languages
4. **Chapters**: Add support for video chapters
5. **Enhanced Analytics**: More detailed user engagement metrics
6. **Custom Branding**: Allow for white-labeling the player

## Related Components
- Content.tsx: Displays video content cards
- WatchHistory.tsx: Shows user's viewing history
- DownloadManager: Manages offline content
- VideoDetailsModal: Displays video details 