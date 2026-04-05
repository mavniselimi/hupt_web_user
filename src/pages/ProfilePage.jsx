import { useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { UserAvatar } from '@/components/UserAvatar'
import { profileService } from '@/features/profile/profileService'
import { useAuthStore } from '@/store/authStore'
import { ErrorState, LoadingState } from '@/components/PageState'

export function ProfilePage() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await profileService.me()
        setProfile(data)
      } catch {
        setError('Unable to load profile.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const userId = profile?.id ?? profile?.userId ?? user?.id
  const qrValue = useMemo(() => (userId != null ? `USER:${userId}` : ''), [userId])

  if (loading) return <LoadingState message="Loading profile..." />
  if (error) return <ErrorState message={error} />

  return (
    <section className="mx-auto flex max-w-lg flex-col gap-4 p-1">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-slate-100 to-slate-50 px-4 pb-8 pt-6 sm:px-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <UserAvatar size="lg" className="ring-4 ring-white shadow-md" />
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">{profile?.name}</h2>
              <p className="mt-1 text-sm text-slate-600">{profile?.role}</p>
            </div>
          </div>
        </div>
        <dl className="space-y-0 px-4 py-4 text-sm sm:px-6">
          <div className="flex flex-col gap-1 border-b border-slate-100 py-3 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-slate-500">Email</dt>
            <dd className="break-all font-medium text-slate-900">{profile?.email}</dd>
          </div>
          <div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-slate-500">Role</dt>
            <dd className="font-medium text-slate-900">{profile?.role}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="text-center text-lg font-semibold text-slate-900">My QR Code</h3>
        <p className="mt-1 text-center text-sm text-slate-500">
          Show this code to staff for event check-in
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-4">
          {qrValue ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-inner">
              <QRCodeSVG value={qrValue} size={220} level="M" includeMargin />
            </div>
          ) : (
            <p className="text-center text-sm text-slate-500">
              We couldn&apos;t build a check-in code because your user ID isn&apos;t available. Try signing
              in again or contact support.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
