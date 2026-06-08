import { useState, useEffect } from "react";
import AdminMenu from "./AdminMenu";
import { useNavigate, useParams } from "react-router-dom";
import {
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductByIdQuery,
  useUploadProductImageMutation,
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";

const buildFormState = (productData) => ({
  image: productData?.image || "",
  name: productData?.name || "",
  description: productData?.description || "",
  price: productData?.price || "",
  category: productData?.category?._id || productData?.category || "",
  quantity: productData?.quantity || "",
  brand: productData?.brand || "",
  stock: productData?.countInStock || 0,
  productType: productData?.productType || "beans",
  origin: productData?.beanProfile?.origin || "",
  region: productData?.beanProfile?.region || "",
  species: productData?.beanProfile?.species || "arabica",
  roastLevel: productData?.beanProfile?.roastLevel || "medium",
  acidity: productData?.beanProfile?.acidity || 3,
  body: productData?.beanProfile?.body || 3,
  processingMethod: productData?.beanProfile?.processingMethod || "washed",
  tastingNotes: (productData?.beanProfile?.tastingNotes || []).join(", "),
  recommendedBrewingMethods: (
    productData?.beanProfile?.recommendedBrewingMethods || []
  ).join(", "),
  gramsPerBag: productData?.beanProfile?.gramsPerBag || 250,
  equipmentType: productData?.equipmentProfile?.equipmentType || "",
  material: productData?.equipmentProfile?.material || "",
  supportedBrewingMethods: (
    productData?.equipmentProfile?.supportedBrewingMethods || []
  ).join(", "),
  modelEnabled: productData?.interactiveModel?.enabled ?? true,
  modelType: productData?.interactiveModel?.modelType || "coffee-bag",
  accentColor: productData?.interactiveModel?.accentColor || "#d97706",
  hotspots: (productData?.interactiveModel?.hotspots || [])
    .map((entry) => entry.label)
    .join(", "),
  subscriptionEligible: productData?.marketing?.subscriptionEligible ?? true,
  featuredHeadline: productData?.marketing?.featuredHeadline || "",
});

const AdminProductUpdate = () => {
  const params = useParams();
  const { data: productData } = useGetProductByIdQuery(params._id);
  const [form, setForm] = useState(buildFormState(productData));
  const navigate = useNavigate();
  const { data: categories = [] } = useFetchCategoriesQuery();
  const [uploadProductImage] = useUploadProductImageMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  useEffect(() => {
    if (productData && productData._id) {
      setForm(buildFormState(productData));
    }
  }, [productData]);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append("image", e.target.files[0]);
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success("Image uploaded successfully", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 2000,
      });
      setField("image", res.image);
    } catch (err) {
      toast.error(err?.data?.message || "Image upload failed", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 2000,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        const normalizedKey = key === "stock" ? "countInStock" : key;
        formData.append(normalizedKey, value);
      });

      const data = await updateProduct({ productId: params._id, formData });

      if (data?.error) {
        toast.error(data.error, {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 2000,
        });
      } else {
        toast.success("Product successfully updated", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 2000,
        });
        navigate("/admin/allproductslist");
      }
    } catch (err) {
      toast.error("Product update failed. Try again.", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 2000,
      });
    }
  };

  const handleDelete = async () => {
    try {
      const answer = window.confirm("Are you sure you want to delete this product?");
      if (!answer) {
        return;
      }

      const { data } = await deleteProduct(params._id);
      toast.success(`"${data.name}" is deleted`, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 2000,
      });
      navigate("/admin/allproductslist");
    } catch (err) {
      toast.error("Delete failed. Try again.", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 2000,
      });
    }
  };

  return (
    <div className="container xl:mx-[9rem] sm:mx-[0]">
      <div className="flex flex-col md:flex-row">
        <AdminMenu />
        <div className="md:w-3/4 p-3">
          <div className="h-12 text-xl font-semibold">Update / Delete Product</div>

          {form.image && (
            <div className="text-center">
              <img src={form.image} alt="product" className="mx-auto block w-full h-[40%]" />
            </div>
          )}

          <div className="mb-3">
            <label className="block w-full cursor-pointer rounded-lg py-11 text-center font-bold text-white">
              Upload image
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={uploadFileHandler}
                className="text-white"
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
                  min="1"
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
                />
              </div>
            </div>

            <label>Description</label>
            <textarea
              className="w-[95%] rounded-lg border bg-[#101011] p-2 text-white"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
            />

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
                />
              </div>
              <div>
                <label>Recommended Brew Methods</label> <br />
                <input
                  type="text"
                  className="w-full rounded-lg border bg-[#101011] p-4 text-white"
                  value={form.recommendedBrewingMethods}
                  onChange={(e) => setField("recommendedBrewingMethods", e.target.value)}
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

            <div>
              <button
                onClick={handleSubmit}
                className="mr-6 mt-5 rounded-lg bg-green-600 px-10 py-4 text-lg font-bold"
              >
                Update
              </button>
              <button
                onClick={handleDelete}
                className="mt-5 rounded-lg bg-pink-600 px-10 py-4 text-lg font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductUpdate;
