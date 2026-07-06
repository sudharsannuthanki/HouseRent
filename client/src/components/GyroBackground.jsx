import { useEffect } from "react";

function GyroBackground() {
  useEffect(() => {
    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function setGyro(x, y) {
      root.style.setProperty("--gyro-x", x.toFixed(3));
      root.style.setProperty("--gyro-y", y.toFixed(3));
    }

    // Desktop: mouse/pen movement
    function updatePointer(event) {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      setGyro(x, y);
    }

    // Mobile: finger drag across the screen (pointermove doesn't fire
    // for touch unless the finger is actively moving, so we listen to
    // touchmove directly for a responsive feel)
    function updateTouch(event) {
      const touch = event.touches[0];
      if (!touch) return;
      const x = (touch.clientX / window.innerWidth - 0.5) * 2;
      const y = (touch.clientY / window.innerHeight - 0.5) * 2;
      setGyro(x, y);
    }

    // Mobile fallback: subtle drift tied to scroll position, so the
    // background still feels alive even without any touch interaction
    function updateScroll() {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      const y = (progress - 0.5) * 2;
      root.style.setProperty("--gyro-scroll-y", y.toFixed(3));
    }

    if (prefersReducedMotion) {
      setGyro(0, 0);
      return;
    }

    window.addEventListener("pointermove", updatePointer);
    window.addEventListener("touchmove", updateTouch, { passive: true });
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    return () => {
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("touchmove", updateTouch);
      window.removeEventListener("scroll", updateScroll);
    };
  }, []);

  return (
    <div className="gyro-background" aria-hidden="true">
      <div className="gyro-photo-layer" />
      <div className="gyro-meteor-layer" />
      <div className="gyro-glow-layer" />
    </div>
  );
}

export default GyroBackground;
