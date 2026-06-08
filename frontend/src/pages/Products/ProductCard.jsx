import { Link } from "react-router-dom";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import HeartIcon from "./HeartIcon";
import CoffeeProductImage from "../../components/Products/CoffeeProductImage";
import { addToCart } from "../../redux/features/cart/cartSlice";
import {
  buildCartItem,
  getCollectionMeta,
  getFormattedCurrency,
  getProductFacts,
  getProductPricePreview,
  getVariantOptions,
} from "../../lib/catalog";

const ProductCard = ({ p }) => {
  const dispatch = useDispatch();
  const pricePreview = getProductPricePreview(p);
  const variantOptions = getVariantOptions(p);

  const addToCartHandler = () => {
    dispatch(addToCart(buildCartItem(p, {}, 1)));
    toast.success("Added to cart");
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-[#dfd2c3] bg-white/85 shadow-[0_18px_55px_rgba(92,70,54,0.06)] transition hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(92,70,54,0.1)]">
      <div className="relative overflow-hidden">
        <Link to={`/product/${p._id}`}>
          <CoffeeProductImage
            product={p}
            className="aspect-[4/4.6] bg-[#f3e7db]"
            imageClassName="transition duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="absolute right-4 top-4">
          <HeartIcon product={p} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="text-xs uppercase tracking-[0.32em] text-[#9a7b62]">{getCollectionMeta(p).label}</div>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <Link to={`/product/${p._id}`} className="text-2xl text-[#2f2218]">
              {p.name}
            </Link>
            <div className="mt-2 text-sm text-[#6d5747]">{p.brand}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-[#8b6343]">{pricePreview.label}</div>
            <div className="mt-1 text-xs text-[#9a7b62]">variant pricing</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-[#8b7565]">
          {getProductFacts(p).map((fact) => (
            <span key={fact} className="rounded-full bg-[#f6ede3] px-3 py-1">
              {fact}
            </span>
          ))}
        </div>

        <p className="mt-4 flex-1 text-sm leading-7 text-[#6d5747]">
          {p.marketing?.featuredHeadline || p.description}
        </p>

        <div className="mt-5 border-t border-[#ede2d7] pt-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.32em] text-[#9a7b62]">Sizes</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {variantOptions.sizes.slice(0, 3).map((size) => (
                  <span key={size.value} className="rounded-full border border-[#e2d4c5] px-3 py-1 text-xs text-[#5d4738]">
                    {size.label}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.32em] text-[#9a7b62]">Colors</div>
              <div className="mt-2 flex justify-end gap-2">
                {variantOptions.colors.slice(0, 3).map((color) => (
                  <span
                    key={color.value}
                    title={color.label}
                    className="h-5 w-5 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <Link to={`/product/${p._id}`} className="text-sm font-semibold text-[#8b6343]">
              View details
            </Link>
            <button
              type="button"
              onClick={addToCartHandler}
              className="flex items-center gap-2 rounded-full bg-[#8b6343] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#755136]"
            >
              <AiOutlineShoppingCart size={18} />
              Quick add
            </button>
          </div>

          <div className="mt-3 text-xs text-[#9a7b62]">
            Default variant starts at {getFormattedCurrency(pricePreview.min)}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
