import { Link } from "react-router-dom";

const values = [
  {
    title: "Thoughtful sourcing",
    description:
      "We keep the assortment focused: standout beans, dependable tools, and brewing pieces worth living with.",
  },
  {
    title: "Coffee-first guidance",
    description:
      "Every roast and machine is merchandised with clear notes, use cases, and pairings for real coffee drinkers.",
  },
  {
    title: "Slow retail feel",
    description:
      "Soft colors, generous spacing, and tactile details make the shop feel more like a neighborhood counter than a marketplace.",
  },
];

const About = () => {
  return (
    <div className="container mx-auto px-4 pb-20">
      <section className="overflow-hidden rounded-[2.25rem] border border-[#ddcfbf] bg-[#fbf7f1] shadow-[0_28px_80px_rgba(92,70,54,0.08)]">
        <div className="grid gap-8 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="p-8 md:p-12">
            <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">About The Brand</div>
            <h1 className="mt-4 max-w-xl text-5xl leading-tight text-[#2f2218]">
              A small coffee shop storefront built around calm rituals and good brewing.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6d5747]">
              Morrow & Bean started with a simple idea: online coffee shopping should feel as warm
              and confident as standing at a favorite neighborhood counter. We pair carefully
              chosen beans with machines and brew tools that genuinely belong in a coffee lover’s
              kitchen.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="rounded-full bg-[#8b6343] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#755136]"
              >
                Explore the shop
              </Link>
              <Link
                to="/contact"
                className="rounded-full border border-[#d8c7b3] px-6 py-3 text-sm font-semibold text-[#5e4737] transition hover:bg-white"
              >
                Visit our contact page
              </Link>
            </div>
          </div>

          <div className="min-h-[340px] bg-[url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center" />
        </div>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        {values.map((value) => (
          <article
            key={value.title}
            className="rounded-[1.75rem] border border-[#dfd2c3] bg-white/80 p-6 shadow-[0_14px_45px_rgba(92,70,54,0.06)]"
          >
            <h2 className="text-2xl text-[#2f2218]">{value.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[#6d5747]">{value.description}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 rounded-[2rem] border border-[#ddcfbf] bg-[#f2e7db] p-8 md:p-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">What We Stock</div>
            <h2 className="mt-4 text-4xl text-[#2f2218]">
              Beans, machines, and gear chosen to work together.
            </h2>
          </div>
          <p className="text-base leading-8 text-[#6d5747]">
            Our catalog is intentionally small: bright single-origin bags, espresso-focused roasts,
            beautiful machines, and dependable manual tools. That tighter assortment makes it
            easier to browse by ritual instead of scrolling through noise.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
