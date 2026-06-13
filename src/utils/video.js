// Parses a YouTube or Twitch URL and returns embed info, or null if not recognised.
// Returns: { type, embedUrl, thumbnailUrl, label } or null
export function parseVideoUrl(raw) {
  if (!raw) return null
  const url = raw.trim()

  // YouTube — watch URLs and short youtu.be links
  const ytLong = url.match(/(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/)
  const ytShort = url.match(/youtu\.be\/([\w-]{11})/)
  const ytId = (ytLong || ytShort)?.[1]
  if (ytId) {
    const parent = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? window.location.hostname : 'localhost'
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      label: 'YouTube',
      parent,
    }
  }

  // Twitch channel — twitch.tv/channelname
  const twitchChannel = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)(?:\s|$|\/?)(?!videos|clips|clip)/)
  if (twitchChannel) {
    const parent = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? window.location.hostname : 'localhost'
    return {
      type: 'twitch',
      embedUrl: `https://player.twitch.tv/?channel=${twitchChannel[1]}&parent=${parent}`,
      thumbnailUrl: null,
      label: `Twitch — ${twitchChannel[1]}`,
      parent,
    }
  }

  // Twitch clip — clips.twitch.tv/ClipID or twitch.tv/*/clip/ClipID
  const twitchClip =
    url.match(/clips\.twitch\.tv\/([\w-]+)/) ||
    url.match(/twitch\.tv\/\w+\/clip\/([\w-]+)/)
  if (twitchClip) {
    const parent = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? window.location.hostname : 'localhost'
    return {
      type: 'twitch',
      embedUrl: `https://clips.twitch.tv/embed?clip=${twitchClip[1]}&parent=${parent}`,
      thumbnailUrl: null,
      label: `Twitch Clip`,
      parent,
    }
  }

  return null
}
