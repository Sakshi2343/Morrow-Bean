import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon";

const Product = ({ product }) => {
  return (
    <div className="group relative w-full overflow-hidden rounded-xl border border-white/10 bg-card shadow-lg transition-all duration-300 hover:shadow-2xl">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
          <HeartIcon product={product} />
        </div>
      </div>

      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <div className="mb-2 flex items-start justify-between">
            <h2 className="line-clamp-1 text-lg font-bold text-white transition-colors group-hover:text-primary">
              {product.name}
            </h2>
            <span className="rounded-full bg-primary/20 px-2 py-1 text-xs font-bold text-primary">
              ${product.price}
            </span>
          </div>
          <div className="mb-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.15em] text-stone-400">
            {product.beanProfile?.origin ? <span>{product.beanProfile.origin}</span> : null}
            {product.beanProfile?.roastLevel ? <span>{product.beanProfile.roastLevel}</span> : null}
            {product.productType ? <span>{product.productType}</span> : null}
          </div>
          <p className="mb-3 line-clamp-2 text-sm text-gray-400">
            {product.description?.substring(0, 60)}...
          </p>
        </Link>
      </div>
    </div>
  );
};

export default Product;
