import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  useGetMyLimitOrdersQuery,
  usePlaceLimitOrderMutation,
} from "../../redux/api/intelligenceApiSlice";

const CoffeeExchangePanel = ({ product, pricingInsight }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const [targetPrice, setTargetPrice] = useState(
    Number(pricingInsight?.currentPrice || product.price || 0)
  );
  const [qty, setQty] = useState(1);
  const [feedItems, setFeedItems] = useState([]);
  const [livePrice, setLivePrice] = useState(Number(pricingInsight?.currentPrice || product.price));
  const { data: limitOrders = [], refetch } = useGetMyLimitOrdersQuery(undefined, {
    skip: !userInfo,
  });
  const [placeLimitOrder, { isLoading }] = usePlaceLimitOrderMutation();

  useEffect(() => {
    setTargetPrice(Number(pricingInsight?.currentPrice || product.price || 0));
    setLivePrice(Number(pricingInsight?.currentPrice || product.price || 0));
  }, [pricingInsight?.currentPrice, product.price]);

  useEffect(() => {
    const stream = new EventSource("/api/intelligence/market-stream");

    const handleEvent = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (String(payload.productId) !== String(product._id)) {
          return;
        }

        if (event.type === "price-update") {
          setLivePrice(Number(payload.currentPrice || livePrice));
        }

        setFeedItems((current) => [
          {
            id: `${event.type}-${Date.now()}`,
            type: event.type,
            message:
              event.type === "price-update"
                ? `Price tick: $${Number(payload.currentPrice || 0).toFixed(2)}`
                : `Limit order executed at $${Number(payload.executedPrice || 0).toFixed(2)}`,
          },
          ...current,
        ].slice(0, 4));
      } catch (error) {
        // Ignore malformed events without breaking the feed.
      }
    };

    stream.addEventListener("price-update", handleEvent);
    stream.addEventListener("limit-order-executed", handleEvent);

    return () => {
      stream.close();
    };
  }, [product._id]);

  const myOrdersForProduct = useMemo(
    () =>
      limitOrders.filter((entry) => String(entry.product?._id || entry.product) === String(product._id)),
    [limitOrders, product._id]
  );

  const submitLimitOrder = async (event) => {
    event.preventDefault();

    if (!userInfo) {
      toast.error("Please sign in to place a limit order.");
      return;
    }

    try {
      await placeLimitOrder({
        productId: product._id,
        targetPrice: Number(targetPrice),
        qty: Number(qty),
      }).unwrap();
      toast.success("Limit order placed on the coffee exchange");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Unable to place limit order");
    }
  };

  return (
    <div className="coffee-panel p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="eyebrow">Coffee Exchange</div>
          <h3 className="mt-2 text-3xl font-heading text-white">Live market terminal</h3>
          <p className="mt-2 text-sm text-stone-400">
            Stream dynamic pricing updates, watch floor and ceiling bands, and set algorithmic buy targets on rare roasts.
          </p>
        </div>
        <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
          Live
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm text-stone-400">Current price</div>
          <div className="mt-2 text-3xl font-semibold text-white">${Number(livePrice || 0).toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm text-stone-400">Floor</div>
          <div className="mt-2 text-2xl font-semibold text-amber-200">
            ${Number(pricingInsight?.priceFloor || product.price || 0).toFixed(2)}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm text-stone-400">Ceiling</div>
          <div className="mt-2 text-2xl font-semibold text-amber-200">
            ${Number(pricingInsight?.priceCeiling || product.price || 0).toFixed(2)}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm text-stone-400">Open interest</div>
          <div className="mt-2 text-2xl font-semibold text-white">{pricingInsight?.openLimitOrders || 0}</div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
        <form onSubmit={submitLimitOrder} className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <h4 className="text-lg font-semibold text-white">Algorithmic order execution</h4>
          <p className="mt-2 text-sm text-stone-400">
            When the dynamic price reaches your target, the backend auto-reserves the roast and generates an exchange order.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm text-stone-300">Target price</label>
              <input
                type="number"
                step="0.01"
                value={targetPrice}
                onChange={(event) => setTargetPrice(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#1a120e] px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-stone-300">Quantity</label>
              <input
                type="number"
                min="1"
                max={Math.max(1, product.countInStock || 1)}
                value={qty}
                onChange={(event) => setQty(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#1a120e] px-4 py-3 text-white outline-none"
              />
            </div>

            {userInfo ? (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-primary px-4 py-3 font-semibold text-stone-950 transition hover:bg-[#dfa15d]"
              >
                {isLoading ? "Placing..." : "Place Limit Order"}
              </button>
            ) : (
              <Link
                to="/login"
                className="block w-full rounded-full border border-white/10 px-4 py-3 text-center font-semibold text-white transition hover:bg-white/5"
              >
                Sign in to trade
              </Link>
            )}
          </div>
        </form>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h4 className="text-lg font-semibold text-white">Market feed</h4>
            <div className="mt-4 space-y-3">
              {feedItems.length ? (
                feedItems.map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-stone-300">
                    {entry.message}
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 p-3 text-sm text-stone-400">
                  The terminal is listening for price ticks and order executions.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h4 className="text-lg font-semibold text-white">Your open interest</h4>
            <div className="mt-4 space-y-3">
              {myOrdersForProduct.length ? (
                myOrdersForProduct.slice(0, 3).map((entry) => (
                  <div key={entry._id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">${Number(entry.targetPrice || 0).toFixed(2)}</span>
                      <span className="text-xs uppercase tracking-[0.2em] text-stone-400">{entry.status}</span>
                    </div>
                    <div className="mt-1 text-sm text-stone-400">Qty {entry.qty}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 p-3 text-sm text-stone-400">
                  No limit orders on this roast yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoffeeExchangePanel;
