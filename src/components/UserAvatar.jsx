import { PROFILE_AVATAR_URL } from '@/constants/profileAssets'

const SIZES = {
  sm: 'h-9 w-9 min-h-[36px] min-w-[36px]',
  md: 'h-16 w-16',
  lg: 'h-24 w-24 sm:h-28 sm:w-28',
}

export function UserAvatar({ size = 'md', className = '' }) {
  return (
    <img
      src={PROFILE_AVATAR_URL}
      alt=""
      className={`rounded-full object-cover ring-2 ring-white ${SIZES[size] ?? SIZES.md} ${className}`}
    />
  )
}
