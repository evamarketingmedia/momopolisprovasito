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
    <section className="bg-dots relative overflow-hidden bg-momo-black pb-20 pt-16 sm:pb-24 sm:pt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-momo-green-900/60 via-momo-black to-momo-black" />
      <Container className="relative">
        <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-momo-orange">
          {kicker}
        </p>
        <h1 className="font-display mt-3 max-w-3xl text-4xl font-extrabold text-white sm:text-5xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-5 max-w-2xl text-lg text-white/75">{intro}</p>
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
