import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge, Button, Card, Container, EmptyState, PageHeader } from "@/components/ui";
import { getMessages, translate } from "@/lib/i18n";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const messages = getMessages();
  const t = (key, params) => translate(messages, key, params);

  if (!user) {
    return (
      <main className="flex flex-col items-center gap-6 bg-accent-light px-8 py-20 text-center">
        <h1 className="text-5xl font-bold text-accent">{t("home.loggedOut.title")}</h1>
        <p className="max-w-2xl text-lg text-gray-600">{t("home.loggedOut.subtitle")}</p>
        <div className="flex justify-center gap-4">
          <Button href="/signup" size="lg">{t("home.loggedOut.getStarted")}</Button>
          <Button href="/clubs" variant="secondary" size="lg">{t("home.loggedOut.browseClubs")}</Button>
        </div>
      </main>
    );
  }

  const [{ data: profile }, { data: membership }, { data: scores }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase.from("club_members").select("club_id, role, clubs(id, name)").eq("profile_id", user.id).maybeSingle(),
    supabase
      .from("scores")
      .select("id, round_name, score, shot_at, status")
      .eq("profile_id", user.id)
      .order("shot_at", { ascending: false })
      .limit(5),
  ]);

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
            {membership?.clubs ? (
              <div className="flex items-center justify-between gap-2">
                <Link href={`/clubs/${membership.clubs.id}`} className="font-medium hover:text-accent">
                  {membership.clubs.name}
                </Link>
                {membership.role && <Badge>{membership.role}</Badge>}
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
