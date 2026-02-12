import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-24">
      <div className="max-w-6xl mx-auto px-5 md:px-6 py-16">
        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {/* BRAND */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">
              SalePhone
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Buy and sell refurbished smartphones with confidence. Verified
              devices, secure payments, fast delivery.
            </p>
          </div>

          {/* SHOP */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Shop
            </h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <Link to="/" className="hover:text-gray-900 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/phones" className="hover:text-gray-900 transition">
                  Browse Phones
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-gray-900 transition">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="hover:text-gray-900 transition cursor-pointer">
                Contact Us
              </li>
              <li className="hover:text-gray-900 transition cursor-pointer">
                FAQs
              </li>
              <li className="hover:text-gray-900 transition cursor-pointer">
                Terms & Conditions
              </li>
              <li className="hover:text-gray-900 transition cursor-pointer">
                Privacy Policy
              </li>
            </ul>
          </div>

          {/* SOCIAL */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Follow
            </h3>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-900 transition">
                Instagram
              </a>
              <a href="#" className="hover:text-gray-900 transition">
                Twitter
              </a>
              <a href="#" className="hover:text-gray-900 transition">
                Facebook
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="mt-16 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} SalePhone. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
