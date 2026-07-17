"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import GeneralStats from "@/components/AdminPanelPage/GeneralStats";
import AdminTable from "@/components/AdminPanelPage/AdminTable";
import ProvidersTable from "@/components/AdminPanelPage/ProvidersTable";
import BrandsTable from "@/components/AdminPanelPage/BrandsTable";
import AddProductForm from "@/components/AdminPanelPage/AddProductForm";

export default function PanelAdminPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // States for suppliers and brands data
    const [providersData, setProvidersData] = useState([]);
    const [brandsData, setBrandsData] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [dataError, setDataError] = useState(null);

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

    // Fetch and aggregate brands and providers counts paginated to avoid the 1000 limit
    useEffect(() => {
        if (loading || !user) return;

        async function fetchTablesData() {
            try {
                setDataLoading(true);
                setDataError(null);

                // 1. Fetch providers and brands in parallel
                const [
                    { data: provData, error: provErr },
                    { data: brandData, error: brandErr }
                ] = await Promise.all([
                    supabase.from("proveedores").select("id, nombre_proveedor, sitio_web").order("nombre_proveedor", { ascending: true }),
                    supabase.from("marcas").select("id, nombre_marca").order("nombre_marca", { ascending: true })
                ]);

                if (provErr) throw provErr;
                if (brandErr) throw brandErr;

                // 2. Fetch all products (paginated) to count occurrences
                let allProducts = [];
                let pageNum = 0;
                const pageSize = 1000;
                let hasMore = true;

                while (hasMore) {
                    const { data, error: countErr } = await supabase
                        .from("productos")
                        .select("id_marca, id_proveedor")
                        .range(pageNum * pageSize, (pageNum + 1) * pageSize - 1);

                    if (countErr) throw countErr;

                    allProducts = [...allProducts, ...data];
                    if (data.length < pageSize) {
                        hasMore = false;
                    } else {
                        pageNum++;
                    }
                }

                // 3. Count occurrences locally
                const brandCounts = {};
                const providerCounts = {};
                allProducts.forEach((p) => {
                    if (p.id_marca != null) {
                        brandCounts[p.id_marca] = (brandCounts[p.id_marca] || 0) + 1;
                    }
                    if (p.id_proveedor != null) {
                        providerCounts[p.id_proveedor] = (providerCounts[p.id_proveedor] || 0) + 1;
                    }
                });

                // 4. Combine counts with lists
                const combinedProviders = (provData || []).map((prov) => ({
                    ...prov,
                    productCount: providerCounts[prov.id] || 0
                }));

                const combinedBrands = (brandData || []).map((brand) => ({
                    ...brand,
                    productCount: brandCounts[brand.id] || 0
                })).sort((a, b) => {
                    if (b.productCount !== a.productCount) {
                        return b.productCount - a.productCount;
                    }
                    return a.nombre_marca.localeCompare(b.nombre_marca);
                });

                setProvidersData(combinedProviders);
                setBrandsData(combinedBrands);
            } catch (err) {
                console.error("Error fetching admin tables data:", err);
                setDataError("No se pudieron cargar los datos de proveedores o marcas.");
            } finally {
                setDataLoading(false);
            }
        }

        fetchTablesData();
    }, [loading, user, refreshTrigger]);

    if (loading) {
        return (
            <div className="w-full min-h-[70vh] flex flex-col justify-center items-center gap-4 text-white">
                <div className="w-12 h-12 border-4 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <p className="text-neutral-400 font-medium">Verificando credenciales...</p>
            </div>
        );
    }

    return (
        <div className="flex-grow flex flex-col items-center p-8">
            {/*General Stats Container */}
            <div className="w-full px-4 md:px-8 flex flex-col gap-4">
                <h2 className="text-3xl font-bold">Estadísticas generales</h2>
                <div className="w-full p-2">
                    <GeneralStats key={refreshTrigger} />
                </div>
            </div>
            <AdminTable onProductUpdate={() => setRefreshTrigger((prev) => prev + 1)} />
            <div className="w-full px-4 md:px-8 mt-6">
                <AddProductForm onProductAdded={() => setRefreshTrigger((prev) => prev + 1)} />
            </div>
            <div className="w-full px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                {/* Proveedores Column */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-3xl font-bold text-left w-full">Proveedores</h2>
                    <div className="w-full flex justify-center items-center">
                        <ProvidersTable 
                            providers={providersData} 
                            loading={dataLoading} 
                            error={dataError} 
                        />
                    </div>
                </div>
                {/* Marcas Column */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-3xl font-bold text-left w-full">Marcas Disponibles</h2>
                    <div className="w-full flex justify-center items-center">
                        <BrandsTable 
                            brands={brandsData} 
                            loading={dataLoading} 
                            error={dataError} 
                        />
                    </div>
                </div>
            </div>

        </div>
    );
}
