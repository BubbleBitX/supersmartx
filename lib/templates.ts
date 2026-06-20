export type TemplateCategory = "achievement" | "founder" | "career" | "creator" | "events" | "newsletter";

export interface Template {
  id: string;
  name: string;
  slug: string;
  category: TemplateCategory;
  icon: string;
  fields: FormField[];
  captionTemplate: string;
  hashtagSets: string[];
}

export interface FormField {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "textarea";
  maxLength: number;
  required: boolean;
}

export const TEMPLATES: Template[] = [
  // ── ACHIEVEMENT ──────────────────────────────────────────────────────────
  {
    id: "hackathon-selected",
    name: "Hackathon Selected",
    slug: "hackathon-selected",
    category: "career",
    icon: "🏆",
    fields: [
      { key: "name", label: "Your Name", placeholder: "Hemant Sharad Patil", type: "text", maxLength: 50, required: true },
      { key: "productIdea", label: "Your Product Idea / Problem Statement", placeholder: "AI researcher for startups", type: "textarea", maxLength: 150, required: true },
      { key: "profession", label: "Profession", placeholder: "Software Engineer", type: "text", maxLength: 30, required: true },
      { key: "company", label: "Company", placeholder: "BubblebitX", type: "text", maxLength: 30, required: true },
      { key: "event", label: "Hackathon / Event Name", placeholder: "AI Builders Hackathon", type: "text", maxLength: 60, required: true },
      { key: "topLine", label: "Event Organizers (bottom logo area)", placeholder: "OpenAI  |  Outskill", type: "text", maxLength: 40, required: false },
    ],
    captionTemplate: `Excited to share that I've been shortlisted for the {{event}} 🚀

Over the next week, I'll be building alongside 1000 selected builders from across the country to launch real AI products.

I'll be building: {{productIdea}}

Really looking forward to turning this idea into a live product in just a few days while building alongside some incredible developers, founders, and AI-native builders.

I'll also be sharing my progress, build journey, learnings, and updates from the hackathon here over the next week, so do follow along and support 🙏

If you're a developer, AI engineer, founder, or builder experimenting with AI and coding agents, you should definitely give this a try.

#AI #Builders #Hackathon #BuildInPublic`,
    hashtagSets: ["#AI #Builders #Hackathon #BuildInPublic", "#Hackathon #Innovation #Tech #BuildInPublic", "#OpenAI #AIBuilders #Hackathon #BuildWithAI"],
  },
  {
    id: "certification-earned",
    name: "Certification Earned",
    slug: "certification-earned",
    category: "achievement",
    icon: "🎓",
    fields: [
      { key: "name", label: "Your Name", placeholder: "Your Name", type: "text", maxLength: 50, required: true },
      { key: "event", label: "Certification Name", placeholder: "AWS Solutions Architect", type: "text", maxLength: 60, required: true },
      { key: "company", label: "Issuing Organization", placeholder: "Amazon Web Services", type: "text", maxLength: 40, required: true },
      { key: "profession", label: "Your Role", placeholder: "Cloud Engineer", type: "text", maxLength: 30, required: true },
      { key: "topLine", label: "Organization Logo Label (optional)", placeholder: "Amazon Web Services", type: "text", maxLength: 40, required: false },
    ],
    captionTemplate: `Thrilled to share that I've just earned my {{event}} certification from {{company}}! 🎓

This has been an incredible learning journey, and I'm grateful for the knowledge and skills I've gained along the way.

Looking forward to applying these learnings in real-world projects and continuing to grow as a {{profession}}.

#Certification #LearningAndDevelopment #ProfessionalGrowth #SkillUp`,
    hashtagSets: ["#Certification #AWS #CloudComputing #LearningAndDevelopment", "#Certified #ProfessionalGrowth #SkillUp #Career"],
  },
  {
    id: "award-winner",
    name: "Award Winner",
    slug: "award-winner",
    category: "achievement",
    icon: "🥇",
    fields: [
      { key: "name", label: "Your Name", placeholder: "Your Name", type: "text", maxLength: 50, required: true },
      { key: "event", label: "Award Name", placeholder: "Best Innovation Award", type: "text", maxLength: 60, required: true },
      { key: "company", label: "Awarding Organization", placeholder: "TechFest India", type: "text", maxLength: 40, required: true },
      { key: "profession", label: "Your Role", placeholder: "Product Manager", type: "text", maxLength: 30, required: true },
      { key: "topLine", label: "Award Body / Logo Label (optional)", placeholder: "TechFest India", type: "text", maxLength: 40, required: false },
    ],
    captionTemplate: `Honoured to share that I've received the {{event}} from {{company}}! 🥇

This recognition means a great deal and I'm grateful to everyone who has supported me along the way.

Thank you to my team and mentors who made this possible!

#Award #Recognition #Grateful #Milestone`,
    hashtagSets: ["#Award #Recognition #Proud #Grateful", "#Winner #Innovation #Achievement #Milestone"],
  },
  {
    id: "promotion",
    name: "Got Promoted",
    slug: "promotion",
    category: "achievement",
    icon: "📈",
    fields: [
      { key: "name", label: "Your Name", placeholder: "Your Name", type: "text", maxLength: 50, required: true },
      { key: "event", label: "New Position", placeholder: "Senior Software Engineer", type: "text", maxLength: 50, required: true },
      { key: "company", label: "Company", placeholder: "Google", type: "text", maxLength: 30, required: true },
      { key: "profession", label: "Previous Role", placeholder: "Software Engineer", type: "text", maxLength: 30, required: false },
      { key: "topLine", label: "Company Label (optional)", placeholder: "Google", type: "text", maxLength: 40, required: false },
    ],
    captionTemplate: `Thrilled to share that I've been promoted to {{event}} at {{company}}! 🎉

Grateful for the opportunity and excited for what's ahead. This milestone wouldn't have been possible without the incredible support of my team and leaders.

Looking forward to taking on new challenges and contributing even more.

#Promotion #CareerGrowth #NewRole #Grateful`,
    hashtagSets: ["#Promotion #CareerGrowth #NewRole #Milestone", "#GotPromoted #CareerDevelopment #Grateful #NewChapter"],
  },
  // ── CAREER ───────────────────────────────────────────────────────────────
  {
    id: "new-job",
    name: "New Job",
    slug: "new-job",
    category: "career",
    icon: "💼",
    fields: [
      { key: "name", label: "Your Name", placeholder: "Your Name", type: "text", maxLength: 50, required: true },
      { key: "company", label: "Company", placeholder: "Microsoft", type: "text", maxLength: 30, required: true },
      { key: "profession", label: "Position", placeholder: "Product Designer", type: "text", maxLength: 40, required: true },
      { key: "event", label: "Role title for the graphic", placeholder: "Product Designer @ Microsoft", type: "text", maxLength: 60, required: true },
      { key: "productIdea", label: "What you'll be doing", placeholder: "Building AI-powered design tools for millions", type: "textarea", maxLength: 120, required: false },
      { key: "topLine", label: "Company label (optional)", placeholder: "Microsoft", type: "text", maxLength: 40, required: false },
    ],
    captionTemplate: `Excited to share that I'm starting a new journey as {{profession}} at {{company}}! 🚀

{{productIdea}}

Looking forward to learning, growing, and contributing to something meaningful. Grateful for this opportunity!

#NewJob #NewBeginnings #Excited #CareerGrowth`,
    hashtagSets: ["#NewJob #Excited #CareerGrowth #NewChapter", "#NewRole #StartingNewJob #Grateful #BuildInPublic"],
  },
  {
    id: "open-to-work",
    name: "Open To Work",
    slug: "open-to-work",
    category: "career",
    icon: "🔍",
    fields: [
      { key: "name", label: "Your Name", placeholder: "Your Name", type: "text", maxLength: 50, required: true },
      { key: "event", label: "Desired Role", placeholder: "Full-Stack Developer / Product Manager", type: "text", maxLength: 60, required: true },
      { key: "profession", label: "Your Background", placeholder: "3 years in SaaS startups", type: "text", maxLength: 50, required: true },
      { key: "productIdea", label: "Top Skills", placeholder: "React · Node.js · System Design · Leadership", type: "textarea", maxLength: 150, required: true },
      { key: "company", label: "Preferred Work Mode", placeholder: "Remote / Hybrid", type: "text", maxLength: 30, required: false },
      { key: "topLine", label: "Contact / Portfolio (optional)", placeholder: "linkedin.com/in/yourname", type: "text", maxLength: 40, required: false },
    ],
    captionTemplate: `I'm currently open to new opportunities as a {{event}}! 🔍

Background: {{profession}}
Skills: {{productIdea}}
Preference: {{company}}

If you know of any roles or opportunities that match this profile, I'd love to connect. Feel free to reach out or tag someone who might be hiring!

#OpenToWork #JobSearch #Hiring #{{event}}`,
    hashtagSets: ["#OpenToWork #JobSearch #Hiring #LookingForWork", "#OpenToOpportunities #JobSeeker #HireMe #Career"],
  },
  // ── FOUNDER ──────────────────────────────────────────────────────────────
  {
    id: "startup-launch",
    name: "Startup Launch",
    slug: "startup-launch",
    category: "founder",
    icon: "🚀",
    fields: [
      { key: "name", label: "Founder Name", placeholder: "Your Name", type: "text", maxLength: 50, required: true },
      { key: "company", label: "Startup Name", placeholder: "YourStartup", type: "text", maxLength: 30, required: true },
      { key: "event", label: "Tagline / What you're building", placeholder: "AI hiring platform for fast-growing teams", type: "text", maxLength: 80, required: true },
      { key: "profession", label: "Your Role", placeholder: "Founder & CEO", type: "text", maxLength: 40, required: true },
      { key: "topLine", label: "Startup Label (bottom area)", placeholder: "YourStartup", type: "text", maxLength: 40, required: false },
    ],
    captionTemplate: `Today I'm officially launching {{company}}! 🚀

We're building: {{event}}

It's been months in the making and I'm finally ready to share this with the world. If you're someone who's been waiting for something like this — this is for you.

Follow along as I build in public and share everything.

#StartupLaunch #BuildInPublic #Founder #{{company}}`,
    hashtagSets: ["#StartupLaunch #Founder #BuildInPublic #StartupLife", "#LaunchDay #Startup #Entrepreneurship #BuildInPublic"],
  },
  {
    id: "product-launch",
    name: "Product Launch",
    slug: "product-launch",
    category: "founder",
    icon: "🎯",
    fields: [
      { key: "name", label: "Your Name", placeholder: "Your Name", type: "text", maxLength: 50, required: true },
      { key: "company", label: "Product Name", placeholder: "ProductName", type: "text", maxLength: 30, required: true },
      { key: "event", label: "What it does (one line)", placeholder: "Ship 10x faster with AI code reviews", type: "text", maxLength: 80, required: true },
      { key: "productIdea", label: "More details", placeholder: "Works with GitHub, GitLab, Bitbucket...", type: "textarea", maxLength: 120, required: false },
      { key: "profession", label: "Your Role", placeholder: "Product Manager", type: "text", maxLength: 40, required: true },
      { key: "topLine", label: "Website / CTA label (optional)", placeholder: "yourproduct.com", type: "text", maxLength: 40, required: false },
    ],
    captionTemplate: `Today we're launching {{company}}! 🎯

{{event}}

{{productIdea}}

After months of building, testing, and iterating — it's finally live. We'd love for you to check it out and share your feedback.

Try it: {{topLine}}

#ProductLaunch #BuildInPublic #Launch #{{company}}`,
    hashtagSets: ["#ProductLaunch #BuildInPublic #Launched #Maker", "#NewProduct #Launch #Startup #ProductHunt"],
  },
  {
    id: "revenue-milestone",
    name: "Revenue Milestone",
    slug: "revenue-milestone",
    category: "founder",
    icon: "💰",
    fields: [
      { key: "name", label: "Your Name", placeholder: "Your Name", type: "text", maxLength: 50, required: true },
      { key: "company", label: "Startup Name", placeholder: "YourStartup", type: "text", maxLength: 30, required: true },
      { key: "event", label: "Revenue Milestone", placeholder: "₹1,00,000 MRR", type: "text", maxLength: 60, required: true },
      { key: "profession", label: "Your Role", placeholder: "Founder", type: "text", maxLength: 40, required: true },
      { key: "topLine", label: "Startup label (bottom)", placeholder: "YourStartup", type: "text", maxLength: 40, required: false },
    ],
    captionTemplate: `We just hit {{event}} at {{company}}! 🎉

This milestone felt impossible when we started. Grateful to every customer who believed in us early.

The journey continues. 🚀

#MRR #RevenueMilestone #Startup #BuildInPublic`,
    hashtagSets: ["#MRR #RevenueMilestone #Startup #Founder", "#StartupMilestone #BuildInPublic #SaaS #IndieHacker"],
  },
  // ── CREATOR ──────────────────────────────────────────────────────────────
  {
    id: "youtube-milestone",
    name: "YouTube Milestone",
    slug: "youtube-milestone",
    category: "newsletter",
    icon: "🎬",
    fields: [
      { key: "name", label: "Your Name", placeholder: "Your Name", type: "text", maxLength: 50, required: true },
      { key: "company", label: "Channel Name", placeholder: "YourChannel", type: "text", maxLength: 30, required: true },
      { key: "event", label: "Subscriber Milestone", placeholder: "10,000 subscribers", type: "text", maxLength: 40, required: true },
      { key: "profession", label: "Content Niche", placeholder: "Tech / AI / Coding", type: "text", maxLength: 30, required: true },
      { key: "topLine", label: "Channel label (optional)", placeholder: "YourChannel on YouTube", type: "text", maxLength: 40, required: false },
    ],
    captionTemplate: `WE HIT {{event}} ON YOUTUBE! 🎬

When I started {{company}}, I never imagined reaching this milestone. Thank you to every single subscriber — you make this worth it.

More {{profession}} videos coming. Stay tuned! 🙏

#YouTube #Creator #ContentCreator #Milestone`,
    hashtagSets: ["#YouTube #Subscriber #Milestone #Creator", "#YouTubeMilestone #ContentCreator #Grateful #10K"],
  },
  {
    id: "newsletter-launch",
    name: "Newsletter Launch",
    slug: "newsletter-launch",
    category: "creator",
    icon: "📰",
    fields: [
      { key: "name", label: "Your Name", placeholder: "Your Name", type: "text", maxLength: 50, required: true },
      { key: "company", label: "Newsletter Name", placeholder: "The Builders Brief", type: "text", maxLength: 40, required: true },
      { key: "event", label: "Topic / What it covers", placeholder: "AI tools for builders", type: "text", maxLength: 60, required: true },
      { key: "profession", label: "Publishing Frequency", placeholder: "Every Sunday", type: "text", maxLength: 30, required: true },
      { key: "topLine", label: "Newsletter label (optional)", placeholder: "The Builders Brief", type: "text", maxLength: 40, required: false },
    ],
    captionTemplate: `I just launched my newsletter: {{company}}! 📰

It covers: {{event}}

Publishing {{profession}}. If this sounds interesting to you, subscribe and join thousands of others.

#Newsletter #Creator #Writing #BuildInPublic`,
    hashtagSets: ["#Newsletter #Creator #Writing #ContentMarketing", "#NewsletterLaunch #Substack #Writing #BuildInPublic"],
  },
  // ── EVENTS ───────────────────────────────────────────────────────────────
  {
    id: "speaker-announcement",
    name: "Speaker Announcement",
    slug: "speaker-announcement",
    category: "events",
    icon: "🎤",
    fields: [
      { key: "name", label: "Your Name", placeholder: "Your Name", type: "text", maxLength: 50, required: true },
      { key: "event", label: "Event Name", placeholder: "DevFest India 2025", type: "text", maxLength: 60, required: true },
      { key: "productIdea", label: "Talk Topic", placeholder: "Building AI Agents with LangChain", type: "text", maxLength: 80, required: true },
      { key: "profession", label: "Your Role", placeholder: "AI Engineer", type: "text", maxLength: 40, required: true },
      { key: "company", label: "Company / Organization", placeholder: "Google", type: "text", maxLength: 30, required: false },
      { key: "topLine", label: "Event label (bottom)", placeholder: "DevFest India 2025", type: "text", maxLength: 40, required: false },
    ],
    captionTemplate: `Excited to announce that I'll be speaking at {{event}}! 🎤

Topic: {{productIdea}}

Looking forward to sharing insights with the community and connecting with fellow builders and learners.

See you there! 🙌

#Speaker #{{event}} #Tech #Community`,
    hashtagSets: ["#Speaker #Conference #Tech #Community", "#PublicSpeaking #TechTalk #BuildInPublic #DevCommunity"],
  },
  {
    id: "webinar",
    name: "Webinar",
    slug: "webinar",
    category: "events",
    icon: "🖥️",
    fields: [
      { key: "name", label: "Host Name", placeholder: "Your Name", type: "text", maxLength: 50, required: true },
      { key: "event", label: "Webinar Topic", placeholder: "How to Build Your First SaaS in 30 Days", type: "text", maxLength: 80, required: true },
      { key: "productIdea", label: "What attendees will learn", placeholder: "Idea validation, tech stack, first 100 users", type: "textarea", maxLength: 120, required: false },
      { key: "profession", label: "Your Role / Expertise", placeholder: "SaaS Founder", type: "text", maxLength: 40, required: true },
      { key: "company", label: "Date & Time", placeholder: "Jan 20, 2025 · 7 PM IST", type: "text", maxLength: 40, required: true },
      { key: "topLine", label: "Registration link / label (optional)", placeholder: "Register free: link.com", type: "text", maxLength: 50, required: false },
    ],
    captionTemplate: `I'm hosting a FREE webinar: {{event}} 🖥️

Date: {{company}}

What you'll learn: {{productIdea}}

Limited seats — register now!
{{topLine}}

#Webinar #Free #Learning #{{profession}}`,
    hashtagSets: ["#Webinar #Free #Learning #OnlineEvent", "#LiveSession #Community #BuildInPublic #Tech"],
  },
];

