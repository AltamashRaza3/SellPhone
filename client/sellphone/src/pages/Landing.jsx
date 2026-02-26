import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Container from "../components/ui/Container";
import PhoneCard from "../components/PhoneCard";

const Landing = () => {
  const phones = useSelector((state) =>
    Array.isArray(state?.phones?.items) ? state.phones.items : [],
  );

  const featuredPhones = phones.slice(0, 4);

  return (
    <div className="w-full bg-[#f5f5f7] min-h-screen">
      {/* ================= HERO ================= */}
      <section className="pt-28 pb-28">
        <Container>
          <div className="flex justify-center">
            <div className="w-full max-w-6xl bg-white rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.08)] px-10 sm:px-16 py-20">
              <div className="grid lg:grid-cols-2 items-center gap-20">
                {/* LEFT */}
                <div className="text-center lg:text-left space-y-8">
                  <h1 className="text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] text-gray-900">
                    Buy & Sell
                    <br />
                    <span className="text-gray-400">Premium Smartphones</span>
                  </h1>

                  <p className="text-gray-500 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                    Certified refurbished devices. Verified quality. Secure
                    payments. Nationwide pickup and fast delivery.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                    <Link to="/phones">
                      <button className="px-10 py-4 text-lg font-semibold rounded-full bg-black text-white hover:scale-[1.02] transition shadow-md">
                        Browse Phones
                      </button>
                    </Link>

                    <Link to="/sale">
                      <button className="px-10 py-4 text-lg font-semibold rounded-full border border-gray-300 hover:bg-gray-100 transition">
                        Sell Your Phone
                      </button>
                    </Link>
                  </div>
                </div>

                {/* RIGHT IMAGE */}
                <div className="flex justify-center">
                  <div className="w-[320px] lg:w-[420px]">
                    <img
                      src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900"
                      alt="Smartphone"
                      className="rounded-[36px] shadow-[0_40px_90px_rgba(0,0,0,0.12)] w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="pb-32">
        <Container>
          <div className="flex justify-center">
            <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-16 text-center">
              {[
                {
                  title: "Verified Devices",
                  desc: "35+ quality checks before delivery.",
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="w-6 h-6"
                    >
                      <path d="M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7l7-4z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                  ),
                },
                {
                  title: "Free Pickup",
                  desc: "Doorstep pickup at your convenience.",
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="w-6 h-6"
                    >
                      <path d="M3 7h13l3 4v6H3z" />
                      <circle cx="7.5" cy="17.5" r="1.5" />
                      <circle cx="17.5" cy="17.5" r="1.5" />
                    </svg>
                  ),
                },
                {
                  title: "Secure Delivery",
                  desc: "Fast & insured nationwide shipping.",
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="w-6 h-6"
                    >
                      <path d="M7 11V8a5 5 0 0110 0v3" />
                      <path d="M12 11c1.657 0 3 1.343 3 3v3H9v-3c0-1.657 1.343-3 3-3z" />
                    </svg>
                  ),
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-6"
                >
                  <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white shadow-sm">
                    {item.icon}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ================= FEATURED ================= */}
      <section className="py-32 border-t border-gray-100 bg-white">
        <Container>
          <div className="flex justify-center">
            <div className="w-full max-w-6xl space-y-16">
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
                  Featured Phones
                </h2>

                <Link
                  to="/phones"
                  className="text-sm text-gray-500 hover:text-black transition"
                >
                  View All →
                </Link>
              </div>

              {featuredPhones.length === 0 ? (
                <div className="bg-[#f5f5f7] rounded-3xl py-24 text-center">
                  <p className="text-gray-500">No phones available</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
                  {featuredPhones.map((phone) => (
                    <PhoneCard key={phone._id} phone={phone} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* ================= WHY SELL WITH US ================= */}
      <section className="py-44 bg-[#f5f5f7] border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-28">
          {/* HEADER */}
          <div className="flex flex-col items-center space-y-6 text-center">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
              Why Sell With Us
            </h2>

            <p className="text-gray-500 text-lg leading-relaxed max-w-xl">
              We make selling your smartphone simple, transparent, and
              rewarding.
              <br className="hidden md:block" />
              No hidden fees. No stress.
            </p>
          </div>

          {/* CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
            {[
              {
                icon: "AED",
                title: "Best Market Value",
                desc: "Competitive payouts powered by real-time demand analytics.",
              },
              {
                icon: "🚚",
                title: "Free Doorstep Pickup",
                desc: "Schedule pickup at your convenience anywhere in Dubai.",
              },
              {
                icon: "⚡",
                title: "Instant Payment",
                desc: "Once verified, your payment is processed immediately.",
              },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center space-y-6">
                <div className="w-16 h-16 flex items-center justify-center rounded-3xl bg-white shadow-sm text-xl font-semibold">
                  {item.icon}
                </div>

                <h3 className="text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>

                <p className="text-gray-500 leading-relaxed max-w-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* CTA BUTTON */}
          <div className="pt-10">
            <Link to="/sale">
              <button className="px-12 py-4 text-lg font-semibold rounded-full bg-black text-white hover:scale-[1.02] transition shadow-md">
                Start Selling
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-36 bg-white border-t border-gray-100">
        <Container>
          <div className="flex justify-center">
            <div className="max-w-3xl text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
                Upgrade Your Smartphone Today
              </h2>

              <p className="text-gray-500 text-lg">
                Discover top refurbished devices at unbeatable prices.
              </p>

              <Link to="/phones">
                <button className="px-12 py-4 text-lg font-semibold rounded-full bg-black text-white hover:scale-[1.02] transition shadow-md">
                  Explore Collection
                </button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Landing;
