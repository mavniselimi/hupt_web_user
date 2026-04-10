import { Link } from 'react-router-dom'
import { useT } from '@/i18n/useT'

export function NotFoundPage() {
  const { t } = useT()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <p className="text-5xl font-bold text-slate-200">404</p>
      <p className="mt-3 text-base font-medium text-slate-700">{t('common.notFound')}</p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700"
      >
        ← Home
      </Link>
    </div>
  )
}
