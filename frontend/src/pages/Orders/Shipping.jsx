import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { savePaymentMethod, saveShippingAddress } from "../../redux/features/cart/cartSlice";
import ProgressSteps from "../../components/ProgressSteps";

const paymentOptions = ["PayPal", "Card", "Pay on Pickup"];

const Shipping = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { shippingAddress, paymentMethod } = useSelector((state) => state.cart);

  const [formState, setFormState] = useState({
    address: shippingAddress.address || "",
    city: shippingAddress.city || "",
    postalCode: shippingAddress.postalCode || "",
    country: shippingAddress.country || "",
  });
  const [selectedPayment, setSelectedPayment] = useState(paymentMethod || "PayPal");

  const submitHandler = (event) => {
    event.preventDefault();
    dispatch(saveShippingAddress(formState));
    dispatch(savePaymentMethod(selectedPayment));
    navigate("/checkout/payment");
  };

  return (
    <div className="container mx-auto px-4 pb-20">
      <ProgressSteps step1 step2 />
      <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <form
          onSubmit={submitHandler}
          className="rounded-[2.2rem] border border-[#ddcfbf] bg-[#fbf7f1] p-8 shadow-[0_28px_80px_rgba(92,70,54,0.08)]"
        >
          <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Checkout</div>
          <h1 className="mt-4 text-4xl text-[#2f2218]">Shipping and payment details</h1>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-[#5f4b3c] md:col-span-2">
              Street address
              <input
                type="text"
                required
                value={formState.address}
                onChange={(event) => setFormState({ ...formState, address: event.target.value })}
                className="rounded-[1.1rem] border border-[#dbcbb8] bg-white px-4 py-3 text-[#2f2218] outline-none transition focus:border-[#9d7552]"
                placeholder="123 Market Street"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#5f4b3c]">
              City
              <input
                type="text"
                required
                value={formState.city}
                onChange={(event) => setFormState({ ...formState, city: event.target.value })}
                className="rounded-[1.1rem] border border-[#dbcbb8] bg-white px-4 py-3 text-[#2f2218] outline-none transition focus:border-[#9d7552]"
                placeholder="San Francisco"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#5f4b3c]">
              Postal code
              <input
                type="text"
                required
                value={formState.postalCode}
                onChange={(event) => setFormState({ ...formState, postalCode: event.target.value })}
                className="rounded-[1.1rem] border border-[#dbcbb8] bg-white px-4 py-3 text-[#2f2218] outline-none transition focus:border-[#9d7552]"
                placeholder="94103"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#5f4b3c] md:col-span-2">
              Country
              <input
                type="text"
                required
                value={formState.country}
                onChange={(event) => setFormState({ ...formState, country: event.target.value })}
                className="rounded-[1.1rem] border border-[#dbcbb8] bg-white px-4 py-3 text-[#2f2218] outline-none transition focus:border-[#9d7552]"
                placeholder="United States"
              />
            </label>
          </div>

          <div className="mt-8">
            <div className="text-sm font-medium text-[#5f4b3c]">Payment method</div>
            <div className="mt-4 grid gap-3">
              {paymentOptions.map((option) => (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center justify-between rounded-[1.3rem] border px-4 py-4 transition ${
                    selectedPayment === option
                      ? "border-[#8b6343] bg-[#f3e7db]"
                      : "border-[#dbcbb8] bg-white"
                  }`}
                >
                  <span className="text-sm font-medium text-[#2f2218]">{option}</span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={option}
                    checked={selectedPayment === option}
                    onChange={(event) => setSelectedPayment(event.target.value)}
                    className="accent-[#8b6343]"
                  />
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="mt-8 rounded-full bg-[#8b6343] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#755136]"
          >
            Continue to review
          </button>
        </form>

        <aside className="rounded-[2.2rem] border border-[#ddcfbf] bg-white/85 p-8 shadow-[0_20px_60px_rgba(92,70,54,0.06)]">
          <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Shipping Notes</div>
          <div className="mt-6 space-y-4 text-sm leading-7 text-[#6d5747]">
            <div className="rounded-[1.3rem] border border-[#eadfd3] bg-[#fbf7f1] p-4">
              Orders over $120 qualify for free delivery.
            </div>
            <div className="rounded-[1.3rem] border border-[#eadfd3] bg-[#fbf7f1] p-4">
              Beans ship in protective packaging and machines are packed with reinforced padding.
            </div>
            <div className="rounded-[1.3rem] border border-[#eadfd3] bg-[#fbf7f1] p-4">
              We will confirm dispatch and tracking details once the order is placed.
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default Shipping;
