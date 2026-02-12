import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { auth } from "../utils/firebase";
import { toast } from "react-hot-toast";
import OrderStatusBadge from "../components/OrderStatusBadge";
import API_BASE_URL from "../../config/api";

const Orders = () => {
  const user = useSelector((state) => state.user.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          toast.error("Session expired. Please login again.");
          return;
        }

        const token = await currentUser.getIdToken();

        const res = await fetch(`${API_BASE_URL}/api/orders/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error();

        setOrders(Array.isArray(data) ? data : []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400 text-sm">
        Loading your orders…
      </div>
    );
  }

  /* ================= EMPTY STATE ================= */
  if (!orders.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-3xl font-semibold text-gray-900">No orders yet</h2>

        <p className="text-gray-500 mt-3 max-w-md">
          When you place your first order, it will appear here.
        </p>

        <Link
          to="/phones"
          className="mt-8 px-8 py-3 rounded-full bg-black text-white text-sm font-medium hover:opacity-90 transition"
        >
          Browse Phones
        </Link>
      </div>
    );
  }

  /* ================= ORDERS LIST ================= */
 return (
   <div className="bg-[#f5f5f7] min-h-screen py-28">
     <div className="max-w-4xl mx-auto px-6">
       {/* ================= HEADER ================= */}
       <div className="mb-16">
         <h1 className="text-5xl font-semibold tracking-tight text-gray-900">
           My Orders
         </h1>
         <p className="text-gray-500 mt-4 text-lg">
           Review your recent purchases and track their progress.
         </p>
       </div>

       {/* ================= ORDER LIST ================= */}
       <div className="space-y-10">
         {orders.map((order) => (
           <div
             key={order._id}
             className="
              bg-white
              rounded-3xl
              p-8
              border border-gray-100
              transition-all duration-300
              hover:shadow-2xl
            "
           >
             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
               {/* LEFT SIDE */}
               <div className="space-y-4">
                 <p className="text-xs uppercase tracking-widest text-gray-400">
                   Order #{order._id.slice(-6)}
                 </p>

                 <p className="text-3xl font-semibold text-gray-900">
                   ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                 </p>

                 <OrderStatusBadge status={order.status} />
               </div>

               {/* RIGHT SIDE */}
               <div className="flex flex-col md:items-end gap-4">
                 <p className="text-sm text-gray-400">
                   {new Date(order.createdAt).toLocaleDateString("en-IN", {
                     day: "numeric",
                     month: "long",
                     year: "numeric",
                   })}
                 </p>

                 <Link
                   to={`/order/${order._id}`}
                   className="
                    px-8 py-3
                    rounded-full
                    bg-black
                    text-white
                    text-sm font-medium
                    hover:opacity-90
                    transition
                  "
                 >
                   View Details
                 </Link>
               </div>
             </div>
           </div>
         ))}
       </div>
     </div>
   </div>
 );


};

export default Orders;
