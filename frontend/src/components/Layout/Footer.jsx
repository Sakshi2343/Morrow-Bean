import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative z-10 mt-auto border-t border-[#e2d4c5] bg-[#f3e7db]">
      <div className="container mx-auto grid gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <div className="text-xs uppercase tracking-[0.35em] text-[#9a7b62]">Morrow & Bean</div>
          <h3 className="mt-4 text-3xl text-[#2f2218]">A softer online coffee shop.</h3>
          <p className="mt-4 text-sm leading-7 text-[#6d5747]">
            Carefully chosen beans, espresso machines, and brew tools for coffee drinkers who care
            about the whole ritual.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-[#2f2218]">Shop</h4>
          <div className="mt-4 grid gap-2 text-sm text-[#6d5747]">
            <Link to="/shop?collection=coffee-beans">Coffee Beans</Link>
            <Link to="/shop?collection=machines">Machines</Link>
            <Link to="/shop?collection=brew-tools">Brew Tools</Link>
            <Link to="/shop?collection=subscriptions">Subscriptions & Gifts</Link>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-[#2f2218]">Help</h4>
          <div className="mt-4 grid gap-2 text-sm text-[#6d5747]">
            <Link to="/about">About the brand</Link>
            <Link to="/faq">FAQ & Shipping</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/cart">Shopping cart</Link>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-[#2f2218]">Visit</h4>
          <div className="mt-4 space-y-3 text-sm leading-7 text-[#6d5747]">
            <p>415 Market Street, San Francisco, CA</p>
            <p>hello@morrowandbean.com</p>
            <p>Mon to Sat, 8:00 AM to 6:00 PM</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
