import React, { useEffect, useRef, useState } from 'react'

interface LazyVideoPlayerProps {
  videoSrc?: string; 
}

function LazyVideoPlayer({ videoSrc = "/video/litra-video.mp4" }: LazyVideoPlayerProps) {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const currentContainerRef = containerRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        
      
        if (videoRef.current) {
          if (entry.isIntersecting) {
            videoRef.current.play().catch(console.error);
          } else {
            videoRef.current.pause();
          }
        }
      }, 
      { 
        threshold: 0.3, 
        rootMargin: "50px" 
      }
    );

    if (currentContainerRef) {
      observer.observe(currentContainerRef);
    }

    return () => {
      if (currentContainerRef) {
        observer.unobserve(currentContainerRef);
      }
    }
  }, []);

  // Handle video loaded event
  const handleVideoLoaded = () => {
    if (videoRef.current && isInView) {
      videoRef.current.play().catch(console.error);
    }
  };

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {isInView ? (
        <video
          ref={videoRef}
          src={videoSrc}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={handleVideoLoaded}
          onError={(e) => console.error('Video loading error:', e)}
        />
      ) : (
        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
          <div className="text-gray-500">Loading video...</div>
        </div>
      )}
    </div>
  );
}

export default LazyVideoPlayer