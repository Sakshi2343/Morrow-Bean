import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import ProgressSteps from "../../components/ProgressSteps";
import CoffeeProductImage from "../../components/Products/CoffeeProductImage";
import { useCreateOrderMutation } from "../../redux/api/orderApiSlice";
import { clearCartItems } from "../../redux/features/cart/cartSlice";
import { getFormattedCurrency } from "../../lib/catalog";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const [createOrder, { isLoading, error }] = useCreateOrderMutation();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate("/checkout");
    }
  }, [cart.shippingAddress.address, navigate]);

  const placeOrderHandler = async () => {
    try {
      const response = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      }).unwrap();

      dispatch(clearCartItems());
      navigate(`/order/${response._id}`);
    } catch (submitError) {
      toast.error(submitError?.data?.error || "We couldn't place the order.");
    }
  };

  return (
    <div className="container mx-auto px-4 pb-20">
      <ProgressSteps step1 step2 step3 />

      {!cart.cartItems.length ? (
        <Message>
          Your cart is empty. <Link to="/shop">Return to the shop</Link>.
        </Message>
      ) : (
        <section className="grid gap-8 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-[2.2rem] border border-[#ddcfbf] bg-[#fbf7f1] p-8 shadow-[0_28px_80px_rgba(92,70,54,0.08)]">
            <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Review Order</div>
            <h1 className="mt-4 text-4xl text-[#2f2218]">One last look before payment.</h1>

            <div className="mt-8 space-y-4">
              {cart.cartItems.map((item) => (
                <div
                  key={item.cartItemId || item._id}
                  className="grid gap-4 rounded-[1.6rem] border border-[#eadfd3] bg-white/80 p-4 md:grid-cols-[96px,1fr,auto]"
                >
                  <CoffeeProductImage
                    product={item}
                    className="h-24 rounded-[1.1rem] bg-[#f3e7db]"
                    imageClassName="h-full w-full rounded-[1.1rem] object-cover"
                  />
                  <div>
                    <div className="font-semibold text-[#2f2218]">{item.name}</div>
                    <div className="mt-1 text-sm text-[#6d5747]">{item.variantLabel}</div>
                    <div className="mt-1 text-sm text-[#8a6d58]">Qty {item.qty}</div>
                  </div>
                  <div className="text-right text-sm font-semibold text-[#2f2218]">
                    {getFormattedCurrency(item.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-[#ddcfbf] bg-white/85 p-7 shadow-[0_18px_55px_rgba(92,70,54,0.06)]">
              <h2 className="text-2xl text-[#2f2218]">Shipping</h2>
              <p className="mt-4 text-sm leading-7 text-[#6d5747]">
                {cart.shippingAddress.address}, {cart.shippingAddress.city} {cart.shippingAddress.postalCode},{" "}
                {cart.shippingAddress.country}
              </p>
            </div>

            <div className="rounded-[2rem] border border-[#ddcfbf] bg-white/85 p-7 shadow-[0_18px_55px_rgba(92,70,54,0.06)]">
              <h2 className="text-2xl text-[#2f2218]">Payment</h2>
              <p className="mt-4 text-sm leading-7 text-[#6d5747]">{cart.paymentMethod}</p>
            </div>

            <div className="rounded-[2rem] border border-[#ddcfbf] bg-[#f3e7db] p-7 shadow-[0_18px_55px_rgba(92,70,54,0.06)]">
              <h2 className="text-2xl text-[#2f2218]">Totals</h2>
              <div className="mt-5 space-y-3 text-sm text-[#6d5747]">
                <div className="flex items-center justify-between">
                  <span>Items</span>
                  <span>{getFormattedCurrency(cart.itemsPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>{getFormattedCurrency(cart.shippingPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax</span>
                  <span>{getFormattedCurrency(cart.taxPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-semibold text-[#2f2218]">
                  <span>Total</span>
                  <span>{getFormattedCurrency(cart.totalPrice)}</span>
                </div>
              </div>

              {error ? (
                <div className="mt-5">
                  <Message variant="danger">{error.data?.message || error.data?.error}</Message>
                </div>
              ) : null}

              <button
                type="button"
                onClick={placeOrderHandler}
                className="mt-6 w-full rounded-full bg-[#8b6343] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#755136]"
              >
                Place order
              </button>
              {isLoading ? <Loader /> : null}
            </div>
          </aside>
        </section>
      )}
    </div>
  );
};

export default PlaceOrder;
