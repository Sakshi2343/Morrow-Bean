import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { FiMessageSquare, FiSend, FiX, FiMinus } from "react-icons/fi";
import { useConciergeChatMutation } from "../../redux/api/intelligenceApiSlice";
import CoffeeProductImage from "../Products/CoffeeProductImage";

const brewMethodOptions = ["espresso", "aeropress", "pour-over", "french press"];
const roastOptions = ["light", "medium", "medium-dark", "dark"];

const initialMessages = [
  {
    role: "assistant",
    content:
      "Tell me how you brew and what flavors you like, and I’ll point you to the best beans or gear in the roastery.",
    recommendations: [],
  },
];

const RoastConcierge = () => {
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [preferences, setPreferences] = useState({
    brewingMethods: userInfo?.coffeeProfile?.brewingMethods || [],
    roastPreference: userInfo?.coffeeProfile?.roastPreference || "",
  });
  const [conciergeChat, { isLoading }] = useConciergeChatMutation();

  const hiddenOnPath =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register");

  if (hiddenOnPath) {
    return null;
  }

  const toggleMethod = (method) => {
    setPreferences((current) => ({
      ...current,
      brewingMethods: current.brewingMethods.includes(method)
        ? current.brewingMethods.filter((entry) => entry !== method)
        : [...current.brewingMethods, method],
    }));
  };

  const sendMessage = async (prompt) => {
    const nextMessage = prompt.trim();

    if (!nextMessage) {
      return;
    }

    const updatedMessages = [
      ...messages,
      {
        role: "user",
        content: nextMessage,
        recommendations: [],
      },
    ];

    setMessages(updatedMessages);
    setMessage("");

    try {
      const response = await conciergeChat({
        message: nextMessage,
        preferences: {
          ...userInfo?.coffeeProfile,
          ...preferences,
        },
        history: updatedMessages.slice(-6).map((entry) => ({
          role: entry.role,
          content: entry.content,
        })),
      }).unwrap();

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: response.reply,
          recommendations: response.recommendations || [],
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error?.data?.message ||
            "The concierge is taking a coffee break. Try again in a moment.",
          recommendations: [],
        },
      ]);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60]">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="w-[min(92vw,24rem)] overflow-hidden rounded-[2rem] border border-white/10 bg-[#120c09]/95 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          >
            <div className="flex items-start justify-between border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(201,139,76,0.25),_transparent_45%)] px-5 py-4">
              <div>
                <div className="text-xs uppercase tracking-[0.34em] text-amber-200/75">
                  Roast Concierge
                </div>
                <h3 className="mt-2 font-heading text-2xl text-white">Find your next cup</h3>
                <p className="mt-1 text-sm text-stone-300">
                  Personalized bean and equipment picks grounded in this store’s catalog.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMinimized(!minimized)}
                  className="rounded-full border border-white/10 p-2 text-stone-200 transition hover:bg-white/5"
                >
                  <FiMinus />
                </button>
                <button
                  onClick={() => { setOpen(false); setMinimized(false); }}
                  className="rounded-full border border-white/10 p-2 text-stone-200 transition hover:bg-white/5"
                >
                  <FiX />
                </button>
              </div>
            </div>

            {!minimized && (
              <>
                <div className="border-b border-white/10 px-5 py-4">
              <div className="text-xs uppercase tracking-[0.28em] text-stone-500">
                Brew Method
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {brewMethodOptions.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => toggleMethod(method)}
                    className={`rounded-full px-3 py-2 text-xs capitalize transition ${
                      preferences.brewingMethods.includes(method)
                        ? "bg-amber-400 text-stone-950"
                        : "border border-white/10 bg-white/5 text-stone-200"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              <div className="mt-4 text-xs uppercase tracking-[0.28em] text-stone-500">
                Roast Level
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {roastOptions.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      setPreferences((current) => ({
                        ...current,
                        roastPreference: current.roastPreference === level ? "" : level,
                      }))
                    }
                    className={`rounded-full px-3 py-2 text-xs capitalize transition ${
                      preferences.roastPreference === level
                        ? "bg-white text-stone-950"
                        : "border border-white/10 bg-white/5 text-stone-200"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[24rem] space-y-4 overflow-y-auto px-5 py-4">
              {messages.map((entry, index) => (
                <div key={`${entry.role}-${index}`}>
                  <div
                    className={`max-w-[90%] rounded-[1.4rem] px-4 py-3 text-sm leading-6 ${
                      entry.role === "assistant"
                        ? "bg-white/6 text-stone-100"
                        : "ml-auto bg-amber-400 text-stone-950"
                    }`}
                  >
                    {entry.content}
                  </div>

                  {entry.recommendations?.length ? (
                    <div className="mt-3 grid gap-3">
                      {entry.recommendations.map((product) => (
                        <Link
                          key={product._id}
                          to={`/product/${product._id}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 transition hover:border-amber-300/30"
                        >
                          <CoffeeProductImage
                            product={product}
                            className="h-16 w-16 rounded-2xl"
                            imageClassName="rounded-2xl"
                          />
                          <div className="min-w-0">
                            <div className="truncate font-medium text-white">{product.name}</div>
                            <div className="mt-1 text-xs text-stone-400">
                              {product.recommendationReasons?.[0] || product.brand}
                            </div>
                            <div className="mt-1 text-sm text-amber-200">${product.price}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
              {isLoading ? (
                <div className="rounded-[1.4rem] bg-white/6 px-4 py-3 text-sm text-stone-300">
                  Tasting the catalog and dialing in recommendations...
                </div>
              ) : null}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage(message);
              }}
              className="border-t border-white/10 p-4"
            >
              <div className="flex items-end gap-3">
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={2}
                  placeholder="Example: I brew AeroPress and want something chocolatey under $25."
                  className="min-h-[5rem] flex-1 rounded-[1.4rem] border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/35"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <FiSend />
                </button>
              </div>
            </form>
            </>
          )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(true)}
        className="ml-auto flex items-center gap-3 rounded-full border border-amber-300/30 bg-[#20130d] px-5 py-3 text-left text-white shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-400 text-stone-950">
          <FiMessageSquare />
        </span>
        <span>
          <span className="block text-xs uppercase tracking-[0.32em] text-amber-200/75">
            AI Barista
          </span>
          <span className="block text-sm text-stone-100">Ask for your best match</span>
        </span>
      </motion.button>
    </div>
  );
};

export default RoastConcierge;
