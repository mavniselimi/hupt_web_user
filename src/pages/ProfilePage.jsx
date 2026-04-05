import { useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
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
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">My profile</h2>
        <dl className="mt-6 space-y-4 text-sm">
          <div className="flex flex-col gap-1 border-b border-slate-100 pb-4 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-slate-500">Name</dt>
            <dd className="font-medium text-slate-900">{profile?.name}</dd>
          </div>
          <div className="flex flex-col gap-1 border-b border-slate-100 pb-4 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-slate-500">Email</dt>
            <dd className="break-all font-medium text-slate-900">{profile?.email}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-slate-500">Role</dt>
            <dd className="font-medium text-slate-900">{profile?.role}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="text-center text-lg font-semibold text-slate-900">My QR Code</h3>
        <p className="mt-1 text-center text-sm text-slate-500">
          Show this code to event staff for check-in
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-4">
          {qrValue ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-inner">
              <QRCodeSVG value={qrValue} size={220} level="M" includeMargin />
            </div>
          ) : (
            <p className="text-center text-sm text-slate-500">User ID unavailable for QR code.</p>
          )}
        </div>
      </div>
    </section>
  )
}
