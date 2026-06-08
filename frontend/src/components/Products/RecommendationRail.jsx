import { Link } from "react-router-dom";
import CoffeeProductImage from "./CoffeeProductImage";

const RecommendationRail = ({ data = [], title = "Flavor Matches" }) => {
  if (!data.length) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-[#120d09] p-5">
      <div className="mb-5">
        <h3 className="text-2xl font-heading text-white">{title}</h3>
        <p className="mt-1 text-sm text-stone-400">
          Personalized by the flavor matcher using your brew habits and taste preferences.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((product) => (
          <Link
            key={product._id}
            to={`/product/${product._id}`}
            className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:-translate-y-1 hover:border-amber-400/20"
          >
            <div className="mb-3 flex items-center gap-3">
              <CoffeeProductImage
                product={product}
                className="h-16 w-16 rounded-xl"
                imageClassName="rounded-xl"
              />
              <div>
                <h4 className="font-semibold text-white">{product.name}</h4>
                <p className="text-sm text-amber-200">
                  Match score: {Math.round(product.recommendationScore || 0)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-stone-300">
              {(product.recommendationReasons || []).map((reason) => (
                <span
                  key={reason}
                  className="rounded-full border border-white/10 bg-white/5 px-2 py-1"
                >
                  {reason}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecommendationRail;
