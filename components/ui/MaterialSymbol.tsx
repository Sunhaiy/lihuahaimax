interface MaterialSymbolProps {
  icon: string
  className?: string
  size?: number
  fill?: boolean
  weight?: number
  opticalSize?: number
  grade?: number
  'aria-label'?: string
  'aria-hidden'?: boolean
}

export function MaterialSymbol({
  icon,
  className = '',
  size = 20,
  fill = false,
  weight = 500,
  opticalSize = 24,
  grade = 0,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden = true,
}: MaterialSymbolProps) {
  return (
    <span
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      className={`material-symbols-rounded inline-flex select-none align-middle leading-none ${className}`.trim()}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
      }}
    >
      {icon}
    </span>
  )
}
