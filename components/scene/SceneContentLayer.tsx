interface SceneContentLayerProps {
  children: React.ReactNode
  className?: string
}

export function SceneContentLayer({ children, className = '' }: SceneContentLayerProps) {
  return (
    <div className={`relative z-10 ${className}`.trim()}>
      {children}
    </div>
  )
}
