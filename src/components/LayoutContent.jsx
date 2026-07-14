"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import NavbarAdmin from "./NavbarAdmin";

export default function LayoutContent({ children }) {
    const pathname = usePathname();

    // Ruta de Login del Admin
    if (pathname === "/admin") {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center">
                {children}
            </div>
        );
    }

    // Ruta del Panel de Admin
    if (pathname.startsWith("/admin/panel")) {
        return (
            <div className="min-h-screen bg-white text-black pt-24 flex flex-col">
                <NavbarAdmin />
                <main className="flex-1 w-full">
                    {children}
                </main>
            </div>
        );
    }

    // Rutas públicas del sitio
    return (
        <div className="min-h-screen flex flex-col pt-24 bg-white text-black">
            <Navbar />
            <main className="flex-grow w-full">
                {children}
            </main>
            <Footer />
        </div>
    );
}
