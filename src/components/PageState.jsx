export function LoadingState({ message = 'Loading...' }) {
  return <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">{message}</div>
}

export function EmptyState({ message = 'No data found.' }) {
  return <div className="rounded-xl border bg-white p-4 text-sm text-slate-500">{message}</div>
}

export function ErrorState({ message = 'Something went wrong.' }) {
  return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>
}
