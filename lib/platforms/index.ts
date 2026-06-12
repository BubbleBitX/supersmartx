// Platform definitions and generation guidance for each destination.

export type PlatformSlug =
  | "linkedin" | "twitter" | "threads" | "instagram"
  | "reddit" | "producthunt" | "indiehackers" | "hackernews"
  | "github" | "devto" | "discord" | "substack";

export type OutputType =
  | "caption"
  | "graphic"
  | "title"
  | "body"
  | "tagline"
  | "description"
  | "outline"
  | "announcement";

export type TextOutputType = Exclude<OutputType, "graphic">;

export interface PlatformRules {
  tone: string;
  maxLength?: number;
  minLength?: number;
  hashtagCount?: number;
  emojiUsage: "none" | "minimal" | "moderate" | "heavy";
  style: string[];
  avoid: string[];
  includeMetrics: boolean;
  primaryTextOutput?: TextOutputType;
  fieldLimits?: Partial<Record<TextOutputType, number>>;
  limitNote?: string;
}

export interface Platform {
  slug: PlatformSlug;
  label: string;
  icon: string;
  color: string;
  description: string;
  outputTypes: OutputType[];
  rules: PlatformRules;
}

export const PLATFORMS: Platform[] = [
  {
    slug: "linkedin",
    label: "LinkedIn",
    icon: "💼",
    color: "#0077b5",
    description: "Professional feed post plus graphic",
    outputTypes: ["caption", "graphic"],
    rules: {
      tone: "Professional, story-driven, and authentic",
      minLength: 300,
      maxLength: 1200,
      hashtagCount: 4,
      emojiUsage: "minimal",
      primaryTextOutput: "caption",
      fieldLimits: { caption: 1200 },
      limitNote: "A fuller story usually performs better here than a one-line update.",
      style: [
        "Start with a hook",
        "Tell the story behind the achievement",
        "End with a forward-looking statement",
        "Add 3-5 relevant hashtags",
      ],
      avoid: [
        "Clickbait headlines",
        "Excessive emojis",
        "Self-congratulatory tone without substance",
      ],
      includeMetrics: true,
    },
  },
  {
    slug: "twitter",
    label: "Twitter / X",
    icon: "𝕏",
    color: "#000000",
    description: "Short post plus graphic",
    outputTypes: ["caption", "graphic"],
    rules: {
      tone: "Short, punchy, and direct",
      maxLength: 280,
      hashtagCount: 2,
      emojiUsage: "moderate",
      primaryTextOutput: "caption",
      fieldLimits: { caption: 280 },
      limitNote: "Using a safe 280-character default. Premium accounts can post longer.",
      style: [
        "Lead with the win",
        "One sentence max per idea",
        "Strong CTA at the end",
      ],
      avoid: ["Long sentences", "Jargon", "More than 2 hashtags"],
      includeMetrics: true,
    },
  },
  {
    slug: "threads",
    label: "Threads",
    icon: "🧵",
    color: "#000000",
    description: "Conversational caption",
    outputTypes: ["caption"],
    rules: {
      tone: "Conversational, personal, and authentic",
      maxLength: 500,
      hashtagCount: 0,
      emojiUsage: "moderate",
      primaryTextOutput: "caption",
      fieldLimits: { caption: 500 },
      style: [
        "Casual and personal",
        "Like texting a friend about good news",
        "No hashtags needed",
      ],
      avoid: ["Hashtags", "Corporate language", "Overly formal tone"],
      includeMetrics: false,
    },
  },
  {
    slug: "instagram",
    label: "Instagram",
    icon: "📸",
    color: "#e1306c",
    description: "Visual caption plus feed graphic",
    outputTypes: ["caption", "graphic"],
    rules: {
      tone: "Aspirational, personal, and visual",
      maxLength: 2000,
      hashtagCount: 10,
      emojiUsage: "heavy",
      primaryTextOutput: "caption",
      fieldLimits: { caption: 2000 },
      limitNote: "Keep the lead strong and move extra hashtags to the end if needed.",
      style: [
        "Open with emotion or a hook",
        "Use line breaks for readability",
        "Tell the story visually in words",
        "Close with a light CTA",
      ],
      avoid: ["Dry corporate language", "Dense hashtag blocks at the top"],
      includeMetrics: false,
    },
  },
  {
    slug: "reddit",
    label: "Reddit",
    icon: "🤖",
    color: "#ff4500",
    description: "Discussion title plus body",
    outputTypes: ["title", "body"],
    rules: {
      tone: "Honest, discussion-focused, and community-driven",
      maxLength: 2000,
      hashtagCount: 0,
      emojiUsage: "none",
      primaryTextOutput: "body",
      fieldLimits: { title: 300, body: 2000 },
      style: [
        "Lead with the most interesting insight",
        "Be honest about failures and challenges",
        "Invite discussion with a closing question",
      ],
      avoid: ["Marketing language", "Self-promotion without value", "Hype", "Emojis"],
      includeMetrics: true,
    },
  },
  {
    slug: "producthunt",
    label: "Product Hunt",
    icon: "🐱",
    color: "#da552f",
    description: "Tagline, launch description, and graphic",
    outputTypes: ["tagline", "description", "graphic"],
    rules: {
      tone: "Benefit-focused, concise, and launch-ready",
      maxLength: 300,
      hashtagCount: 0,
      emojiUsage: "none",
      primaryTextOutput: "description",
      fieldLimits: { tagline: 60, description: 260 },
      limitNote: "Keep the tagline crisp and let the description explain the value.",
      style: [
        "Lead with user benefit, not features",
        "Use active voice",
        "Mention the problem and solution",
      ],
      avoid: ["Superlatives like 'best' or 'revolutionary'", "Jargon", "Feature stuffing"],
      includeMetrics: false,
    },
  },
  {
    slug: "indiehackers",
    label: "Indie Hackers",
    icon: "⚒️",
    color: "#0070f3",
    description: "Milestone write-up",
    outputTypes: ["body"],
    rules: {
      tone: "Builder-minded, reflective, and metrics-aware",
      maxLength: 1500,
      hashtagCount: 0,
      emojiUsage: "minimal",
      primaryTextOutput: "body",
      fieldLimits: { body: 1500 },
      style: [
        "Lead with the milestone",
        "Share what worked and what did not",
        "Explain what comes next",
      ],
      avoid: ["Vague statements without numbers", "Bragging without lessons", "Self-promotional fluff"],
      includeMetrics: true,
    },
  },
  {
    slug: "hackernews",
    label: "Hacker News",
    icon: "🔶",
    color: "#ff6600",
    description: "Show HN title plus technical body",
    outputTypes: ["title", "body"],
    rules: {
      tone: "Technical, plainspoken, and no-hype",
      maxLength: 1000,
      hashtagCount: 0,
      emojiUsage: "none",
      primaryTextOutput: "body",
      fieldLimits: { title: 80, body: 1000 },
      limitNote: "Keep the title plain and let the body handle the implementation details.",
      style: [
        "Start with 'Show HN:' for launches",
        "Be precise about implementation or constraints",
        "Be honest about tradeoffs",
      ],
      avoid: ["Marketing language", "Hype", "Emojis", "Superlatives", "Vague claims"],
      includeMetrics: true,
    },
  },
  {
    slug: "github",
    label: "GitHub",
    icon: "🐙",
    color: "#333333",
    description: "Repo summary plus release notes",
    outputTypes: ["description", "body"],
    rules: {
      tone: "Technical, factual, and documentation-style",
      maxLength: 1200,
      hashtagCount: 0,
      emojiUsage: "minimal",
      primaryTextOutput: "body",
      fieldLimits: { description: 160, body: 1200 },
      limitNote: "Use the short description like a repo summary and keep the body scannable.",
      style: [
        "Start with a one-line summary",
        "List key capabilities or changes with bullets",
        "Mention setup, usage, or stack when relevant",
      ],
      avoid: ["Marketing language", "Vague benefits", "First-person storytelling"],
      includeMetrics: false,
    },
  },
  {
    slug: "devto",
    label: "Dev.to",
    icon: "👩‍💻",
    color: "#0a0a0a",
    description: "Article outline",
    outputTypes: ["outline"],
    rules: {
      tone: "Developer-focused, educational, and practical",
      maxLength: 2000,
      hashtagCount: 4,
      emojiUsage: "minimal",
      primaryTextOutput: "outline",
      fieldLimits: { outline: 2000 },
      style: [
        "Start with a relatable problem",
        "Break the post into practical sections",
        "End with takeaways or next steps",
      ],
      avoid: ["Filler content", "Paywalls", "Overly promotional content"],
      includeMetrics: true,
    },
  },
  {
    slug: "discord",
    label: "Discord",
    icon: "🎮",
    color: "#5865f2",
    description: "Community announcement",
    outputTypes: ["announcement"],
    rules: {
      tone: "Short, friendly, and community-first",
      maxLength: 500,
      hashtagCount: 0,
      emojiUsage: "moderate",
      primaryTextOutput: "announcement",
      fieldLimits: { announcement: 500 },
      style: [
        "Keep it short",
        "Be warm and community-oriented",
        "Tag roles only when it adds value",
      ],
      avoid: ["Long walls of text", "Corporate language", "Overuse of @everyone"],
      includeMetrics: false,
    },
  },
  {
    slug: "substack",
    label: "Substack",
    icon: "📓",
    color: "#ff6719",
    description: "Newsletter draft",
    outputTypes: ["body"],
    rules: {
      tone: "Long-form, personal, and reflective",
      minLength: 300,
      maxLength: 3000,
      hashtagCount: 0,
      emojiUsage: "none",
      primaryTextOutput: "body",
      fieldLimits: { body: 3000 },
      style: [
        "Open with a personal moment or story",
        "Build tension before the reveal",
        "Share lessons and insights",
        "End with a question for readers",
      ],
      avoid: ["Bullet-point lists without narrative", "Corporate tone", "Rushed conclusions"],
      includeMetrics: true,
    },
  },
];

