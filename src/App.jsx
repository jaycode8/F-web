import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import "./App.css";
import api from "./pages/helpers/Api";
import SignIn from "./pages/auth/Signin";
import Library from "./pages/library/Library";
import FolderDetails from "./pages/library/FolderDetails";

const checkAuth = () => api.get("/auth").then(r => r.data.data);

const ProtectedRoute = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["me"],
        queryFn: checkAuth,
        retry: false,
        staleTime: 5 * 60_000,
    });

    if (isLoading) {
        return (
            <div className="min-h-dvh bg-surface flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
                    <p className="text-sm text-muted">Loading...</p>
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return <Navigate to="/signin" replace />;
    }

    return <Outlet />;
};

// const PosLayout = ({ children }) => {
//     const [openSideBar, setOpenSideBar] = useState(false);
//     const [collapsed, setCollapsed] = useState(() => {
//         return localStorage.getItem("sidebarCollapsed") === "true";
//     });
//
//     const toggleSideBar = () => setOpenSideBar(p => !p);
//
//     return (
//         <div className="min-h-dvh bg-surface overflow-x-hidden">
//             <SideBar
//                 openSideBar={openSideBar}
//                 toggleSideBar={toggleSideBar}
//                 collapsed={collapsed}
//                 setCollapsed={setCollapsed}
//             />
//             <TopBar
//                 toggleSideBar={toggleSideBar}
//                 collapsed={collapsed}
//             />
//             {openSideBar && (
//                 <div
//                     className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
//                     onClick={toggleSideBar}
//                 />
//             )}
//             <main className={`pt-14 min-h-screen transition-all duration-300
//                 ${collapsed ? "lg:pl-16" : "lg:pl-60"}`}>
//                 <div className="p-4 sm:p-6">
//                     {children}
//                 </div>
//             </main>
//         </div>
//     );
// };

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/signin" element={<SignIn />} />

                <Route element={<ProtectedRoute />}>
                    {/* <Route path="/" element={<PosLayout><Dashboard /></PosLayout>} /> */}
                    <Route path="/library" element={<Library />} />
                    <Route path="/folder/:id" element={<FolderDetails />} />
                </Route>

                {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
            </Routes>
        </BrowserRouter>
    );
};

export default App;
