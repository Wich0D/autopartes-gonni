"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/utils/supabase";
import { FaSearch, FaUndo, FaChevronDown } from "react-icons/fa";
import SearchableSelect from "@/components/CatalogPage/SearchableSelect";

export default function AdminTable({ onProductUpdate }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter states
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedProvider, setSelectedProvider] = useState("");
    const [selectedVisibility, setSelectedVisibility] = useState("");
    const [selectedImageStatus, setSelectedImageStatus] = useState("");
    const [enableYearRange, setEnableYearRange] = useState(false);
    const [minYear, setMinYear] = useState(1990);
    const [maxYear, setMaxYear] = useState(2026);
    const [minLimitYear, setMinLimitYear] = useState(1990);
    const [maxLimitYear, setMaxLimitYear] = useState(2026);

    // Column visibility states
    const [visibleColumns, setVisibleColumns] = useState({
        id: true,
        codigo_original: true,
        codigo_proveedor: true,
        descripcion: true,
        modelo: true,
        anios: true,
        precio: true,
        precio_proveedor: true,
        marca: true,
        categoria: true,
        imagen: true,
        proveedor: true,
        visibilidad: true
    });
    const [isColDropdownOpen, setIsColDropdownOpen] = useState(false);
    const colDropdownRef = useRef(null);

    // Labels for display
    const columnLabels = {
        id: "ID",
        codigo_original: "Código Orig.",
        codigo_proveedor: "Código Prov.",
        descripcion: "Descripción",
        modelo: "Modelo",
        anios: "Años (Inicio-Fin)",
        precio: "Precio ($)",
        precio_proveedor: "Precio Prov. ($)",
        marca: "Marca",
        categoria: "Categoría",
        imagen: "Imagen",
        proveedor: "Proveedor",
        visibilidad: "Visibilidad"
    };

    const allSelectableColumns = [
        "codigo_proveedor",
        "descripcion",
        "modelo",
        "anios",
        "precio",
        "precio_proveedor",
        "marca",
        "categoria",
        "imagen",
        "proveedor",
        "visibilidad"
    ];

    const isAllSelected = allSelectableColumns.every(col => visibleColumns[col]);

    const toggleColumn = (colKey) => {
        if (colKey === "id" || colKey === "codigo_original") return;
        setVisibleColumns(prev => ({
            ...prev,
            [colKey]: !prev[colKey]
        }));
    };

    const toggleSelectAll = () => {
        const newValue = !isAllSelected;
        setVisibleColumns(prev => {
            const updated = { ...prev };
            allSelectableColumns.forEach(col => {
                updated[col] = newValue;
            });
            return updated;
        });
    };

    // Close column dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (colDropdownRef.current && !colDropdownRef.current.contains(event.target)) {
                setIsColDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Modal state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editPrecio, setEditPrecio] = useState("");
    const [editVisibleEnWeb, setEditVisibleEnWeb] = useState(false);
    const [editAplicarIva, setEditAplicarIva] = useState(false);
    const [saving, setSaving] = useState(false);
    const [modalError, setModalError] = useState("");

    // Drag and Drop states
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    // Deletion states
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletePasswordInput, setDeletePasswordInput] = useState("");
    const [deleteError, setDeleteError] = useState("");

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

                // Calculate dynamic year limits based on loaded products
                const startYears = allData.map((p) => p.anio_inicio).filter((y) => typeof y === "number" && y > 0);
                const endYears = allData.map((p) => p.anio_final).filter((y) => typeof y === "number" && y > 0);
                const calculatedMin = startYears.length > 0 ? Math.min(...startYears) : 1990;
                const calculatedMax = endYears.length > 0 ? Math.max(...endYears) : 2026;

                setMinLimitYear(calculatedMin);
                setMaxLimitYear(calculatedMax);
                setMinYear(calculatedMin);
                setMaxYear(calculatedMax);
            } catch (err) {
                console.error("Error loading products for admin table:", err);
                setError("No se pudieron cargar los datos de los productos.");
            } finally {
                setLoading(false);
            }
        }

        fetchAllProducts();
    }, []);

    // Unique lists of options from fetched products
    const brands = useMemo(() => {
        const list = products.map((p) => p.marcas?.nombre_marca).filter(Boolean);
        return Array.from(new Set(list)).sort();
    }, [products]);

    const categories = useMemo(() => {
        const list = products.map((p) => p.categorias?.nombre_categoria).filter(Boolean);
        return Array.from(new Set(list)).sort();
    }, [products]);

    const providers = useMemo(() => {
        const list = products.map((p) => p.proveedores?.nombre_proveedor).filter(Boolean);
        return Array.from(new Set(list)).sort();
    }, [products]);

    // Filter logic
    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            // Search query filter
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch = query === "" || (
                (product.codigo_original || "").toLowerCase().includes(query) ||
                (product.codigo_proveedor || "").toLowerCase().includes(query) ||
                (product.descripcion || "").toLowerCase().includes(query) ||
                (product.modelo || "").toLowerCase().includes(query) ||
                (product.marcas?.nombre_marca || "").toLowerCase().includes(query) ||
                (product.categorias?.nombre_categoria || "").toLowerCase().includes(query) ||
                (product.proveedores?.nombre_proveedor || "").toLowerCase().includes(query)
            );

            // Brand filter
            const matchesBrand = selectedBrand === "" || product.marcas?.nombre_marca === selectedBrand;

            // Category filter
            const matchesCategory = selectedCategory === "" || product.categorias?.nombre_categoria === selectedCategory;

            // Provider filter
            const matchesProvider = selectedProvider === "" || product.proveedores?.nombre_proveedor === selectedProvider;

            // Year range filter
            const matchesYear = !enableYearRange || (
                (product.anio_inicio || 1990) <= maxYear &&
                (product.anio_final || 2026) >= minYear
            );

            // Visibility filter
            let matchesVisibility = true;
            if (selectedVisibility === "visible") {
                matchesVisibility = product.visible_en_web === true;
            } else if (selectedVisibility === "oculto") {
                matchesVisibility = product.visible_en_web === false;
            }

            // Image status filter
            let matchesImageStatus = true;
            if (selectedImageStatus === "con_imagen") {
                matchesImageStatus = !!product.imagen;
            } else if (selectedImageStatus === "sin_imagen") {
                matchesImageStatus = !product.imagen;
            }

            return matchesSearch && matchesBrand && matchesCategory && matchesProvider && matchesYear && matchesVisibility && matchesImageStatus;
        });
    }, [products, searchQuery, selectedBrand, selectedCategory, selectedProvider, enableYearRange, minYear, maxYear, selectedVisibility, selectedImageStatus]);

    // Reset all filters
    const resetFilters = () => {
        setSearchQuery("");
        setSelectedBrand("");
        setSelectedCategory("");
        setSelectedProvider("");
        setSelectedVisibility("");
        setSelectedImageStatus("");
        setEnableYearRange(false);
        setMinYear(minLimitYear);
        setMaxYear(maxLimitYear);
        setCurrentPage(1);
    };

    // Range percentages for custom dual slider styling
    const rangeSpan = maxLimitYear - minLimitYear;
    const leftPercent = rangeSpan > 0 ? ((minYear - minLimitYear) / rangeSpan) * 100 : 0;
    const rightPercent = rangeSpan > 0 ? 100 - (((maxYear - minLimitYear) / rangeSpan) * 100) : 0;
    const midYearThreshold = minLimitYear + (rangeSpan / 2);

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

    // Drag handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file) => {
        if (!file.type.startsWith("image/")) {
            alert("Por favor, selecciona un archivo de imagen válido (JPEG, PNG, WEBP).");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert("El archivo de imagen excede el límite de 5MB.");
            return;
        }
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeFile = () => {
        setSelectedFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Modal handlers
    const calculatePublicPrice = (provPrice, useIva) => {
        const parsed = parseFloat(provPrice);
        if (!isNaN(parsed) && parsed > 0) {
            const basePrice = useIva ? parsed * 1.16 : parsed;
            return (basePrice * 1.90).toFixed(2);
        }
        return "";
    };

    const handleEditAplicarIvaChange = (checked) => {
        setEditAplicarIva(checked);
        if (selectedProduct && selectedProduct.precio_proveedor != null) {
            setEditPrecio(calculatePublicPrice(selectedProduct.precio_proveedor, checked));
        }
    };

    const handleRowClick = (product) => {
        setSelectedProduct(product);
        setEditPrecio(product.precio != null ? product.precio.toString() : "");
        setEditVisibleEnWeb(!!product.visible_en_web);
        setEditAplicarIva(false);
        setModalError("");
        setSelectedFile(null);
        setImagePreview(null);
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
        setIsDeleting(false);
        setDeletePasswordInput("");
        setDeleteError("");
        setSelectedFile(null);
        setImagePreview(null);
        setEditAplicarIva(false);
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

            let imageUrl = selectedProduct.imagen;

            // 1. Upload image to Supabase Storage if selected
            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
                const filePath = `products/${fileName}`;

                const { data: uploadData, error: uploadError } = await supabase
                    .storage
                    .from("productos")
                    .upload(filePath, selectedFile);

                if (uploadError) {
                    console.error("Storage upload error:", uploadError);
                    throw new Error(
                        `Error al subir la imagen: ${uploadError.message}. \n` +
                        `Asegúrate de haber creado el bucket 'productos' en Supabase y que sus políticas RLS permitan subidas públicas.`
                    );
                }

                // Get public URL of the uploaded image
                const { data: { publicUrl } } = supabase
                    .storage
                    .from("productos")
                    .getPublicUrl(filePath);

                // If upload succeeded and product had an old image, delete the old image from Supabase Storage
                if (selectedProduct.imagen) {
                    try {
                        const marker = "/public/productos/";
                        const index = selectedProduct.imagen.indexOf(marker);
                        if (index !== -1) {
                            const storagePath = selectedProduct.imagen.substring(index + marker.length);
                            await supabase
                                .storage
                                .from("productos")
                                .remove([storagePath]);
                        }
                    } catch (storageErr) {
                        console.warn("Could not delete old image asset from storage:", storageErr);
                    }
                }

                imageUrl = publicUrl;
            }

            // 2. Update DB record
            const { error: updateError } = await supabase
                .from("productos")
                .update({
                    precio: parsedPrice,
                    visible_en_web: editVisibleEnWeb,
                    imagen: imageUrl
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
                            imagen: imageUrl,
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
            setSelectedFile(null);
            setImagePreview(null);
        } catch (err) {
            console.error("Error updating product:", err);
            setModalError(err.message || "Ocurrió un error al guardar los cambios.");
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        setDeleteError("");
        const expectedPwd = process.env.NEXT_PUBLIC_DELETE_PWD || process.env.DELETE_PWD;

        if (!expectedPwd) {
            setDeleteError("El código de eliminación (DELETE_PWD) no está configurado en el archivo .env.");
            return;
        }

        if (deletePasswordInput !== expectedPwd) {
            setDeleteError("Código de eliminación incorrecto.");
            return;
        }

        try {
            setSaving(true);

            // 1. Delete product row from Database
            const { error: delError } = await supabase
                .from("productos")
                .delete()
                .eq("id", selectedProduct.id);

            if (delError) throw delError;

            // 2. If deletion succeeded and the product has an image, delete the image from Supabase Storage
            if (selectedProduct.imagen) {
                try {
                    const marker = "/public/productos/";
                    const index = selectedProduct.imagen.indexOf(marker);
                    if (index !== -1) {
                        const storagePath = selectedProduct.imagen.substring(index + marker.length);
                        await supabase
                            .storage
                            .from("productos")
                            .remove([storagePath]);
                    }
                } catch (storageErr) {
                    console.warn("Could not delete image asset from storage:", storageErr);
                }
            }

            // Remove locally from the list
            setProducts((prevProducts) => prevProducts.filter((p) => p.id !== selectedProduct.id));

            // Refetch or update stats
            if (onProductUpdate) {
                onProductUpdate();
            }

            // Close and reset
            setIsModalOpen(false);
            setSelectedProduct(null);
            setIsDeleting(false);
            setDeletePasswordInput("");
        } catch (err) {
            console.error("Error deleting product:", err);
            setDeleteError(err.message || "Ocurrió un error al intentar eliminar el producto.");
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
        <div className="w-full mt-8 px-4 md:px-8 flex flex-col gap-6">

            {/* Admin Table Filters */}
            <div className="flex flex-col gap-4 bg-white border border-neutral-200 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between gap-4">
                    <h3 className="font-bold text-neutral-800 text-sm">Filtros de Búsqueda</h3>
                    <div className="flex items-center gap-4 relative">
                        {/* Column visibility dropdown */}
                        <div ref={colDropdownRef} className="relative z-30">
                            <button
                                type="button"
                                onClick={() => setIsColDropdownOpen(!isColDropdownOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 border border-neutral-300 rounded-xl text-xs font-semibold hover:bg-neutral-50 active:scale-95 transition duration-150 bg-white shadow-sm cursor-pointer"
                            >
                                <span>Mostrar Columnas</span>
                                <svg
                                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isColDropdownOpen ? "rotate-180" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isColDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white border border-neutral-200 rounded-xl shadow-lg p-3 flex flex-col gap-2 select-none">
                                    {/* Select All */}
                                    <label className="flex items-center gap-2 pb-2 border-b border-neutral-100 cursor-pointer font-bold text-xs text-neutral-800">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black cursor-pointer accent-black"
                                        />
                                        <span>Seleccionar Todos</span>
                                    </label>

                                    {/* List of Columns */}
                                    <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto scrollbar-thin">
                                        {Object.keys(columnLabels).map((colKey) => {
                                            const isMandatory = colKey === "id" || colKey === "codigo_original";
                                            return (
                                                <label
                                                    key={colKey}
                                                    className={`flex items-center gap-2 text-xs cursor-pointer py-0.5 text-neutral-700 ${isMandatory ? "opacity-60 cursor-not-allowed font-medium" : "hover:text-neutral-900"
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={visibleColumns[colKey]}
                                                        disabled={isMandatory}
                                                        onChange={() => toggleColumn(colKey)}
                                                        className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black cursor-pointer disabled:cursor-not-allowed accent-black"
                                                    />
                                                    <span>
                                                        {columnLabels[colKey]} {isMandatory && <span className="text-[10px] text-neutral-400 font-normal">(Requerido)</span>}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {(searchQuery || selectedBrand || selectedCategory || selectedProvider || enableYearRange) && (
                            <button
                                onClick={resetFilters}
                                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer transition"
                            >
                                <FaUndo size={10} />
                                Limpiar Filtros
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid for Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">

                    {/* Search Input */}
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Buscar por código, modelo, descripción..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white shadow-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition text-sm text-neutral-800"
                        />
                    </div>

                    {/* Brand Select */}
                    <div>
                        <SearchableSelect
                            value={selectedBrand}
                            onChange={(val) => {
                                setSelectedBrand(val);
                                setCurrentPage(1);
                            }}
                            options={brands}
                            placeholder="Todas las marcas"
                            emptyMessage="No se encontraron marcas"
                        />
                    </div>

                    {/* Category Select */}
                    <div>
                        <SearchableSelect
                            value={selectedCategory}
                            onChange={(val) => {
                                setSelectedCategory(val);
                                setCurrentPage(1);
                            }}
                            options={categories}
                            placeholder="Todas las categorías"
                            emptyMessage="No se encontraron categorías"
                        />
                    </div>

                    {/* Provider Select */}
                    <div>
                        <SearchableSelect
                            value={selectedProvider}
                            onChange={(val) => {
                                setSelectedProvider(val);
                                setCurrentPage(1);
                            }}
                            options={providers}
                            placeholder="Todos los proveedores"
                            emptyMessage="No se encontraron proveedores"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-1/2">
                    {/* Visibility Select */}
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-1 select-none">Visibilidad</span>
                        <div className="relative">
                            <select
                                value={selectedVisibility}
                                onChange={(e) => {
                                    setSelectedVisibility(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-neutral-200 bg-white shadow-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition text-sm text-neutral-800 appearance-none cursor-pointer font-medium"
                            >
                                <option value="">Todos</option>
                                <option value="visible">Visibles en web</option>
                                <option value="oculto">No visibles en web</option>
                            </select>
                            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={12} />
                        </div>
                    </div>

                    {/* Image Status Select */}
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-1 select-none">Imagen</span>
                        <div className="relative">
                            <select
                                value={selectedImageStatus}
                                onChange={(e) => {
                                    setSelectedImageStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-neutral-200 bg-white shadow-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition text-sm text-neutral-800 appearance-none cursor-pointer font-medium"
                            >
                                <option value="">Todos</option>
                                <option value="con_imagen">Con imagen</option>
                                <option value="sin_imagen">Sin imagen</option>
                            </select>
                            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={12} />
                        </div>
                    </div>
                </div>

                {/* Year Range Slider Row */}
                <div className="border-t border-neutral-100 pt-3 flex flex-col md:flex-row md:items-center gap-6 w-full">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-neutral-700 select-none shrink-0">
                        <input
                            type="checkbox"
                            checked={enableYearRange}
                            onChange={(e) => {
                                setEnableYearRange(e.target.checked);
                                setCurrentPage(1);
                            }}
                            className="w-4.5 h-4.5 text-black border-neutral-300 rounded focus:ring-black cursor-pointer accent-black"
                        />
                        <span>Filtrar por rango de años</span>
                    </label>

                    {enableYearRange && (
                        <div className="flex-1 flex items-center w-full select-none">
                            <span className="text-black/95 text-xs font-black rounded-xl shrink-0 min-w-[50px] text-center">
                                {minYear}
                            </span>

                            <div className="relative flex-1 flex items-center h-6 mx-2">
                                <div className="absolute left-0 right-0 h-1 bg-neutral-200 rounded-full" />
                                <div
                                    className="absolute h-1 bg-black rounded-full"
                                    style={{
                                        left: `${leftPercent}%`,
                                        right: `${rightPercent}%`
                                    }}
                                />
                                <input
                                    type="range"
                                    min={minLimitYear}
                                    max={maxLimitYear}
                                    value={minYear}
                                    onChange={(e) => {
                                        const val = Math.min(parseInt(e.target.value), maxYear);
                                        setMinYear(val);
                                        setCurrentPage(1);
                                    }}
                                    className="absolute pointer-events-none appearance-none w-full bg-transparent h-1 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:pointer-events-auto cursor-pointer"
                                    style={{ zIndex: minYear > midYearThreshold ? 12 : 11 }}
                                />
                                <input
                                    type="range"
                                    min={minLimitYear}
                                    max={maxLimitYear}
                                    value={maxYear}
                                    onChange={(e) => {
                                        const val = Math.max(parseInt(e.target.value), minYear);
                                        setMaxYear(val);
                                        setCurrentPage(1);
                                    }}
                                    className="absolute pointer-events-none appearance-none w-full bg-transparent h-1 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:pointer-events-auto cursor-pointer"
                                    style={{ zIndex: 10 }}
                                />
                            </div>

                            <span className="text-black/95 text-xs font-black rounded-xl shrink-0 min-w-[50px] text-center">
                                {maxYear}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">

                {/* Table wrapper */}
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                            <tr className="bg-black border-b border-neutral-200 text-white uppercase tracking-wider text-xs font-semibold text-center">
                                {visibleColumns.id && <th className="px-4 py-4.5">ID</th>}
                                {visibleColumns.codigo_original && <th className="px-4 py-4.5">Código Orig.</th>}
                                {visibleColumns.codigo_proveedor && <th className="px-4 py-4.5">Código Prov.</th>}
                                {visibleColumns.descripcion && <th className="px-4 py-4.5">Descripción</th>}
                                {visibleColumns.modelo && <th className="px-4 py-4.5">Modelo</th>}
                                {visibleColumns.anios && <th className="px-4 py-4.5">Años (Inicio-Fin)</th>}
                                {visibleColumns.precio && <th className="px-4 py-4.5">Precio ($)</th>}
                                {visibleColumns.precio_proveedor && <th className="px-4 py-4.5">Precio Prov. ($)</th>}
                                {visibleColumns.marca && <th className="px-4 py-4.5">Marca</th>}
                                {visibleColumns.categoria && <th className="px-4 py-4.5">Categoría</th>}
                                {visibleColumns.imagen && <th className="px-4 py-4.5">Imagen</th>}
                                {visibleColumns.proveedor && <th className="px-4 py-4.5">Proveedor</th>}
                                {visibleColumns.visibilidad && <th className="px-4 py-4.5">Visibilidad</th>}
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
                                        {visibleColumns.id && (
                                            <td className="px-4 py-4 font-mono text-neutral-400">{product.id}</td>
                                        )}
                                        {visibleColumns.codigo_original && (
                                            <td className="px-4 py-4 font-mono font-bold text-neutral-900">
                                                {product.codigo_original || "-"}
                                            </td>
                                        )}
                                        {visibleColumns.codigo_proveedor && (
                                            <td className="px-4 py-4 font-mono text-neutral-500">
                                                {product.codigo_proveedor || "-"}
                                            </td>
                                        )}
                                        {visibleColumns.descripcion && (
                                            <td className="px-4 py-4 text-left max-w-[200px] truncate font-medium text-neutral-800" title={product.descripcion}>
                                                {product.descripcion || "-"}
                                            </td>
                                        )}
                                        {visibleColumns.modelo && (
                                            <td className="px-4 py-4 font-semibold text-neutral-900">{product.modelo || "-"}</td>
                                        )}
                                        {visibleColumns.anios && (
                                            <td className="px-4 py-4">
                                                {product.anio_inicio && product.anio_final
                                                    ? `${product.anio_inicio} - ${product.anio_final}`
                                                    : `${product.anio_inicio || "-"} / ${product.anio_final || "-"}`
                                                }
                                            </td>
                                        )}
                                        {visibleColumns.precio && (
                                            <td className="px-4 py-4 font-bold text-neutral-900">
                                                {product.precio != null ? `$${product.precio.toFixed(2)}` : "-"}
                                            </td>
                                        )}
                                        {visibleColumns.precio_proveedor && (
                                            <td className="px-4 py-4 text-neutral-500 font-medium">
                                                {product.precio_proveedor != null ? `$${product.precio_proveedor.toFixed(2)}` : "-"}
                                            </td>
                                        )}
                                        {visibleColumns.marca && (
                                            <td className="px-4 py-4">
                                                <span className="inline-block px-2 py-1 rounded bg-neutral-100 text-neutral-700 border border-neutral-200 text-[10px] font-bold">
                                                    {product.marcas?.nombre_marca || `ID: ${product.id_marca}`}
                                                </span>
                                            </td>
                                        )}
                                        {visibleColumns.categoria && (
                                            <td className="px-4 py-4">
                                                <span className="inline-block px-2 py-1 rounded bg-neutral-900 text-white text-[10px] font-bold">
                                                    {product.categorias?.nombre_categoria || `ID: ${product.id_categoria}`}
                                                </span>
                                            </td>
                                        )}
                                        {visibleColumns.imagen && (
                                            <td className="px-4 py-4">
                                                {product.imagen ? (
                                                    <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                                                        Sí
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-red-100 text-red-700 text-[10px] font-bold border border-red-200">
                                                        No
                                                    </span>
                                                )}
                                            </td>
                                        )}
                                        {visibleColumns.proveedor && (
                                            <td className="px-4 py-4 font-medium text-neutral-800">
                                                {product.proveedores?.nombre_proveedor || `ID: ${product.id_proveedor}`}
                                            </td>
                                        )}
                                        {visibleColumns.visibilidad && (
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
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="px-4 py-8 text-neutral-500 text-center font-medium">
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
                    <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 border border-neutral-200">
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

                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Columns Grid */}
                                <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                    <div className="sm:col-span-2 flex flex-col gap-1">
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

                                    {/* Aplicar IVA Checkbox */}
                                    <div className="flex flex-col justify-end pb-1.5 pl-1">
                                        <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-neutral-800">
                                            <input
                                                type="checkbox"
                                                checked={editAplicarIva}
                                                onChange={(e) => handleEditAplicarIvaChange(e.target.checked)}
                                                className="w-4.5 h-4.5 rounded border-neutral-300 text-black focus:ring-black cursor-pointer accent-black"
                                            />
                                            <span>Aplicar IVA (16% + 190%)</span>
                                        </label>
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

                                    {/* Drag and Drop Image Box */}
                                    <div className="sm:col-span-2 flex flex-col gap-2 mt-2">
                                        <label className="text-[10px] font-bold text-black uppercase tracking-wide">Cargar o Reemplazar Imagen (Drag Box)</label>
                                        <div 
                                            onDragEnter={handleDrag}
                                            onDragOver={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDrop={handleDrop}
                                            className={`relative border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2.5 transition min-h-[140px] ${
                                                dragActive ? "border-black bg-neutral-50" : "border-neutral-300 hover:border-neutral-400"
                                            }`}
                                        >
                                            <input 
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            
                                            {imagePreview ? (
                                                <div className="flex flex-col items-center gap-2 z-20">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-neutral-600 font-semibold truncate max-w-[200px]">{selectedFile?.name}</span>
                                                        <button 
                                                            type="button" 
                                                            onClick={removeFile}
                                                            className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition cursor-pointer"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center text-center gap-1.5 pointer-events-none">
                                                    <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <p className="text-xs text-neutral-700 font-semibold">Arrastra tu imagen aquí, o haz clic para buscar</p>
                                                    <p className="text-[10px] text-neutral-400 font-medium">Formatos soportados: JPEG, PNG, WEBP (Máx. 5MB)</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right column: Image (only if exists or new preview exists) */}
                                {(imagePreview || selectedProduct.imagen) && (
                                    <div className="flex flex-col gap-2 shrink-0 self-start md:w-56">
                                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">
                                            {imagePreview ? "Nueva Imagen (Vista Previa)" : "Imagen del Producto"}
                                        </span>
                                        <div className="border border-neutral-200 rounded-2xl overflow-hidden bg-neutral-50 flex items-center justify-center p-2 h-56 w-56 shadow-sm">
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Nueva Vista Previa"
                                                    className="h-full w-full object-contain rounded-xl"
                                                />
                                            ) : (
                                                <a
                                                    href={selectedProduct.imagen}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="h-full w-full flex items-center justify-center cursor-zoom-in"
                                                    title="Ver imagen completa"
                                                >
                                                    <img
                                                        src={selectedProduct.imagen}
                                                        alt={selectedProduct.modelo || "Producto"}
                                                        className="h-full w-full object-contain rounded-xl hover:scale-105 transition duration-300"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "https://placehold.co/250?text=Sin+Imagen";
                                                        }}
                                                    />
                                                </a>
                                            )}
                                        </div>
                                        {!imagePreview ? (
                                            <span className="text-[9px] text-neutral-400 text-center">Haz clic para ver tamaño completo</span>
                                        ) : (
                                            <span className="text-[9px] text-emerald-600 text-center font-semibold animate-pulse">Nueva imagen seleccionada</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {isDeleting && (
                                <div className="flex flex-col gap-2 p-4 bg-red-50 border border-red-200 rounded-2xl animate-fadeIn mt-2 text-left">
                                    <p className="text-sm font-bold text-red-800">¿Estás seguro de que deseas eliminar este producto permanentemente?</p>
                                    <p className="text-xs text-neutral-600">Por favor, ingresa el código de eliminación para confirmar:</p>
                                    <div className="flex flex-col sm:flex-row gap-2 mt-1">
                                        <input
                                            type="password"
                                            placeholder="Código de eliminación"
                                            value={deletePasswordInput}
                                            onChange={(e) => setDeletePasswordInput(e.target.value)}
                                            className="flex-grow border border-red-300 rounded-xl px-3 py-2 text-sm bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-red-500"
                                            disabled={saving}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={handleConfirmDelete}
                                                disabled={saving || !deletePasswordInput}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition active:scale-95 disabled:opacity-55 disabled:active:scale-100 cursor-pointer"
                                            >
                                                {saving ? "Eliminando..." : "Confirmar"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsDeleting(false);
                                                    setDeletePasswordInput("");
                                                    setDeleteError("");
                                                }}
                                                disabled={saving}
                                                className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                    {deleteError && (
                                        <p className="text-xs font-bold text-red-600 mt-1 animate-fadeIn">
                                            {deleteError}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Modal Actions */}
                            <div className="flex justify-between items-center gap-3 border-t border-neutral-100 pt-4 mt-2">
                                <div>
                                    {!isDeleting && (
                                        <button
                                            type="button"
                                            onClick={() => setIsDeleting(true)}
                                            disabled={saving}
                                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm font-semibold active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition duration-150 cursor-pointer"
                                        >
                                            Eliminar Producto
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-3">
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
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}