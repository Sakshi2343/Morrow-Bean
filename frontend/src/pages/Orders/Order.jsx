import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Messsage from "../../components/Message";
import Loader from "../../components/Loader";
import CoffeeProductImage from "../../components/Products/CoffeeProductImage";
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  useGetPaypalClientIdQuery,
  usePayOrderMutation,
} from "../../redux/api/orderApiSlice";

const Order = () => {
  const { id: orderId } = useParams();
  const { data: order, refetch, isLoading, error } = useGetOrderDetailsQuery(orderId);

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  const {
    data: paypal,
    isLoading: loadingPaPal,
    error: errorPayPal,
  } = useGetPaypalClientIdQuery();

  useEffect(() => {
    if (!errorPayPal && !loadingPaPal && paypal.clientId) {
      const loadingPaPalScript = async () => {
        paypalDispatch({
          type: "resetOptions",
          value: {
            "client-id": paypal.clientId,
            currency: "USD",
          },
        });
        paypalDispatch({ type: "setLoadingStatus", value: "pending" });
      };

      if (order && !order.isPaid && !window.paypal) {
        loadingPaPalScript();
      }
    }
  }, [errorPayPal, loadingPaPal, order, paypal, paypalDispatch]);

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        await payOrder({ orderId, details });
        refetch();
        toast.success("Order is paid");
      } catch (paymentError) {
        toast.error(paymentError?.data?.message || paymentError.message);
      }
    });
  }

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [{ amount: { value: order.totalPrice } }],
      })
      .then((orderID) => orderID);
  }

  function onError(err) {
    toast.error(err.message);
  }

  const deliverHandler = async () => {
    await deliverOrder(orderId);
    refetch();
  };

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Messsage variant="danger">{error.data.message}</Messsage>
  ) : (
    <div className="container mx-auto grid gap-8 px-4 pb-16 md:grid-cols-[1.2fr,0.8fr]">
      <div className="coffee-panel p-6">
        <div className="mb-5">
          <div className="eyebrow">Order Items</div>
          <h2 className="mt-3 text-3xl font-heading text-white">Coffee order details</h2>
        </div>

        {order.orderItems.length === 0 ? (
          <Messsage>Order is empty</Messsage>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr className="text-left text-sm uppercase tracking-[0.2em] text-stone-500">
                  <th className="p-2">Image</th>
                  <th className="p-2">Product</th>
                  <th className="p-2 text-center">Quantity</th>
                  <th className="p-2">Unit Price</th>
                  <th className="p-2">Total</th>
                </tr>
              </thead>

              <tbody>
                {order.orderItems.map((item, index) => (
                  <tr key={index} className="border-b border-white/5">
                    <td className="p-2">
                      <CoffeeProductImage
                        product={item}
                        className="h-16 w-16 rounded-2xl"
                        imageClassName="rounded-2xl"
                      />
                    </td>

                    <td className="p-2">
                      <Link to={`/product/${item.product}`} className="text-white">
                        {item.name}
                      </Link>
                    </td>

                    <td className="p-2 text-center text-stone-300">{item.qty}</td>
                    <td className="p-2 text-center text-stone-300">{item.price}</td>
                    <td className="p-2 text-center text-stone-300">
                      $ {(item.qty * item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="coffee-panel p-6">
          <h2 className="text-2xl font-heading text-white">Shipping</h2>
          <div className="mt-4 space-y-3 text-stone-300">
            <p>
              <strong className="text-primary">Order:</strong> {order._id}
            </p>
            <p>
              <strong className="text-primary">Name:</strong> {order.user.username}
            </p>
            <p>
              <strong className="text-primary">Email:</strong> {order.user.email}
            </p>
            <p>
              <strong className="text-primary">Address:</strong> {order.shippingAddress.address},{" "}
              {order.shippingAddress.city} {order.shippingAddress.postalCode},{" "}
              {order.shippingAddress.country}
            </p>
            <p>
              <strong className="text-primary">Method:</strong> {order.paymentMethod}
            </p>
          </div>

          <div className="mt-4">
            {order.isPaid ? (
              <Messsage variant="success">Paid on {order.paidAt}</Messsage>
            ) : (
              <Messsage variant="danger">Not paid</Messsage>
            )}
          </div>
        </div>

        <div className="coffee-panel p-6">
          <h2 className="text-2xl font-heading text-white">Order Summary</h2>
          <div className="mt-4 space-y-2 text-stone-300">
            <div className="flex justify-between">
              <span>Items</span>
              <span>$ {order.itemsPrice}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>$ {order.shippingPrice}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>$ {order.taxPrice}</span>
            </div>
            <div className="flex justify-between">
              <span>Total</span>
              <span>$ {order.totalPrice}</span>
            </div>
          </div>

          {!order.isPaid && (
            <div className="mt-6">
              {loadingPay && <Loader />}
              {isPending ? (
                <Loader />
              ) : (
                <PayPalButtons createOrder={createOrder} onApprove={onApprove} onError={onError} />
              )}
            </div>
          )}

          {loadingDeliver && <Loader />}
          {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
            <div className="mt-6">
              <button
                type="button"
                className="w-full rounded-full bg-primary py-3 font-semibold text-stone-950"
                onClick={deliverHandler}
              >
                Mark As Delivered
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Order;
