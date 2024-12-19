import React from 'react'

interface VideoPlayerProps {
  url: string
  thumbnail: string
  title: string
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  thumbnail,
  title,
}) => {
  return (
    <div className="relative aspect-video w-full">
      <video
        className="h-full w-full"
        controls
        poster={thumbnail}
        title={title}
      >
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

export default VideoPlayer
