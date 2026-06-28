export function GET() {
  return new Response(JSON.stringify({
    status: "ok",
    env: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      anonPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 15) + "...",
      hasService: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    time: new Date().toISOString(),
  }), { headers: { "Content-Type": "application/json" } });
}
