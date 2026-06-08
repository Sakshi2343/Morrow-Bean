import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  useGetBlindTastingChallengeQuery,
  useSubmitBlindTastingFlightMutation,
} from "../redux/api/intelligenceApiSlice";

const roastLevels = ["light", "medium", "medium-dark", "dark"];

const BlindTastingLab = () => {
  const { data: challenge, isLoading } = useGetBlindTastingChallengeQuery();
  const [submitBlindTastingFlight, { isLoading: submitting }] = useSubmitBlindTastingFlightMutation();
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const initializedAnswers = useMemo(
    () =>
      (challenge?.samples || []).reduce((acc, sample) => {
        acc[sample.sampleCode] = answers[sample.sampleCode] || {
          productId: sample.productId,
          sampleCode: sample.sampleCode,
          guessedNotes: [],
          guessedOrigin: "",
          guessedAcidity: 3,
          guessedRoastLevel: sample.roastHint || "medium",
        };
        return acc;
      }, {}),
    [answers, challenge?.samples]
  );

  const toggleNote = (sampleCode, note) => {
    const current = initializedAnswers[sampleCode];
    const guessedNotes = current.guessedNotes.includes(note)
      ? current.guessedNotes.filter((entry) => entry !== note)
      : [...current.guessedNotes, note];

    setAnswers((state) => ({
      ...state,
      [sampleCode]: { ...current, guessedNotes },
    }));
  };

  const updateAnswer = (sampleCode, field, value) => {
    setAnswers((state) => ({
      ...state,
      [sampleCode]: {
        ...(initializedAnswers[sampleCode] || {}),
        [field]: value,
      },
    }));
  };

  const submitFlight = async () => {
    try {
      const payload = {
        entries: Object.values(initializedAnswers),
      };
      const response = await submitBlindTastingFlight(payload).unwrap();
      setResult(response);
      toast.success("Blind tasting results submitted to the flavor matcher");
    } catch (error) {
      toast.error(error?.data?.message || "Unable to submit blind tasting flight");
    }
  };

  return (
    <div className="rounded-[2rem] border border-[#ddcfbf] bg-white/85 p-7 shadow-[0_18px_55px_rgba(92,70,54,0.06)]">
      <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Feedback Loop</div>
      <h3 className="mt-3 text-3xl text-[#2f2218]">Blind tasting flight</h3>
      <p className="mt-2 text-sm leading-7 text-[#6d5747]">
        Guess the tasting notes, roast level, origin, and acidity on four mystery samples. Your
        answers are converted into training rows for the flavor matcher.
      </p>

      {isLoading ? (
        <div className="mt-6 text-sm text-[#6d5747]">Loading your tasting flight...</div>
      ) : (
        <div className="mt-6 grid gap-4">
          {(challenge?.samples || []).map((sample) => {
            const entry = initializedAnswers[sample.sampleCode] || {};

            return (
              <div
                key={sample.sampleCode}
                className="rounded-[1.5rem] border border-[#eadfd3] bg-[#fbf7f1] p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-[#2f2218]">{sample.sampleCode}</div>
                    <div className="mt-1 text-sm text-[#6d5747]">
                      Brew hint: {sample.brewMethod} · bag size {sample.bagSize}g
                    </div>
                  </div>
                  <div className="text-sm text-[#8b6343]">Roast hint: {sample.roastHint}</div>
                </div>

                <div className="mt-4">
                  <div className="mb-2 text-sm font-medium text-[#5f4b3c]">Flavor notes</div>
                  <div className="flex flex-wrap gap-2">
                    {(challenge?.noteOptions || []).map((note) => (
                      <button
                        key={`${sample.sampleCode}-${note}`}
                        type="button"
                        onClick={() => toggleNote(sample.sampleCode, note)}
                        className={`rounded-full px-3 py-2 text-xs transition ${
                          entry.guessedNotes?.includes(note)
                            ? "border border-[#8b6343] bg-[#f3e7db] text-[#2f2218]"
                            : "border border-[#dbcbb8] bg-white text-[#6d5747]"
                        }`}
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#5f4b3c]">Origin</label>
                    <select
                      value={entry.guessedOrigin || ""}
                      onChange={(event) =>
                        updateAnswer(sample.sampleCode, "guessedOrigin", event.target.value)
                      }
                      className="w-full rounded-[1.1rem] border border-[#dbcbb8] bg-white px-4 py-3 text-[#2f2218] outline-none transition focus:border-[#9d7552]"
                    >
                      <option value="">Choose</option>
                      {(challenge?.originOptions || []).map((origin) => (
                        <option key={origin} value={origin}>
                          {origin}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#5f4b3c]">Roast level</label>
                    <select
                      value={entry.guessedRoastLevel || "medium"}
                      onChange={(event) =>
                        updateAnswer(sample.sampleCode, "guessedRoastLevel", event.target.value)
                      }
                      className="w-full rounded-[1.1rem] border border-[#dbcbb8] bg-white px-4 py-3 text-[#2f2218] outline-none transition focus:border-[#9d7552]"
                    >
                      {roastLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#5f4b3c]">
                      Acidity: {entry.guessedAcidity || 3}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={entry.guessedAcidity || 3}
                      onChange={(event) =>
                        updateAnswer(sample.sampleCode, "guessedAcidity", Number(event.target.value))
                      }
                      className="w-full accent-[#8b6343]"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={submitFlight}
        disabled={submitting || !challenge?.samples?.length}
        className="mt-6 rounded-full bg-[#8b6343] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#755136] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Submitting flight..." : "Submit flight to train matcher"}
      </button>

      {result ? (
        <div className="mt-6 rounded-[1.5rem] border border-[#ddcfbf] bg-[#f3e7db] p-5">
          <div className="text-lg font-semibold text-[#2f2218]">
            Flight score: {result.rewardScore}
          </div>
          <div className="mt-1 text-sm text-[#6d5747]">
            Training status: {result.trained ? `updated via ${result.modelType}` : result.modelType}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {(result.results || []).map((entry) => (
              <div
                key={entry.productId}
                className="rounded-[1.1rem] border border-[#ddcfbf] bg-white/80 p-4"
              >
                <div className="font-medium text-[#2f2218]">{entry.sampleCode}</div>
                <div className="mt-1 text-sm text-[#6d5747]">{entry.name}</div>
                <div className="mt-2 text-sm text-[#8b6343]">Score: {entry.score}</div>
                <div className="mt-2 text-xs text-[#7f6654]">
                  Actual: {entry.actualOrigin} · {entry.actualRoastLevel}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default BlindTastingLab;
