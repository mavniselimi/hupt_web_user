import { useEffect, useState } from 'react'
import { profileService } from '@/features/profile/profileService'
import { ErrorState, LoadingState } from '@/components/PageState'

export function ProfilePage() {
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

  if (loading) return <LoadingState message="Loading profile..." />
  if (error) return <ErrorState message={error} />

  return (
    <section className="max-w-xl rounded-xl border bg-white p-4">
      <h2 className="text-xl font-semibold">My Profile</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4 border-b pb-2">
          <dt className="text-slate-500">Name</dt>
          <dd className="font-medium">{profile?.name}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b pb-2">
          <dt className="text-slate-500">Email</dt>
          <dd className="font-medium">{profile?.email}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Role</dt>
          <dd className="font-medium">{profile?.role}</dd>
        </div>
      </dl>
    </section>
  )
}
