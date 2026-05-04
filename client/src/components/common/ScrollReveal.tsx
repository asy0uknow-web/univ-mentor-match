import { useEffect, useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 600,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      ref.current.classList.add("opacity-0", "translate-y-8", "transition-all");
      ref.current.style.transitionDuration = `${duration}ms`;
      ref.current.style.transitionDelay = `${delay}ms`;
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay, duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
