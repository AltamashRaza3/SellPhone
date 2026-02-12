import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Container from "../components/ui/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SectionTitle from "../components/ui/SectionTitle";
import PhoneCard from "../components/PhoneCard";

const Landing = () => {
  const phones = useSelector((state) =>
    Array.isArray(state?.phones?.items) ? state.phones.items : [],
  );

  const featuredPhones = phones.slice(0, 4);

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <Container>
          <div className="grid lg:grid-cols-2 items-center gap-12 lg:gap-20 justify-items-center lg:justify-items-start">
            {/* LEFT CONTENT - CENTERED ON MOBILE */}
            <div className="text-center lg:text-left space-y-8 lg:space-y-10 max-w-lg lg:max-w-none w-full lg:w-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 leading-tight">
                Buy & Sell <br className="hidden sm:block" />
                <span className="text-transparent bg-gradient-to-r from-slate-900 via-black to-slate-900 bg-clip-text">
                  Premium Smartphones
                </span>
                .
              </h1>

              <p className="text-slate-600 text-lg lg:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Certified refurbished devices. Verified quality. Secure
                payments. Nationwide pickup and fast delivery.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 w-full sm:w-auto">
                <Link to="/phones">
                  <Button size="lg">Browse Phones</Button>
                </Link>
                <Link to="/sale">
                  <Button variant="secondary" size="lg">
                    Sell Your Phone
                  </Button>
                </Link>
              </div>
            </div>

            {/* RIGHT IMAGES - RELIABLE CDN IMAGES */}
            <div className="relative flex justify-center lg:justify-end w-full">
              <div className="relative w-[280px] md:w-[360px] lg:w-[420px] max-w-full">
                {/* Main Phone */}
                <img
                  src="https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="iPhone device"
                  className="w-full h-auto rounded-3xl shadow-2xl rotate-[-8deg] absolute bottom-0 z-10 max-w-full"
                  loading="eager"
                />

                {/* Secondary Phone */}
                <img
                  src="https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Premium smartphone"
                  className="w-[85%] h-auto rounded-3xl shadow-2xl rotate-[10deg] absolute top-16 lg:-right-12 md:-right-8 -right-4 z-20"
                  loading="eager"
                />

                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-3xl blur-xl -z-10 w-full h-full" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="py-24 lg:py-32">
        <Container>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10 justify-items-center">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 p-8 w-full max-w-sm">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4 tracking-tight">
                Verified Devices
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed text-center">
                Every phone undergoes 35+ quality checks and certification
                before delivery.
              </p>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 p-8 w-full max-w-sm">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4 tracking-tight">
                Secure Payments
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed text-center">
                Multiple payment options with buyer & seller protection
                guarantee.
              </p>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 p-8 w-full max-w-sm">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4 tracking-tight">
                Free Pickup
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed text-center">
                Schedule pickup from your doorstep. No shipping hassles.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* ================= FEATURED PHONES ================= */}
      <section className="py-24 lg:py-32 bg-white">
        <Container>
          <div className="flex flex-col lg:flex-row items-center justify-between mb-12 lg:mb-16 gap-4 lg:gap-0">
            <SectionTitle>Featured Phones</SectionTitle>
            <Link
              to="/phones"
              className="text-base font-semibold text-slate-900 hover:text-black transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
            >
              View All
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>

          {featuredPhones.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No phones available
              </h3>
              <p className="text-slate-600">
                Check back soon for amazing deals!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 justify-items-center lg:justify-items-stretch">
              {featuredPhones.map((phone) => (
                <PhoneCard key={phone._id} phone={phone} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="py-24 lg:py-32">
        <Container>
          <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8 lg:space-y-10">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 leading-tight">
                Upgrade Your <br />
                <span className="text-transparent bg-gradient-to-r from-slate-900 via-black to-slate-900 bg-clip-text">
                  Smartphone Today
                </span>
                .
              </h2>
              <div className="w-28 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full mx-auto" />
            </div>

            <p className="text-slate-600 text-xl lg:text-2xl font-medium leading-relaxed max-w-lg">
              Discover top refurbished devices at unbeatable prices.
            </p>

            <div className="flex justify-center">
              <Link to="/phones">
                <Button size="xl">Explore Collection</Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Landing;
