"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { FaExternalLinkAlt } from "react-icons/fa";

export default function ProvidersTable() {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchProvidersData() {
            try {
                setLoading(true);
                
                // 1. Fetch all providers
                const { data: provData, error: provError } = await supabase
                    .from("proveedores")
                    .select("id, nombre_proveedor, sitio_web")
                    .order("nombre_proveedor", { ascending: true });

                if (provError) throw provError;

                // 2. Fetch all products to count occurrences of each supplier locally (failsafe & fast)
                const { data: countData, error: countError } = await supabase
                    .from("productos")
                    .select("id_proveedor");

                if (countError) throw countError;

                // Count items per provider id
                const countsMap = {};
                (countData || []).forEach((p) => {
                    const id = p.id_proveedor;
                    if (id != null) {
                        countsMap[id] = (countsMap[id] || 0) + 1;
                    }
                });

                // Merge counts with providers
                const combined = (provData || []).map((prov) => ({
                    ...prov,
                    productCount: countsMap[prov.id] || 0
                }));

                setProviders(combined);
            } catch (err) {
                console.error("Error loading providers table:", err);
                setError("No se pudieron cargar los datos de los proveedores.");
            } finally {
                setLoading(false);
            }
        }

        fetchProvidersData();
    }, []);

    if (loading) {
        return (
            <div className="w-full bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-t-black border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <p className="text-neutral-500 font-medium text-sm">Cargando proveedores...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center">
                <p className="font-bold">{error}</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col mt-2">
            <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="bg-black border-b border-neutral-200 text-white uppercase tracking-wider text-xs font-semibold text-center">
                            <th className="px-6 py-4 w-20">ID</th>
                            <th className="px-6 py-4 text-left">Nombre de Proveedor</th>
                            <th className="px-6 py-4 text-left">Sitio Web</th>
                            <th className="px-6 py-4 w-40">No. Productos</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 text-neutral-700 text-sm text-center">
                        {providers.map((prov) => (
                            <tr key={prov.id} className="hover:bg-neutral-50/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-neutral-400 font-bold">{prov.id}</td>
                                <td className="px-6 py-4 text-left font-semibold text-neutral-900">
                                    {prov.nombre_proveedor}
                                </td>
                                <td className="px-6 py-4 text-left">
                                    {prov.sitio_web ? (
                                        <a
                                            href={prov.sitio_web}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline font-medium transition"
                                        >
                                            <span className="truncate max-w-[350px]">{prov.sitio_web}</span>
                                            <FaExternalLinkAlt size={11} className="shrink-0" />
                                        </a>
                                    ) : (
                                        <span className="text-neutral-400 font-medium">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 font-bold text-xs border border-neutral-200 shadow-sm">
                                        {prov.productCount}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
