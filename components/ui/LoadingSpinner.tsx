export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="relative w-16 h-16">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-[rgb(var(--primary))/20 rounded-full" />
        {/* Spinning ring */}
        <div className="absolute inset-0 border-4 border-transparent border-t-[rgb(var(--primary))] rounded-full animate-spin" />
        {/* Inner pulse */}
        <div className="absolute inset-3 bg-[rgb(var(--primary))] rounded-full animate-pulse opacity-50" />
      </div>
    </div>
  )
} 