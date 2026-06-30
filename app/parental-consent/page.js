import ParentalConsentClient from "./ParentalConsentClient";

export const metadata = {
  title: "Parental Consent · Logginhood",
  description: "Approve an under-18 archer's request to make their Logginhood profile public.",
};

export default async function ParentalConsentPage({ searchParams }) {
  const { token, p } = await searchParams;

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-4 p-4 md:p-8" style={{ paddingTop: "8vh" }}>
      <ParentalConsentClient token={token || ""} profileId={p || ""} />
    </main>
  );
}
