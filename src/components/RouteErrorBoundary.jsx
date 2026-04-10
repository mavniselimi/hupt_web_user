import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'
import { useT } from '@/i18n/useT'

export function RouteErrorBoundary() {
  const { t } = useT()
  const error = useRouteError()

  let message = t('common.error')
  if (isRouteErrorResponse(error)) {
    message = `${error.status} ${error.statusText}`
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 mx-auto">
          <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-slate-900">{t('common.error')}</h2>
        <p className="mt-1 text-sm text-slate-500">{message}</p>
        <Link
          to="/"
          className="mt-5 flex min-h-[44px] items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700"
        >
          ← Home
        </Link>
      </div>
    </div>
  )
}
