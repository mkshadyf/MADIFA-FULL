import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { VimeoVideo } from '@/types/vimeo'

interface VimeoAnalyticsProps {
  video: VimeoVideo
}

export default function VimeoAnalytics({ video }: VimeoAnalyticsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Total Views</h3>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{video.stats.plays}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Completion Rate</h3>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {((video.stats.finishes / video.stats.plays) * 100).toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Load Count</h3>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{video.stats.loads}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Engagement Rate</h3>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {((video.stats.finishes / video.stats.loads) * 100).toFixed(1)}%
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
