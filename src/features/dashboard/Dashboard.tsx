import AdminLayout from '../../components/layout/AdminLayout'
import DriverApprovals from './components/DriverApprovals'
import KpiCards from './components/KpiCards'
import LiveOperationsPanel from './components/LiveOperationsPanel'
import RevenueChart from './components/RevenueChart'
import TopDrivers from './components/TopDrivers'
import { useDashboardStats } from './hooks/useDashboardStats'
import { useLiveOperations } from './hooks/useLiveOperations'
import { usePendingDrivers } from './hooks/usePendingDrivers'
import { useRevenueSeries } from './hooks/useRevenueSeries'
import { useTopDrivers } from './hooks/useTopDrivers'

export default function Dashboard() {
  const stats = useDashboardStats()
  const revenue = useRevenueSeries()
  const liveOps = useLiveOperations()
  const topDrivers = useTopDrivers(3)
  const approvals = usePendingDrivers(5)

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <KpiCards stats={stats.stats} isLoading={stats.isLoading} error={stats.error} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <RevenueChart
              points={revenue.points}
              isLoading={revenue.isLoading}
              error={revenue.error}
              preset={revenue.preset}
              setRangePreset={revenue.setRangePreset}
              applyCustomRange={revenue.applyCustomRange}
            />
          </div>
          <LiveOperationsPanel
            active={liveOps.active}
            idle={liveOps.idle}
            offline={liveOps.offline}
            drivers={liveOps.drivers}
            isLoading={liveOps.isLoading}
            error={liveOps.error}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <TopDrivers drivers={topDrivers.drivers} isLoading={topDrivers.isLoading} error={topDrivers.error} />
          </div>
          <DriverApprovals
            drivers={approvals.drivers}
            isLoading={approvals.isLoading}
            error={approvals.error}
            actionError={approvals.actionError}
            actioningId={approvals.actioningId}
            onApprove={(id) => void approvals.approve(id)}
            onReject={(id) => void approvals.reject(id)}
          />
        </div>
      </div>
    </AdminLayout>
  )
}
