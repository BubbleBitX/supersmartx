import { EventType, interpolate } from "../events/categories";
import { Platform, TextOutputType, Voice, Mood } from "./index";

export interface CaptionInput {
  event: EventType;
  values: Record<string, string>;
  platform: Platform;
  voice: Voice;
  mood: Mood;
}

export type PlatformContent = Partial<Record<TextOutputType, string>>;

export interface CaptionOutput {
  platform: string;
  outputs: PlatformContent;
  primaryOutput: TextOutputType;
}

function truncateAtWordBoundary(value: string, limit?: number): string {
  if (!limit || value.length <= limit) return value;
  const clipped = value.slice(0, Math.max(0, limit - 1));
  const boundary = clipped.lastIndexOf(" ");
  const base = boundary > Math.floor(limit * 0.6) ? clipped.slice(0, boundary) : clipped;
  return `${base.trimEnd()}…`;
}

function applyFieldLimits(platform: Platform, outputs: PlatformContent): PlatformContent {
  const next: PlatformContent = {};
  for (const [key, value] of Object.entries(outputs) as [TextOutputType, string][]) {
    const limit = platform.rules.fieldLimits?.[key] ?? platform.rules.maxLength;
    next[key] = truncateAtWordBoundary(value.trim(), limit);
  }
  return next;
}

function buildLinkedIn(input: CaptionInput): PlatformContent {
  const { values, event, voice, mood } = input;
  const context = values.context || "";

  const hooks: Record<Voice, string> = {
    professional: "Excited to share a meaningful milestone.",
    founder: "A milestone I have been building toward just became real.",
    creator: "This one means a lot to me.",
    student: "I did not expect to be writing this update so soon.",
    developer: "Shipped something worth sharing today.",
    executive: "Proud to share a milestone with real strategic impact.",
  };

  const middles: Record<Mood, string> = {
    achievement: `${interpolate(event.baseSummary, values)}.`,
    launch: `Today marks the beginning of something new: ${interpolate(event.cardHeadline, values)}.`,
    growth: `${interpolate(event.baseSummary, values)}. Grateful for the progress and the people behind it.`,
    community: `${interpolate(event.baseSummary, values)}. This happened because of the community around it.`,
    educational: `A recent milestone turned into a strong learning moment: ${interpolate(event.baseSummary, values)}.`,
  };

  const closings: Record<Voice, string> = {
    professional: "Looking forward to what comes next.",
    founder: "Still building, still learning, and sharing the journey.",
    creator: "Thank you for being part of the journey.",
    student: "The journey continues and I am excited for the next chapter.",
    developer: "More experiments and updates coming soon.",
    executive: "Grateful to the team and partners who helped make it happen.",
  };

  const hashtags: Record<string, string> = {
    achievement: "#Achievement #Milestone #Growth #BuildInPublic",
    career: "#Career #NewOpportunity #ProfessionalGrowth #Milestone",
    founder: "#Startup #Founder #BuildInPublic #Entrepreneurship",
    creator: "#Creator #BuildInPublic #Community #Storytelling",
    growth: "#Growth #Milestone #Community #BuildInPublic",
    revenue: "#Revenue #MRR #Startup #IndieHacker",
    "open-source": "#OpenSource #GitHub #Developer #Community",
    community: "#Community #Builder #Network #Growth",
    events: "#Speaker #Tech #Community #Learning",
    education: "#Education #Career #Learning #Opportunity",
    newsletter: "#Newsletter #Writing #Creator #BuildInPublic",
  };

  const parts = [
    hooks[voice],
    middles[mood],
    context,
    closings[voice],
    hashtags[event.category] || "#Milestone #Growth #BuildInPublic",
  ].filter(Boolean);

  return { caption: parts.join("\n\n") };
}

function buildTwitter(input: CaptionInput): PlatformContent {
  const { values, event } = input;
  const headline = interpolate(event.cardHeadline, values);
  const context = values.context ? values.context.split(".")[0]?.trim() : "";
  const tag =
    event.category === "founder"
      ? "#BuildInPublic"
      : event.category === "career"
        ? "#Career"
        : event.category === "creator"
          ? "#Creator"
          : "#Milestone";

  const parts = [headline, context, `${tag}`].filter(Boolean);
  return { caption: parts.join("\n\n") };
}

function buildThreads(input: CaptionInput): PlatformContent {
  const { values, event } = input;
  const headline = interpolate(event.cardHeadline, values);
  const context = values.context || "";
  return { caption: [headline, context, "More updates soon."].filter(Boolean).join("\n\n") };
}

function buildInstagram(input: CaptionInput): PlatformContent {
  const { values, event } = input;
  const headline = interpolate(event.cardHeadline, values);
  const context = values.context || "";
  return {
    caption: [
      `${headline} ✨`,
      context,
      "Celebrating this milestone and excited for what comes next.",
      "#achievement #milestone #growth #buildinpublic #founder #creator #developer #startup",
    ].filter(Boolean).join("\n\n"),
  };
}

