import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Layout = () => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#f7f0e7] text-[#2f2218]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(189,137,93,0.18),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(118,91,63,0.12),_transparent_22%),linear-gradient(180deg,_rgba(248,242,235,0.95),_rgba(242,233,222,0.98))]" />
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(130,94,63,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(130,94,63,0.04)_1px,transparent_1px)] [background-size:120px_120px]" />
      <ToastContainer />
      <Header />
      <main className="relative z-10 flex-grow pt-28 md:pt-32">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
