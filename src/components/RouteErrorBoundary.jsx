import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

export function RouteErrorBoundary() {
  const error = useRouteError()
  let message = 'Unexpected error while rendering page.'
  if (isRouteErrorResponse(error)) {
    message = `${error.status} ${error.statusText}`
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <Link to="/" className="mt-4 inline-block rounded-lg bg-slate-900 px-3 py-2 text-sm text-white">
          Go home
        </Link>
      </div>
    </div>
  )
}
