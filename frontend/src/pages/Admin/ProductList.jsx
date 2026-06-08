import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import AdminMenu from "./AdminMenu";

const defaultProductState = {
  image: "",
  imageUrl: null,
  name: "",
  description: "",
  price: "",
  category: "",
  quantity: "",
  brand: "",
  stock: 0,
  productType: "beans",
  origin: "",
  region: "",
  species: "arabica",
  roastLevel: "medium",
  acidity: 3,
  body: 3,
  processingMethod: "washed",
  tastingNotes: "",
  recommendedBrewingMethods: "",
  gramsPerBag: 250,
  equipmentType: "",
  material: "",
  supportedBrewingMethods: "",
  modelEnabled: true,
  modelType: "coffee-bag",
  accentColor: "#d97706",
  hotspots: "origin valve, aroma seal, roast info",
  subscriptionEligible: true,
  featuredHeadline: "",
};

const ProductList = () => {
  const [form, setForm] = useState(defaultProductState);
  const navigate = useNavigate();

  const [uploadProductImage] = useUploadProductImageMutation();
  const [createProduct] = useCreateProductMutation();
  const { data: categories } = useFetchCategoriesQuery();

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "imageUrl") {
          return;
        }

        const normalizedKey = key === "stock" ? "countInStock" : key;
        productData.append(normalizedKey, value);
      });

      const { data } = await createProduct(productData);

      if (data?.error) {
        toast.error("Product create failed. Try Again.");
      } else {
        toast.success(`${data.name} is created`);
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error("Product create failed. Try Again.");
    }
  };

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append("image", e.target.files[0]);

    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      setForm((current) => ({
        ...current,
        image: res.image,
        imageUrl: res.image,
      }));
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  return (
    <div className="container xl:mx-[9rem] sm:mx-[0]">
      <div className="flex flex-col md:flex-row">
        <AdminMenu />
        <div className="md:w-3/4 p-3">
          <div className="h-12 text-xl font-semibold">Create Coffee Product</div>

          {form.imageUrl && (
            <div className="text-center">
              <img src={form.imageUrl} alt="product" className="mx-auto block max-h-[200px]" />
            </div>
          )}

          <div className="mb-3">
            <label className="block w-full cursor-pointer rounded-lg border px-4 py-11 text-center font-bold text-white">
              {form.image ? "Replace product image" : "Upload Image"}

              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={uploadFileHandler}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-6 p-3">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label>Name</label> <br />
                <input
                  type="text"
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                />
              </div>
              <div>
                <label>Price</label> <br />
                <input
                  type="number"
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                />
              </div>
              <div>
                <label>Quantity</label> <br />
                <input
                  type="number"
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  value={form.quantity}
                  onChange={(e) => setField("quantity", e.target.value)}
                />
              </div>
              <div>
                <label>Brand</label> <br />
                <input
                  type="text"
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  value={form.brand}
                  onChange={(e) => setField("brand", e.target.value)}
                />
              </div>
              <div>
                <label>Product Type</label> <br />
                <select
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  value={form.productType}
                  onChange={(e) => setField("productType", e.target.value)}
                >
                  <option value="beans">Beans</option>
                  <option value="equipment">Equipment</option>
                  <option value="bundle">Bundle</option>
                  <option value="subscription">Subscription</option>
                </select>
              </div>
              <div>
                <label>Featured Headline</label> <br />
                <input
                  type="text"
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  value={form.featuredHeadline}
                  onChange={(e) => setField("featuredHeadline", e.target.value)}
                  placeholder="Bright citrus espresso with syrupy sweetness"
                />
              </div>
            </div>

            <div>
              <label>Description</label>
              <textarea
                className="mb-3 w-[95%] rounded-lg border bg-[#101011] p-2 text-white"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              ></textarea>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label>Count In Stock</label> <br />
                <input
                  type="number"
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  value={form.stock}
                  onChange={(e) => setField("stock", e.target.value)}
                />
              </div>

              <div>
                <label>Category</label> <br />
                <select
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  onChange={(e) => setField("category", e.target.value)}
                  value={form.category}
                >
                  <option value="">Choose Category</option>
                  {categories?.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label>Origin</label> <br />
                <input
                  type="text"
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  value={form.origin}
                  onChange={(e) => setField("origin", e.target.value)}
                />
              </div>
              <div>
                <label>Region</label> <br />
                <input
                  type="text"
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  value={form.region}
                  onChange={(e) => setField("region", e.target.value)}
                />
              </div>
              <div>
                <label>Species</label> <br />
                <input
                  type="text"
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  value={form.species}
                  onChange={(e) => setField("species", e.target.value)}
                />
              </div>
              <div>
                <label>Roast Level</label> <br />
                <input
                  type="text"
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  value={form.roastLevel}
                  onChange={(e) => setField("roastLevel", e.target.value)}
                />
              </div>
              <div>
                <label>Acidity</label> <br />
                <input
                  type="number"
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  value={form.acidity}
                  onChange={(e) => setField("acidity", e.target.value)}
                />
              </div>
              <div>
                <label>Body</label> <br />
                <input
                  type="number"
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  value={form.body}
                  onChange={(e) => setField("body", e.target.value)}
                />
              </div>
              <div>
                <label>Processing Method</label> <br />
                <input
                  type="text"
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  value={form.processingMethod}
                  onChange={(e) => setField("processingMethod", e.target.value)}
                />
              </div>
              <div>
                <label>Bag Size (grams)</label> <br />
                <input
                  type="number"
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  value={form.gramsPerBag}
                  onChange={(e) => setField("gramsPerBag", e.target.value)}
                />
              </div>
              <div>
                <label>Tasting Notes</label> <br />
                <input
                  type="text"
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  value={form.tastingNotes}
                  onChange={(e) => setField("tastingNotes", e.target.value)}
                  placeholder="citrus, floral, cocoa"
                />
              </div>
              <div>
                <label>Recommended Brew Methods</label> <br />
                <input
                  type="text"
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  value={form.recommendedBrewingMethods}
                  onChange={(e) => setField("recommendedBrewingMethods", e.target.value)}
                  placeholder="espresso, pour-over"
                />
              </div>
              <div>
                <label>Equipment Type</label> <br />
                <input
                  type="text"
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  value={form.equipmentType}
                  onChange={(e) => setField("equipmentType", e.target.value)}
                />
              </div>
              <div>
                <label>Material</label> <br />
                <input
                  type="text"
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  value={form.material}
                  onChange={(e) => setField("material", e.target.value)}
                />
              </div>
              <div>
                <label>Supported Brewing Methods</label> <br />
                <input
                  type="text"
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  value={form.supportedBrewingMethods}
                  onChange={(e) => setField("supportedBrewingMethods", e.target.value)}
                  placeholder="espresso, moka pot"
                />
              </div>
              <div>
                <label>3D Model Type</label> <br />
                <select
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  value={form.modelType}
                  onChange={(e) => setField("modelType", e.target.value)}
                >
                  <option value="coffee-bag">Coffee Bag</option>
                  <option value="espresso-machine">Espresso Machine</option>
                  <option value="manual-grinder">Manual Grinder</option>
                  <option value="dripper">Dripper</option>
                  <option value="kettle">Kettle</option>
                </select>
              </div>
              <div>
                <label>Accent Color</label> <br />
                <input
                  type="color"
                  className="h-[56px] w-full rounded-lg border bg-[#101011] text-white"
                  value={form.accentColor}
                  onChange={(e) => setField("accentColor", e.target.value)}
                />
              </div>
              <div>
                <label>3D Hotspots</label> <br />
                <input
                  type="text"
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  value={form.hotspots}
                  onChange={(e) => setField("hotspots", e.target.value)}
                  placeholder="steam wand, burr chamber, pressure gauge"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-8 text-white">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.modelEnabled}
                  onChange={(e) => setField("modelEnabled", e.target.checked)}
                />
                Enable 3D Viewer
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.subscriptionEligible}
                  onChange={(e) => setField("subscriptionEligible", e.target.checked)}
                />
                Subscription Eligible
              </label>
            </div>

            <button
              onClick={handleSubmit}
              className="mt-5 rounded-lg bg-pink-600 px-10 py-4 text-lg font-bold"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
