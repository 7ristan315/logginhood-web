import { createClient } from "@/lib/supabase/server";
import ActivateClient from "./ActivateClient";

export const metadata = {
  title: "Activate Code · Logginhood",
  description: "Redeem your equipment activation code for free Logginhood Premium",
};

export default async function ActivatePage({ searchParams }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let existingSub = null;
  if (user) {
    const { data } = await supabase
      .from("premium_subscriptions")
      .select("id, expires_at, source")
      .eq("profile_id", user.id)
      .eq("is_active", true)
      .maybeSingle();
    existingSub = data;
  }

  const { code } = await searchParams;

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-4 p-4 md:p-8" style={{ paddingTop: "8vh" }}>
      <ActivateClient user={user} existingSub={existingSub} prefilledCode={code} />
    </main>
  );
}
