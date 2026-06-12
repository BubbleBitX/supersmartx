// ─────────────────────────────────────────────────────────────────────────────
// EVENT CATEGORIES + EVENT TYPES
// PRD §6 — full expanded set
// ─────────────────────────────────────────────────────────────────────────────

export type EventCategorySlug =
  | "achievement" | "career" | "founder" | "creator"
  | "growth" | "revenue" | "open-source" | "community"
  | "events" | "education" | "newsletter";

export interface EventType {
  id: string;
  label: string;
  icon: string;
  category: EventCategorySlug;
  fields: EventField[];
  // Card headline template — uses {{field_key}}
  cardHeadline: string;
  // Caption template — platform-specific versions in platforms.ts
  baseSummary: string;
}

export interface EventField {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "textarea" | "number";
  maxLength: number;
  required: boolean;
  hint?: string;
}

export interface EventCategory {
  slug: EventCategorySlug;
  label: string;
  icon: string;
  color: string;
  description: string;
}

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

export const EVENT_CATEGORIES: EventCategory[] = [
  { slug: "achievement", label: "Achievement",  icon: "🏆", color: "#a3e635", description: "Awards, certifications, hackathons, competitions" },
  { slug: "career",      label: "Career",       icon: "💼", color: "#60a5fa", description: "Jobs, promotions, work anniversaries, open to work" },
  { slug: "founder",     label: "Founder",      icon: "🚀", color: "#fb923c", description: "Startup launch, product launch, funding, milestones" },
  { slug: "creator",     label: "Creator",      icon: "🎬", color: "#c084fc", description: "Channel launch, subscriber milestones, course launch" },
  { slug: "growth",      label: "Growth",       icon: "📈", color: "#34d399", description: "Follower milestones across any platform" },
  { slug: "revenue",     label: "Revenue",      icon: "💰", color: "#fbbf24", description: "First sale, MRR/ARR milestones, revenue goals" },
  { slug: "open-source", label: "Open Source",  icon: "⭐", color: "#f472b6", description: "Repo launch, GitHub stars, major releases" },
  { slug: "community",   label: "Community",    icon: "🌐", color: "#818cf8", description: "Community launch, member milestones, partnerships" },
  { slug: "events",      label: "Events",       icon: "🎤", color: "#2dd4bf", description: "Speaking, webinars, workshops, conferences" },
  { slug: "education",   label: "Education",    icon: "🎓", color: "#e879f9", description: "Admission, placement, internship, research publication" },
  { slug: "newsletter",  label: "Newsletter",   icon: "📰", color: "#f87171", description: "Newsletter launch, subscriber milestones, sponsorships" },
];

// ─── SHARED FIELD DEFINITIONS ────────────────────────────────────────────────

const nameField    = (placeholder = "Your Name"): EventField =>
  ({ key: "name", label: "Your Name", placeholder, type: "text", maxLength: 50, required: true });
const roleField    = (placeholder = "Your Role"): EventField =>
  ({ key: "role", label: "Your Role / Title", placeholder, type: "text", maxLength: 50, required: true });
const companyField = (placeholder = "Company / Organization"): EventField =>
  ({ key: "company", label: "Company / Organization", placeholder, type: "text", maxLength: 50, required: false });
const contextField = (label: string, placeholder: string, required = false): EventField =>
  ({ key: "context", label, placeholder, type: "textarea", maxLength: 200, required });
const achievementField = (label: string, placeholder: string): EventField =>
  ({ key: "achievement", label, placeholder, type: "text", maxLength: 80, required: true });

// ─── ALL EVENT TYPES ─────────────────────────────────────────────────────────

