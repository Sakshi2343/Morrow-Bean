import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { removeFromFavorites, selectFavoriteProduct } from "../../redux/features/favorites/favoriteSlice";
import { removeFavoriteFromLocalStorage } from "../../Utils/localStorage";
import { buildCartItem } from "../../lib/catalog";
import ProductCard from "./ProductCard";

const Favorites = () => {
  const dispatch = useDispatch();
  const favorites = useSelector(selectFavoriteProduct);

  const addFavoriteToCart = (product) => {
    dispatch(addToCart(buildCartItem(product, {}, 1)));
    toast.success("Moved to cart");
  };

  const removeItem = (product) => {
    dispatch(removeFromFavorites(product));
    removeFavoriteFromLocalStorage(product._id);
  };

  return (
    <div className="container mx-auto px-4 pb-20">
      <section className="rounded-[2.3rem] border border-[#ddcfbf] bg-[#fbf7f1] p-8 shadow-[0_28px_80px_rgba(92,70,54,0.08)]">
        <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Wishlist</div>
        <h1 className="mt-4 text-5xl leading-tight text-[#2f2218]">Saved favorites for later.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#6d5747]">
          Keep a shortlist of beans, machines, and brew tools before you are ready to check out.
        </p>

        {!favorites.length ? (
          <p className="mt-8 text-base leading-8 text-[#6d5747]">
            Your wishlist is empty. <Link to="/shop" className="font-semibold text-[#8b6343]">Return to the shop</Link>.
          </p>
        ) : (
          <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {favorites.map((product) => (
              <div key={product._id} className="space-y-4">
                <ProductCard p={product} />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => addFavoriteToCart(product)}
                    className="flex-1 rounded-full bg-[#8b6343] px-5 py-3 text-sm font-semibold text-white"
                  >
                    Add to cart
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(product)}
                    className="rounded-full border border-[#d9c8b4] px-5 py-3 text-sm font-medium text-[#5d4738]"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Favorites;
