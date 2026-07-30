import Container from "./Container";

export default function PageHero({
  kicker,
  title,
  intro,
}: {
  kicker: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="bg-dots-green relative overflow-hidden bg-white pb-20 pt-40 sm:pb-24 sm:pt-32">
      <div className="absolute inset-0 bg-gradient-to-br from-momo-green-neon/35 via-white to-momo-orange/20" />
      <Container className="relative">
        <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-momo-orange">
          {kicker}
        </p>
        <h1 className="font-display mt-3 max-w-3xl text-4xl font-extrabold text-momo-black sm:text-5xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-5 max-w-2xl text-lg text-momo-black/70">{intro}</p>
        )}
      </Container>
      <svg
        className="absolute inset-x-0 bottom-0 h-8 w-full sm:h-12"
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,32 C200,64 400,0 600,24 C800,48 1000,8 1200,32 L1200,60 L0,60 Z"
          className="momo-wave-fill"
        />
      </svg>
    </section>
  );
}
