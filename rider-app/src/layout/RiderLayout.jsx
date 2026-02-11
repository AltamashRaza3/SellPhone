import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

const RiderLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9eef5] flex justify-center">
      {/* Mobile App Container */}
      <div className="w-full max-w-[480px] min-h-screen flex flex-col">
        <Header />

        {/* Main Content */}
        <main className="flex-1 px-6 pt-5 pb-20 space-y-5 overflow-y-auto">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default RiderLayout;
