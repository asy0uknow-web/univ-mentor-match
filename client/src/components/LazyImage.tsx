import { memo, useState, useEffect, useRef } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  onLoad?: () => void;
}

export const LazyImage = memo(function LazyImage({
  src,
  alt,
  className = "",
  width,
  height,
  placeholder,
  onLoad,
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(placeholder || "");
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = src;
            img.onload = () => {
              setIsLoaded(true);
              onLoad?.();
            };
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: "50px",
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, onLoad]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${
        isLoaded ? "opacity-100" : "opacity-50"
      } ${className}`}
      width={width}
      height={height}
    />
  );
});

LazyImage.displayName = "LazyImage";