// ── CUSTOMIZATION TYPES ─────────────────────────────────────────────────────

export const THEMES = ["dark", "light", "premium", "startup", "corporate", "modern"] as const;
export type Theme = typeof THEMES[number];

export const ACCENT_COLORS = {
  lime:   { primary: "#a3e635", secondary: "#84cc16", bg: "rgba(163,230,53,0.08)" },
  blue:   { primary: "#60a5fa", secondary: "#3b82f6", bg: "rgba(96,165,250,0.08)" },
  purple: { primary: "#c084fc", secondary: "#a855f7", bg: "rgba(192,132,252,0.08)" },
  orange: { primary: "#fb923c", secondary: "#f97316", bg: "rgba(251,146,60,0.08)" },
  red:    { primary: "#f87171", secondary: "#ef4444", bg: "rgba(248,113,113,0.08)" },
  teal:   { primary: "#2dd4bf", secondary: "#14b8a6", bg: "rgba(45,212,191,0.08)" },
} as const;
export type AccentColor = keyof typeof ACCENT_COLORS;

export const PROFILE_SHAPES = ["circle", "rounded", "square"] as const;
export type ProfileShape = typeof PROFILE_SHAPES[number];

export const LAYOUTS = ["A", "B", "C"] as const;
export type Layout = typeof LAYOUTS[number];

