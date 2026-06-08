import { Link } from "react-router-dom";
import { useAllProductsQuery } from "../redux/api/productApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import ProductCard from "./Products/ProductCard";
import { getCollectionId, getCollectionMeta, shopCollections } from "../lib/catalog";

const Home = () => {
  const { data: products = [], isLoading, isError, error } = useAllProductsQuery();

  const featuredProducts = products.slice(0, 4);
  const beanProducts = products.filter((product) => getCollectionId(product) === "coffee-beans").slice(0, 3);
  const gearProducts = products.filter((product) => getCollectionId(product) !== "coffee-beans").slice(0, 3);
  const collectionCards = shopCollections
    .filter((collection) => collection.id !== "all")
    .map((collection) => ({
      ...collection,
      count: products.filter((product) => getCollectionId(product) === collection.id).length,
      image: products.find((product) => getCollectionId(product) === collection.id)?.image,
    }));

  return (
    <div className="container mx-auto px-4 pb-20">
      <section className="overflow-hidden rounded-[2.5rem] border border-[#dfd2c3] bg-[#fbf7f1] shadow-[0_30px_90px_rgba(92,70,54,0.1)]">
        <div className="grid gap-10 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="p-8 md:p-12 lg:p-14">
            <div className="text-xs uppercase tracking-[0.36em] text-[#9a7b62]">Coffee Shop Storefront</div>
            <h1 className="mt-5 max-w-xl text-6xl leading-[1.05] text-[#2f2218]">
              Elegant coffee shopping for beans, machines, and slower mornings.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6d5747]">
              Discover roasted coffee, home espresso machines, and manual brew gear in a calm,
              tactile storefront designed for real coffee drinkers.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="rounded-full bg-[#8b6343] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#755136]"
              >
                Shop the collection
              </Link>
              <Link
                to="/about"
                className="rounded-full border border-[#d8c7b3] px-6 py-3 text-sm font-semibold text-[#5e4737] transition hover:bg-white"
              >
                Read the brand story
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-[#eadfd3] bg-white/80 p-4">
                <div className="text-2xl font-semibold text-[#2f2218]">{products.length}+</div>
                <div className="mt-1 text-sm text-[#6d5747]">Curated products</div>
              </div>
              <div className="rounded-[1.5rem] border border-[#eadfd3] bg-white/80 p-4">
                <div className="text-2xl font-semibold text-[#2f2218]">4</div>
                <div className="mt-1 text-sm text-[#6d5747]">Shop categories</div>
              </div>
              <div className="rounded-[1.5rem] border border-[#eadfd3] bg-white/80 p-4">
                <div className="text-2xl font-semibold text-[#2f2218]">Soft</div>
                <div className="mt-1 text-sm text-[#6d5747]">Elegant, tactile design</div>
              </div>
            </div>
          </div>

          <div className="min-h-[420px] bg-[url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1400&auto=format&fit=crop')] bg-cover bg-center" />
        </div>
      </section>

      <section className="mt-12 grid gap-5 lg:grid-cols-4">
        {collectionCards.map((collection) => (
          <Link
            key={collection.id}
            to={`/shop?collection=${collection.id}`}
            className="overflow-hidden rounded-[1.9rem] border border-[#dfd2c3] bg-white/80 shadow-[0_18px_55px_rgba(92,70,54,0.06)] transition hover:-translate-y-1"
          >
            <div
              className="h-44 bg-cover bg-center"
              style={{ backgroundImage: `url(${collection.image || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop"})` }}
            />
            <div className="p-5">
              <div className="text-xs uppercase tracking-[0.32em] text-[#9a7b62]">{collection.count} products</div>
              <h2 className="mt-3 text-2xl text-[#2f2218]">{collection.label}</h2>
              <p className="mt-3 text-sm leading-7 text-[#6d5747]">{collection.description}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Featured</div>
            <h2 className="mt-3 text-4xl text-[#2f2218]">Best sellers from the coffee shelf</h2>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-[#8b6343]">
            Browse everything
          </Link>
        </div>

        {isLoading ? (
          <Loader />
        ) : isError ? (
          <Message variant="danger">{error?.data?.message || error?.error}</Message>
        ) : (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} p={product} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-14 grid gap-8 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-[#dfd2c3] bg-[#f3e7db] p-8">
          <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Coffee Beans</div>
          <h2 className="mt-3 text-3xl text-[#2f2218]">Choose by roast style, not by overwhelm.</h2>
          <div className="mt-6 space-y-4">
            {beanProducts.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className="block rounded-[1.35rem] border border-[#e2d4c5] bg-white/80 px-5 py-4 transition hover:bg-white"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-[#2f2218]">{product.name}</div>
                    <div className="mt-1 text-sm text-[#6d5747]">{getCollectionMeta(product).label}</div>
                  </div>
                  <div className="text-sm font-semibold text-[#8b6343]">View</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#dfd2c3] bg-white/80 p-8 shadow-[0_18px_55px_rgba(92,70,54,0.06)]">
          <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Machines & Gear</div>
          <h2 className="mt-3 text-3xl text-[#2f2218]">Build a home setup with pieces that feel lasting.</h2>
          <div className="mt-6 space-y-4">
            {gearProducts.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className="block rounded-[1.35rem] border border-[#e2d4c5] bg-[#fbf7f1] px-5 py-4 transition hover:bg-white"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-[#2f2218]">{product.name}</div>
                    <div className="mt-1 text-sm text-[#6d5747]">{getCollectionMeta(product).label}</div>
                  </div>
                  <div className="text-sm font-semibold text-[#8b6343]">View</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
