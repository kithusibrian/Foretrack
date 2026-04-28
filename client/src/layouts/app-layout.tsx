import Navbar from "@/components/navbar";
import { Outlet } from "react-router-dom";
import EditTransactionDrawer from "@/components/transaction/edit-transaction-drawer";
import CoachChat from "@/components/coach-chat/coach-chat";

const AppLayout = () => {
  return (
    <>
      <div className="min-h-screen pb-10">
        <Navbar />
        <main className="w-full max-w-full">
          <Outlet />
        </main>
        <CoachChat />
      </div>
      <EditTransactionDrawer />
    </>
  );
};

export default AppLayout;
