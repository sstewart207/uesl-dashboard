// Finds the first YouTube or Twitch URL in any string and returns it, or null.
export function extractVideoUrl(text) {
  if (!text) return null
  const match = text.match(/https?:\/\/(?:(?:www\.|m\.)?(?:youtube\.com|youtu\.be|twitch\.tv|clips\.twitch\.tv))[^\s"'<>]*/i)
  return match ? match[0] : null
}

// Parses a YouTube or Twitch URL and returns embed info, or null if not recognised.
// Returns: { type, embedUrl, thumbnailUrl, label } or null
export function parseVideoUrl(raw) {
  if (!raw) return null
  const url = raw.trim()

  const host = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? window.location.hostname : 'localhost'

  // YouTube — watch, short link, live, and shorts
  const ytWatch = url.match(/[?&]v=([\w-]{11})/)
  const ytShort = url.match(/youtu\.be\/([\w-]{11})/)
  const ytLive  = url.match(/youtube\.com\/live\/([\w-]{11})/)
  const ytShorts = url.match(/youtube\.com\/shorts\/([\w-]{11})/)
  const ytId = (ytWatch || ytShort || ytLive || ytShorts)?.[1]
  if (ytId) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      label: 'YouTube',
      parent: host,
    }
  }

  // Twitch VOD — twitch.tv/videos/ID (must be before channel match)
  const twitchVod = url.match(/twitch\.tv\/videos\/(\d+)/)
  if (twitchVod) {
    return {
      type: 'twitch',
      embedUrl: `https://player.twitch.tv/?video=${twitchVod[1]}&parent=${host}`,
      thumbnailUrl: null,
      label: 'Twitch VOD',
      parent: host,
    }
  }

  // Twitch clip — clips.twitch.tv/ID or twitch.tv/*/clip/ID (must be before channel match)
  const twitchClip =
    url.match(/clips\.twitch\.tv\/([\w-]+)/) ||
    url.match(/twitch\.tv\/\w+\/clip\/([\w-]+)/)
  if (twitchClip) {
    return {
      type: 'twitch',
      embedUrl: `https://clips.twitch.tv/embed?clip=${twitchClip[1]}&parent=${host}`,
      thumbnailUrl: null,
      label: 'Twitch Clip',
      parent: host,
    }
  }

  // Twitch live channel — twitch.tv/channelname (catches anything left)
  const twitchChannel = url.match(/(?:www\.|m\.)?twitch\.tv\/([a-zA-Z0-9_]+)\/?$/)
  if (twitchChannel) {
    return {
      type: 'twitch',
      embedUrl: `https://player.twitch.tv/?channel=${twitchChannel[1]}&parent=${host}`,
      thumbnailUrl: null,
      label: `Twitch — ${twitchChannel[1]}`,
      parent: host,
    }
  }

  return null
}
