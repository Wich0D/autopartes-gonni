"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

export default function PanelAdminPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    // Si no está autenticado, redirige al login
                    router.push("/admin");
                } else {
                    setUser(session.user);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Error checking auth:", err);
                router.push("/admin");
            }
        }

        checkAuth();

        // Escucha cambios en el estado de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                router.push("/admin");
            } else {
                setUser(session.user);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            router.push("/admin");
        } catch (err) {
            console.error("Error signing out:", err);
        }
    };

    if (loading) {
        return (
            <div className="w-full min-h-[70vh] flex flex-col justify-center items-center gap-4 text-white">
                <div className="w-12 h-12 border-4 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <p className="text-neutral-400 font-medium">Verificando credenciales...</p>
            </div>
        );
    }

    return (
        <div className="flex-grow flex flex-col items-center justify-center p-8 mt-12 ">
            <div className="">

            </div>
        </div>
    );
}

