import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge, Button, Card, Container, EmptyState, PageHeader } from "@/components/ui";
import ArrowRain from "@/components/ArrowRain";
import { getMessages, translate } from "@/lib/i18n";
import { roleLabel } from "@/lib/permissions";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const messages = getMessages();
  const t = (key, params) => translate(messages, key, params);

  if (!user) {
    const features = [
      { icon: "📸", title: t("home.loggedOut.features.scoring.title"), body: t("home.loggedOut.features.scoring.body") },
      { icon: "📈", title: t("home.loggedOut.features.progress.title"), body: t("home.loggedOut.features.progress.body") },
      { icon: "🏟️", title: t("home.loggedOut.features.clubs.title"), body: t("home.loggedOut.features.clubs.body") },
    ];
    return (
      <main className="flex flex-col">
        {/* Hero */}
        <section className="relative overflow-hidden bg-accent-light px-6 py-20 text-center md:px-10 md:py-28">
          <ArrowRain style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.55 }} />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6">
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
              {t("home.loggedOut.eyebrow")}
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-accent md:text-6xl">
              {t("home.loggedOut.title")}
            </h1>
            <p className="max-w-2xl text-lg md:text-xl" style={{ color: "var(--color-text-secondary)" }}>
              {t("home.loggedOut.subtitle")}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button href="/signup" size="lg">{t("home.loggedOut.getStarted")}</Button>
              <Button href="/clubs" variant="secondary" size="lg">{t("home.loggedOut.browseClubs")}</Button>
            </div>
            <Link href="/features" className="text-sm font-medium underline" style={{ color: "var(--accent)" }}>
              {t("home.loggedOut.seeFeatures")}
            </Link>
          </div>
        </section>

        {/* Feature pillars */}
        <section className="px-6 py-16 md:px-10">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-10 text-center text-2xl font-bold tracking-tight md:text-3xl" style={{ color: "var(--foreground)" }}>
              {t("home.loggedOut.features.heading")}
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="card flex flex-col gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light text-2xl" aria-hidden="true">{f.icon}</span>
                  <h3 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="px-6 pb-20 md:px-10">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 rounded-2xl bg-accent px-6 py-14 text-center text-accent-foreground md:py-16">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t("home.loggedOut.cta.title")}</h2>
            <p className="max-w-xl text-base opacity-90">{t("home.loggedOut.cta.body")}</p>
            <Button href="/signup" size="lg" style={{ background: "#fff", color: "var(--accent)" }}>{t("home.loggedOut.cta.action")}</Button>
          </div>
        </section>
      </main>
    );
  }

  const [{ data: profile }, { data: scores }] = await Promise.all([
    supabase.from("profiles").select("full_name, club_id, clubs(id, name)").eq("id", user.id).single(),
    supabase
      .from("scores")
      .select("id, round_name, score, shot_at, status")
      .eq("profile_id", user.id)
      .order("shot_at", { ascending: false })
      .limit(5),
  ]);

  let primaryRole = null;
  if (profile?.club_id) {
    const { data: mem } = await supabase.from("club_members").select("role").eq("profile_id", user.id).eq("club_id", profile.club_id).eq("status", "approved").maybeSingle();
    primaryRole = mem?.role || null;
  }

  const bestScore = scores?.length ? Math.max(...scores.map((s) => s.score)) : null;

  return (
    <Container size="lg">
      <PageHeader
        title={t("home.loggedIn.welcomeBack", { name: profile?.full_name ?? "" })}
        actions={
          <Button href="https://logginhood.vercel.app" target="_blank" rel="noreferrer">
            {t("nav.scoreRound")}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card
          title={t("home.loggedIn.recentScores")}
          actions={<Link href="/history" className="text-sm hover:text-accent">{t("home.loggedIn.viewAll")}</Link>}
          className="lg:col-span-2"
        >
          {!scores?.length ? (
            <EmptyState
              icon="🎯"
              title={t("home.loggedIn.noScores.title")}
              description={t("home.loggedIn.noScores.description")}
              action={
                <Button href="https://logginhood.vercel.app" target="_blank" rel="noreferrer" size="sm">
                  {t("home.loggedIn.noScores.action")}
                </Button>
              }
            />
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {scores.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 border-b border-accent-light pb-2 last:border-none last:pb-0">
                  <span className="truncate">{s.round_name}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="font-semibold">{s.score}</span>
                    <span className="text-xs opacity-50">{s.shot_at}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="flex flex-col gap-4">
          <Card title={t("home.loggedIn.yourClub")}>
            {profile?.clubs ? (
                <div className="flex items-center justify-between gap-2">
                  <Link href={`/clubs/${profile.clubs.id}`} className="font-medium hover:text-accent">
                    {profile.clubs.name}
                  </Link>
                  {primaryRole && primaryRole !== "member" && <Badge>{roleLabel(primaryRole)}</Badge>}
                </div>
            ) : (
              <EmptyState
                icon="🏟️"
                title={t("home.loggedIn.noClub.title")}
                description={t("home.loggedIn.noClub.description")}
                action={<Button href="/clubs" size="sm">{t("home.loggedIn.noClub.action")}</Button>}
              />
            )}
          </Card>

          <Card title={t("home.loggedIn.quickLinks")}>
            <div className="flex flex-wrap gap-2">
              <Button href="/dashboard" variant="secondary" size="sm">{t("nav.dashboard")}</Button>
              <Button href="/progress" variant="secondary" size="sm">{t("nav.progress")}</Button>
              <Button href="/profile" variant="secondary" size="sm">{t("nav.profile")}</Button>
            </div>
            {bestScore != null && (
              <p className="text-sm opacity-70">
                {t("home.loggedIn.personalBest")}: <strong>{bestScore}</strong>
              </p>
            )}
          </Card>
        </div>
      </div>
    </Container>
  );
}