export const EVENT_TYPES: EventType[] = [

  // ── ACHIEVEMENT ────────────────────────────────────────────────────────────
  {
    id: "hackathon-selected",
    label: "Hackathon Selected",
    icon: "🏆",
    category: "achievement",
    cardHeadline: "Selected for {{achievement}}",
    baseSummary: "{{name}} has been selected for {{achievement}}",
    fields: [
      nameField(),
      achievementField("Hackathon / Event Name", "OpenAI x Outskill AI Builders Hackathon"),
      { key: "product_idea", label: "What you're building", placeholder: "AI researcher for startups", type: "textarea", maxLength: 150, required: true },
      roleField("Software Engineer"),
      companyField("BubblebitX"),
      { key: "organizers", label: "Organizers (bottom label)", placeholder: "OpenAI  |  Outskill", type: "text", maxLength: 50, required: false },
    ],
  },
  {
    id: "award-winner",
    label: "Award Winner",
    icon: "🥇",
    category: "achievement",
    cardHeadline: "Won {{achievement}}",
    baseSummary: "{{name}} won {{achievement}} at {{company}}",
    fields: [
      nameField(),
      achievementField("Award Name", "Best Innovation Award"),
      companyField("TechFest India"),
      roleField("Product Manager"),
      contextField("What the award is for", "Building an AI tool that helps 10,000+ developers"),
    ],
  },
  {
    id: "certification-earned",
    label: "Certification Earned",
    icon: "🎓",
    category: "achievement",
    cardHeadline: "Earned {{achievement}}",
    baseSummary: "{{name}} earned {{achievement}} certification from {{company}}",
    fields: [
      nameField(),
      achievementField("Certification Name", "AWS Solutions Architect"),
      companyField("Amazon Web Services"),
      roleField("Cloud Engineer"),
    ],
  },
  {
    id: "scholarship-winner",
    label: "Scholarship Winner",
    icon: "🎯",
    category: "achievement",
    cardHeadline: "Received {{achievement}}",
    baseSummary: "{{name}} received the {{achievement}} scholarship from {{company}}",
    fields: [
      nameField(),
      achievementField("Scholarship Name", "Google Developer Scholarship"),
      companyField("Google"),
      roleField("Computer Science Student"),
      contextField("What this scholarship means to you", "This enables me to pursue my dream of building AI products"),
    ],
  },
  {
    id: "competition-winner",
    label: "Competition Winner",
    icon: "🏅",
    category: "achievement",
    cardHeadline: "Won {{achievement}}",
    baseSummary: "{{name}} won {{achievement}}",
    fields: [
      nameField(),
      achievementField("Competition Name", "Smart India Hackathon 2025"),
      { key: "position", label: "Position / Rank", placeholder: "1st Place", type: "text", maxLength: 30, required: true },
      companyField("IIT Bombay"),
      roleField("Full-Stack Developer"),
    ],
  },
  {
    id: "patent-granted",
    label: "Patent Granted",
    icon: "📜",
    category: "achievement",
    cardHeadline: "Patent Granted: {{achievement}}",
    baseSummary: "{{name}} was granted a patent for {{achievement}}",
    fields: [
      nameField(),
      achievementField("Patent Title", "AI-Powered Content Recommendation System"),
      companyField("Your Company"),
      roleField("Inventor / Engineer"),
      { key: "patent_number", label: "Patent Number (optional)", placeholder: "US11234567B2", type: "text", maxLength: 30, required: false },
    ],
  },

  // ── CAREER ─────────────────────────────────────────────────────────────────
  {
    id: "new-job",
    label: "New Job",
    icon: "💼",
    category: "career",
    cardHeadline: "Joining {{company}} as {{role}}",
    baseSummary: "{{name}} is joining {{company}} as {{role}}",
    fields: [
      nameField(),
      roleField("Product Designer"),
      companyField("Microsoft"),
      contextField("What you'll be working on", "Building AI-powered design tools for millions of users"),
      { key: "start_date", label: "Start Date (optional)", placeholder: "July 1, 2025", type: "text", maxLength: 30, required: false },
    ],
  },
  {
    id: "promotion",
    label: "Got Promoted",
    icon: "📈",
    category: "career",
    cardHeadline: "Promoted to {{role}} at {{company}}",
    baseSummary: "{{name}} was promoted to {{role}} at {{company}}",
    fields: [
      nameField(),
      achievementField("New Position", "Senior Software Engineer"),
      companyField("Google"),
      { key: "prev_role", label: "Previous Role (optional)", placeholder: "Software Engineer", type: "text", maxLength: 50, required: false },
      contextField("Key achievement that led to this", "Led migration of core infrastructure serving 50M users"),
    ],
  },
  {
    id: "work-anniversary",
    label: "Work Anniversary",
    icon: "🎂",
    category: "career",
    cardHeadline: "{{achievement}} at {{company}}",
    baseSummary: "{{name}} is celebrating {{achievement}} at {{company}}",
    fields: [
      nameField(),
      achievementField("Milestone", "3 Year Anniversary"),
      companyField("Your Company"),
      roleField("Software Engineer"),
      contextField("Key lessons / highlights", "Built 3 products from scratch, led a team of 8"),
    ],
  },
  {
    id: "open-to-work",
    label: "Open To Work",
    icon: "🔍",
    category: "career",
    cardHeadline: "Open to {{achievement}} Roles",
    baseSummary: "{{name}} is open to {{achievement}} opportunities",
    fields: [
      nameField(),
      achievementField("Desired Role", "Full-Stack Developer / Product Manager"),
      roleField("3 years in SaaS startups"),
      { key: "skills", label: "Top Skills", placeholder: "React · Node.js · System Design · AI", type: "textarea", maxLength: 150, required: true },
      { key: "work_mode", label: "Work Preference", placeholder: "Remote / Hybrid / Pune", type: "text", maxLength: 40, required: false },
    ],
  },
  {
    id: "leadership-role",
    label: "Leadership Role",
    icon: "👑",
    category: "career",
    cardHeadline: "Appointed as {{achievement}} at {{company}}",
    baseSummary: "{{name}} has been appointed {{achievement}} at {{company}}",
    fields: [
      nameField(),
      achievementField("Leadership Title", "Head of Engineering"),
      companyField("Startup Name"),
      roleField("Previous Role"),
      contextField("What this role involves", "Building and scaling the engineering team from 5 to 50"),
    ],
  },

  // ── FOUNDER ────────────────────────────────────────────────────────────────
  {
    id: "startup-launch",
    label: "Startup Launch",
    icon: "🚀",
    category: "founder",
    cardHeadline: "Launching {{company}}",
    baseSummary: "{{name}} is launching {{company}}",
    fields: [
      nameField("Founder Name"),
      companyField("Startup Name"),
      achievementField("What you're building (tagline)", "AI hiring platform for fast-growing teams"),
      roleField("Founder & CEO"),
      contextField("The problem you're solving", "90% of startup hires fail in the first 6 months due to bad fit"),
      { key: "website", label: "Website (optional)", placeholder: "yourstartup.com", type: "text", maxLength: 60, required: false },
    ],
  },
  {
    id: "product-launch",
    label: "Product Launch",
    icon: "🎯",
    category: "founder",
    cardHeadline: "Launching {{company}}",
    baseSummary: "{{name}} launched {{company}}",
    fields: [
      nameField(),
      companyField("Product Name"),
      achievementField("What it does (one line)", "Ship 10x faster with AI code reviews"),
      roleField("Product Manager"),
      contextField("Key features / what makes it different", "Works with GitHub, GitLab, Bitbucket. Free for open source."),
      { key: "website", label: "Product URL", placeholder: "yourproduct.com", type: "text", maxLength: 60, required: false },
    ],
  },
  {
    id: "first-customer",
    label: "First Customer",
    icon: "🎉",
    category: "founder",
    cardHeadline: "First customer at {{company}}",
    baseSummary: "{{company}} just got their first customer",
    fields: [
      nameField(),
      companyField("Startup Name"),
      roleField("Founder"),
      contextField("What this milestone means", "6 months of building, 47 rejections, and finally — our first paying customer"),
    ],
  },
  {
    id: "funding-announcement",
    label: "Funding Announcement",
    icon: "💵",
    category: "founder",
    cardHeadline: "{{company}} raised {{achievement}}",
    baseSummary: "{{company}} announced {{achievement}} in funding",
    fields: [
      nameField("Founder Name"),
      companyField("Startup Name"),
      achievementField("Funding Amount", "₹50 Lakhs Pre-Seed"),
      roleField("Founder & CEO"),
      { key: "investors", label: "Lead Investors (optional)", placeholder: "Backed by Sequoia, YC", type: "text", maxLength: 80, required: false },
      contextField("What you'll use it for", "Building the engineering team and launching in 3 new cities"),
    ],
  },
  {
    id: "acquisition",
    label: "Acquisition",
    icon: "🤝",
    category: "founder",
    cardHeadline: "{{company}} acquired by {{achievement}}",
    baseSummary: "{{company}} has been acquired by {{achievement}}",
    fields: [
      nameField("Founder Name"),
      companyField("Your Startup"),
      achievementField("Acquirer Name", "BigCo Inc."),
      roleField("Founder & CEO"),
      contextField("What's next", "Joining the BigCo team to scale this globally"),
    ],
  },

  // ── CREATOR ────────────────────────────────────────────────────────────────
  {
    id: "channel-launch",
    label: "Channel Launch",
    icon: "📺",
    category: "creator",
    cardHeadline: "Launching {{company}} on YouTube",
    baseSummary: "{{name}} just launched {{company}} on YouTube",
    fields: [
      nameField(),
      companyField("Channel Name"),
      achievementField("What the channel is about", "Weekly tutorials on building SaaS products"),
      roleField("Content Creator"),
      contextField("Why you started", "I've been building in public for 2 years. Time to go on camera."),
    ],
  },
  {
    id: "subscriber-milestone",
    label: "Subscriber Milestone",
    icon: "🎬",
    category: "creator",
    cardHeadline: "{{achievement}} on {{company}}",
    baseSummary: "{{name}} hit {{achievement}} subscribers on {{company}}",
    fields: [
      nameField(),
      companyField("Channel / Platform Name"),
      achievementField("Milestone", "10,000 Subscribers"),
      roleField("Content Creator · Tech / AI"),
      contextField("Message to your community", "Thank you to every single subscriber. You make this worth it."),
    ],
  },
  {
    id: "course-launch",
    label: "Course Launch",
    icon: "📚",
    category: "creator",
    cardHeadline: "Launching {{company}}",
    baseSummary: "{{name}} just launched {{company}}",
    fields: [
      nameField(),
      companyField("Course Name"),
      achievementField("What students will learn", "Build and launch a SaaS product from zero"),
      roleField("Instructor / Educator"),
      { key: "price", label: "Price (optional)", placeholder: "Free / ₹999", type: "text", maxLength: 30, required: false },
      { key: "website", label: "Course URL", placeholder: "gumroad.com/yourcourse", type: "text", maxLength: 80, required: false },
    ],
  },
  {
    id: "podcast-launch",
    label: "Podcast Launch",
    icon: "🎙️",
    category: "creator",
    cardHeadline: "Launching {{company}} Podcast",
    baseSummary: "{{name}} just launched {{company}} podcast",
    fields: [
      nameField(),
      companyField("Podcast Name"),
      achievementField("What the podcast covers", "Conversations with indie hackers and SaaS founders"),
      roleField("Podcast Host"),
      { key: "platform", label: "Where to listen", placeholder: "Spotify, Apple Podcasts, YouTube", type: "text", maxLength: 80, required: false },
    ],
  },

  // ── GROWTH ─────────────────────────────────────────────────────────────────
  {
    id: "followers-milestone",
    label: "Followers Milestone",
    icon: "👥",
    category: "growth",
    cardHeadline: "{{achievement}} Followers on {{company}}",
    baseSummary: "{{name}} just hit {{achievement}} followers on {{company}}",
    fields: [
      nameField(),
      achievementField("Milestone", "1,000 Followers"),
      companyField("Platform (LinkedIn / Twitter / Instagram)"),
      roleField("Developer / Founder / Creator"),
      contextField("Thank you message", "Started this journey 6 months ago with 0 followers. Grateful for every one of you."),
    ],
  },
  {
    id: "github-stars",
    label: "GitHub Stars",
    icon: "⭐",
    category: "open-source",
    cardHeadline: "{{achievement}} Stars on {{company}}",
    baseSummary: "{{company}} just hit {{achievement}} stars on GitHub",
    fields: [
      nameField(),
      companyField("Repository Name"),
      achievementField("Star Milestone", "1,000 Stars"),
      roleField("Open Source Maintainer"),
      contextField("What the project does", "A lightweight React state management library"),
      { key: "github_url", label: "GitHub URL", placeholder: "github.com/you/repo", type: "text", maxLength: 80, required: false },
    ],
  },

  // ── REVENUE ────────────────────────────────────────────────────────────────
  {
    id: "first-sale",
    label: "First Sale",
    icon: "💸",
    category: "revenue",
    cardHeadline: "First sale at {{company}}",
    baseSummary: "{{company}} just made their first sale",
    fields: [
      nameField(),
      companyField("Product / Startup Name"),
      roleField("Founder / Maker"),
      contextField("The feeling + story", "3 months of building, 0 customers, countless doubts — and then it happened. First ₹ in."),
    ],
  },
  {
    id: "mrr-milestone",
    label: "MRR Milestone",
    icon: "📊",
    category: "revenue",
    cardHeadline: "{{company}} hits {{achievement}} MRR",
    baseSummary: "{{company}} hit {{achievement}} in monthly recurring revenue",
    fields: [
      nameField(),
      companyField("Startup Name"),
      achievementField("MRR Milestone", "₹1,00,000 MRR"),
      roleField("Founder"),
      contextField("How you got here", "12 months, 3 pivots, 1 co-founder, 47 paying customers"),
    ],
  },
  {
    id: "arr-milestone",
    label: "ARR Milestone",
    icon: "🚀",
    category: "revenue",
    cardHeadline: "{{company}} hits {{achievement}} ARR",
    baseSummary: "{{company}} hit {{achievement}} in annual recurring revenue",
    fields: [
      nameField(),
      companyField("Startup Name"),
      achievementField("ARR Milestone", "₹10L ARR"),
      roleField("Founder"),
      contextField("Key to getting here", "Focus on one ICP, nail the onboarding, obsess over retention"),
    ],
  },

  // ── OPEN SOURCE ────────────────────────────────────────────────────────────
  {
    id: "repo-launch",
    label: "Repository Launch",
    icon: "📦",
    category: "open-source",
    cardHeadline: "Launching {{company}} on GitHub",
    baseSummary: "{{name}} just open-sourced {{company}}",
    fields: [
      nameField(),
      companyField("Repository / Project Name"),
      achievementField("What it does", "A zero-config deployment tool for Node.js apps"),
      roleField("Open Source Developer"),
      { key: "github_url", label: "GitHub URL", placeholder: "github.com/you/repo", type: "text", maxLength: 80, required: false },
    ],
  },
  {
    id: "major-release",
    label: "Major Release",
    icon: "🎁",
    category: "open-source",
    cardHeadline: "{{company}} {{achievement}} Released",
    baseSummary: "{{company}} {{achievement}} is now available",
    fields: [
      nameField(),
      companyField("Project Name"),
      achievementField("Version / Release", "v2.0.0"),
      roleField("Maintainer"),
      contextField("What's new in this release", "Complete rewrite in Rust. 10x faster. Zero breaking changes."),
      { key: "github_url", label: "Release URL", placeholder: "github.com/you/repo/releases", type: "text", maxLength: 80, required: false },
    ],
  },

  // ── COMMUNITY ──────────────────────────────────────────────────────────────
  {
    id: "community-launch",
    label: "Community Launch",
    icon: "🌐",
    category: "community",
    cardHeadline: "Launching {{company}} Community",
    baseSummary: "{{name}} just launched the {{company}} community",
    fields: [
      nameField(),
      companyField("Community Name"),
      achievementField("What the community is for", "Indie hackers and SaaS builders in India"),
      roleField("Community Builder"),
      { key: "platform", label: "Where (Discord / Slack / WhatsApp)", placeholder: "Discord", type: "text", maxLength: 40, required: false },
      { key: "join_link", label: "Join Link (optional)", placeholder: "discord.gg/yourserver", type: "text", maxLength: 80, required: false },
    ],
  },
  {
    id: "members-milestone",
    label: "Members Milestone",
    icon: "👨‍👩‍👧‍👦",
    category: "community",
    cardHeadline: "{{company}} hits {{achievement}} Members",
    baseSummary: "{{company}} community just hit {{achievement}} members",
    fields: [
      nameField(),
      companyField("Community Name"),
      achievementField("Members Milestone", "1,000 Members"),
      roleField("Community Builder"),
      contextField("Thank you message", "When I started this community I had no idea this many people would join. Grateful for all of you."),
    ],
  },
  {
    id: "partnership-announcement",
    label: "Partnership",
    icon: "🤝",
    category: "community",
    cardHeadline: "{{company}} × {{achievement}}",
    baseSummary: "{{company}} just partnered with {{achievement}}",
    fields: [
      nameField(),
      companyField("Your Organization"),
      achievementField("Partner Name", "Google for Startups"),
      roleField("Founder / Community Lead"),
      contextField("What this partnership means", "Access to $200K in cloud credits and mentorship from Google experts"),
    ],
  },

  // ── EVENTS ─────────────────────────────────────────────────────────────────
  {
    id: "speaker-announcement",
    label: "Speaking At Event",
    icon: "🎤",
    category: "events",
    cardHeadline: "Speaking at {{company}}",
    baseSummary: "{{name}} is speaking at {{company}}",
    fields: [
      nameField(),
      companyField("Event Name"),
      achievementField("Talk Topic", "Building AI Agents with LangChain"),
      roleField("AI Engineer"),
      { key: "event_date", label: "Event Date", placeholder: "August 15, 2025", type: "text", maxLength: 40, required: false },
      { key: "event_location", label: "Location / Online", placeholder: "Pune, India", type: "text", maxLength: 50, required: false },
    ],
  },
  {
    id: "webinar",
    label: "Hosting Webinar",
    icon: "🖥️",
    category: "events",
    cardHeadline: "Hosting: {{achievement}}",
    baseSummary: "{{name}} is hosting a webinar on {{achievement}}",
    fields: [
      nameField(),
      achievementField("Webinar Topic", "How to Build Your First SaaS in 30 Days"),
      roleField("SaaS Founder"),
      { key: "date_time", label: "Date & Time", placeholder: "Jan 20 · 7 PM IST", type: "text", maxLength: 50, required: true },
      contextField("What attendees will learn", "Idea validation, tech stack, first 100 users"),
      { key: "register_link", label: "Registration Link (optional)", placeholder: "lu.ma/yourwebinar", type: "text", maxLength: 80, required: false },
    ],
  },
  {
    id: "workshop",
    label: "Workshop",
    icon: "🔧",
    category: "events",
    cardHeadline: "Workshop: {{achievement}}",
    baseSummary: "{{name}} is hosting a workshop on {{achievement}}",
    fields: [
      nameField(),
      achievementField("Workshop Title", "Building with LLMs: From Zero to Production"),
      roleField("AI Engineer / Educator"),
      { key: "date_time", label: "Date & Time", placeholder: "Feb 5 · 10 AM IST", type: "text", maxLength: 50, required: true },
      companyField("Organizer / Venue"),
      { key: "register_link", label: "Registration Link (optional)", placeholder: "lu.ma/yourworkshop", type: "text", maxLength: 80, required: false },
    ],
  },

  // ── EDUCATION ──────────────────────────────────────────────────────────────
  {
    id: "admission",
    label: "College Admission",
    icon: "🏫",
    category: "education",
    cardHeadline: "Admitted to {{company}}",
    baseSummary: "{{name}} has been admitted to {{company}}",
    fields: [
      nameField(),
      companyField("Institution Name"),
      achievementField("Program / Degree", "B.Tech Computer Science"),
      roleField("Student"),
      contextField("What this means to you", "First in my family to attend this university. Incredibly grateful."),
    ],
  },
  {
    id: "placement",
    label: "Campus Placement",
    icon: "🎓",
    category: "education",
    cardHeadline: "Placed at {{company}}",
    baseSummary: "{{name}} has been placed at {{company}}",
    fields: [
      nameField(),
      companyField("Company Name"),
      achievementField("Role / Package", "SDE-1 · ₹18 LPA"),
      roleField("B.Tech CS · Final Year"),
      contextField("Your journey", "600 DSA problems, 50+ mock interviews, and countless rejections later..."),
    ],
  },
  {
    id: "internship",
    label: "Internship",
    icon: "💻",
    category: "education",
    cardHeadline: "Interning at {{company}}",
    baseSummary: "{{name}} is joining {{company}} as an intern",
    fields: [
      nameField(),
      companyField("Company Name"),
      achievementField("Internship Role", "SDE Intern"),
      roleField("B.Tech CS · 3rd Year"),
      { key: "duration", label: "Duration", placeholder: "June – August 2025", type: "text", maxLength: 40, required: false },
    ],
  },
  {
    id: "research-publication",
    label: "Research Publication",
    icon: "📄",
    category: "education",
    cardHeadline: "Published: {{achievement}}",
    baseSummary: "{{name}} published a research paper: {{achievement}}",
    fields: [
      nameField(),
      achievementField("Paper Title", "Efficient Transformer Architectures for Edge Devices"),
      companyField("Journal / Conference"),
      roleField("Research Scholar"),
      { key: "abstract", label: "Brief Summary", placeholder: "We propose a novel approach to...", type: "textarea", maxLength: 200, required: false },
      { key: "paper_url", label: "Paper Link (optional)", placeholder: "arxiv.org/abs/...", type: "text", maxLength: 100, required: false },
    ],
  },

  // ── NEWSLETTER ─────────────────────────────────────────────────────────────
  {
    id: "newsletter-launch",
    label: "Newsletter Launch",
    icon: "📰",
    category: "newsletter",
    cardHeadline: "Launching {{company}}",
    baseSummary: "{{name}} just launched {{company}} newsletter",
    fields: [
      nameField(),
      companyField("Newsletter Name"),
      achievementField("What it covers", "AI tools for builders — every Sunday"),
      roleField("Writer / Builder"),
      { key: "frequency", label: "Publishing Frequency", placeholder: "Every Sunday", type: "text", maxLength: 30, required: false },
      { key: "subscribe_link", label: "Subscribe Link (optional)", placeholder: "substack.com/yournewsletter", type: "text", maxLength: 80, required: false },
    ],
  },
  {
    id: "newsletter-milestone",
    label: "Newsletter Milestone",
    icon: "📬",
    category: "newsletter",
    cardHeadline: "{{company}} hits {{achievement}}",
    baseSummary: "{{company}} newsletter just hit {{achievement}} subscribers",
    fields: [
      nameField(),
      companyField("Newsletter Name"),
      achievementField("Subscriber Milestone", "1,000 Subscribers"),
      roleField("Newsletter Writer"),
      contextField("Thank you / what's next", "When I sent my first email to 12 friends, I never imagined reaching this."),
    ],
  },
  {
    id: "newsletter-sponsorship",
    label: "Sponsorship Announcement",
    icon: "💎",
    category: "newsletter",
    cardHeadline: "{{company}} now sponsored by {{achievement}}",
    baseSummary: "{{company}} newsletter is now sponsored by {{achievement}}",
    fields: [
      nameField(),
      companyField("Newsletter Name"),
      achievementField("Sponsor Name", "Stripe"),
      roleField("Newsletter Creator"),
      contextField("What the sponsorship means", "This covers my hosting costs and lets me keep the newsletter free for readers"),
    ],
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export function getEventsByCategory(category: EventCategorySlug): EventType[] {
  return EVENT_TYPES.filter(e => e.category === category);
}

export function getEventById(id: string): EventType | undefined {
  return EVENT_TYPES.find(e => e.id === id);
}

export function getCategoryMeta(slug: EventCategorySlug): EventCategory {
  return EVENT_CATEGORIES.find(c => c.slug === slug)!;
}

export function interpolate(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] || `[${key}]`);
}
