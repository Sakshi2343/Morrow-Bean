import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLogoutMutation } from "../../redux/api/usersApiSlice";
import { logout } from "../../redux/features/auth/authSlice";
import {
  AiOutlineClose,
  AiOutlineHeart,
  AiOutlineMenu,
  AiOutlineSearch,
  AiOutlineShoppingCart,
  AiOutlineUser,
} from "react-icons/ai";
import { shopCollections } from "../../lib/catalog";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop", dropdown: true },
  { name: "About", path: "/about" },
  { name: "FAQ", path: "/faq" },
  { name: "Contact", path: "/contact" },
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const favorites = useSelector((state) => state.favorites) || [];
  const { cartItems } = useSelector((state) => state.cart);

  const [logoutApiCall] = useLogoutMutation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (location.pathname === "/shop") {
      const params = new URLSearchParams(location.search);
      setSearch(params.get("search") || "");
    } else {
      setSearch("");
    }
  }, [location.pathname, location.search]);

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      setAccountOpen(false);
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const searchHandler = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    navigate(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
    setMobileMenuOpen(false);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#e6d7c6] bg-[#fbf7f1]/95 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 py-4">
          <Link to="/" className="min-w-fit">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#8b6343] text-sm font-bold tracking-[0.24em] text-white">
                MB
              </div>
              <div>
                <div className="font-heading text-2xl text-[#2f2218]">Morrow & Bean</div>
                <div className="text-[11px] uppercase tracking-[0.32em] text-[#9a7b62]">
                  Coffee for slower mornings
                </div>
              </div>
            </div>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-7 lg:flex">
            {navLinks.map((link) => {
              const isActive =
                location.pathname === link.path ||
                (link.path === "/shop" && location.pathname.startsWith("/product/"));

              if (!link.dropdown) {
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-sm font-medium transition ${
                      isActive ? "text-[#2f2218]" : "text-[#7e6858] hover:text-[#2f2218]"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              }

              return (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => setShopMenuOpen(true)}
                  onMouseLeave={() => setShopMenuOpen(false)}
                >
                  <Link
                    to="/shop"
                    className={`text-sm font-medium transition ${
                      isActive ? "text-[#2f2218]" : "text-[#7e6858] hover:text-[#2f2218]"
                    }`}
                  >
                    {link.name}
                  </Link>
                  {shopMenuOpen ? (
                    <div className="absolute left-1/2 top-full mt-4 w-64 -translate-x-1/2 rounded-[1.4rem] border border-[#e5d7c6] bg-white p-3 shadow-[0_22px_50px_rgba(73,45,20,0.12)]">
                      {shopCollections
                        .filter((collection) => collection.id !== "all")
                        .map((collection) => (
                          <Link
                            key={collection.id}
                            to={`/shop?collection=${collection.id}`}
                            className="block rounded-[1rem] px-4 py-3 transition hover:bg-[#f6ede3]"
                          >
                            <div className="text-sm font-semibold text-[#2f2218]">{collection.label}</div>
                            <div className="mt-1 text-xs leading-5 text-[#7e6858]">{collection.description}</div>
                          </Link>
                        ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <form
            onSubmit={searchHandler}
            className="hidden min-w-[240px] flex-1 items-center rounded-full border border-[#e2d2c0] bg-white px-4 py-2 xl:flex"
          >
            <AiOutlineSearch className="text-[#8d7462]" size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search beans, machines, brew tools..."
              className="w-full bg-transparent px-3 text-sm text-[#2f2218] outline-none placeholder:text-[#a18874]"
            />
          </form>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/favorite"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#e2d2c0] bg-white text-[#6b5444] transition hover:border-[#ab7f5a] hover:text-[#2f2218]"
            >
              <AiOutlineHeart size={21} />
              {favorites.length ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-[#8b6343] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {favorites.length}
                </span>
              ) : null}
            </Link>

            <Link
              to="/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#e2d2c0] bg-white text-[#6b5444] transition hover:border-[#ab7f5a] hover:text-[#2f2218]"
            >
              <AiOutlineShoppingCart size={21} />
              {cartCount ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-[#8b6343] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            {userInfo ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((current) => !current)}
                  className="flex h-11 items-center gap-2 rounded-full border border-[#e2d2c0] bg-white px-4 text-sm font-medium text-[#5d4738] transition hover:border-[#ab7f5a] hover:text-[#2f2218]"
                >
                  {userInfo.username}
                  <AiOutlineUser size={18} />
                </button>
                {accountOpen ? (
                  <div className="absolute right-0 top-full mt-3 w-48 rounded-[1.25rem] border border-[#e5d7c6] bg-white p-2 shadow-[0_22px_50px_rgba(73,45,20,0.12)]">
                    <Link
                      to="/profile"
                      onClick={() => setAccountOpen(false)}
                      className="block rounded-xl px-4 py-2 text-sm text-[#5d4738] transition hover:bg-[#f6ede3]"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/user-orders"
                      onClick={() => setAccountOpen(false)}
                      className="block rounded-xl px-4 py-2 text-sm text-[#5d4738] transition hover:bg-[#f6ede3]"
                    >
                      Orders
                    </Link>
                    <button
                      type="button"
                      onClick={logoutHandler}
                      className="block w-full rounded-xl px-4 py-2 text-left text-sm text-[#9b4b40] transition hover:bg-[#f9ede9]"
                    >
                      Log out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-[#6b5444] transition hover:text-[#2f2218]">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-[#8b6343] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#755136]"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#e2d2c0] bg-white text-[#5d4738] lg:hidden"
          >
            {mobileMenuOpen ? <AiOutlineClose size={22} /> : <AiOutlineMenu size={22} />}
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="space-y-5 border-t border-[#eadfd1] py-5 lg:hidden">
            <form
              onSubmit={searchHandler}
              className="flex items-center rounded-full border border-[#e2d2c0] bg-white px-4 py-2"
            >
              <AiOutlineSearch className="text-[#8d7462]" size={18} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search the shop"
                className="w-full bg-transparent px-3 text-sm text-[#2f2218] outline-none"
              />
            </form>

            <div className="space-y-3">
              {navLinks.map((link) => (
                <div key={link.name} className="space-y-2">
                  <Link
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-semibold text-[#2f2218]"
                  >
                    {link.name}
                  </Link>
                  {link.dropdown ? (
                    <div className="grid gap-2 rounded-[1.3rem] bg-[#f6ede3] p-3">
                      {shopCollections
                        .filter((collection) => collection.id !== "all")
                        .map((collection) => (
                          <Link
                            key={collection.id}
                            to={`/shop?collection=${collection.id}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="rounded-xl bg-white px-4 py-3 text-sm text-[#5d4738]"
                          >
                            {collection.label}
                          </Link>
                        ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/favorite"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-[1.2rem] border border-[#e2d2c0] bg-white px-4 py-3 text-sm font-medium text-[#5d4738]"
              >
                Wishlist ({favorites.length})
              </Link>
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-[1.2rem] border border-[#e2d2c0] bg-white px-4 py-3 text-sm font-medium text-[#5d4738]"
              >
                Cart ({cartCount})
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
