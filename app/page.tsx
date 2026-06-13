import Link from "next/link";
import styles from "./page.module.css";

const STATS = [
  { label: "Templates", value: "10+" },
  { label: "Design Variations", value: "2700+" },
  { label: "Creation Time", value: "60 sec" },
  { label: "Exports", value: "Unlimited" },
];

export default function RootPage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand}>
            SuperSmartX
          </Link>
          <div className={styles.nav}>
            <Link href="/templates" className={styles.navLink}>
              Templates
            </Link>
            <Link href="/pricing" className={styles.navLink}>
              Pricing
            </Link>
            <Link href="/dashboard" className={styles.dashboardLink}>
              Dashboard
            </Link>
          </div>
        </header>

        <div className={styles.hero}>
          <div className={styles.copy}>
            <div className={styles.eyebrow}>
              Turn achievements into branded assets
            </div>
            <h1 className={styles.title}>
              Create professional achievement posts in 60 seconds
            </h1>
            <p className={styles.description}>
              Generate polished graphics, platform-ready captions, and personal branding
              content from one fast workflow.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/create" className={styles.primaryCta}>
                Start Creating Free
              </Link>
              <Link href="/templates" className={styles.secondaryCta}>
                View Templates
              </Link>
            </div>
            <div className={styles.stats}>
              {STATS.map((stat) => (
                <div key={stat.label} className={styles.statCard}>
                  <div className={styles.statValue}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.preview}>
            <div className={styles.previewTop}>
              <div>
                <div className={styles.previewLabel}>Live Preview</div>
                <div className={styles.previewTitle}>Hackathon Selected</div>
              </div>
              <div className={styles.previewBadge}>LinkedIn Ready</div>
            </div>

            <div className={styles.previewCard}>
              <div className={styles.previewCardLabel}>Achievement</div>
              <div className={styles.previewCardTitle}>
                Selected for OpenAI x Outskill AI Builders Hackathon
              </div>
              <div className={styles.previewCardCopy}>
                Building an AI researcher for startups with platform-ready captions and
                exportable social graphics.
              </div>
              <div className={styles.previewPerson}>
                <div className={styles.previewAvatar} />
                <div>
                  <div className={styles.previewName}>Your Name</div>
                  <div className={styles.previewRole}>Software Engineer</div>
                </div>
              </div>
            </div>

            <div className={styles.previewInfo}>
              <div className={styles.previewInfoCard}>
                <div className={styles.previewInfoLabel}>Output</div>
                <div className={styles.previewInfoCopy}>
                  1080x1080 PNG, LinkedIn caption, multi-platform copy
                </div>
              </div>
              <div className={styles.previewInfoCard}>
                <div className={styles.previewInfoLabel}>Flow</div>
                <div className={styles.previewInfoCopy}>
                  Choose event type, fill details, customize theme, export instantly
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
