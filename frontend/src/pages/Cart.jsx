import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaRegTrashAlt } from "react-icons/fa";
import CoffeeProductImage from "../components/Products/CoffeeProductImage";
import {
  addToCart,
  moveToCart,
  removeFromCart,
  removeSavedItem,
  saveForLater,
} from "../redux/features/cart/cartSlice";
import { getFormattedCurrency } from "../lib/catalog";

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems, savedItems, itemsPrice, shippingPrice, taxPrice, totalPrice } = useSelector((state) => state.cart);

  const checkoutHandler = () => {
    navigate("/login?redirect=/checkout");
  };

  return (
    <div className="container mx-auto px-4 pb-20">
      <section className="grid gap-8 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-6">
          <div className="rounded-[2.2rem] border border-[#ddcfbf] bg-[#fbf7f1] p-8 shadow-[0_28px_80px_rgba(92,70,54,0.08)]">
            <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Shopping Cart</div>
            <h1 className="mt-4 text-4xl text-[#2f2218]">Review your coffee shelf</h1>

            {!cartItems.length ? (
              <p className="mt-6 text-base leading-8 text-[#6d5747]">
                Your cart is empty. <Link to="/shop" className="font-semibold text-[#8b6343]">Explore the shop</Link>.
              </p>
            ) : (
              <div className="mt-8 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.cartItemId || item._id}
                    className="grid gap-4 rounded-[1.6rem] border border-[#eadfd3] bg-white/80 p-4 md:grid-cols-[120px,1fr,auto]"
                  >
                    <CoffeeProductImage
                      product={item}
                      className="h-28 rounded-[1.2rem] bg-[#f3e7db]"
                      imageClassName="h-full w-full rounded-[1.2rem] object-cover"
                    />

                    <div>
                      <Link to={`/product/${item._id}`} className="text-xl text-[#2f2218]">
                        {item.name}
                      </Link>
                      <div className="mt-2 text-sm text-[#6d5747]">{item.variantLabel}</div>
                      <div className="mt-2 text-sm text-[#8a6d58]">{item.brand}</div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <select
                          value={item.qty}
                          onChange={(event) =>
                            dispatch(addToCart({ ...item, qty: Number(event.target.value) }))
                          }
                          className="rounded-full border border-[#d9c8b4] bg-white px-4 py-2 text-sm text-[#2f2218] outline-none"
                        >
                          {[...Array(Math.min(item.countInStock || 10, 10)).keys()].map((value) => (
                            <option key={value + 1} value={value + 1}>
                              Qty {value + 1}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => dispatch(saveForLater(item.cartItemId || item._id))}
                          className="rounded-full border border-[#d9c8b4] px-4 py-2 text-sm font-medium text-[#5d4738]"
                        >
                          Save for later
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <div className="text-lg font-semibold text-[#2f2218]">{getFormattedCurrency(item.price)}</div>
                      <button
                        type="button"
                        onClick={() => dispatch(removeFromCart(item.cartItemId || item._id))}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfd3] bg-white text-[#8e5a4a]"
                      >
                        <FaRegTrashAlt size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {savedItems.length ? (
            <div className="rounded-[2.2rem] border border-[#ddcfbf] bg-white/85 p-8 shadow-[0_20px_60px_rgba(92,70,54,0.06)]">
              <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Save For Later</div>
              <div className="mt-6 space-y-4">
                {savedItems.map((item) => (
                  <div
                    key={item.cartItemId || item._id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-[1.4rem] border border-[#eadfd3] bg-[#fbf7f1] p-4"
                  >
                    <div>
                      <div className="font-semibold text-[#2f2218]">{item.name}</div>
                      <div className="mt-1 text-sm text-[#6d5747]">{item.variantLabel}</div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => dispatch(moveToCart(item.cartItemId || item._id))}
                        className="rounded-full bg-[#8b6343] px-4 py-2 text-sm font-semibold text-white"
                      >
                        Move to cart
                      </button>
                      <button
                        type="button"
                        onClick={() => dispatch(removeSavedItem(item.cartItemId || item._id))}
                        className="rounded-full border border-[#d9c8b4] px-4 py-2 text-sm font-medium text-[#5d4738]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="rounded-[2.2rem] border border-[#ddcfbf] bg-[#f3e7db] p-8 shadow-[0_28px_80px_rgba(92,70,54,0.08)]">
          <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Order Summary</div>
          <h2 className="mt-4 text-3xl text-[#2f2218]">Checkout totals</h2>
          <div className="mt-6 space-y-4 text-sm text-[#6d5747]">
            <div className="flex items-center justify-between">
              <span>Items</span>
              <span>{cartItems.reduce((sum, item) => sum + item.qty, 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{getFormattedCurrency(itemsPrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>{getFormattedCurrency(shippingPrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tax</span>
              <span>{getFormattedCurrency(taxPrice)}</span>
            </div>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-[#dbcbb8] bg-white/75 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6d5747]">Total</span>
              <span className="text-2xl font-semibold text-[#2f2218]">{getFormattedCurrency(totalPrice)}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={!cartItems.length}
            onClick={checkoutHandler}
            className="mt-6 w-full rounded-full bg-[#8b6343] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#755136] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Continue to checkout
          </button>

          <Link to="/favorite" className="mt-4 block text-center text-sm font-medium text-[#8b6343]">
            View wishlist
          </Link>
        </aside>
      </section>
    </div>
  );
};

export default Cart;
