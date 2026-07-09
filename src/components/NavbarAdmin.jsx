"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { FaSignOutAlt } from "react-icons/fa";

export default function NavbarAdmin() {
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            router.push("/admin");
        } catch (err) {
            console.error("Error signing out:", err);
        }
    };

    return (
        <nav className="fixed top-0 left-0 w-full h-24 px-4 md:px-8 bg-black flex items-center justify-between shadow-md z-50 text-white">
            {/* Logo */}
            <div className="flex items-center gap-2">
                <Link href="/admin/panel" className="flex items-center">
                    <Image
                        src="/gonni_logo_2.png"
                        alt="Logo"
                        width={100}
                        height={100}
                        priority
                        className="h-16 w-auto object-contain"
                    />
                </Link>
                {/* Welcome Message */}
                <div className="hidden sm:block text-white font-bold text-lg tracking-wide ">
                    Bienvenido, Administrador.
                </div>
            </div>


            {/* Logout Button */}
            <div>
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl font-bold cursor-pointer transition-all duration-200 active:scale-[0.98] text-sm hover:opacity-60 "
                >
                    <FaSignOutAlt size={16} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </nav>
    );
}