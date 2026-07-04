const PALETTE = ['#26344F', '#FE5035', '#00A67D', '#7C5CFC', '#0EA5E9', '#D97706']

function colorForName(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

interface AvatarProps {
  name: string
  photoUrl?: string | null
  size?: number
}

export default function Avatar({ name, photoUrl, size = 40 }: AvatarProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <span
      className="flex items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, backgroundColor: colorForName(name), fontSize: size * 0.4 }}
    >
      {initials || '?'}
    </span>
  )
}
