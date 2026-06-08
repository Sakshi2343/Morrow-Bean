import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader";
import { useRegisterMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import CoffeeProfileFields from "../../components/CoffeeProfileFields";

const Register = () => {
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [coffeeProfile, setCoffeeProfile] = useState({
    brewingMethods: ["pour-over"],
    acidityTolerance: 3,
    roastPreference: "medium",
    beanPreference: "single-origin arabica",
    flavorNotes: ["chocolate"],
    preferredOrigins: ["colombia"],
    preferredEquipment: [],
    dailyCups: 2,
  });
  const [smartSubscription, setSmartSubscription] = useState({
    enabled: true,
    reminderLeadDays: 2,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
    } else {
      try {
        const res = await register({
          username,
          email,
          password,
          coffeeProfile,
          smartSubscription,
        }).unwrap();
        dispatch(setCredentials({ ...res }));
        navigate(redirect);
        toast.success("Profile created and flavor matcher activated");
      } catch (err) {
        toast.error(err?.data?.message || "Registration failed");
      }
    }
  };

  return (
    <section className="grid min-h-screen gap-8 bg-[linear-gradient(180deg,#1b1108_0%,#09090b_100%)] px-6 py-24 lg:grid-cols-[1fr,0.9fr] lg:px-16">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Coffee Exchange</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Build your flavor profile</h1>
          <p className="mt-3 max-w-2xl text-stone-400">
            Join the premium coffee marketplace, train the flavor matcher, and let the platform predict your next brew before you run out.
          </p>
        </div>

        <form onSubmit={submitHandler} className="space-y-6">
          <div className="my-[2rem]">
            <label htmlFor="name" className="block text-sm font-medium text-white">
              Name
            </label>
            <input
              type="text"
              id="name"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white"
              placeholder="Enter name"
              value={username}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="my-[2rem]">
            <label htmlFor="email" className="block text-sm font-medium text-white">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="my-[2rem]">
            <label htmlFor="password" className="block text-sm font-medium text-white">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="my-[2rem]">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <CoffeeProfileFields
            coffeeProfile={coffeeProfile}
            smartSubscription={smartSubscription}
            onCoffeeProfileChange={setCoffeeProfile}
            onSmartSubscriptionChange={setSmartSubscription}
          />

          <button
            disabled={isLoading}
            type="submit"
            className="rounded-full bg-amber-500 px-6 py-3 font-semibold text-stone-950 transition hover:bg-amber-400"
          >
            {isLoading ? "Creating profile..." : "Create Coffee Profile"}
          </button>

          {isLoading && <Loader />}
        </form>

        <div className="mt-4">
          <p className="text-white">
            Already have an account?{" "}
            <Link
              to={redirect ? `/login?redirect=${redirect}` : "/login"}
              className="text-amber-300 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.2),_transparent_55%),linear-gradient(180deg,#2b190d_0%,#0f0a08_100%)] p-10 lg:block">
        <div className="flex h-full flex-col justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-200">AI Flavor Profiling</p>
            <h2 className="mt-4 text-5xl font-semibold text-white">Predictive coffee matching for every cup.</h2>
          </div>
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <h3 className="text-lg font-semibold text-white">Dynamic pricing</h3>
              <p className="mt-2 text-stone-400">
                Regression models watch velocity, page views, and stock pressure to trigger premium pricing or flash sales automatically.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <h3 className="text-lg font-semibold text-white">Smart replenishment</h3>
              <p className="mt-2 text-stone-400">
                Consumption-aware reminders queue a prefilled cart before your current bag runs out.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
