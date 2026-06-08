import { useState } from "react";
import { toast } from "react-toastify";

const Contact = () => {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });

  const submitHandler = (event) => {
    event.preventDefault();
    toast.success("Thanks! Your message is ready for the team.");
    setFormState({ name: "", email: "", message: "" });
  };

  return (
    <div className="container mx-auto px-4 pb-20">
      <section className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
        <div className="rounded-[2.1rem] border border-[#ddcfbf] bg-[#fbf7f1] p-8 shadow-[0_28px_80px_rgba(92,70,54,0.08)] md:p-10">
          <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Contact</div>
          <h1 className="mt-4 text-5xl leading-tight text-[#2f2218]">
            Need help choosing beans or gear?
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#6d5747]">
            Reach out for product questions, order support, gifting help, or machine guidance.
          </p>

          <div className="mt-8 space-y-4 text-sm leading-7 text-[#6d5747]">
            <div className="rounded-[1.4rem] border border-[#eadfd3] bg-white/75 p-4">
              <strong className="block text-[#2f2218]">Studio Hours</strong>
              Monday to Saturday, 8:00 AM to 6:00 PM
            </div>
            <div className="rounded-[1.4rem] border border-[#eadfd3] bg-white/75 p-4">
              <strong className="block text-[#2f2218]">Email</strong>
              hello@morrowandbean.com
            </div>
            <div className="rounded-[1.4rem] border border-[#eadfd3] bg-white/75 p-4">
              <strong className="block text-[#2f2218]">Phone</strong>
              +1 (415) 555-0191
            </div>
          </div>
        </div>

        <form
          onSubmit={submitHandler}
          className="rounded-[2.1rem] border border-[#ddcfbf] bg-white/85 p-8 shadow-[0_28px_80px_rgba(92,70,54,0.08)] md:p-10"
        >
          <div className="grid gap-5">
            <label className="grid gap-2 text-sm font-medium text-[#5f4b3c]">
              Name
              <input
                type="text"
                value={formState.name}
                required
                onChange={(event) => setFormState({ ...formState, name: event.target.value })}
                className="rounded-[1.1rem] border border-[#dbcbb8] bg-[#fbf7f1] px-4 py-3 text-[#2f2218] outline-none transition focus:border-[#9d7552]"
                placeholder="Your name"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#5f4b3c]">
              Email
              <input
                type="email"
                value={formState.email}
                required
                onChange={(event) => setFormState({ ...formState, email: event.target.value })}
                className="rounded-[1.1rem] border border-[#dbcbb8] bg-[#fbf7f1] px-4 py-3 text-[#2f2218] outline-none transition focus:border-[#9d7552]"
                placeholder="you@example.com"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#5f4b3c]">
              Message
              <textarea
                value={formState.message}
                required
                rows={6}
                onChange={(event) => setFormState({ ...formState, message: event.target.value })}
                className="rounded-[1.1rem] border border-[#dbcbb8] bg-[#fbf7f1] px-4 py-3 text-[#2f2218] outline-none transition focus:border-[#9d7552]"
                placeholder="Tell us what you’re looking for."
              />
            </label>

            <button
              type="submit"
              className="rounded-full bg-[#8b6343] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#755136]"
            >
              Send message
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Contact;
