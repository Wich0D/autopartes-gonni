"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import GeneralStats from "@/components/AdminPanelPage/GeneralStats";
import AdminTable from "@/components/AdminPanelPage/AdminTable";

export default function PanelAdminPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

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

    if (loading) {
        return (
            <div className="w-full min-h-[70vh] flex flex-col justify-center items-center gap-4 text-white">
                <div className="w-12 h-12 border-4 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <p className="text-neutral-400 font-medium">Verificando credenciales...</p>
            </div>
        );
    }

    return (
        <div className="flex-grow flex flex-col items-center p-8  ">
            {/*General Stats Container */}
            <h2 className="text-3xl font-bold mb-4">Estadísticas generales</h2>
            <div className="flex flex-col items-center w-full bg-neutral-200 border border-neutral-100 py-2 rounded-2xl">
                <GeneralStats key={refreshTrigger} />
            </div>
            <AdminTable onProductUpdate={() => setRefreshTrigger((prev) => prev + 1)} />
        </div>
    );
}
