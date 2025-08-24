export type YTTarget =
  | { kind: "video"; id: string }
  | { kind: "playlist"; list: string };

export function parseYouTubeTarget(url: string): YTTarget | null {
  try {
    const u = new URL(url.trim());

    // Playlist (works with watch?list=..., /playlist?list=..., etc.)
    const list = u.searchParams.get("list");
    if (list) return { kind: "playlist", list };

    // youtu.be/<id>
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace(/^\/+/, "").split("/")[0];
      return id ? { kind: "video", id } : null;
    }

    // youtube.com/watch?v=<id>
    const v = u.searchParams.get("v");
    if (v) return { kind: "video", id: v };

    // /embed/<id>
    let m = u.pathname.match(/\/embed\/([^/?#]+)/);
    if (m?.[1]) return { kind: "video", id: m[1] };

    // /live/<id>
    m = u.pathname.match(/\/live\/([^/?#]+)/);
    if (m?.[1]) return { kind: "video", id: m[1] };

    // /shorts/<id>
    m = u.pathname.match(/\/shorts\/([^/?#]+)/);
    if (m?.[1]) return { kind: "video", id: m[1] };

    return null;
  } catch {
    return null;
  }
}

export function buildEmbedSrc(inputUrl: string, opts?: { autoplay?: 0|1; mute?: 0|1; loop?: 0|1 }) {
  const t = parseYouTubeTarget(inputUrl);
  if (!t) return "";

  const ap = opts?.autoplay ?? 1;
  const mt = opts?.mute ?? 1;
  const lp = opts?.loop ?? 1;

  if (t.kind === "playlist") {
    // Privacy-enhanced domain; videoseries is required for playlists.
    const base = "https://www.youtube-nocookie.com/embed/videoseries";
    return `${base}?list=${encodeURIComponent(t.list)}&autoplay=${ap}&mute=${mt}&loop=${lp}&controls=0&modestbranding=1&playsinline=1&rel=0`;
  } else {
    const base = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(t.id);
    // For looping single video, YouTube requires playlist=<same id>
    return `${base}?autoplay=${ap}&mute=${mt}&loop=${lp}&playlist=${encodeURIComponent(t.id)}&controls=0&modestbranding=1&playsinline=1&rel=0`;
  }
}

// Legacy function for backward compatibility
export function getYouTubeId(url: string): string | null {
  const target = parseYouTubeTarget(url);
  return target?.kind === "video" ? target.id : null;
}