function buildReddit(input: CaptionInput): PlatformContent {
  const { values, event } = input;
  const title = interpolate(event.cardHeadline, values);
  const body = [
    `${interpolate(event.baseSummary, values)}.`,
    values.context || "Happy to share more detail if anyone is curious about the process behind this.",
    "Would love feedback or questions from people who have gone through something similar.",
  ].filter(Boolean).join("\n\n");

  return { title, body };
}

function buildProductHunt(input: CaptionInput): PlatformContent {
  const { values } = input;
  const product = values.company || "Our product";
  const tagline = values.achievement || values.product_idea || "A new product built for ambitious teams";
  const description = [
    `${product} helps users ${values.achievement || "move faster with less friction"}.`,
    values.context || values.product_idea || "Built to solve a painful workflow in a simpler way.",
    "Would love your feedback from launch day onward.",
  ].filter(Boolean).join(" ");

  return { tagline, description };
}

function buildIndieHackers(input: CaptionInput): PlatformContent {
  const { values, event } = input;
  const headline = interpolate(event.cardHeadline, values);
  const body = [
    `${headline}.`,
    interpolate(event.baseSummary, values),
    values.context || "Still learning what works, but this milestone feels worth documenting.",
    "What worked: staying focused on the core problem before expanding scope.",
    "What is next: doubling down on the next repeatable growth lever.",
  ].filter(Boolean).join("\n\n");

  return { body };
}

function buildHackerNews(input: CaptionInput): PlatformContent {
  const { values } = input;
  const company = values.company || "Project";
  const achievement = values.achievement || values.product_idea || "a new build";
  const title = `Show HN: ${company} - ${achievement}`;
  const body = [
    values.context || "Built this recently and wanted to share the technical approach behind it.",
    "Current focus is on core reliability, implementation tradeoffs, and honest feedback from builders.",
    "Happy to discuss architecture, tooling choices, and where the rough edges still are.",
  ].filter(Boolean).join("\n\n");

  return { title, body };
}

function buildDiscord(input: CaptionInput): PlatformContent {
  const { values, event } = input;
  const headline = interpolate(event.cardHeadline, values);
  return {
    announcement: [
      `Announcement: ${headline}`,
      values.context || "Excited to share this update with the community.",
      "More details soon.",
    ].filter(Boolean).join("\n\n"),
  };
}

function buildSubstack(input: CaptionInput): PlatformContent {
  const { values, event } = input;
  const headline = interpolate(event.cardHeadline, values);
  const body = [
    `# ${headline}`,
    "Something happened recently that felt worth writing down in full.",
    `${interpolate(event.baseSummary, values)}.`,
    values.context || "There is a larger story behind this update, and I want to unpack it properly.",
    "What would you want to hear more about from this journey?",
  ].filter(Boolean).join("\n\n");

  return { body };
}

function buildGitHub(input: CaptionInput): PlatformContent {
  const { values } = input;
  const product = values.company || "Project";
  const description = values.achievement || `${product} release update`;
  const body = [
    `${product} is focused on ${values.achievement || "solving a clear workflow problem"}.`,
    "Highlights:",
    `- ${values.context || "Improved the core experience and polished the main flow."}`,
    `- Built by ${values.name || "the team"} with a focus on practical usage.`,
    "- Feedback, issues, and contributions are welcome.",
  ].join("\n");

  return { description, body };
}

function buildDevTo(input: CaptionInput): PlatformContent {
  const { values, event } = input;
  const headline = interpolate(event.cardHeadline, values);
  const outline = [
    `Title idea: ${headline}`,
    "1. The problem or opportunity",
    `2. What happened: ${interpolate(event.baseSummary, values)}`,
    `3. Build or workflow details: ${values.context || "Explain the process, tradeoffs, and decisions."}`,
    "4. Lessons learned",
    "5. What you would do differently next time",
  ].join("\n");

  return { outline };
}

export function generatePlatformCaption(input: CaptionInput): CaptionOutput {
  const { platform } = input;
  let outputs: PlatformContent;

  switch (platform.slug) {
    case "linkedin":
      outputs = buildLinkedIn(input);
      break;
    case "twitter":
      outputs = buildTwitter(input);
      break;
    case "threads":
      outputs = buildThreads(input);
      break;
    case "instagram":
      outputs = buildInstagram(input);
      break;
    case "reddit":
      outputs = buildReddit(input);
      break;
    case "producthunt":
      outputs = buildProductHunt(input);
      break;
    case "indiehackers":
      outputs = buildIndieHackers(input);
      break;
    case "hackernews":
      outputs = buildHackerNews(input);
      break;
    case "discord":
      outputs = buildDiscord(input);
      break;
    case "substack":
      outputs = buildSubstack(input);
      break;
    case "devto":
      outputs = buildDevTo(input);
      break;
    case "github":
      outputs = buildGitHub(input);
      break;
    default:
      outputs = buildLinkedIn(input);
      break;
  }

  return {
    platform: platform.label,
    outputs: applyFieldLimits(platform, outputs),
    primaryOutput: platform.rules.primaryTextOutput || "caption",
  };
}
