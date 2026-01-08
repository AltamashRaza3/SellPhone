import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-600 mt-12 pt-12 pb-8 text-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-4 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-orange-500">SalePhone</h2>
          <p className="text-gray-400 text-sm">
            Buy and sell smartphones with confidence. Verified devices, secure
            payments, fast delivery.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Shop</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>
              <Link to="/" className="hover:text-orange-500">
                Home
              </Link>
            </li>
            <li>
              <Link to="/sale" className="hover:text-orange-500">
                Phones for Sale
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-orange-500">
                Cart
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Support</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="hover:text-orange-500 cursor-pointer">Contact Us</li>
            <li className="hover:text-orange-500 cursor-pointer">FAQs</li>
            <li className="hover:text-orange-500 cursor-pointer">
              Terms & Conditions
            </li>
            <li className="hover:text-orange-500 cursor-pointer">
              Privacy Policy
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
          <div className="flex items-center gap-4 text-gray-400 text-xl">
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              📘
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              🐦
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              📸
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 py-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} SalePhone. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
