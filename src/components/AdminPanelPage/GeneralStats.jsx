"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";

export default function GeneralStats() {
    const [stats, setStats] = useState({
        products: 0,
        brands: 0,
        categories: 0,
        visibleProducts: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const [
                    { count: productCount, error: productError },
                    { count: brandCount, error: brandError },
                    { count: categoryCount, error: categoryError },
                    { count: visibleCount, error: visibleError }
                ] = await Promise.all([
                    supabase.from("productos").select("*", { count: "exact", head: true }),
                    supabase.from("marcas").select("*", { count: "exact", head: true }),
                    supabase.from("categorias").select("*", { count: "exact", head: true }),
                    supabase.from("productos").select("*", { count: "exact", head: true }).eq("visible_en_web", true)
                ]);

                if (productError) throw productError;
                if (brandError) throw brandError;
                if (categoryError) throw categoryError;
                if (visibleError) throw visibleError;

                setStats({
                    products: productCount || 0,
                    brands: brandCount || 0,
                    categories: categoryCount || 0,
                    visibleProducts: visibleCount || 0
                });
            } catch (err) {
                console.error("Error fetching admin stats:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full p-4">
            {/* Card 1 */}
            <div className="bg-neutral-50/60 border border-neutral-100 flex flex-col items-center justify-center p-6 shadow-md rounded-lg w-full text-center">
                <h2 className="text-neutral-500 font-semibold text-sm mb-1">Total de productos</h2>
                <p className="font-bold text-2xl text-neutral-900">{loading ? "..." : stats.products}</p>
            </div>

            {/* Card 2 */}
            <div className="bg-neutral-50/60 border border-neutral-100 flex flex-col items-center justify-center p-6 shadow-md rounded-lg w-full text-center">
                <h2 className="text-neutral-500 font-semibold text-sm mb-1">Total de Marcas</h2>
                <p className="font-bold text-2xl text-neutral-900">{loading ? "..." : stats.brands}</p>
            </div>

            {/* Card 3 */}
            <div className="bg-neutral-50/60 border border-neutral-100 flex flex-col items-center justify-center p-6 shadow-md rounded-lg w-full text-center">
                <h2 className="text-neutral-500 font-semibold text-sm mb-1">Total de Categorías</h2>
                <p className="font-bold text-2xl text-neutral-900">{loading ? "..." : stats.categories}</p>
            </div>

            {/* Card 4 */}
            <div className="bg-neutral-50/60 border border-neutral-100 flex flex-col items-center justify-center p-6 shadow-md rounded-lg w-full text-center">
                <h2 className="text-neutral-500 font-semibold text-sm mb-1">Productos Visibles</h2>
                <p className="font-bold text-2xl text-neutral-900">{loading ? "..." : stats.visibleProducts}</p>
            </div>
        </div>
    );
}
