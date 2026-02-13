import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#f5f5f7] border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
        {/* CENTERED GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-20 text-center">
          {/* BRAND */}
          <div className="flex flex-col items-center space-y-5">
            <h2 className="text-lg font-semibold tracking-tight text-black">
              SalePhone
            </h2>

            <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
              Buy and sell refurbished smartphones with confidence. Verified
              devices, secure payments and fast delivery.
            </p>
          </div>

          {/* SHOP */}
          <div className="flex flex-col items-center space-y-5">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-900">
              Shop
            </h3>

            <ul className="space-y-3 text-sm text-neutral-500">
              <li>
                <Link to="/" className="hover:text-black transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/phones" className="hover:text-black transition">
                  Browse Phones
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-black transition">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div className="flex flex-col items-center space-y-5">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-900">
              Support
            </h3>

            <ul className="space-y-3 text-sm text-neutral-500">
              <li className="hover:text-black transition cursor-pointer">
                Contact Us
              </li>
              <li className="hover:text-black transition cursor-pointer">
                FAQs
              </li>
              <li className="hover:text-black transition cursor-pointer">
                Terms & Conditions
              </li>
              <li className="hover:text-black transition cursor-pointer">
                Privacy Policy
              </li>
            </ul>
          </div>

          {/* FOLLOW */}
          <div className="flex flex-col items-center space-y-5">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-900">
              Follow
            </h3>

            <ul className="space-y-3 text-sm text-neutral-500">
              <li>
                <a href="#" className="hover:text-black transition">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black transition">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black transition">
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="mt-20 pt-8 border-t border-neutral-200 text-center text-xs text-neutral-400">
          © {new Date().getFullYear()} SalePhone. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
