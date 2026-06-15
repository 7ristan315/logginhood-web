// Social platforms users can link from their profile, and how to build a
// share/compose URL for each (where the platform supports one).

export const SOCIAL_PLATFORMS = [
  {
    key: "instagram",
    label: "Instagram",
    icon: "📷",
    placeholder: "https://instagram.com/yourhandle",
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: "📘",
    placeholder: "https://facebook.com/yourpage",
    shareUrl: (text) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://logginhood.com")}&quote=${encodeURIComponent(text)}`,
  },
  {
    key: "x",
    label: "X (Twitter)",
    icon: "✖️",
    placeholder: "https://x.com/yourhandle",
    shareUrl: (text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
  },
  {
    key: "strava",
    label: "Strava",
    icon: "🏃",
    placeholder: "https://strava.com/athletes/yourid",
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: "🎵",
    placeholder: "https://tiktok.com/@yourhandle",
  },
];

export function socialPlatform(key) {
  return SOCIAL_PLATFORMS.find((p) => p.key === key);
}
