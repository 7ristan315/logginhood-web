import Link from "next/link";
import { Button, Container } from "@/components/ui";

export const metadata = {
  title: "Features · Logginhood",
  description: "Everything Logginhood and Quiver can do — from arrow-by-arrow scoring on your phone to club records, online competitions, and world rankings.",
};

const AppBadge = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">📱 App</span>
);

const WebBadge = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">🌐 Quiver</span>
);

const BothBadge = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-gray-500 px-2 py-0.5 text-xs font-semibold text-white">✦ Both</span>
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

function Feature({ title, description, badge }) {
  return (
    <div className="rounded-xl border border-accent-light bg-background p-5 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-snug">{title}</h3>
        <div className="shrink-0">{badge}</div>
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
        <h1 className="mb-4 text-4xl font-bold">Everything in one place</h1>
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
        <Feature
          badge={<AppBadge />}
          title="Touch scoring"
          description="Arrow-by-arrow score entry with a large, clear button layout. Tap your score, the app advances automatically."
        />
        <Feature
          badge={<AppBadge />}
          title="Voice scoring"
          description="Call your scores aloud — 'ten', 'nine', 'miss' — and the app fills them in hands-free. Perfect when arrows are still in the target."
        />
        <Feature
          badge={<AppBadge />}
          title="Photo scoring (AI)"
          description="Take a photo of your target and let the AI read the arrows. Scores auto-fill the current end. You can tap to correct any result."
        />
        <Feature
          badge={<AppBadge />}
          title="10-zone &amp; 5-zone"
          description="Full support for metric (WA 10-zone, X through 1) and imperial (5-zone, gold through white) scoring. Worcester face handled separately with its unique colour scheme."
        />
        <Feature
          badge={<AppBadge />}
          title="3 or 6 arrow ends"
          description="Set how many arrows per batch for voice and photo input — useful for clubs that pull after 3 instead of 6. The scoresheet structure stays correct."
        />
        <Feature
          badge={<AppBadge />}
          title="PB comparison live"
          description="See your personal best for that round overlaid end-by-end as you shoot, so you always know if you're on track for a PB."
        />
        <Feature
          badge={<AppBadge />}
          title="Delete last arrow"
          description="Made a mistake? One tap removes the last entered score and steps back the cursor."
        />
        <Feature
          badge={<AppBadge />}
          title="Screen stays on"
          description="The phone screen won't sleep mid-round. Logginhood uses the Wake Lock API to keep the display active while you're scoring."
        />
        <Feature
          badge={<AppBadge />}
          title="Sight notes"
          description="Store your sight marks per distance directly on the round setup screen. Available to glance at any time during scoring."
        />
      </Section>

      {/* Rounds */}
      <Section title="Rounds">
        <Feature
          badge={<BothBadge />}
          title="Full round library"
          description="Every standard WA indoor and outdoor round built in — Portsmouth, WA 18m, Vegas, York, Hereford, Bristol I–V, St George, Windsor, Long Metric, Short Metric, WA 70m and more."
        />
        <Feature
          badge={<AppBadge />}
          title="Indoor &amp; outdoor seasons"
          description="Switch between indoor and outdoor round lists instantly. The app remembers your last selection."
        />
        <Feature
          badge={<AppBadge />}
          title="Auto venue lookup"
          description="Tap the location pin and Logginhood reverse-geocodes your GPS position to fill in the venue name automatically."
        />
        <Feature
          badge={<AppBadge />}
          title="Status tracking"
          description="Mark each round as Practice, Competition, Record Attempt, or Club Round. Affects how it appears in history and on Quiver."
        />
      </Section>

      {/* Profile & Personalisation */}
      <Section title="Profile &amp; Personalisation">
        <Feature
          badge={<BothBadge />}
          title="Archer profile"
          description="Name, Archery GB number, date of birth, gender, age category (U12 through 60+), and club. Synced across the app and Quiver."
        />
        <Feature
          badge={<AppBadge />}
          title="Bow types"
          description="Recurve, Compound, Barebow, and Longbow built in. Add a custom bow type if yours doesn't fit a standard category."
        />
        <Feature
          badge={<AppBadge />}
          title="Per-bow colour themes"
          description="Set a custom accent colour for each bow. When you switch bow the whole app recolours — handy if you shoot multiple disciplines."
        />
        <Feature
          badge={<AppBadge />}
          title="Arrow sets"
          description="Name and manage your arrow sets (e.g. Easton X10, ACE 620). Star a default and it's auto-selected when you set up a round."
        />
        <Feature
          badge={<AppBadge />}
          title="Dark &amp; light mode"
          description="Full dark mode support. Easier on the eyes at indoor venues with low lighting."
        />
        <Feature
          badge={<AppBadge />}
          title="Custom accent colour"
          description="10 presets or a full colour picker. The accent colour flows through buttons, highlights, and the active score cell."
        />
        <Feature
          badge={<BothBadge />}
          title="Social media links"
          description="Connect your Facebook, Instagram, Twitter/X, TikTok, and YouTube profiles. Used for quick posting when you share a score."
        />
      </Section>

      {/* History & Analytics */}
      <Section title="History &amp; Analytics">
        <Feature
          badge={<BothBadge />}
          title="Full score history"
          description="Every saved round stored with date, venue, bow, status, hits, golds, and full arrow-by-arrow scoresheet. Tap any entry to review it."
        />
        <Feature
          badge={<BothBadge />}
          title="Personal best tracking"
          description="PBs tracked per round and bow combination. History entries are badged automatically when a new PB is set."
        />
        <Feature
          badge={<BothBadge />}
          title="Classification display"
          description="UK classification levels (IA3 through IGMB) calculated live. Thresholds shown for the next level up."
        />
        <Feature
          badge={<BothBadge />}
          title="Progress charts"
          description="Score trend over time, velocity (score change session-to-session), gold count, and consistency (standard deviation) — all filterable by round and bow."
        />
        <Feature
          badge={<AppBadge />}
          title="Trend lines"
          description="Linear regression trend overlaid on score charts showing whether you're improving, plateauing, or dropping."
        />
        <Feature
          badge={<AppBadge />}
          title="52-week activity heatmap"
          description="A full year of shooting at a glance. Colour intensity shows how well you scored each week — like GitHub's contribution graph, but for archery."
        />
        <Feature
          badge={<BothBadge />}
          title="Cloud sync"
          description="Scores save locally first (works offline) then sync to the cloud automatically. Access your history from any device."
        />
      </Section>

      {/* Club features — Quiver */}
      <Section title="Club features — Quiver">
        <Feature
          badge={<WebBadge />}
          title="Club directory"
          description="Browse all registered clubs with verification status. Find your club, view its members, records, and upcoming sessions."
        />
        <Feature
          badge={<WebBadge />}
          title="Club membership"
          description="Apply to join a club directly through Quiver. Chairmen approve applications and assign roles — Chairman, Coach, Records Keeper, Member."
        />
        <Feature
          badge={<WebBadge />}
          title="Club records table"
          description="Top 3 scores for every round, age group, gender, and bow type combination. Medal icons (🥇🥈🥉) for the podium. Filterable by governing body."
        />
        <Feature
          badge={<WebBadge />}
          title="Session calendar"
          description="A 6-week rolling calendar of club sessions with dates, times, locations, max places, and keyholder assignments. Members can book in advance."
        />
        <Feature
          badge={<WebBadge />}
          title="Keyholder management"
          description="Assign keyholders per session. If a keyholder can't make it, the system flags the session automatically."
        />
        <Feature
          badge={<WebBadge />}
          title="Club verification"
          description="Clubs go through a verification process — verified clubs are badged so archers know they're legitimate."
        />
      </Section>

      {/* Competitions */}
      <Section title="Online Competitions — Quiver">
        <Feature
          badge={<WebBadge />}
          title="Create competitions"
          description="Coaches, records keepers, and admins can create online competitions specifying round, bow type, dates, and prize availability."
        />
        <Feature
          badge={<WebBadge />}
          title="Browse &amp; enter"
          description="Search and filter upcoming, active, and completed competitions. Enter with a score shot in the Logginhood app."
        />
        <Feature
          badge={<WebBadge />}
          title="Live leaderboards"
          description="Entries rank in real time as scores come in. Standings update as archers submit during the competition window."
        />
        <Feature
          badge={<WebBadge />}
          title="Trophy system"
          description="Competition hosts award trophies for 1st, 2nd, and 3rd place. Trophies appear permanently in the winner's trophy cabinet."
        />
        <Feature
          badge={<WebBadge />}
          title="Trophy cabinet"
          description="Every archer's profile shows their trophy history — which competitions they placed in and when."
        />
      </Section>

      {/* World rankings */}
      <Section title="World Rankings — Quiver">
        <Feature
          badge={<WebBadge />}
          title="Global leaderboard"
          description="Rankings across all Logginhood users worldwide, by round, bow type, age category, and gender."
        />
        <Feature
          badge={<WebBadge />}
          title="World records"
          description="The highest score ever shot on Logginhood for every round and category combination — visible to anyone, no account needed."
        />
        <Feature
          badge={<WebBadge />}
          title="Public stats"
          description="Total archers, total rounds shot, and score distributions — open to the world as a window into the community."
        />
      </Section>

      {/* CTA */}
      <div className="mb-16 rounded-2xl bg-accent-light px-8 py-12 text-center">
        <h2 className="mb-3 text-3xl font-bold text-accent">Ready to get started?</h2>
        <p className="mb-6 text-lg opacity-70">The app is free. Open it in your browser and add it to your home screen — no download needed.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button href="https://logginhood.vercel.app" target="_blank" rel="noreferrer" size="lg">
            Open the app
          </Button>
          <Button href="/signup" variant="secondary" size="lg">
            Create a Quiver account
          </Button>
        </div>
      </div>
    </Container>
  );
}
