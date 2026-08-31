type DownloadButtonProps = {
  productId: string
  disabled?: boolean
  remaining?: number
}

export function DownloadButton({
  productId,
  disabled,
  remaining,
}: DownloadButtonProps) {
  if (disabled) {
    return (
      <span className="inline-flex rounded-full px-4 py-1.5 text-sm font-semibold bg-neutral-200 text-neutral-500">
        Limit reached
      </span>
    )
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <a
        href={`/api/download/${productId}`}
        className="inline-flex rounded-full px-4 py-1.5 text-sm font-semibold bg-neutral-950 text-white hover:bg-neutral-800 transition"
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
