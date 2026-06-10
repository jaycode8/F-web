import { Link, useLocation } from "react-router-dom";
import {
    LayoutGrid, TrendingUp, Package, Settings, ChevronsLeft, ChevronsRight, X,
    Users, ShoppingCart, Receipt, BarChart2, Warehouse, Tags, Truck, CreditCard, RefreshCcw
} from "lucide-react";

const mediaUrl = import.meta.env.VITE_MEDIA_URL;

const sections = [
    {
        label: "Overview",
        items: [
            { label: "Dashboard", icon: LayoutGrid, path: "/" },
        ],
    },
    {
        label: "Point of Sale",
        items: [
            { label: "Sales", icon: ShoppingCart, path: "/sales" },
            { label: "Transactions", icon: Receipt, path: "/transactions" },
            { label: "Returns", icon: RefreshCcw, path: "/returns" },
            { label: "Payments", icon: CreditCard, path: "/payments" },
        ],
    },
    {
        label: "Inventory",
        items: [
            { label: "Products", icon: Package, path: "/products" },
            { label: "Categories", icon: Tags, path: "/categories" },
            { label: "Stock", icon: Warehouse, path: "/stock" },
            { label: "Suppliers", icon: Truck, path: "/suppliers" },
        ],
    },
    {
        label: "Reports",
        items: [
            { label: "Analytics", icon: BarChart2, path: "/analytics" },
            { label: "Sales Report", icon: TrendingUp, path: "/reports" },
        ],
    },
    {
        label: "Management",
        items: [
            { label: "Users", icon: Users, path: "/users" },
            { label: "Settings", icon: Settings, path: "/settings" },
        ],
    },
];

const SideBar = ({ openSideBar, toggleSideBar, collapsed, setCollapsed }) => {
    const location = useLocation();

    const isActive = (path) =>
        path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

    const toggleCollapse = () => {
        const next = !collapsed;
        setCollapsed(next);
        localStorage.setItem("sidebarCollapsed", next);
    };

    return (
        <aside className={`fixed top-0 left-0 z-50 h-screen bg-bg border-r border-border shadow-sm
            transition-all duration-300 ease-in-out
            ${collapsed ? "w-16" : "w-60"}
            ${openSideBar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>

            <button onClick={toggleSideBar}
                className="lg:hidden absolute top-3 right-3 p-1.5 rounded-lg text-muted hover:bg-surface transition-colors">
                <X size={18} />
            </button>

            <button onClick={toggleCollapse}
                className="hidden lg:flex absolute -right-3 top-16 w-6 h-6 bg-bg border border-border
                    rounded-full items-center justify-center shadow-sm hover:bg-surface transition-colors z-10">
                {collapsed
                    ? <ChevronsRight size={13} className="text-primary" />
                    : <ChevronsLeft size={13} className="text-primary" />}
            </button>

            <div className="flex flex-col h-full px-3 py-5 overflow-hidden">
                {/* Logo */}
                <div className={`flex items-center justify-center mb-8 px-1 ${collapsed ? "justify-center" : "gap-2"}`}>
                    <div className="h-44">
                        <img src={`${mediaUrl}/imgs/logo.png`} alt="logo" className="h-full object-contain" />
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-4 overflow-y-auto scrollbar-none">
                    {sections.map(({ label, items }) => (
                        <div key={label}>
                            {!collapsed && (
                                <p className="text-[9px] font-bold tracking-widest uppercase text-muted/50 px-3 mb-1">
                                    {label}
                                </p>
                            )}
                            {collapsed && (
                                <div className="w-6 mx-auto border-t border-border mb-1" />
                            )}
                            <div className="space-y-0.5">
                                {items.map(({ label: itemLabel, icon: Icon, path }) => {
                                    const active = isActive(path);
                                    return (
                                        <Link key={path} to={path} onClick={toggleSideBar}
                                            title={collapsed ? itemLabel : undefined}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150
                                                ${collapsed ? "justify-center" : ""}
                                                ${active
                                                    ? "bg-primary text-white shadow-sm shadow-primary/25"
                                                    : "text-muted hover:bg-surface hover:text-text"
                                                }`}>
                                            <Icon size={18} className="shrink-0" />
                                            {!collapsed && (
                                                <span className="text-sm font-semibold">{itemLabel}</span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Bottom brand */}
                {!collapsed && (
                    <p className="text-[10px] text-muted/50 text-center tracking-widest uppercase pb-1">
                        Qwin POS &copy; {new Date().getFullYear()}
                    </p>
                )}
            </div>
        </aside>
    );
};

export default SideBar;
