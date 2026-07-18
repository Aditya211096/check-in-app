export default function Splash() {
  return (
    <main className="min-h-screen flex flex-col justify-end">
      <div className="h-[55vw] bg-gradient-to-b from-sky1 via-sky2 to-sky3" />
      <section className="p-6 space-y-4">
        <h1 className="font-display text-3xl">Rest stops, made simple.</h1>
        <p className="text-ink/70">Book beds and private rooms across trusted hostels. One profile, one KYC, every property.</p>
        <a href="/auth/phone" className="inline-flex items-center rounded-2xl bg-navy text-cream px-6 py-3 font-medium">Continue with phone</a>
      </section>
    </main>
  );
}
