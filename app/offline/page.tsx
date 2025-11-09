"use client"

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="text-center">
        <div className="mb-4 text-6xl">📡</div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900">You're Offline</h1>
        <p className="mb-6 text-slate-600">
          Your device is not connected to the internet. Don't worry, your work is being saved locally and will sync when
          you reconnect.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
