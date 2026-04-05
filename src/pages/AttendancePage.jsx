import { useEffect, useState } from 'react'
import { attendanceService } from '@/features/attendance/attendanceService'
import { formatDateTime } from '@/utils/formatters'
import { EmptyState, ErrorState, LoadingState } from '@/components/PageState'
import { useToast } from '@/hooks/useToast'

export function AttendancePage() {
  const toast = useToast()
  const [form, setForm] = useState({ sessionId: '', qrKey: '' })
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAttendance = async () => {
    setLoading(true)
    try {
      const data = await attendanceService.myAttendanceList()
      setAttendance(data)
    } catch {
      setError('Unable to load attendance.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAttendance()
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await attendanceService.submit({ sessionId: Number(form.sessionId), qrKey: form.qrKey })
      toast.show('Attendance submitted.')
      setForm({ sessionId: '', qrKey: '' })
      loadAttendance()
    } catch {
      toast.show('Attendance submission failed.', 'error')
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Attendance</h2>
      <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-3">
        <input
          type="number"
          placeholder="Session ID"
          value={form.sessionId}
          onChange={(e) => setForm((prev) => ({ ...prev, sessionId: e.target.value }))}
          className="rounded-lg border px-3 py-2 text-sm"
          required
        />
        <input
          type="text"
          placeholder="QR Key"
          value={form.qrKey}
          onChange={(e) => setForm((prev) => ({ ...prev, qrKey: e.target.value }))}
          className="rounded-lg border px-3 py-2 text-sm"
          required
        />
        <button className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white">Submit</button>
      </form>

      {loading && <LoadingState message="Loading attendance history..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && !attendance.length && <EmptyState message="No attendance records yet." />}
      {!loading && !error && attendance.length > 0 && (
        <div className="space-y-2">
          {attendance.map((item) => (
            <div key={item.id} className="rounded-xl border bg-white p-4">
              <p className="font-medium">{item.sessionTitle}</p>
              <p className="text-xs text-slate-500">{formatDateTime(item.attendedAt)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
