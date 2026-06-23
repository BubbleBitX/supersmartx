import Link from "next/link";
import styles from "./page.module.css";

const STATS = [
  { label: "Profile setup", value: "Once" },
  { label: "First template", value: "No login" },
  { label: "Career paths", value: "6" },
  { label: "Platform outputs", value: "12" },
];

const SAMPLES = [
  "Promotion post",
  "Certification graphic",
  "Open to work card",
  "Internship update",
];

const TRUST = [
  "Built for LinkedIn-first career posts",
  "One profile reused across every milestone",
  "First generation fully unlocked",
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
            <div className={styles.eyebrow}>The LinkedIn milestone tool</div>
            <h1 className={styles.title}>
              Set up your profile once. Turn career updates into LinkedIn-ready posts in seconds.
            </h1>
            <p className={styles.description}>
              Generate your first template instantly - no email required. Promotions, certifications,
              internships, open-to-work updates, and founder wins all become polished graphics with
              platform-aware copy.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/create" className={styles.primaryCta}>
                Generate First Template
              </Link>
              <Link href="/templates" className={styles.secondaryCta}>
                View Template Library
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
                <div className={styles.previewLabel}>Live preview</div>
                <div className={styles.previewTitle}>Career milestone output</div>
              </div>
              <div className={styles.previewBadge}>Profile once</div>
            </div>

            <div className={styles.previewCard}>
              <div className={styles.previewCardLabel}>LinkedIn feed 1080 x 1350</div>
              <div className={styles.previewCardTitle}>Promoted to Senior Software Engineer</div>
              <div className={styles.previewCardCopy}>
                One saved profile becomes a polished graphic, a complete LinkedIn caption, and clean
                variants for X, Instagram, and community platforms.
              </div>
              <div className={styles.previewPerson}>
                <div className={styles.previewAvatar} />
                <div>
                  <div className={styles.previewName}>Priya Sharma</div>
                  <div className={styles.previewRole}>Software Engineer at Razorpay</div>
                </div>
              </div>
            </div>

            <div className={styles.sampleStrip}>
              {SAMPLES.map((sample) => (
                <div key={sample} className={styles.sampleChip}>
                  {sample}
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className={styles.socialProof}>
          <div className={styles.socialProofLabel}>Why people keep using it</div>
          <div className={styles.socialProofGrid}>
            {TRUST.map((item) => (
              <div key={item} className={styles.socialProofCard}>
                {item}
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
