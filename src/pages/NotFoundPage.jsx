import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="rounded-xl border bg-white p-6 text-center">
        <p className="text-sm text-slate-500">Page not found</p>
        <Link to="/" className="mt-3 inline-block rounded-lg bg-slate-900 px-3 py-2 text-sm text-white">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
