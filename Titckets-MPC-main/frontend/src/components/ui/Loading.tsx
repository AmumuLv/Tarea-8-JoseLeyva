import { Loader2 } from 'lucide-react'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

export default function Loading({ size = 'md', fullScreen = false }: LoadingProps) {
  const spinner = (
    <Loader2 className={`animate-spin text-blue-600 ${sizeClasses[size]}`} />
  )

  if (fullScreen) {
    return (
      <div className="flex h-screen items-center justify-center">
        {spinner}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  )
}