export const BADGE_STYLES = ["professional", "modern", "minimal", "bold"] as const;
export type BadgeStyle = typeof BADGE_STYLES[number];

export const FONT_PAIRS = {
  classic:    { display: "Georgia, 'Times New Roman', serif", body: "'Segoe UI', system-ui, sans-serif", label: "Classic" },
  modern:     { display: "'Segoe UI', system-ui, sans-serif", body: "'Segoe UI', system-ui, sans-serif", label: "Modern" },
  startup:    { display: "Georgia, serif", body: "'Segoe UI', system-ui, sans-serif", label: "Startup" },
  corporate:  { display: "'Segoe UI', system-ui, sans-serif", body: "'Segoe UI', system-ui, sans-serif", label: "Corporate" },
} as const;
export type FontPair = keyof typeof FONT_PAIRS;

export const LOGO_PLACEMENTS = ["bottom", "top", "hidden"] as const;
export type LogoPlacement = typeof LOGO_PLACEMENTS[number];

export const CTA_STYLES = [
  { key: "follow",   label: "Follow Journey" },
  { key: "connect",  label: "Connect With Me" },
  { key: "building", label: "Building In Public" },
  { key: "waitlist", label: "Join Waitlist" },
  { key: "none",     label: "No CTA" },
] as const;
export type CtaStyle = typeof CTA_STYLES[number]["key"];

export const BACKGROUND_PRESETS = [
  { key: "aurora", label: "Aurora" },
  { key: "studio", label: "Studio" },
  { key: "blueprint", label: "Blueprint" },
  { key: "sunrise", label: "Sunrise" },
  { key: "grain", label: "Grain" },
] as const;
export type BackgroundPreset = typeof BACKGROUND_PRESETS[number]["key"];

export const DOWNLOAD_FORMATS = [
  { key: "square",    label: "Universal",      width: 1080, height: 1080, displayW: 540, displayH: 540 },
  { key: "linkedin",  label: "LinkedIn Feed",  width: 1080, height: 1350, displayW: 432, displayH: 540 },
  { key: "twitter",   label: "X / Twitter",    width: 1200, height: 675,  displayW: 540, displayH: 304 },
  { key: "instagram", label: "Instagram Feed", width: 1080, height: 1350, displayW: 432, displayH: 540 },
] as const;
export type DownloadFormat = typeof DOWNLOAD_FORMATS[number]["key"];
