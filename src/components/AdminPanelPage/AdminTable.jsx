"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/utils/supabase";

export default function AdminTable({ onProductUpdate }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editPrecio, setEditPrecio] = useState("");
    const [editVisibleEnWeb, setEditVisibleEnWeb] = useState(false);
    const [saving, setSaving] = useState(false);
    const [modalError, setModalError] = useState("");

    useEffect(() => {
        async function fetchAllProducts() {
            try {
                setLoading(true);
                let allData = [];
                let pageNum = 0;
                const pageSize = 1000;
                let hasMore = true;

                while (hasMore) {
                    const { data, error: fetchError } = await supabase
                        .from("productos")
                        .select(`
                            id,
                            codigo_proveedor,
                            codigo_original,
                            descripcion,
                            modelo,
                            anio_inicio,
                            anio_final,
                            precio,
                            precio_proveedor,
                            imagen,
                            id_marca,
                            id_categoria,
                            id_proveedor,
                            visible_en_web,
                            creado_en,
                            actualizado_en,
                            marcas (nombre_marca),
                            categorias (nombre_categoria),
                            proveedores (nombre_proveedor)
                        `)
                        .range(pageNum * pageSize, (pageNum + 1) * pageSize - 1);

                    if (fetchError) throw fetchError;

                    allData = [...allData, ...(data || [])];

                    if (!data || data.length < pageSize) {
                        hasMore = false;
                    } else {
                        pageNum++;
                    }
                }

                setProducts(allData);
            } catch (err) {
                console.error("Error loading products for admin table:", err);
                setError("No se pudieron cargar los datos de los productos.");
            } finally {
                setLoading(false);
            }
        }

        fetchAllProducts();
    }, []);

    // Filter logic
    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return products;
        
        const query = searchQuery.toLowerCase().trim();
        return products.filter((product) => {
            const codeOrig = (product.codigo_original || "").toLowerCase();
            const codeProv = (product.codigo_proveedor || "").toLowerCase();
            const desc = (product.descripcion || "").toLowerCase();
            const model = (product.modelo || "").toLowerCase();
            const brand = (product.marcas?.nombre_marca || "").toLowerCase();
            const cat = (product.categorias?.nombre_categoria || "").toLowerCase();
            const prov = (product.proveedores?.nombre_proveedor || "").toLowerCase();

            return (
                codeOrig.includes(query) ||
                codeProv.includes(query) ||
                desc.includes(query) ||
                model.includes(query) ||
                brand.includes(query) ||
                cat.includes(query) ||
                prov.includes(query)
            );
        });
    }, [products, searchQuery]);

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredProducts, currentPage]);

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    // Modal handlers
    const handleRowClick = (product) => {
        setSelectedProduct(product);
        setEditPrecio(product.precio != null ? product.precio.toString() : "");
        setEditVisibleEnWeb(!!product.visible_en_web);
        setModalError("");
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setModalError("");
        try {
            const parsedPrice = editPrecio.trim() === "" ? null : parseFloat(editPrecio);
            if (parsedPrice !== null && isNaN(parsedPrice)) {
                throw new Error("El precio debe ser un número válido.");
            }

            const { error: updateError } = await supabase
                .from("productos")
                .update({
                    precio: parsedPrice,
                    visible_en_web: editVisibleEnWeb
                })
                .eq("id", selectedProduct.id);

            if (updateError) throw updateError;

            // Update locally in the list
            setProducts((prevProducts) =>
                prevProducts.map((p) =>
                    p.id === selectedProduct.id
                        ? { 
                            ...p, 
                            precio: parsedPrice, 
                            visible_en_web: editVisibleEnWeb,
                            actualizado_en: new Date().toISOString()
                          }
                        : p
                )
            );

            // Refetch or update stats
            if (onProductUpdate) {
                onProductUpdate();
            }

            setIsModalOpen(false);
            setSelectedProduct(null);
        } catch (err) {
            console.error("Error updating product:", err);
            setModalError(err.message || "Ocurrió un error al guardar los cambios.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm flex flex-col items-center justify-center gap-3 mt-8">
                <div className="w-10 h-10 border-4 border-t-black border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <p className="text-neutral-500 font-medium text-sm">Cargando base de datos completa de productos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center mt-8">
                <p className="font-bold">{error}</p>
            </div>
        );
    }

    return (
        <div className="w-full mt-8 px-4 md:px-8">
            <div className="w-full bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">

                {/* Table wrapper */}
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                            <tr className="bg-black border-b border-neutral-200 text-white uppercase tracking-wider text-xs font-semibold text-center">
                                <th className="px-4 py-4.5">ID</th>
                                <th className="px-4 py-4.5">Código Orig.</th>
                                <th className="px-4 py-4.5">Código Prov.</th>
                                <th className="px-4 py-4.5">Descripción</th>
                                <th className="px-4 py-4.5">Modelo</th>
                                <th className="px-4 py-4.5">Años (Inicio-Fin)</th>
                                <th className="px-4 py-4.5">Precio ($)</th>
                                <th className="px-4 py-4.5">Precio Prov. ($)</th>
                                <th className="px-4 py-4.5">Marca</th>
                                <th className="px-4 py-4.5">Categoría</th>
                                <th className="px-4 py-4.5">Proveedor</th>
                                <th className="px-4 py-4.5">Visibilidad</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 text-neutral-700 text-xs text-center">
                            {paginatedProducts.length > 0 ? (
                                paginatedProducts.map((product) => (
                                    <tr 
                                        key={product.id} 
                                        onClick={() => handleRowClick(product)}
                                        className="hover:bg-neutral-50/50 transition-colors cursor-pointer"
                                        title="Haz clic para ver todos los campos y editar"
                                    >
                                        <td className="px-4 py-4 font-mono text-neutral-400">{product.id}</td>
                                        <td className="px-4 py-4 font-mono font-bold text-neutral-900">
                                            {product.codigo_original || "-"}
                                        </td>
                                        <td className="px-4 py-4 font-mono text-neutral-500">
                                            {product.codigo_proveedor || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-left max-w-[200px] truncate font-medium text-neutral-800" title={product.descripcion}>
                                            {product.descripcion || "-"}
                                        </td>
                                        <td className="px-4 py-4 font-semibold text-neutral-900">{product.modelo || "-"}</td>
                                        <td className="px-4 py-4">
                                            {product.anio_inicio && product.anio_final
                                                ? `${product.anio_inicio} - ${product.anio_final}`
                                                : `${product.anio_inicio || "-"} / ${product.anio_final || "-"}`
                                            }
                                        </td>
                                        <td className="px-4 py-4 font-bold text-neutral-900">
                                            {product.precio != null ? `$${product.precio.toFixed(2)}` : "-"}
                                        </td>
                                        <td className="px-4 py-4 text-neutral-500 font-medium">
                                            {product.precio_proveedor != null ? `$${product.precio_proveedor.toFixed(2)}` : "-"}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="inline-block px-2 py-1 rounded bg-neutral-100 text-neutral-700 border border-neutral-200 text-[10px] font-bold">
                                                {product.marcas?.nombre_marca || `ID: ${product.id_marca}`}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="inline-block px-2 py-1 rounded bg-neutral-900 text-white text-[10px] font-bold">
                                                {product.categorias?.nombre_categoria || `ID: ${product.id_categoria}`}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 font-medium text-neutral-800">
                                            {product.proveedores?.nombre_proveedor || `ID: ${product.id_proveedor}`}
                                        </td>
                                        <td className="px-4 py-4">
                                            {product.visible_en_web ? (
                                                <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                                                    Sí
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-red-100 text-red-700 text-[10px] font-bold border border-red-200">
                                                    No
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="12" className="px-4 py-8 text-neutral-500 text-center font-medium">
                                        No se encontraron autopartes.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-neutral-200 px-6 py-4 bg-neutral-50/30 gap-4">
                    <p className="text-xs text-neutral-500">
                        Mostrando del <span className="font-semibold">{filteredProducts.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0}</span> al{" "}
                        <span className="font-semibold">
                            {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
                        </span>{" "}
                        de <span className="font-semibold">{filteredProducts.length}</span> registros
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-semibold hover:bg-neutral-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 transition duration-150 bg-white"
                        >
                            Anterior
                        </button>
                        <span className="text-xs text-neutral-600 font-semibold px-2">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-semibold hover:bg-neutral-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 transition duration-150 bg-white"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>

            </div>

            {/* Modal Overlay */}
            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 border border-neutral-200">
                        {/* Modal Header */}
                        <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
                            <h4 className="text-lg font-bold">Detalle y Edición de Producto</h4>
                            <button 
                                type="button"
                                onClick={handleCancel} 
                                className="text-white/60 hover:text-white transition cursor-pointer text-2xl font-bold p-1 focus:outline-none"
                            >
                                &times;
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <form onSubmit={handleSave} className="p-6 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
                            {modalError && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg text-sm">
                                    {modalError}
                                </div>
                            )}
                            
                            {/* Columns Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Read-only fields */}
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">ID</span>
                                    <input type="text" readOnly value={selectedProduct.id} className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-500 focus:outline-none cursor-not-allowed" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Código Original</span>
                                    <input type="text" readOnly value={selectedProduct.codigo_original || "-"} className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-500 focus:outline-none cursor-not-allowed" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Código Proveedor</span>
                                    <input type="text" readOnly value={selectedProduct.codigo_proveedor || "-"} className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-500 focus:outline-none cursor-not-allowed" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Modelo</span>
                                    <input type="text" readOnly value={selectedProduct.modelo || "-"} className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-500 focus:outline-none cursor-not-allowed" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Año Inicio</span>
                                    <input type="text" readOnly value={selectedProduct.anio_inicio || "-"} className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-500 focus:outline-none cursor-not-allowed" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Año Fin</span>
                                    <input type="text" readOnly value={selectedProduct.anio_final || "-"} className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-500 focus:outline-none cursor-not-allowed" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Marca</span>
                                    <input type="text" readOnly value={selectedProduct.marcas?.nombre_marca || `ID: ${selectedProduct.id_marca}`} className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-500 focus:outline-none cursor-not-allowed" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Categoría</span>
                                    <input type="text" readOnly value={selectedProduct.categorias?.nombre_categoria || `ID: ${selectedProduct.id_categoria}`} className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-500 focus:outline-none cursor-not-allowed" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Proveedor</span>
                                    <input type="text" readOnly value={selectedProduct.proveedores?.nombre_proveedor || `ID: ${selectedProduct.id_proveedor}`} className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-500 focus:outline-none cursor-not-allowed" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Precio Proveedor ($)</span>
                                    <input type="text" readOnly value={selectedProduct.precio_proveedor != null ? `$${selectedProduct.precio_proveedor.toFixed(2)}` : "-"} className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-500 focus:outline-none cursor-not-allowed" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Creado En</span>
                                    <input type="text" readOnly value={selectedProduct.creado_en ? new Date(selectedProduct.creado_en).toLocaleString() : "-"} className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-500 focus:outline-none cursor-not-allowed" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Actualizado En</span>
                                    <input type="text" readOnly value={selectedProduct.actualizado_en ? new Date(selectedProduct.actualizado_en).toLocaleString() : "-"} className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-500 focus:outline-none cursor-not-allowed" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Imagen (Ruta)</span>
                                    <input type="text" readOnly value={selectedProduct.imagen || "-"} className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-500 focus:outline-none cursor-not-allowed" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">ID Proveedor</span>
                                    <input type="text" readOnly value={selectedProduct.id_proveedor || "-"} className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-500 focus:outline-none cursor-not-allowed" />
                                </div>
                                <div className="md:col-span-2 flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Descripción</span>
                                    <textarea readOnly rows={2} value={selectedProduct.descripcion || "-"} className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-500 focus:outline-none resize-none cursor-not-allowed" />
                                </div>
                                
                                {/* Editable Fields */}
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-black uppercase tracking-wide">Precio Público ($) *</span>
                                    <input 
                                        type="text" 
                                        required
                                        value={editPrecio}
                                        onChange={(e) => setEditPrecio(e.target.value)}
                                        className="border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                                    />
                                </div>
                                
                                <div className="flex flex-col justify-end pb-1.5 pl-1">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-neutral-800">
                                        <input 
                                            type="checkbox"
                                            checked={editVisibleEnWeb}
                                            onChange={(e) => setEditVisibleEnWeb(e.target.checked)}
                                            className="w-4.5 h-4.5 rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                                        />
                                        <span>Visible en la Web (Visibilidad)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex justify-end gap-3 border-t border-neutral-100 pt-4 mt-2">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="px-4 py-2 border border-neutral-300 rounded-xl text-sm font-semibold hover:bg-neutral-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition duration-150 cursor-pointer bg-white"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-sm font-semibold active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 cursor-pointer flex items-center gap-2"
                                >
                                    {saving ? "Guardando..." : "Guardar Cambios"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}