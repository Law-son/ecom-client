import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getProfilingStatus, startProfiling, stopProfiling } from '../api/profiling'

function ProfilingPage() {
  const [durationSeconds, setDurationSeconds] = useState(60)
  const [settings, setSettings] = useState('profile')
  const [fileName, setFileName] = useState('')

  const { data: status, refetch } = useQuery({
    queryKey: ['profiling-status'],
    queryFn: getProfilingStatus,
    refetchInterval: 5000,
  })

  const startMutation = useMutation({
    mutationFn: (params) => startProfiling(params),
    onSuccess: () => refetch(),
  })

  const stopMutation = useMutation({
    mutationFn: (params) => stopProfiling(params),
    onSuccess: () => refetch(),
  })

  const handleStart = () => {
    startMutation.mutate({ durationSeconds, settings })
  }

  const handleStop = () => {
    stopMutation.mutate(fileName ? { fileName } : {})
  }

  const isRecording = status?.recording || status?.isRecording

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">JFR Profiling</h1>
        <p className="mt-2 text-sm text-slate-600">
          Java Flight Recorder profiling for performance analysis
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Status</h2>
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Recording:</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                isRecording
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isRecording ? 'Active' : 'Inactive'}
            </span>
          </div>
          {status?.outputDir && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Output Directory:</span>
              <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                {status.outputDir}
              </code>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Start Recording</h2>
        <div className="mt-4 space-y-4">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Duration (seconds)
            <input
              type="number"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(Number(e.target.value))}
              min="1"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Settings
            <select
              value={settings}
              onChange={(e) => setSettings(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="default">default</option>
              <option value="profile">profile</option>
            </select>
          </label>
          <button
            onClick={handleStart}
            disabled={isRecording || startMutation.isPending}
            className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {startMutation.isPending ? 'Starting...' : 'Start Recording'}
          </button>
          {startMutation.isError && (
            <p className="text-sm text-rose-600">{startMutation.error?.message}</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Stop Recording</h2>
        <div className="mt-4 space-y-4">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            File Name (optional)
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g. checkout-load.jfr"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <button
            onClick={handleStop}
            disabled={!isRecording || stopMutation.isPending}
            className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {stopMutation.isPending ? 'Stopping...' : 'Stop Recording'}
          </button>
          {stopMutation.isError && (
            <p className="text-sm text-rose-600">{stopMutation.error?.message}</p>
          )}
          {stopMutation.isSuccess && (
            <p className="text-sm text-green-600">Recording stopped successfully</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilingPage
