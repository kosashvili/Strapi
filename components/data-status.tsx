"use client"

interface DataStatusProps {
  isUsingFallback: boolean
}

export function DataStatus({ isUsingFallback }: DataStatusProps) {
  return (
    <div className="text-xs text-blue-400 text-center mb-4 p-2 bg-blue-900/20 border border-blue-800 rounded">
      {">"} Demo Mode: Showing sample projects (Admin panel uses local storage)
    </div>
  )
}
