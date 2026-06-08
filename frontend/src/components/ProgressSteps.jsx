const ProgressSteps = ({ step1, step2, step3 }) => {
  const steps = [
    { label: "Sign In", active: step1 },
    { label: "Shipping & Payment", active: step2 },
    { label: "Review Order", active: step3 },
  ];

  return (
    <div className="mb-10 flex flex-wrap items-center gap-4 rounded-[2rem] border border-[#d9c7b2] bg-[#fbf6ef]/90 p-5 text-[#5c4636] shadow-[0_18px_50px_rgba(73,45,20,0.08)]">
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold ${
                step.active
                  ? "border-[#8c6544] bg-[#8c6544] text-white"
                  : "border-[#d8c7b2] bg-white text-[#8a7768]"
              }`}
            >
              {index + 1}
            </div>
            <span className={`text-sm font-medium ${step.active ? "text-[#2f2218]" : "text-[#8a7768]"}`}>
              {step.label}
            </span>
          </div>

          {index < steps.length - 1 ? <div className="hidden h-px w-10 bg-[#d7c6b2] sm:block" /> : null}
        </div>
      ))}
    </div>
  );
};

export default ProgressSteps;
