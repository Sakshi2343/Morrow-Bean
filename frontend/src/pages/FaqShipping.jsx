import { useState } from "react";

const faqs = [
  {
    question: "How fresh are the beans when they ship?",
    answer:
      "We schedule roasting in small batches and hold back roast dates long enough for the coffee to settle, then ship promptly for peak flavor.",
  },
  {
    question: "Do you offer different bag sizes and colors?",
    answer:
      "Yes. Beans and gear are presented with available size and color variants so you can choose the format that best fits your shelf and brewing routine.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Orders usually leave our studio within 1 to 2 business days. Standard delivery typically lands within 3 to 5 business days depending on location.",
  },
  {
    question: "Can I save products for later?",
    answer:
      "Yes. Use the wishlist heart on products or the save-for-later controls in the cart to keep your shortlist ready for a future order.",
  },
];

const shippingHighlights = [
  "Free delivery on orders above $120.",
  "Protective packaging for machines, grinders, and ceramic pieces.",
  "Simple order tracking with updates after dispatch.",
  "Support for address changes before roasting or packing begins.",
];

const FaqShipping = () => {
  const [activeQuestion, setActiveQuestion] = useState(0);

  return (
    <div className="container mx-auto px-4 pb-20">
      <section className="rounded-[2.25rem] border border-[#ddcfbf] bg-[#fbf7f1] p-8 shadow-[0_28px_80px_rgba(92,70,54,0.08)] md:p-12">
        <div className="max-w-3xl">
          <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">FAQ & Shipping</div>
          <h1 className="mt-4 text-5xl leading-tight text-[#2f2218]">
            Shipping details and common questions for a calm checkout.
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#6d5747]">
            Everything here is designed to make ordering beans and brewing equipment feel clear,
            trustworthy, and easy to scan.
          </p>
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[0.95fr,1.05fr]">
        <div className="rounded-[2rem] border border-[#ddcfbf] bg-white/85 p-7 shadow-[0_18px_55px_rgba(92,70,54,0.06)]">
          <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Shipping Snapshot</div>
          <h2 className="mt-4 text-3xl text-[#2f2218]">What to expect after you place an order</h2>
          <div className="mt-6 space-y-4">
            {shippingHighlights.map((item) => (
              <div
                key={item}
                className="rounded-[1.25rem] border border-[#eadfd3] bg-[#faf4ec] p-4 text-sm leading-7 text-[#6d5747]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#ddcfbf] bg-white/85 p-7 shadow-[0_18px_55px_rgba(92,70,54,0.06)]">
          <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Common Questions</div>
          <div className="mt-6 space-y-3">
            {faqs.map((faq, index) => {
              const isActive = index === activeQuestion;
              return (
                <button
                  key={faq.question}
                  type="button"
                  onClick={() => setActiveQuestion(index)}
                  className={`w-full rounded-[1.4rem] border px-5 py-4 text-left transition ${
                    isActive
                      ? "border-[#b6906f] bg-[#f6ede3]"
                      : "border-[#eadfd3] bg-[#fffaf4] hover:border-[#d5bea8]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-base font-semibold text-[#2f2218]">{faq.question}</span>
                    <span className="text-[#8a6d58]">{isActive ? "−" : "+"}</span>
                  </div>
                  {isActive ? (
                    <p className="mt-3 text-sm leading-7 text-[#6d5747]">{faq.answer}</p>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FaqShipping;
