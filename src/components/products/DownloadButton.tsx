import clsx from 'clsx'

type DownloadButtonProps = {
  productId: string
  disabled?: boolean
  remaining?: number
  className?: string
}

export function DownloadButton({
  productId,
  disabled,
  remaining,
  className,
}: DownloadButtonProps) {
  if (disabled) {
    return (
      <span
        className={clsx(
          'inline-flex rounded-full px-4 py-1.5 text-sm font-semibold bg-neutral-200 text-neutral-500',
          className,
        )}
      >
        Limit reached
      </span>
    )
  }

  return (
    <span className={clsx('inline-flex flex-col items-stretch gap-1 sm:items-start', className)}>
      <a
        href={`/api/download/${productId}`}
        className="inline-flex justify-center rounded-full px-4 py-1.5 text-sm font-semibold bg-neutral-950 text-white transition hover:bg-neutral-800 sm:w-auto"
      >
        Download
      </a>
      {remaining !== undefined && (
        <span className="text-xs text-neutral-500">
          {remaining} download{remaining === 1 ? '' : 's'} remaining
        </span>
      )}
    </span>
  )
}
