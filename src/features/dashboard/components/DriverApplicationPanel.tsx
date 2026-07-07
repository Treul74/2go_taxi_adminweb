import { Check, ExternalLink, FileText, Mail, Phone, X } from 'lucide-react'
import Avatar from '../../../components/ui/Avatar'
import SlideOver from '../../../components/ui/SlideOver'
import { formatDateTime } from '../../../lib/format'
import type { PendingDriverRow } from '../../../types/dashboard'

interface DriverApplicationPanelProps {
  driver: PendingDriverRow | null
  actionError: string | null
  isActioning: boolean
  onClose: () => void
  onApprove: (driverId: string) => void
  onReject: (driverId: string) => void
}

const VEHICLE_CLASS_LABEL: Record<string, string> = {
  economy: 'Economy',
  suv: 'SUV',
  luxury: 'Luxury',
  sprinter: 'Sprinter',
}

function DocumentLink({ label, url }: { label: string; url: string | null }) {
  return (
    <div className="flex items-center justify-between rounded-card border border-gray-100 p-3">
      <span className="flex items-center gap-2 text-sm text-primary">
        <FileText className="h-4 w-4 text-muted" />
        {label}
      </span>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm font-semibold text-accent no-underline hover:underline"
        >
          View
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : (
        <span className="text-xs font-semibold text-warning">Not provided</span>
      )}
    </div>
  )
}

export default function DriverApplicationPanel({
  driver,
  actionError,
  isActioning,
  onClose,
  onApprove,
  onReject,
}: DriverApplicationPanelProps) {
  const vehicleName = driver
    ? [driver.vehicleYear, driver.vehicleMake, driver.vehicleModel].filter(Boolean).join(' ')
    : ''

  return (
    <SlideOver
      open={Boolean(driver)}
      onClose={onClose}
      title="Driver Application"
      subtitle={driver ? `Applied on ${formatDateTime(driver.createdAt)}` : undefined}
      footer={
        driver && (
          <div className="flex flex-col gap-3">
            {actionError && <p className="text-xs font-semibold text-danger">{actionError}</p>}
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isActioning}
                onClick={() => onReject(driver.id)}
                className="flex flex-1 items-center justify-center gap-2 rounded-button border-0 bg-danger py-3 text-sm font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                {isActioning ? 'Saving…' : 'Reject'}
              </button>
              <button
                type="button"
                disabled={isActioning}
                onClick={() => onApprove(driver.id)}
                className="flex flex-1 items-center justify-center gap-2 rounded-button border-0 bg-success py-3 text-sm font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {isActioning ? 'Saving…' : 'Approve'}
              </button>
            </div>
          </div>
        )
      }
    >
      {driver && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            {driver.profilePhotoUrl ? (
              <a href={driver.profilePhotoUrl} target="_blank" rel="noopener noreferrer" aria-label="View profile photo">
                <Avatar name={`${driver.firstName} ${driver.lastName}`} photoUrl={driver.profilePhotoUrl} size={64} />
              </a>
            ) : (
              <Avatar name={`${driver.firstName} ${driver.lastName}`} photoUrl={null} size={64} />
            )}
            <div>
              <p className="text-lg font-bold text-primary">
                {driver.firstName} {driver.lastName}
              </p>
              <span className="mt-1 inline-block rounded-full bg-warning/10 px-3 py-0.5 text-xs font-bold text-warning">
                Pending Review
              </span>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Contact</p>
            <div className="flex flex-col gap-2 rounded-card border border-gray-100 p-4">
              <a
                href={`mailto:${driver.email}`}
                className="flex items-center gap-2 text-sm font-semibold text-primary no-underline hover:text-accent"
              >
                <Mail className="h-4 w-4 text-muted" />
                {driver.email}
              </a>
              <a
                href={`tel:${driver.phoneNumber}`}
                className="flex items-center gap-2 text-sm font-semibold text-primary no-underline hover:text-accent"
              >
                <Phone className="h-4 w-4 text-muted" />
                {driver.phoneNumber}
              </a>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Vehicle</p>
            <div className="flex flex-col gap-2 rounded-card border border-gray-100 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Vehicle</span>
                <span className="font-semibold text-primary">{vehicleName || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Class</span>
                <span className="font-semibold text-primary">
                  {VEHICLE_CLASS_LABEL[driver.vehicleClass] ?? driver.vehicleClass}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">License Plate</span>
                <span className="font-semibold text-primary">{driver.licensePlate ?? 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Documents</p>
            <div className="flex flex-col gap-2">
              <DocumentLink label="Driver's License" url={driver.driversLicenseUrl} />
              <DocumentLink label="Vehicle Registration" url={driver.vehicleRegistrationUrl} />
              <DocumentLink label="Insurance Certificate" url={driver.insuranceCertificateUrl} />
            </div>
          </div>
        </div>
      )}
    </SlideOver>
  )
}
