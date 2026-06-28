import Link from "next/link";
import { Button, Container } from "@/components/ui";

export const metadata = {
  title: "Features · Logginhood",
  description: "Everything Logginhood and Quiver can do — from AI-powered arrow scoring to club management, online competitions, world rankings, and equipment analytics for manufacturers.",
};

const AppBadge = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">App</span>
);

const WebBadge = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">Quiver</span>
);

const BothBadge = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-gray-500 px-2 py-0.5 text-xs font-semibold text-white">Both</span>
);

const NewBadge = () => (
  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: "var(--warning-light)", color: "var(--warning-text)" }}>New</span>
);

function Section({ title, children }) {
  return (
    <section className="mb-14">
      <h2 className="mb-6 text-2xl font-bold text-accent">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

function Feature({ title, description, badge, isNew }) {
  return (
    <div className="rounded-xl border bg-background p-5 transition-shadow hover:shadow-md" style={{ borderColor: isNew ? "var(--warning)" : "var(--accent-light)" }}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-snug">{title}</h3>
        <div className="flex items-center gap-1.5 shrink-0">
          {isNew && <NewBadge />}
          {badge}
        </div>
      </div>
      <p className="text-sm leading-relaxed opacity-70">{description}</p>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <Container size="lg">
      {/* Hero */}
      <div className="mb-14 mt-10 text-center">
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">Everything in one place</h1>
        <p className="mx-auto max-w-2xl text-lg opacity-70">
          Logginhood is the scoring app you use on the shooting line. Quiver is the platform where your club, records, and competitions live. Together they cover everything from your first end to the world rankings.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
          <span className="flex items-center gap-1.5"><AppBadge /> Logginhood PWA — scores on your phone</span>
          <span className="flex items-center gap-1.5"><WebBadge /> Quiver website — club &amp; community</span>
          <span className="flex items-center gap-1.5"><BothBadge /> Available on both</span>
        </div>
      </div>

      {/* Scoring */}
      <Section title="Scoring">
        <Feature badge={<AppBadge />} title="Touch scoring" description="Arrow-by-arrow score entry with a large, clear button layout. Tap your score, the app advances automatically." />
        <Feature badge={<AppBadge />} title="Voice scoring" description="Call your scores aloud — 'ten', 'nine', 'miss' — and the app fills them in hands-free. Perfect when arrows are still in the target." />
        <Feature badge={<AppBadge />} title="Photo scoring (AI)" description="Take a photo of your target and let the AI read the arrows. Scores auto-fill the current end. You can tap to correct any result." />
        <Feature badge={<AppBadge />} title="4 scoring systems" isNew description="10-zone metric (X through 1), Imperial 5-zone (9,7,5,3,1 colour scoring), Compound inner-10 (X through 6), and Worcester (5 through 1). The keypad adapts automatically — only valid buttons are shown." />
        <Feature badge={<AppBadge />} title="3 or 6 arrow ends" description="Set how many arrows per batch for voice and photo input. The scoresheet structure stays correct for any configuration." />
        <Feature badge={<AppBadge />} title="PB comparison live" description="See your personal best for that round overlaid end-by-end as you shoot, so you always know if you're on track." />
        <Feature badge={<AppBadge />} title="Screen stays on" description="The phone screen won't sleep mid-round. Logginhood uses the Wake Lock API to keep the display active while you're scoring." />
        <Feature badge={<BothBadge />} title="Sight &amp; crawl marks" description="Store sight marks (recurve/compound) or crawl marks (barebow/longbow) per distance. Set them inline while scoring — they sync across devices." />
        <Feature badge={<AppBadge />} title="Offline-first PWA" isNew description="Score rounds with no internet connection. Everything saves locally, syncs to the cloud when you're back online. Works like a native app from your home screen." />
      </Section>

      {/* Rounds */}
      <Section title="Rounds">
        <Feature badge={<BothBadge />} title="100+ AGB rounds" isNew description="Every standard Archery GB round — indoor (Portsmouth, WA 18m/25m, Vegas, Worcester, Stafford, Bray, Frostbite, NFAA 300) and outdoor (York, Hereford, Bristol I–V, all Windsor/Western/National variants, WA 1440, WA 720, WA 900, Metric I–V, and more)." />
        <Feature badge={<AppBadge />} title="Compound inner-10 rounds" isNew description="Portsmouth, WA 18m, WA 25m, and Bray I/II all available in inner-10 variants for compound archers. Only shows X, 10, 9, 8, 7, 6, and M buttons." />
        <Feature badge={<AppBadge />} title="Imperial 5-zone scoring" isNew description="All outdoor imperial rounds (York, Hereford, Bristol, Western, National, etc.) now use correct 5-zone colour scoring — Gold (9), Red (7), Blue (5), Black (3), White (1)." />
        <Feature badge={<AppBadge />} title="Indoor &amp; outdoor seasons" description="Switch between indoor and outdoor round lists instantly. The app remembers your last selection." />
        <Feature badge={<AppBadge />} title="Auto venue lookup" description="Tap the location pin and Logginhood reverse-geocodes your GPS position to fill in the venue name automatically." />
      </Section>

      {/* Profile & Equipment */}
      <Section title="Profile &amp; Equipment">
        <Feature badge={<BothBadge />} title="Archer profile" description="Name, Archery GB number, date of birth, gender, age category (U12 through 60+), and club. Synced across the app and Quiver." />
        <Feature badge={<BothBadge />} title="Full equipment setup editor" isNew description="Create detailed bow setups with riser, limbs, draw weight, sight, button, clicker, tab, release aid, scope, stabilisers, string, arrow rest, and arrows. The UI adapts to your bow type." />
        <Feature badge={<AppBadge />} title="Equipment in the app" isNew description="Full setup editor built into the app — create and edit equipment offline, syncs to the cloud. No need to switch to the website." />
        <Feature badge={<BothBadge />} title="Per-setup colours" description="Each bow setup has its own accent colour. The app themes itself automatically when you score with that bow." />
        <Feature badge={<BothBadge />} title="Arrow sets" description="Multiple arrow sets per setup with spine, length, point weight, fletching, nock. Star an active set that auto-selects when scoring." />
        <Feature badge={<AppBadge />} title="Dark &amp; light mode" description="Full dark mode support with 10 accent colour presets or a custom colour picker." />
        <Feature badge={<BothBadge />} title="Social media links" description="Connect Facebook, Instagram, Twitter/X, TikTok, and YouTube for quick posting when you share a score." />
      </Section>

      {/* History & Analytics */}
      <Section title="History &amp; Analytics">
        <Feature badge={<BothBadge />} title="Full score history" description="Every saved round with date, venue, bow, status, hits, golds, and full arrow-by-arrow scoresheet. Search, filter by bow type and status, sort by any column." />
        <Feature badge={<BothBadge />} title="Personal best tracking" description="PBs tracked per round and bow combination. History entries are badged automatically when a new PB is set." />
        <Feature badge={<BothBadge />} title="Classification display" description="UK classification levels (IA3 through IGMB) calculated live. Thresholds shown for the next level up." />
        <Feature badge={<BothBadge />} title="Progress charts" description="Score trend over time, velocity, gold count, and consistency — all filterable by round and bow with trend lines." />
        <Feature badge={<AppBadge />} title="Score zone distribution" isNew description="Bar chart showing how your arrows are distributed across scoring zones (X, 10, 9... M) with percentage breakdown. Coloured by target face colours." />
        <Feature badge={<AppBadge />} title="Per-arrow averages" isNew description="Track your per-arrow average over time and cumulative arrows shot. See your best average, latest, and total volume." />
        <Feature badge={<AppBadge />} title="52-week activity heatmap" description="A full year of shooting at a glance — like GitHub's contribution graph, but for archery." />
        <Feature badge={<BothBadge />} title="Cloud sync" description="Scores save locally first (works offline) then sync to the cloud automatically. Access your history from any device." />
      </Section>

      {/* Import */}
      <Section title="Score Import">
        <Feature badge={<AppBadge />} title="Import from Archery Scoresheets" isNew description="Upload your .archeryscoresheets export file directly in the app. All rounds, arrow-by-arrow data, bow type, and equipment are extracted and imported instantly." />
        <Feature badge={<WebBadge />} title="Screenshot import (AI)" description="Screenshot your score history in any app. Claude reads the images, extracts round names, dates, scores, and bow types automatically." />
        <Feature badge={<WebBadge />} title="CSV import" description="Upload a CSV export from any archery app. Claude maps the columns automatically — review and correct before importing." />
        <Feature badge={<WebBadge />} title="Bulk import for clubs" description="Records keepers and chairmen can import scores for multiple club members at once, matching archer names to member profiles." />
      </Section>

      {/* Club features */}
      <Section title="Club Management — Quiver">
        <Feature badge={<WebBadge />} title="Club directory" description="Browse all registered clubs with verification status. Search by name or location. Join directly through Quiver." />
        <Feature badge={<WebBadge />} title="Role-based access" description="Chairman, Secretary, Treasurer, Coach, Records Keeper, Welfare Officer, Tournament Organiser, and Member roles with granular permissions." />
        <Feature badge={<WebBadge />} title="Club records table" description="Top scores for every round, age group, gender, and bow type combination. Medal icons for the podium. Filterable and sortable." />
        <Feature badge={<WebBadge />} title="Session calendar" description="Rolling calendar of club sessions with dates, times, locations, max places, and keyholder assignments. Members can book in advance." />
        <Feature badge={<WebBadge />} title="Keyholder management" description="Assign keyholders per venue and session. Flagged automatically if no keyholder is available." />
        <Feature badge={<WebBadge />} title="Classification audit" description="Records keepers can review and correct member classifications against AGB thresholds, flag discrepancies, and bulk-update." />
        <Feature badge={<WebBadge />} title="Badge ordering" description="Club-specific badge types with stock tracking and member ordering system." />
        <Feature badge={<WebBadge />} title="Member invitations" description="Invite new members via email link or QR code. They sign up and land directly in your club." />
      </Section>

      {/* Competitions */}
      <Section title="Online Competitions">
        <Feature badge={<WebBadge />} title="Create competitions" description="Set round, bow type, dates, max entries, and prize availability. Open to all Logginhood archers or restricted to specific clubs." />
        <Feature badge={<WebBadge />} title="Live leaderboards" description="Entries rank in real time as scores come in. Filter by bow type and age category." />
        <Feature badge={<WebBadge />} title="Trophy system" description="Award trophies for 1st, 2nd, and 3rd place. Trophies appear permanently in the winner's trophy cabinet on their profile." />
        <Feature badge={<WebBadge />} title="Browse &amp; enter" description="Search upcoming, active, and completed competitions. Enter with a score shot in the Logginhood app." />
      </Section>

      {/* World rankings */}
      <Section title="World Rankings">
        <Feature badge={<WebBadge />} title="Global leaderboard" description="Rankings across all Logginhood users worldwide, by round, bow type, age category, and gender." />
        <Feature badge={<WebBadge />} title="World records" description="The highest score ever shot on Logginhood for every round and category combination." />
      </Section>

      {/* Insights — B2B */}
      <Section title="Equipment Insights — For Manufacturers">
        <Feature badge={<WebBadge />} title="Product performance comparison" isNew description="Head-to-head comparison of any two products — average score, consistency, gold rate, score distribution, archer demographics. Powered by real performance data, not surveys." />
        <Feature badge={<WebBadge />} title="Market intelligence" isNew description="Market share by category (risers, limbs, sights, arrows). Competitor matrix with share, score, consistency, and sample size. Real-time, not quarterly reports." />
        <Feature badge={<WebBadge />} title="Switching &amp; churn analysis" isNew description="See which archers are leaving your brand and where they're going. Score impact of switching — did they improve or decline after changing equipment?" />
        <Feature badge={<WebBadge />} title="Archer demographics" isNew description="Who uses your equipment — age distribution, gender split, skill level pyramid. Actionable insights like 'Target U18 with a youth campaign — only 3% of your users are juniors.'" />
        <Feature badge={<WebBadge />} title="Arrow Lab" isNew description="Arrow performance scatter (score vs consistency), spine analysis, brand rankings. Which arrows perform best with which bows?" />
        <Feature badge={<WebBadge />} title="Equipment journey" isNew description="Track how scores change as archers upgrade equipment. Version-by-version timeline with improvement metrics." />
        <Feature badge={<WebBadge />} title="Competitive Edge" isNew description="Which equipment holds up under competition pressure? Compare practice vs competition performance by product." />
        <Feature badge={<WebBadge />} title="Activation codes" isNew description="Generate branded codes for equipment packaging. Archers scan to get free Logginhood Premium — you get guaranteed data capture and a direct channel to your customers." />
      </Section>

      {/* CTA */}
      <div className="mb-16 rounded-2xl bg-accent-light px-6 py-10 text-center md:px-8 md:py-12">
        <h2 className="mb-3 text-2xl font-bold text-accent md:text-3xl">Ready to get started?</h2>
        <p className="mb-6 text-base opacity-70 md:text-lg">The app is free. Open it in your browser and add it to your home screen — no download needed.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button href="https://logginhood.vercel.app" target="_blank" rel="noreferrer" size="lg">
            Open the app
          </Button>
          <Button href="/signup" variant="secondary" size="lg">
            Create a Quiver account
          </Button>
        </div>
        <p className="mt-4 text-sm opacity-50">
          Manufacturer? <a href="mailto:tristan@logginhood.com" className="underline">Contact us about Insights access</a>
        </p>
      </div>
    </Container>
  );
}
