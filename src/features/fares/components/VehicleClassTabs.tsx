import { Bike, Car, Caravan, Star, Truck, type LucideIcon } from 'lucide-react'
import Card from '../../../components/ui/Card'
import Skeleton from '../../../components/ui/Skeleton'
import type { VehicleClassRow } from '../../../types/vehicleClasses'

const NAME_ICON_FALLBACK: Record<string, LucideIcon> = {
  economy: Car,
  comfort: Star,
  bike: Bike,
  tricycle: Caravan,
  truck: Truck,
}

function iconForClass(name: string): LucideIcon {
  return NAME_ICON_FALLBACK[name.trim().toLowerCase()] ?? Car
}

interface VehicleClassTabsProps {
  classes: VehicleClassRow[]
  isLoading: boolean
  activeClassId: string | null
  onSelect: (id: string) => void
}

export default function VehicleClassTabs({ classes, isLoading, activeClassId, onSelect }: VehicleClassTabsProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex gap-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-20" />
          ))}
        </div>
      </Card>
    )
  }

  if (classes.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-muted">
        No vehicle classes yet. Add one on the Vehicle Classes screen first.
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center gap-2">
        {classes.map((vehicleClass) => {
          const isActive = vehicleClass.id === activeClassId
          const Icon = iconForClass(vehicleClass.name)
          return (
            <button
              key={vehicleClass.id}
              type="button"
              onClick={() => onSelect(vehicleClass.id)}
              className={`flex min-w-[7rem] flex-1 flex-col items-center gap-2 rounded-lg border-0 px-4 py-3 text-center transition ${
                isActive ? 'bg-orange-50 text-accent' : 'bg-transparent text-muted hover:bg-gray-50'
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center">
                {vehicleClass.iconSvgUrl ? (
                  <img src={vehicleClass.iconSvgUrl} alt="" className="h-6 w-6" />
                ) : (
                  <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                )}
              </span>
              <span
                className={`text-xs font-bold uppercase tracking-wide ${isActive ? 'border-b-2 border-accent pb-2' : ''}`}
              >
                {vehicleClass.name}
              </span>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
