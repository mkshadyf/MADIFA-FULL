import SubscriptionSyncDashboard from '@/components/admin/subscription-sync-dashboard'
import SubscriptionSyncErrors from '@/components/admin/subscription-sync-errors'
import SubscriptionSyncJobMonitor from '@/components/admin/subscription-sync-job-monitor'

export default function SubscriptionSyncPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-bold text-white">
          Subscription Sync Management
        </h1>

        <div className="space-y-8">
          {/* Overview Dashboard */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">Overview</h2>
            <SubscriptionSyncDashboard />
          </section>

          {/* Job Monitor */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">Sync Jobs</h2>
            <SubscriptionSyncJobMonitor />
          </section>

          {/* Error Log */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">Error Log</h2>
            <SubscriptionSyncErrors />
          </section>
        </div>
      </div>
    </div>
  )
}
