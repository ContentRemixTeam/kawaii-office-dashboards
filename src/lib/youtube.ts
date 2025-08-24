export function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1);
    }
    if (u.searchParams.get("v")) {
      return u.searchParams.get("v");
    }
    const match = u.pathname.match(/\/embed\/([^/?#]+)/);
    return match?.[1] || null;
  } catch {
    return null;
  }
}

export function buildEmbedSrc(url: string, opts?: { autoplay?: 0|1, mute?: 0|1, loop?: 0|1 }) {
  const id = getYouTubeId(url);
  if (!id) return "";
  
  const autoplay = opts?.autoplay ?? 1;
  const mute = opts?.mute ?? 1;
  const loop = opts?.loop ?? 1;
  
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=${autoplay}&mute=${mute}&controls=0&loop=${loop}&modestbranding=1&playsinline=1&rel=0&playlist=${id}`;
}