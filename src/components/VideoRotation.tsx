import clsx from 'clsx';
import LazyVideoPlayer from './LazyVideoPlayer';

const MASK_CLASSES =
  "[mask-image:url(/video-mask.png)] [mask-mode:alpha] [mask-position:center_center] [mask-repeat:no-repeat] [mask-size:80%_auto]";

export function VideoRotation() {
  return (
    <section className='bg-muted relative overflow-hidden'>
      <h2 className='sr-only'>Platform showcase video</h2>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-b from-primary/10 to-accent/10" />

      <div className="relative aspect-video">

        <div
          className={clsx(
            MASK_CLASSES,
            "bg-primary/20 absolute h-[10vh] top-0 lg:top-10"
          )}
        />

        <div
          className={clsx(
            MASK_CLASSES,
            "bg-primary/30 absolute inset-0 h-full top-2 sm:top-6 md:top-2 xl:top-4"
          )}
        />

        <div
          className={clsx(
            MASK_CLASSES,
            "bg-primary/40 absolute inset-0"
          )}
        />

        <div className={clsx(MASK_CLASSES, "relative h-full")}>
          <LazyVideoPlayer videoSrc="/stacks-intro.mp4" />

          <img
            src="/image-texture.png"
            alt=""
            className="pointer-events-none object-cover opacity-30 absolute inset-0 w-full h-full mix-blend-overlay"
          />
          
          {/* Accent glow effect */}
          <div className="absolute inset-0 bg-accent/5 mix-blend-screen pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
