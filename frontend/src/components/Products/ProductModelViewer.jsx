import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { useCreateCustomRoastMutation } from "../../redux/api/intelligenceApiSlice";

const roastPalette = {
  light: "#d8a86c",
  medium: "#9a633a",
  "medium-dark": "#6f4328",
  dark: "#47291c",
};

const inferRoastLevel = (temperatureC, durationSeconds) => {
  const intensity = Number(temperatureC) + Number(durationSeconds) / 10;

  if (intensity < 260) {
    return "light";
  }

  if (intensity < 285) {
    return "medium";
  }

  if (intensity < 305) {
    return "medium-dark";
  }

  return "dark";
};

const tastingBiasForRoast = (roastLevel) => {
  if (roastLevel === "light") {
    return ["citrus", "floral", "tea-like"];
  }

  if (roastLevel === "medium-dark") {
    return ["cocoa", "caramel", "syrupy"];
  }

  if (roastLevel === "dark") {
    return ["molasses", "dark chocolate", "smoke"];
  }

  return ["caramel", "balanced", "stone fruit"];
};

const ModelScene = ({
  modelType = "coffee-bag",
  accentColor = "#d97706",
  beanColor = "#9a633a",
}) => {
  if (modelType === "espresso-machine") {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.3, 1.8, 1.4]} />
          <meshStandardMaterial color="#d6d3d1" metalness={0.6} roughness={0.25} />
        </mesh>
        <mesh position={[0.7, -0.2, 0.9]}>
          <cylinderGeometry args={[0.14, 0.14, 0.9, 32]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
        <mesh position={[-0.7, 0.3, 0.8]}>
          <boxGeometry args={[0.55, 0.3, 0.2]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      </group>
    );
  }

  if (modelType === "manual-grinder") {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.48, 1.8, 32]} />
          <meshStandardMaterial color="#57534e" />
        </mesh>
        <mesh position={[0, 1.2, 0]} rotation={[0, 0, 0.7]}>
          <boxGeometry args={[1.4, 0.08, 0.08]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
        <mesh position={[0.7, 1.2, 0]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial color="#f5f5f4" />
        </mesh>
      </group>
    );
  }

  if (modelType === "dripper") {
    return (
      <group>
        <mesh position={[0, 0.2, 0]}>
          <coneGeometry args={[1.05, 1.4, 32, 1, true]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
        <mesh position={[0, -0.7, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.7, 24]} />
          <meshStandardMaterial color="#f5f5f4" />
        </mesh>
      </group>
    );
  }

  if (modelType === "kettle") {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.95, 32, 32]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <mesh position={[1.1, 0.2, 0]} rotation={[0, 0, -0.4]}>
          <cylinderGeometry args={[0.06, 0.08, 1.3, 16]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh position={[-0.8, 0.1, 0.2]} rotation={[0.2, 0.3, -0.2]}>
        <sphereGeometry args={[0.58, 32, 32]} />
        <meshStandardMaterial color={beanColor} roughness={0.35} metalness={0.05} />
      </mesh>
      <mesh position={[-0.63, 0.1, 0.74]} rotation={[1.4, 0, 0.3]}>
        <cylinderGeometry args={[0.06, 0.06, 0.6, 24]} />
        <meshStandardMaterial color="#f8d8ad" roughness={0.5} />
      </mesh>
      <mesh position={[0.8, -0.05, -0.15]} rotation={[0, -0.3, 0.2]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial color={beanColor} roughness={0.28} metalness={0.08} />
      </mesh>
      <mesh position={[0.95, -0.05, 0.28]} rotation={[1.4, 0, 0.2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.55, 24]} />
        <meshStandardMaterial color="#f8d8ad" roughness={0.5} />
      </mesh>
      <mesh position={[0, -1.1, 0]}>
        <cylinderGeometry args={[1.8, 1.8, 0.08, 36]} />
        <meshStandardMaterial color="#2a1a12" />
      </mesh>
    </group>
  );
};

const ProductModelViewer = ({ product }) => {
  const interactiveModel = product?.interactiveModel;
  const hotspots = interactiveModel?.hotspots || [];
  const [activeHotspot, setActiveHotspot] = useState(hotspots[0] || null);
  const [temperatureC, setTemperatureC] = useState(
    product?.supplyChain?.defaultRoastTemperatureC || 204
  );
  const [durationSeconds, setDurationSeconds] = useState(
    product?.supplyChain?.defaultRoastDurationSeconds || 630
  );
  const [createCustomRoast, { isLoading }] = useCreateCustomRoastMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  if (!interactiveModel?.enabled) {
    return null;
  }

  const roastLevel = inferRoastLevel(temperatureC, durationSeconds);
  const previewNotes = tastingBiasForRoast(roastLevel);
  const beanColor = roastPalette[roastLevel] || roastPalette.medium;
  const isBeanRoastLab =
    product?.productType === "beans" && product?.customization?.customRoastEligible !== false;

  const createCustomSku = async () => {
    if (!userInfo) {
      toast.error("Sign in to create a custom roast SKU.");
      return;
    }

    try {
      const customProduct = await createCustomRoast({
        productId: product._id,
        temperatureC,
        durationSeconds,
      }).unwrap();

      dispatch(addToCart({ ...customProduct, qty: 1 }));
      toast.success("Custom roast added to your cart from the virtual roastery");
    } catch (error) {
      toast.error(error?.data?.message || "Unable to create custom roast");
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0f0a08] p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">Interactive 3D Exploration</h3>
          <p className="mt-1 text-sm text-stone-400">
            Rotate the product, inspect hotspots, and for beans tune a custom roast inside the virtual roastery.
          </p>
        </div>
        <span className="rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-200">
          WebGL
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr,0.8fr]">
        <div className="h-[380px] overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_55%),linear-gradient(180deg,#1c1917_0%,#09090b_100%)]">
          <Canvas camera={{ position: [3.5, 2.5, 4.5], fov: 45 }}>
            <Suspense fallback={<Html center className="text-sm text-white">Loading model...</Html>}>
              <ambientLight intensity={1.1} />
              <directionalLight intensity={2} position={[3, 4, 2]} />
              <pointLight intensity={1.5} position={[-2, 2, 3]} color={beanColor} />
              <ModelScene
                modelType={interactiveModel.modelType}
                accentColor={interactiveModel.accentColor}
                beanColor={beanColor}
              />
              <OrbitControls enablePan={false} autoRotate autoRotateSpeed={1.2} />
            </Suspense>
          </Canvas>
        </div>

        <div className="space-y-3">
          {isBeanRoastLab ? (
            <div className="rounded-2xl border border-amber-300/15 bg-amber-500/5 p-4">
              <div className="text-sm uppercase tracking-[0.22em] text-amber-200/75">Virtual Roastery</div>
              <div className="mt-2 text-lg font-semibold text-white">Custom roast lab</div>
              <div className="mt-3 text-sm text-stone-300">
                Roast level preview: {roastLevel}. The bean color and notes update in real time from your WebGL controls.
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm text-stone-300">
                  Temperature: {temperatureC}C
                </label>
                <input
                  type="range"
                  min="188"
                  max="228"
                  value={temperatureC}
                  onChange={(event) => setTemperatureC(Number(event.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm text-stone-300">
                  Duration: {durationSeconds}s
                </label>
                <input
                  type="range"
                  min="480"
                  max="780"
                  step="15"
                  value={durationSeconds}
                  onChange={(event) => setDurationSeconds(Number(event.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {previewNotes.map((note) => (
                  <span
                    key={note}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-stone-200"
                  >
                    {note}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={createCustomSku}
                disabled={isLoading}
                className="mt-5 w-full rounded-full bg-primary px-4 py-3 font-semibold text-stone-950 transition hover:bg-[#dfa15d]"
              >
                {isLoading ? "Creating custom SKU..." : "Create Custom Roast SKU"}
              </button>
            </div>
          ) : null}

          {hotspots.length ? (
            hotspots.map((hotspot) => (
              <button
                type="button"
                key={hotspot.id}
                onClick={() => setActiveHotspot(hotspot)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  activeHotspot?.id === hotspot.id
                    ? "border-amber-400/30 bg-amber-500/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="text-sm font-semibold text-white">{hotspot.label}</div>
                <div className="mt-1 text-sm text-stone-400">{hotspot.description}</div>
              </button>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-stone-400">
              No hotspots have been configured for this model yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModelViewer;