export const DEFAULT_PLATFORMS: PlatformSlug[] = ["linkedin", "twitter"];

export function getPlatform(slug: PlatformSlug): Platform {
  return PLATFORMS.find((platform) => platform.slug === slug)!;
}

export const VOICE_OPTIONS = [
  { key: "professional", label: "Professional", hint: "Polished, formal, career-oriented" },
  { key: "founder", label: "Founder", hint: "Raw, builder mindset, metrics-driven" },
  { key: "creator", label: "Creator", hint: "Personal, warm, community-first" },
  { key: "student", label: "Student", hint: "Grateful, ambitious, journey-focused" },
  { key: "developer", label: "Developer", hint: "Technical, precise, hype-free" },
  { key: "executive", label: "Executive", hint: "Authoritative, strategic, impact-driven" },
] as const;
export type Voice = typeof VOICE_OPTIONS[number]["key"];

export const MOOD_OPTIONS = [
  { key: "achievement", label: "Achievement", hint: "Celebrate a milestone clearly" },
  { key: "launch", label: "Launch", hint: "Focus on debut energy and momentum" },
  { key: "growth", label: "Growth", hint: "Reflect on progress and lessons" },
  { key: "community", label: "Community", hint: "Center people and collaboration" },
  { key: "educational", label: "Educational", hint: "Highlight learnings and takeaways" },
] as const;
export type Mood = typeof MOOD_OPTIONS[number]["key"];
