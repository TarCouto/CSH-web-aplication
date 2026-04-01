import Image, { type ImageProps } from 'next/image'

export function GrayscaleTransitionImage(
  props: Pick<
    ImageProps,
    'src' | 'quality' | 'className' | 'sizes' | 'priority'
  > & { alt?: string },
) {
  return (
    <div className="group relative">
      <Image
        alt={props.alt || 'Couto Software House case study'}
        {...props}
        className={`${props.className ?? ''} grayscale transition duration-500 hover:grayscale-0`}
      />
    </div>
  )
}
