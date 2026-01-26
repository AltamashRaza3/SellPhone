import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

const RiderLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex justify-center">
      <div className="w-full max-w-md bg-zinc-950 text-white flex flex-col shadow-2xl">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 px-4 py-4 overflow-y-auto">{children}</main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default RiderLayout;
