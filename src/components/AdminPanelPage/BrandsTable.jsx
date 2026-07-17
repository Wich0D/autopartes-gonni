"use client";

export default function BrandsTable({ brands, loading, error }) {
    if (loading) {
        return (
            <div className="w-full bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-t-black border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <p className="text-neutral-500 font-medium text-sm">Cargando marcas...</p>
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
            <div className="overflow-y-auto w-full max-h-[310px] relative scrollbar-thin scrollbar-thumb-neutral-200">
                <table className="w-full text-left border-collapse min-w-[300px]">
                    <thead className="sticky top-0 text-white uppercase tracking-wider text-xs font-semibold text-center z-10">
                        <tr className="bg-black">
                            <th className="px-6 py-4 w-20 bg-black sticky top-0">ID</th>
                            <th className="px-6 py-4 text-left bg-black sticky top-0">Nombre de Marca</th>
                            <th className="px-6 py-4 w-40 bg-black sticky top-0">No. Productos</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 text-neutral-700 text-sm text-center">
                        {brands.map((brand) => (
                            <tr key={brand.id} className="hover:bg-neutral-50/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-neutral-400 font-bold">{brand.id}</td>
                                <td className="px-6 py-4 text-left font-semibold text-neutral-900">
                                    {brand.nombre_marca}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 font-bold text-xs border border-neutral-200 shadow-sm">
                                        {brand.productCount}
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
