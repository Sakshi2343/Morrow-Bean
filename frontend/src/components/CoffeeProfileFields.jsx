const brewingOptions = [
  "espresso",
  "pour-over",
  "french press",
  "aeropress",
  "cold brew",
  "moka pot",
];

const originOptions = ["ethiopia", "colombia", "kenya", "guatemala", "brazil", "sumatra"];
const noteOptions = ["citrus", "berry", "chocolate", "caramel", "floral", "nutty"];

const toggleItem = (items, item) =>
  items.includes(item) ? items.filter((entry) => entry !== item) : [...items, item];

const CheckboxGrid = ({ items, selected, onToggle }) => (
  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
    {items.map((item) => (
      <button
        key={item}
        type="button"
        onClick={() => onToggle(item)}
        className={`rounded-full border px-3 py-2 text-sm capitalize transition ${
          selected.includes(item)
            ? "border-[#8b6343] bg-[#f3e7db] text-[#2f2218]"
            : "border-[#dbcbb8] bg-white text-[#6d5747]"
        }`}
      >
        {item}
      </button>
    ))}
  </div>
);

const CoffeeProfileFields = ({
  coffeeProfile,
  smartSubscription,
  onCoffeeProfileChange,
  onSmartSubscriptionChange,
}) => {
  const updateProfile = (field, value) => {
    onCoffeeProfileChange({ ...coffeeProfile, [field]: value });
  };

  return (
    <div className="space-y-6 rounded-[1.8rem] border border-[#ddcfbf] bg-[#fbf7f1] p-6">
      <div>
        <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Flavor Profile</div>
        <p className="mt-2 text-sm leading-7 text-[#6d5747]">
          These preferences drive the flavor matcher, predictive pricing, and smart replenishment.
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-[#5f4b3c]">Brewing Methods</label>
        <CheckboxGrid
          items={brewingOptions}
          selected={coffeeProfile.brewingMethods}
          onToggle={(value) =>
            updateProfile("brewingMethods", toggleItem(coffeeProfile.brewingMethods, value))
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#5f4b3c]">Roast Preference</label>
          <select
            value={coffeeProfile.roastPreference}
            onChange={(event) => updateProfile("roastPreference", event.target.value)}
            className="w-full rounded-[1.1rem] border border-[#dbcbb8] bg-white px-4 py-3 text-[#2f2218] outline-none transition focus:border-[#9d7552]"
          >
            <option value="light">Light</option>
            <option value="medium-light">Medium Light</option>
            <option value="medium">Medium</option>
            <option value="medium-dark">Medium Dark</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#5f4b3c]">Bean Preference</label>
          <input
            type="text"
            value={coffeeProfile.beanPreference}
            onChange={(event) => updateProfile("beanPreference", event.target.value)}
            placeholder="single-origin arabica"
            className="w-full rounded-[1.1rem] border border-[#dbcbb8] bg-white px-4 py-3 text-[#2f2218] outline-none transition focus:border-[#9d7552]"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#5f4b3c]">
            Acidity Tolerance: {coffeeProfile.acidityTolerance}
          </label>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={coffeeProfile.acidityTolerance}
            onChange={(event) => updateProfile("acidityTolerance", Number(event.target.value))}
            className="w-full accent-[#8b6343]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#5f4b3c]">Daily Cups</label>
          <input
            type="number"
            min="1"
            max="12"
            value={coffeeProfile.dailyCups}
            onChange={(event) => updateProfile("dailyCups", Number(event.target.value))}
            className="w-full rounded-[1.1rem] border border-[#dbcbb8] bg-white px-4 py-3 text-[#2f2218] outline-none transition focus:border-[#9d7552]"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-[#5f4b3c]">Favorite Flavor Notes</label>
        <CheckboxGrid
          items={noteOptions}
          selected={coffeeProfile.flavorNotes}
          onToggle={(value) =>
            updateProfile("flavorNotes", toggleItem(coffeeProfile.flavorNotes, value))
          }
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-[#5f4b3c]">Preferred Origins</label>
        <CheckboxGrid
          items={originOptions}
          selected={coffeeProfile.preferredOrigins}
          onToggle={(value) =>
            updateProfile("preferredOrigins", toggleItem(coffeeProfile.preferredOrigins, value))
          }
        />
      </div>

      <div className="rounded-[1.5rem] border border-[#ddcfbf] bg-[#f3e7db] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold text-[#2f2218]">Smart Subscription</h4>
            <p className="mt-1 text-sm leading-7 text-[#6d5747]">
              Predict when you’ll run out and queue a replenishment reminder automatically.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm font-medium text-[#5f4b3c]">
            <input
              type="checkbox"
              checked={smartSubscription.enabled}
              onChange={(event) =>
                onSmartSubscriptionChange({
                  ...smartSubscription,
                  enabled: event.target.checked,
                })
              }
              className="h-4 w-4 accent-[#8b6343]"
            />
            Enabled
          </label>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-[#5f4b3c]">
            Reminder lead time: {smartSubscription.reminderLeadDays} days
          </label>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={smartSubscription.reminderLeadDays}
            onChange={(event) =>
              onSmartSubscriptionChange({
                ...smartSubscription,
                reminderLeadDays: Number(event.target.value),
              })
            }
            className="w-full accent-[#8b6343]"
          />
        </div>
      </div>
    </div>
  );
};

export default CoffeeProfileFields;
