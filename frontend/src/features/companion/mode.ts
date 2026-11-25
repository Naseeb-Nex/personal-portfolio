// Companion Mode Detection & Preference Persistence
export type PixelMode = "3d" | "2d" | "off";

export function probeWebGL2(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    // Release context right away
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function isLowPowerDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) return true;
  if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 4) return true;
  return false;
}

export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.innerWidth <= 640
  );
}

export function isPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function resolvePixelMode(): PixelMode {
  if (typeof window === "undefined") return "2d";

  // 1. URL search override (?pixel=2d|3d|off)
  const params = new URLSearchParams(window.location.search);
  const param = params.get("pixel")?.toLowerCase();
  if (param === "2d" || param === "3d" || param === "off") {
    try {
      localStorage.setItem("pixel:mode", param);
    } catch {
      // ignore storage errors
    }
    return param as PixelMode;
  }

  // 2. LocalStorage persistence
  try {
    const saved = localStorage.getItem("pixel:mode");
    if (saved === "2d" || saved === "3d" || saved === "off") {
      return saved as PixelMode;
    }
  } catch {
    // ignore storage errors
  }

  // 3. Fallback logic:
  // - prefers-reduced-motion -> 2D
  if (isPrefersReducedMotion()) return "2d";

  // - WebGL2 missing -> 2D
  if (!probeWebGL2()) return "2d";

  // - Mobile (pointer: coarse or width <= 640px) -> 2D
  if (isMobileDevice()) return "2d";

  // - Low power (deviceMemory <= 4 or hardwareConcurrency <= 4) -> 2D
  if (isLowPowerDevice()) return "2d";

  // Default to 3D
  return "3d";
}

export function persistPixelMode(mode: PixelMode) {
  try {
    localStorage.setItem("pixel:mode", mode);
  } catch {
    // ignore
  }
}
