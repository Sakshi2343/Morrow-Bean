import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useAllProductsQuery, useGetProductDetailsQuery, useTrackProductViewMutation } from "../../redux/api/productApiSlice";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import CoffeeProductImage from "../../components/Products/CoffeeProductImage";
import HeartIcon from "./HeartIcon";
import ProductCard from "./ProductCard";
import { addToCart } from "../../redux/features/cart/cartSlice";
import {
  buildCartItem,
  getCollectionMeta,
  getFormattedCurrency,
  getProductFacts,
  getProductPricePreview,
  getVariantOptions,
  resolveVariantSelection,
} from "../../lib/catalog";

const ProductDetails = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const trackedRef = useRef(false);

  const { data: product, isLoading, error } = useGetProductDetailsQuery(productId);
  const { data: allProducts = [] } = useAllProductsQuery();
  const [trackProductView] = useTrackProductViewMutation();

  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    if (product) {
      const options = getVariantOptions(product);
      setSelectedSize(options.sizes[1]?.value || options.sizes[0]?.value || "");
      setSelectedColor(options.colors[0]?.value || "");
    }
  }, [product]);

  useEffect(() => {
    if (!productId || trackedRef.current) {
      return;
    }

    trackedRef.current = true;
    trackProductView(productId).catch(() => {});
  }, [productId, trackProductView]);

  if (isLoading) {
    return <Loader />;
  }

  if (error || !product) {
    return <Message variant="danger">{error?.data?.message || error?.message || "Product not found"}</Message>;
  }

  const variantOptions = getVariantOptions(product);
  const currentVariant = resolveVariantSelection(product, {
    size: selectedSize,
    color: selectedColor,
  });
  const pricePreview = getProductPricePreview(product);
  const relatedProducts = allProducts
    .filter((entry) => entry._id !== product._id && getCollectionMeta(entry).id === getCollectionMeta(product).id)
    .slice(0, 3);

  const addToCartHandler = () => {
    dispatch(
      addToCart(
        buildCartItem(
          product,
          {
            size: currentVariant.selectedSize?.value,
            color: currentVariant.selectedColor?.value,
          },
          qty
        )
      )
    );
    toast.success("Added to cart");
    navigate("/cart");
  };

  return (
    <div className="container mx-auto px-4 pb-20">
      <Link to="/shop" className="mb-6 inline-flex items-center text-sm font-medium text-[#8b6343]">
        ← Back to shop
      </Link>

      <section className="grid gap-8 lg:grid-cols-[1fr,1fr]">
        <div className="overflow-hidden rounded-[2.3rem] border border-[#dfd2c3] bg-white/80 shadow-[0_20px_60px_rgba(92,70,54,0.08)]">
          <div className="relative">
            <CoffeeProductImage
              product={product}
              className="aspect-[4/4.7] bg-[#f3e7db]"
              imageClassName="h-full w-full object-cover"
            />
            <div className="absolute right-5 top-5">
              <HeartIcon product={product} />
            </div>
          </div>
        </div>

        <div className="rounded-[2.3rem] border border-[#dfd2c3] bg-[#fbf7f1] p-8 shadow-[0_20px_60px_rgba(92,70,54,0.08)]">
          <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">{getCollectionMeta(product).label}</div>
          <h1 className="mt-4 text-5xl leading-tight text-[#2f2218]">{product.name}</h1>
          <p className="mt-4 text-lg leading-8 text-[#6d5747]">{product.description}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {getProductFacts(product).map((fact) => (
              <span key={fact} className="rounded-full bg-white px-4 py-2 text-xs uppercase tracking-[0.16em] text-[#7f6654]">
                {fact}
              </span>
            ))}
          </div>

          <div className="mt-7 flex items-end justify-between gap-5">
            <div>
              <div className="text-4xl font-semibold text-[#2f2218]">{getFormattedCurrency(currentVariant.price)}</div>
              <div className="mt-1 text-sm text-[#8a6d58]">Range {pricePreview.label}</div>
            </div>
            <div className="rounded-[1.4rem] border border-[#eadfd3] bg-white px-4 py-3 text-sm text-[#6d5747]">
              <div>{product.brand}</div>
              <div className="mt-1">{product.countInStock} in stock</div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Size</div>
              <div className="mt-3 flex flex-wrap gap-3">
                {variantOptions.sizes.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => setSelectedSize(size.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      selectedSize === size.value
                        ? "border-[#8b6343] bg-[#8b6343] text-white"
                        : "border-[#d9c8b4] bg-white text-[#5e4737]"
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Color</div>
              <div className="mt-3 flex flex-wrap gap-3">
                {variantOptions.colors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                      selectedColor === color.value
                        ? "border-[#8b6343] bg-[#f3e7db] text-[#2f2218]"
                        : "border-[#d9c8b4] bg-white text-[#5e4737]"
                    }`}
                  >
                    <span className="h-4 w-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: color.hex }} />
                    {color.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <select
              value={qty}
              onChange={(event) => setQty(Number(event.target.value))}
              className="rounded-full border border-[#d9c8b4] bg-white px-5 py-3 text-sm text-[#2f2218] outline-none"
            >
              {[...Array(Math.min(product.countInStock, 10)).keys()].map((value) => (
                <option key={value + 1} value={value + 1}>
                  Qty {value + 1}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={addToCartHandler}
              className="rounded-full bg-[#8b6343] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#755136]"
            >
              Add to cart
            </button>
          </div>

          <div className="mt-8 rounded-[1.6rem] border border-[#eadfd3] bg-white/80 p-5">
            <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Selected Variant</div>
            <div className="mt-3 text-base font-semibold text-[#2f2218]">{currentVariant.variantLabel}</div>
            <p className="mt-2 text-sm leading-7 text-[#6d5747]">
              Perfect for shoppers who want clear options without losing the feeling of a considered coffee shelf.
            </p>
          </div>
        </div>
      </section>

      {product.beanProfile?.tastingNotes?.length || product.beanProfile?.recommendedBrewingMethods?.length ? (
        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-[#dfd2c3] bg-white/85 p-7 shadow-[0_18px_55px_rgba(92,70,54,0.06)]">
            <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Flavor Notes</div>
            <div className="mt-4 flex flex-wrap gap-3">
              {(product.beanProfile?.tastingNotes || []).map((note) => (
                <span key={note} className="rounded-full bg-[#f6ede3] px-4 py-2 text-sm text-[#5e4737]">
                  {note}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[#dfd2c3] bg-white/85 p-7 shadow-[0_18px_55px_rgba(92,70,54,0.06)]">
            <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Brewing Match</div>
            <div className="mt-4 flex flex-wrap gap-3">
              {(
                product.beanProfile?.recommendedBrewingMethods ||
                product.equipmentProfile?.supportedBrewingMethods ||
                []
              ).map((method) => (
                <span key={method} className="rounded-full bg-[#f6ede3] px-4 py-2 text-sm text-[#5e4737]">
                  {method}
                </span>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {relatedProducts.length ? (
        <section className="mt-12">
          <div className="mb-8">
            <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">You may also like</div>
            <h2 className="mt-3 text-4xl text-[#2f2218]">More from this collection</h2>
          </div>
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {relatedProducts.map((entry) => (
              <ProductCard key={entry._id} p={entry} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default ProductDetails;
