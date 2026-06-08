import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAllProductsQuery } from "../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../redux/api/categoryApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import ProductCard from "./Products/ProductCard";
import { getCollectionId, getProductSearchText, shopCollections } from "../lib/catalog";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: products = [], isLoading, isError, error } = useAllProductsQuery();
  const { data: categories = [] } = useFetchCategoriesQuery();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [collection, setCollection] = useState(searchParams.get("collection") || "all");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setCollection(searchParams.get("collection") || "all");
  }, [searchParams]);

  const updateRouteFilters = (nextSearch, nextCollection) => {
    const params = new URLSearchParams();

    if (nextSearch) {
      params.set("search", nextSearch);
    }

    if (nextCollection && nextCollection !== "all") {
      params.set("collection", nextCollection);
    }

    setSearchParams(params);
  };

  let filteredProducts = products.filter((product) => {
    const matchesSearch = !search || getProductSearchText(product).includes(search.toLowerCase());
    const matchesCollection = collection === "all" || getCollectionId(product) === collection;
    const categoryId = product.category?._id || product.category;
    const matchesCategory = category === "all" || categoryId === category;

    return matchesSearch && matchesCollection && matchesCategory;
  });

  if (sortBy === "price-low") {
    filteredProducts = [...filteredProducts].sort((left, right) => left.price - right.price);
  } else if (sortBy === "price-high") {
    filteredProducts = [...filteredProducts].sort((left, right) => right.price - left.price);
  } else if (sortBy === "name") {
    filteredProducts = [...filteredProducts].sort((left, right) => left.name.localeCompare(right.name));
  }

  const activeCollectionLabel =
    shopCollections.find((entry) => entry.id === collection)?.label || "All Products";

  return (
    <div className="container mx-auto px-4 pb-20">
      <section className="rounded-[2.4rem] border border-[#ddcfbf] bg-[#fbf7f1] p-8 shadow-[0_28px_80px_rgba(92,70,54,0.08)] md:p-10">
        <div className="max-w-3xl">
          <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Shop</div>
          <h1 className="mt-4 text-5xl leading-tight text-[#2f2218]">
            Browse coffee beans, machines, and brew gear by category.
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#6d5747]">
            The catalog is intentionally tidy, with size and color variants ready inside each
            product page and quick filters to help you narrow the shelf.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr,0.9fr,0.8fr,0.7fr]">
          <label className="grid gap-2 text-sm font-medium text-[#5f4b3c]">
            Search
            <input
              type="search"
              value={search}
              onChange={(event) => {
                const value = event.target.value;
                setSearch(value);
                updateRouteFilters(value, collection);
              }}
              placeholder="Beans, roast styles, machines..."
              className="rounded-[1.1rem] border border-[#dbcbb8] bg-white px-4 py-3 text-[#2f2218] outline-none transition focus:border-[#9d7552]"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-[#5f4b3c]">
            Collection
            <select
              value={collection}
              onChange={(event) => {
                const value = event.target.value;
                setCollection(value);
                updateRouteFilters(search, value);
              }}
              className="rounded-[1.1rem] border border-[#dbcbb8] bg-white px-4 py-3 text-[#2f2218] outline-none transition focus:border-[#9d7552]"
            >
              {shopCollections.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-[#5f4b3c]">
            Category
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-[1.1rem] border border-[#dbcbb8] bg-white px-4 py-3 text-[#2f2218] outline-none transition focus:border-[#9d7552]"
            >
              <option value="all">All categories</option>
              {categories.map((entry) => (
                <option key={entry._id} value={entry._id}>
                  {entry.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-[#5f4b3c]">
            Sort
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-[1.1rem] border border-[#dbcbb8] bg-white px-4 py-3 text-[#2f2218] outline-none transition focus:border-[#9d7552]"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {shopCollections
          .filter((entry) => entry.id !== "all")
          .map((entry) => {
            const count = products.filter((product) => getCollectionId(product) === entry.id).length;
            const active = collection === entry.id;

            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => {
                  setCollection(entry.id);
                  updateRouteFilters(search, entry.id);
                }}
                className={`rounded-[1.7rem] border p-5 text-left transition ${
                  active
                    ? "border-[#a37a58] bg-[#f3e7db]"
                    : "border-[#dfd2c3] bg-white/80 hover:border-[#c9b29d]"
                }`}
              >
                <div className="text-xs uppercase tracking-[0.32em] text-[#9a7b62]">{count} items</div>
                <h2 className="mt-3 text-2xl text-[#2f2218]">{entry.label}</h2>
                <p className="mt-3 text-sm leading-7 text-[#6d5747]">{entry.description}</p>
              </button>
            );
          })}
      </section>

      <section className="mt-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm text-[#8a6d58]">{filteredProducts.length} products</div>
            <h2 className="mt-2 text-4xl text-[#2f2218]">
              {collection === "all" ? "Everything on the shelf" : activeCollectionLabel}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCollection("all");
              setCategory("all");
              setSortBy("featured");
              setSearchParams(new URLSearchParams());
            }}
            className="rounded-full border border-[#d8c7b3] px-5 py-3 text-sm font-semibold text-[#5e4737] transition hover:bg-white"
          >
            Reset filters
          </button>
        </div>

        {isLoading ? (
          <Loader />
        ) : isError ? (
          <Message variant="danger">{error?.data?.message || error?.error}</Message>
        ) : (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} p={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Shop;
