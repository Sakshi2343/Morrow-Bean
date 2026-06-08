import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { toast } from "react-toastify";
import { useGetUsersQuery } from "../../redux/api/usersApiSlice";
import {
  useGetTotalOrdersQuery,
  useGetTotalSalesByDateQuery,
  useGetTotalSalesQuery,
} from "../../redux/api/orderApiSlice";
import {
  useGetIntelligenceDashboardQuery,
  useRunPricingEngineMutation,
} from "../../redux/api/intelligenceApiSlice";
import AdminMenu from "./AdminMenu";
import OrderList from "./OrderList";
import Loader from "../../components/Loader";

const AdminDashboard = () => {
  const { data: sales, isLoading } = useGetTotalSalesQuery();
  const { data: customers, isLoading: loadingCustomers } = useGetUsersQuery();
  const { data: orders, isLoading: loadingOrders } = useGetTotalOrdersQuery();
  const { data: salesDetail } = useGetTotalSalesByDateQuery();
  const { data: intelligenceData, refetch: refetchIntelligence } =
    useGetIntelligenceDashboardQuery();
  const [runPricingEngine, { isLoading: runningPricing }] =
    useRunPricingEngineMutation();

  const [state, setState] = useState({
    options: {
      chart: {
        type: "line",
      },
      tooltip: {
        theme: "dark",
      },
      colors: ["#00E396"],
      dataLabels: {
        enabled: true,
      },
      stroke: {
        curve: "smooth",
      },
      title: {
        text: "Sales Trend",
        align: "left",
      },
      grid: {
        borderColor: "#ccc",
      },
      markers: {
        size: 1,
      },
      xaxis: {
        categories: [],
        title: {
          text: "Date",
        },
      },
      yaxis: {
        title: {
          text: "Sales",
        },
        min: 0,
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        floating: true,
        offsetY: -25,
        offsetX: -5,
      },
    },
    series: [{ name: "Sales", data: [] }],
  });

  useEffect(() => {
    if (salesDetail) {
      const formattedSalesDate = salesDetail.map((item) => ({
        x: item._id,
        y: item.totalSales,
      }));

      setState((prevState) => ({
        ...prevState,
        options: {
          ...prevState.options,
          xaxis: {
            categories: formattedSalesDate.map((item) => item.x),
          },
        },

        series: [{ name: "Sales", data: formattedSalesDate.map((item) => item.y) }],
      }));
    }
  }, [salesDetail]);

  const triggerPricingEngine = async () => {
    try {
      await runPricingEngine({ persistPrice: true }).unwrap();
      toast.success("Dynamic pricing cycle completed");
      refetchIntelligence();
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Pricing cycle failed");
    }
  };

  return (
    <>
      <AdminMenu />

      <section className="md:ml-[0rem] xl:ml-[4rem]">
        <div className="flex w-[80%] flex-wrap justify-around">
          <div className="mt-5 w-[20rem] rounded-lg bg-black p-5">
            <div className="w-[3rem] rounded-full bg-pink-500 p-3 text-center font-bold">$</div>

            <p className="mt-5">Sales</p>
            <h1 className="text-xl font-bold">
              $ {isLoading ? <Loader /> : sales?.totalSales?.toFixed(2)}
            </h1>
          </div>
          <div className="mt-5 w-[20rem] rounded-lg bg-black p-5">
            <div className="w-[3rem] rounded-full bg-pink-500 p-3 text-center font-bold">#</div>

            <p className="mt-5">Customers</p>
            <h1 className="text-xl font-bold">
              {loadingCustomers ? <Loader /> : customers?.length}
            </h1>
          </div>
          <div className="mt-5 w-[20rem] rounded-lg bg-black p-5">
            <div className="w-[3rem] rounded-full bg-pink-500 p-3 text-center font-bold">#</div>

            <p className="mt-5">All Orders</p>
            <h1 className="text-xl font-bold">
              {loadingOrders ? <Loader /> : orders?.totalOrders}
            </h1>
          </div>
        </div>

        <div className="mt-8 flex w-[80%] flex-wrap gap-4">
          <div className="w-[20rem] rounded-lg border border-white/10 bg-[#120d09] p-5">
            <p className="text-sm text-stone-400">Live flash sales</p>
            <h2 className="mt-3 text-3xl font-bold text-white">
              {intelligenceData?.summary?.activeFlashSales || 0}
            </h2>
          </div>
          <div className="w-[20rem] rounded-lg border border-white/10 bg-[#120d09] p-5">
            <p className="text-sm text-stone-400">Queued subscription reminders</p>
            <h2 className="mt-3 text-3xl font-bold text-white">
              {intelligenceData?.summary?.pendingSubscriptionReminders || 0}
            </h2>
          </div>
          <div className="w-[20rem] rounded-lg border border-white/10 bg-[#120d09] p-5">
            <p className="text-sm text-stone-400">Open exchange orders</p>
            <h2 className="mt-3 text-3xl font-bold text-white">
              {intelligenceData?.summary?.openLimitOrders || 0}
            </h2>
          </div>
          <div className="w-[20rem] rounded-lg border border-white/10 bg-[#120d09] p-5">
            <p className="text-sm text-stone-400">Pending roast tickets</p>
            <h2 className="mt-3 text-3xl font-bold text-white">
              {intelligenceData?.summary?.pendingRoastOrders || 0}
            </h2>
          </div>
          <button
            type="button"
            onClick={triggerPricingEngine}
            className="rounded-lg bg-amber-500 px-6 py-4 font-semibold text-stone-950 transition hover:bg-amber-400"
          >
            {runningPricing ? "Running pricing..." : "Run Pricing Engine"}
          </button>
        </div>

        <div className="ml-[10rem] mt-[4rem]">
          <Chart options={state.options} series={state.series} type="bar" width="70%" />
        </div>

        <div className="mt-[4rem] grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-[#120d09] p-6">
            <h3 className="text-xl font-semibold text-white">Pricing candidates</h3>
            <div className="mt-4 space-y-3">
              {(intelligenceData?.pricingCandidates || []).map((product) => (
                <div
                  key={product._id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">{product.name}</div>
                      <div className="text-sm text-stone-400">
                        Stock: {product.countInStock} | Forecast:{" "}
                        {Math.round(product.recommendation?.forecastDemand || 0)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white">${product.price}</div>
                      <div className="text-sm text-amber-200">
                        {product.recommendation?.priceChangePct > 0 ? "+" : ""}
                        {product.recommendation?.priceChangePct || 0}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#120d09] p-6">
            <h3 className="text-xl font-semibold text-white">Smart subscription queue</h3>
            <div className="mt-4 space-y-3">
              {(intelligenceData?.subscriptionQueue || []).map((job) => (
                <div
                  key={job.jobId}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="font-semibold text-white">{job.username}</div>
                  <div className="mt-1 text-sm text-stone-400">
                    Reminder at {new Date(job.runAt).toLocaleString()} | cart size {job.cartSize}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-[4rem] grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-[#120d09] p-6">
            <h3 className="text-xl font-semibold text-white">Predictive roast queue</h3>
            <div className="mt-4 space-y-3">
              {(intelligenceData?.roastOrders || []).map((ticket) => (
                <div
                  key={ticket._id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">{ticket.name}</div>
                      <div className="mt-1 text-sm text-stone-400">
                        Batch {ticket.batchSizeKg}kg · Bin {ticket.warehouseBin}
                      </div>
                      <div className="mt-1 text-sm text-stone-400">
                        Roast at {new Date(ticket.targetRoastAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm uppercase tracking-[0.2em] text-amber-200">
                        {ticket.priority}
                      </div>
                      <div className="mt-2 text-sm text-stone-400">
                        Stock {ticket.currentStock} / Demand {Math.round(ticket.forecastDemand || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#120d09] p-6">
            <h3 className="text-xl font-semibold text-white">Freshness alerts</h3>
            <div className="mt-4 space-y-3">
              {(intelligenceData?.freshnessAlerts || []).map((entry) => (
                <div
                  key={entry._id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="font-semibold text-white">{entry.name}</div>
                  <div className="mt-1 text-sm text-stone-400">
                    {entry.ageDays} days off roast · freshness {entry.freshnessPct}%
                  </div>
                  <div className="mt-1 text-sm text-amber-200">{entry.warehouseBin}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-[4rem]">
          <OrderList />
        </div>
      </section>
    </>
  );
};

export default AdminDashboard;
