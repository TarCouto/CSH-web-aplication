import Image, { type ImageProps } from 'next/image'
import clsx from 'clsx'

type ImagePropsWithOptionalAlt = Omit<ImageProps, 'alt'> & { alt?: string }

export function StylizedImage({
  shape: _shape,
  className,
  alt = 'Couto Software House project image',
  ...props
}: ImagePropsWithOptionalAlt & { shape?: 0 | 1 | 2 }) {
  return (
    <div
      className={clsx(
        className,
        'relative flex aspect-719/680 w-full',
      )}
    >
      <Image
        alt={alt}
        className="w-full rounded-3xl bg-neutral-100 object-cover grayscale"
        style={{ aspectRatio: '719 / 680' }}
        {...props}
      />
    </div>
  )
}
