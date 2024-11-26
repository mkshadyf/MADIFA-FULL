import SubscriptionSyncDashboard from '@/components/admin/subscription-sync-dashboard'
import SubscriptionSyncErrors from '@/components/admin/subscription-sync-errors'
import SubscriptionSyncJobMonitor from '@/components/admin/subscription-sync-job-monitor'

export default function SubscriptionSyncPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-white mb-8">
          Subscription Sync Management
        </h1>

        <div className="space-y-8">
          {/* Overview Dashboard */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
            <SubscriptionSyncDashboard />
          </section>

          {/* Job Monitor */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Sync Jobs</h2>
            <SubscriptionSyncJobMonitor />
          </section>

          {/* Error Log */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Error Log</h2>
            <SubscriptionSyncErrors />
          </section>
        </div>
      </div>
    </div>
  )
} 
