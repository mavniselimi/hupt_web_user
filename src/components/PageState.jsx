import { useT } from '@/i18n/useT'

export function LoadingState({ message }) {
  const { t } = useT()
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-500">
      <svg className="h-4 w-4 animate-spin text-indigo-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      {message ?? t('common.loading')}
    </div>
  )
}

export function EmptyState({ message }) {
  const { t } = useT()
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-white p-5 text-center text-sm text-slate-400">
      {message ?? t('common.noData')}
    </div>
  )
}

export function ErrorState({ message }) {
  const { t } = useT()
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {message ?? t('common.error')}
    </div>
  )
}
