import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge, Button, Card, Container, EmptyState, PageHeader } from "@/components/ui";
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
    return (
      <main className="flex flex-col items-center gap-6 bg-accent-light px-4 py-12 text-center md:px-8 md:py-20">
        <h1 className="text-3xl font-bold text-accent md:text-5xl">{t("home.loggedOut.title")}</h1>
        <p className="max-w-2xl text-lg text-gray-600">{t("home.loggedOut.subtitle")}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button href="/signup" size="lg">{t("home.loggedOut.getStarted")}</Button>
          <Button href="/clubs" variant="secondary" size="lg">{t("home.loggedOut.browseClubs")}</Button>
        </div>
        <Link href="/features" className="text-sm font-medium underline mt-2" style={{ color: "var(--accent)" }}>
          See all features
        </Link>
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
