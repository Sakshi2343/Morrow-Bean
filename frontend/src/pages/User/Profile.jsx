import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";
import CoffeeProfileFields from "../../components/CoffeeProfileFields";
import BlindTastingLab from "../../components/BlindTastingLab";
import { useProfileMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { useGetSubscriptionPlanQuery } from "../../redux/api/intelligenceApiSlice";

const defaultCoffeeProfile = {
  brewingMethods: [],
  acidityTolerance: 3,
  roastPreference: "medium",
  beanPreference: "single-origin arabica",
  flavorNotes: [],
  preferredOrigins: [],
  preferredEquipment: [],
  dailyCups: 2,
};

const defaultSubscription = {
  enabled: false,
  reminderLeadDays: 2,
};

const Profile = () => {
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [coffeeProfile, setCoffeeProfile] = useState(defaultCoffeeProfile);
  const [smartSubscription, setSmartSubscription] = useState(defaultSubscription);

  const { userInfo } = useSelector((state) => state.auth);
  const { data: subscriptionPlan } = useGetSubscriptionPlanQuery(undefined, {
    skip: !userInfo,
  });
  const [updateProfile, { isLoading: loadingUpdateProfile }] = useProfileMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userInfo) {
      return;
    }

    setUserName(userInfo.username);
    setEmail(userInfo.email);
    setCoffeeProfile(userInfo.coffeeProfile || defaultCoffeeProfile);
    setSmartSubscription(userInfo.smartSubscription || defaultSubscription);
  }, [userInfo]);

  const submitHandler = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await updateProfile({
        _id: userInfo._id,
        username,
        email,
        password,
        coffeeProfile,
        smartSubscription,
      }).unwrap();

      dispatch(setCredentials({ ...response }));
      setPassword("");
      setConfirmPassword("");
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="container mx-auto px-4 pb-20">
      <section className="overflow-hidden rounded-[2.4rem] border border-[#ddcfbf] bg-[#fbf7f1] shadow-[0_28px_80px_rgba(92,70,54,0.08)]">
        <div className="grid gap-8 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="p-8 md:p-10">
            <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">My Profile</div>
            <h1 className="mt-4 text-5xl leading-tight text-[#2f2218]">
              Keep your account and coffee preferences in sync.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#6d5747]">
              Update your details, tune the flavor profile, and control your replenishment settings
              in the same calm coffee-shop experience as the rest of the store.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.4rem] border border-[#eadfd3] bg-white/80 p-4">
                <div className="text-xs uppercase tracking-[0.3em] text-[#9a7b62]">Brewing</div>
                <div className="mt-2 text-2xl font-semibold text-[#2f2218]">
                  {coffeeProfile.brewingMethods?.length || 0}
                </div>
                <div className="mt-1 text-sm text-[#6d5747]">Saved methods</div>
              </div>
              <div className="rounded-[1.4rem] border border-[#eadfd3] bg-white/80 p-4">
                <div className="text-xs uppercase tracking-[0.3em] text-[#9a7b62]">Daily Use</div>
                <div className="mt-2 text-2xl font-semibold text-[#2f2218]">
                  {coffeeProfile.dailyCups || 0}
                </div>
                <div className="mt-1 text-sm text-[#6d5747]">cups per day</div>
              </div>
              <div className="rounded-[1.4rem] border border-[#eadfd3] bg-white/80 p-4">
                <div className="text-xs uppercase tracking-[0.3em] text-[#9a7b62]">Subscription</div>
                <div className="mt-2 text-2xl font-semibold text-[#2f2218]">
                  {smartSubscription.enabled ? "On" : "Off"}
                </div>
                <div className="mt-1 text-sm text-[#6d5747]">smart restock</div>
              </div>
            </div>
          </div>

          <div className="bg-[url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center min-h-[320px]" />
        </div>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr,0.92fr]">
        <div className="rounded-[2.2rem] border border-[#ddcfbf] bg-white/85 p-8 shadow-[0_20px_60px_rgba(92,70,54,0.06)]">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Account Details</div>
              <h2 className="mt-3 text-3xl text-[#2f2218]">Personal information and taste profile</h2>
            </div>
            <Link
              to="/user-orders"
              className="rounded-full border border-[#d8c7b3] px-5 py-3 text-sm font-semibold text-[#5e4737] transition hover:bg-[#fbf7f1]"
            >
              My Orders
            </Link>
          </div>

          <form onSubmit={submitHandler} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-[#5f4b3c]">
                Name
                <input
                  type="text"
                  placeholder="Enter name"
                  className="rounded-[1.1rem] border border-[#dbcbb8] bg-[#fbf7f1] px-4 py-3 text-[#2f2218] outline-none transition focus:border-[#9d7552]"
                  value={username}
                  onChange={(event) => setUserName(event.target.value)}
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-[#5f4b3c]">
                Email Address
                <input
                  type="email"
                  placeholder="Enter email"
                  className="rounded-[1.1rem] border border-[#dbcbb8] bg-[#fbf7f1] px-4 py-3 text-[#2f2218] outline-none transition focus:border-[#9d7552]"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-[#5f4b3c]">
                Password
                <input
                  type="password"
                  placeholder="Enter password"
                  className="rounded-[1.1rem] border border-[#dbcbb8] bg-[#fbf7f1] px-4 py-3 text-[#2f2218] outline-none transition focus:border-[#9d7552]"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-[#5f4b3c]">
                Confirm Password
                <input
                  type="password"
                  placeholder="Confirm password"
                  className="rounded-[1.1rem] border border-[#dbcbb8] bg-[#fbf7f1] px-4 py-3 text-[#2f2218] outline-none transition focus:border-[#9d7552]"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </label>
            </div>

            <CoffeeProfileFields
              coffeeProfile={coffeeProfile}
              smartSubscription={smartSubscription}
              onCoffeeProfileChange={setCoffeeProfile}
              onSmartSubscriptionChange={setSmartSubscription}
            />

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="submit"
                className="rounded-full bg-[#8b6343] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#755136]"
              >
                Save profile
              </button>
              {loadingUpdateProfile ? <Loader /> : null}
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-[#ddcfbf] bg-[#f3e7db] p-7 shadow-[0_18px_55px_rgba(92,70,54,0.06)]">
            <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Subscription Forecast</div>
            <h3 className="mt-3 text-2xl text-[#2f2218]">Smart replenishment snapshot</h3>
            <p className="mt-3 text-sm leading-7 text-[#6d5747]">
              {subscriptionPlan?.message ||
                "Once you have paid bean orders, the system will estimate your run-out date automatically."}
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.4rem] border border-[#ddcfbf] bg-white/80 p-4">
                <div className="text-sm text-[#7f6654]">Estimated daily usage</div>
                <div className="mt-2 text-2xl font-semibold text-[#2f2218]">
                  {Math.round(subscriptionPlan?.estimatedDailyGrams || 0)}g
                </div>
              </div>
              <div className="rounded-[1.4rem] border border-[#ddcfbf] bg-white/80 p-4">
                <div className="text-sm text-[#7f6654]">Days remaining</div>
                <div className="mt-2 text-2xl font-semibold text-[#2f2218]">
                  {subscriptionPlan?.estimatedDaysRemaining || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#ddcfbf] bg-white/85 p-7 shadow-[0_18px_55px_rgba(92,70,54,0.06)]">
            <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Next Replenishment Cart</div>
            <div className="mt-4 space-y-3">
              {(subscriptionPlan?.prefilledCart || []).length ? (
                subscriptionPlan.prefilledCart.map((item) => (
                  <div
                    key={`${item.product}-${item.name}`}
                    className="rounded-[1.35rem] border border-[#eadfd3] bg-[#fbf7f1] p-4"
                  >
                    <div className="font-medium text-[#2f2218]">{item.name}</div>
                    <div className="mt-1 text-sm leading-7 text-[#6d5747]">{item.reason}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.35rem] border border-dashed border-[#d7c5b1] bg-[#fbf7f1] p-4 text-sm leading-7 text-[#6d5747]">
                  Your prefilled restock cart will appear here after the first paid bean order.
                </div>
              )}
            </div>
          </div>

          <BlindTastingLab />
        </div>
      </div>
    </div>
  );
};

export default Profile;
