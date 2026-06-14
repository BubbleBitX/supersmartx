import Link from "next/link";
import styles from "./page.module.css";

const STATS = [
  { label: "Profile Setup", value: "Once" },
  { label: "Career Templates", value: "10+" },
  { label: "Platform Variants", value: "12" },
  { label: "First Draft", value: "60 sec" },
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
              The LinkedIn milestone tool
            </div>
            <h1 className={styles.title}>
              Set up once. Post every career win beautifully.
            </h1>
            <p className={styles.description}>
              Turn promotions, new jobs, certifications, internships, and open-to-work
              updates into LinkedIn-ready graphics and captions. Your saved profile fills
              the details in every time.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/create" className={styles.primaryCta}>
                Create Your First Post
              </Link>
              <Link href="/templates" className={styles.secondaryCta}>
                Browse Templates
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
                <div className={styles.previewTitle}>Career Milestone</div>
              </div>
              <div className={styles.previewBadge}>Profile Once</div>
            </div>

            <div className={styles.previewCard}>
              <div className={styles.previewCardLabel}>LinkedIn First</div>
              <div className={styles.previewCardTitle}>
                Promoted to Senior Software Engineer
              </div>
              <div className={styles.previewCardCopy}>
                One saved profile becomes a polished graphic, a thoughtful LinkedIn
                caption, and shorter variants for every other platform.
              </div>
              <div className={styles.previewPerson}>
                <div className={styles.previewAvatar} />
                <div>
                  <div className={styles.previewName}>Priya Sharma</div>
                  <div className={styles.previewRole}>Software Engineer at Razorpay</div>
                </div>
              </div>
            </div>

            <div className={styles.previewInfo}>
              <div className={styles.previewInfoCard}>
                <div className={styles.previewInfoLabel}>Output</div>
                <div className={styles.previewInfoCopy}>
                  LinkedIn graphic, caption, and platform-aware variants
                </div>
              </div>
              <div className={styles.previewInfoCard}>
                <div className={styles.previewInfoLabel}>Flow</div>
                <div className={styles.previewInfoCopy}>
                  Save profile once, choose the milestone, export in minutes
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
