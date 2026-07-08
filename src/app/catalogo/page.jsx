import { Suspense } from "react";
import ProductCatalog from "@/components/CatalogPage/ProductCatalog";

export default function Catalogo() {
    return (
        <div className="w-full min-h-[calc(100vh-6rem)] flex flex-col items-center bg-neutral-50/30">
            <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 flex flex-col gap-6">
                {/* Title Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
                            Catálogo de Refacciones
                        </h1>
                        <p className="mt-2 text-neutral-500 text-sm sm:text-base">
                            Encuentra y cotiza las autopartes que necesitas para tu vehículo.
                        </p>
                    </div>
                </div>
                <Suspense fallback={
                    <div className="w-full flex flex-col gap-6 animate-pulse pb-10">
                        <div className="h-32 bg-neutral-200/60 rounded-2xl w-full" />
                        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden w-full h-96" />
                    </div>
                }>
                    <ProductCatalog />
                </Suspense>
            </div>
        </div>
    );
}