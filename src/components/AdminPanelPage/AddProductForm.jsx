"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabase";

export default function AddProductForm({ onProductAdded }) {
    // Form fields state
    const [codigoOriginal, setCodigoOriginal] = useState("");
    const [codigoProveedor, setCodigoProveedor] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [modelo, setModelo] = useState("");
    const [anioInicio, setAnioInicio] = useState("");
    const [anioFin, setAnioFin] = useState("");
    const [precio, setPrecio] = useState("");
    const [precioProveedor, setPrecioProveedor] = useState("");
    const [idMarca, setIdMarca] = useState("");
    const [idCategoria, setIdCategoria] = useState("");
    const [idProveedor, setIdProveedor] = useState("");
    const [visibleEnWeb, setVisibleEnWeb] = useState(true);

    // Collapsible states
    const [isOpen, setIsOpen] = useState(false);

    // Dynamic price calculation markup (+20%)
    const handlePrecioProveedorChange = (val) => {
        setPrecioProveedor(val);
        const parsed = parseFloat(val);
        if (!isNaN(parsed) && parsed > 0) {
            const calculatedMarkup = (parsed * 1.20).toFixed(2);
            setPrecio(calculatedMarkup);
        } else {
            setPrecio("");
        }
    };

    // Dropdown list data
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [providers, setProviders] = useState([]);

    // UI Feedback state
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Drag and Drop states
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    // Load dropdown options on mount
    useEffect(() => {
        async function fetchDropdownData() {
            try {
                const [
                    { data: brandData, error: brandErr },
                    { data: catData, error: catErr },
                    { data: provData, error: provErr }
                ] = await Promise.all([
                    supabase.from("marcas").select("id, nombre_marca").order("nombre_marca", { ascending: true }),
                    supabase.from("categorias").select("id, nombre_categoria").order("nombre_categoria", { ascending: true }),
                    supabase.from("proveedores").select("id, nombre_proveedor").order("nombre_proveedor", { ascending: true })
                ]);

                if (brandErr) throw brandErr;
                if (catErr) throw catErr;
                if (provErr) throw provErr;

                setBrands(brandData || []);
                setCategories(catData || []);
                setProviders(provData || []);
            } catch (err) {
                console.error("Error loading form selectors:", err);
                setErrorMessage("No se pudieron cargar las marcas, categorías o proveedores de la base de datos.");
            }
        }

        fetchDropdownData();
    }, []);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMessage("");
        setErrorMessage("");

        try {
            // Validations
            if (!codigoOriginal.trim()) throw new Error("El Código Original es requerido.");
            if (!modelo.trim()) throw new Error("El Modelo es requerido.");
            if (!idMarca) throw new Error("Por favor, selecciona una Marca.");
            if (!idCategoria) throw new Error("Por favor, selecciona una Categoría.");
            if (!idProveedor) throw new Error("Por favor, selecciona un Proveedor.");

            let imageUrl = null;

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

                imageUrl = publicUrl;
            }

            // 2. Insert product record into products table
            const newProduct = {
                codigo_original: codigoOriginal.trim(),
                codigo_proveedor: codigoProveedor.trim() || null,
                descripcion: descripcion.trim() || null,
                modelo: modelo.trim(),
                anio_inicio: anioInicio ? parseInt(anioInicio) : null,
                anio_final: anioFin ? parseInt(anioFin) : null,
                precio: precio ? parseFloat(precio) : null,
                precio_proveedor: precioProveedor ? parseFloat(precioProveedor) : null,
                id_marca: parseInt(idMarca),
                id_categoria: parseInt(idCategoria),
                id_proveedor: parseInt(idProveedor),
                visible_en_web: visibleEnWeb,
                imagen: imageUrl
            };

            const { data, error: insertError } = await supabase
                .from("productos")
                .insert([newProduct])
                .select();

            if (insertError) throw insertError;

            // Success feedback
            setSuccessMessage("¡Producto agregado exitosamente a la base de datos!");
            
            // Reset form fields
            setCodigoOriginal("");
            setCodigoProveedor("");
            setDescripcion("");
            setModelo("");
            setAnioInicio("");
            setAnioFin("");
            setPrecio("");
            setPrecioProveedor("");
            setIdMarca("");
            setIdCategoria("");
            setIdProveedor("");
            setVisibleEnWeb(true);
            removeFile();

            // Refresh parent statistics/tables
            if (onProductAdded) {
                onProductAdded();
            }
        } catch (err) {
            console.error("Error submitting new product form:", err);
            setErrorMessage(err.message || "Ocurrió un error inesperado al guardar el producto.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="w-full flex flex-col gap-4 animate-fadeIn">
            {/* Collapsible Header */}
            <div 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full bg-white rounded-2xl border border-neutral-200 shadow-sm px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50/50 transition duration-200 select-none"
            >
                <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                    <svg className="w-5.5 h-5.5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Agregar Producto Manualmente</span>
                </h2>
                <button 
                    type="button" 
                    className="p-1 text-neutral-500 hover:text-neutral-700 focus:outline-none transition duration-200"
                >
                    <svg 
                        className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* Collapsible Content */}
            {isOpen && (
                <form onSubmit={handleSubmit} className="w-full bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 flex flex-col gap-6 animate-slideDown">
                    
                    {/* Feedback messages */}
                    {successMessage && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-semibold animate-fadeIn">
                            {successMessage}
                        </div>
                    )}
                    {errorMessage && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold whitespace-pre-line animate-fadeIn">
                            {errorMessage}
                        </div>
                    )}

                    {/* Grid fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        
                        {/* Codigo Original */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Código Original *</label>
                            <input 
                                type="text" 
                                required 
                                value={codigoOriginal} 
                                onChange={(e) => setCodigoOriginal(e.target.value)} 
                                placeholder="Ej: 65400-50Y10"
                                className="border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition bg-white"
                            />
                        </div>

                        {/* Codigo Proveedor */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Código Proveedor</label>
                            <input 
                                type="text" 
                                value={codigoProveedor} 
                                onChange={(e) => setCodigoProveedor(e.target.value)} 
                                placeholder="Ej: HGRN0121"
                                className="border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition bg-white"
                            />
                        </div>

                        {/* Modelo */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Modelo / Vehículo *</label>
                            <input 
                                type="text" 
                                required 
                                value={modelo} 
                                onChange={(e) => setModelo(e.target.value)} 
                                placeholder="Ej: TS-III, Sentra"
                                className="border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition bg-white"
                            />
                        </div>

                        {/* Año Inicio */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Año Inicio</label>
                            <input 
                                type="number" 
                                value={anioInicio} 
                                onChange={(e) => setAnioInicio(e.target.value)} 
                                placeholder="Ej: 1992"
                                className="border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition bg-white"
                            />
                        </div>

                        {/* Año Fin */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Año Fin</label>
                            <input 
                                type="number" 
                                value={anioFin} 
                                onChange={(e) => setAnioFin(e.target.value)} 
                                placeholder="Ej: 2017"
                                className="border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition bg-white"
                            />
                        </div>

                        {/* Select Marca */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Marca *</label>
                            <select 
                                required 
                                value={idMarca} 
                                onChange={(e) => setIdMarca(e.target.value)} 
                                className="border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition bg-white cursor-pointer"
                            >
                                <option value="">Selecciona Marca</option>
                                {brands.map(b => (
                                    <option key={b.id} value={b.id}>{b.nombre_marca}</option>
                                ))}
                            </select>
                        </div>

                        {/* Select Categoria */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Categoría *</label>
                            <select 
                                required 
                                value={idCategoria} 
                                onChange={(e) => setIdCategoria(e.target.value)} 
                                className="border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition bg-white cursor-pointer"
                            >
                                <option value="">Selecciona Categoría</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre_categoria}</option>
                                ))}
                            </select>
                        </div>

                        {/* Select Proveedor */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Proveedor *</label>
                            <select 
                                required 
                                value={idProveedor} 
                                onChange={(e) => setIdProveedor(e.target.value)} 
                                className="border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition bg-white cursor-pointer"
                            >
                                <option value="">Selecciona Proveedor</option>
                                {providers.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre_proveedor}</option>
                                ))}
                            </select>
                        </div>

                        {/* Precio Proveedor */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Precio Proveedor ($)</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                value={precioProveedor} 
                                onChange={(e) => handlePrecioProveedorChange(e.target.value)} 
                                placeholder="Ej: 200.00"
                                className="border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition bg-white"
                            />
                        </div>

                        {/* Precio Publico (Nuestro Precio) */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Precio Público (Nuestro Precio) ($)</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                value={precio} 
                                onChange={(e) => setPrecio(e.target.value)} 
                                placeholder="Ej: 240.00"
                                className="border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition bg-white"
                            />
                        </div>

                        {/* Visibilidad Checkbox */}
                        <div className="flex flex-col justify-end pb-3 pl-1">
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-neutral-800">
                                <input 
                                    type="checkbox"
                                    checked={visibleEnWeb}
                                    onChange={(e) => setVisibleEnWeb(e.target.checked)}
                                    className="w-4.5 h-4.5 rounded border-neutral-300 text-black focus:ring-black cursor-pointer accent-black"
                                />
                                <span>Visible en la Web (Visibilidad)</span>
                            </label>
                        </div>

                        {/* Descripcion */}
                        <div className="md:col-span-3 flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Descripción del Producto</label>
                            <textarea 
                                rows={2}
                                value={descripcion} 
                                onChange={(e) => setDescripcion(e.target.value)} 
                                placeholder="Escribe detalles del producto (ej: BISAGRA DE COFRE DERECHA)..."
                                className="border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition bg-white resize-none"
                            />
                        </div>

                        {/* Drag and Drop Image Box */}
                        <div className="md:col-span-3 flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Carga de Imagen (Drag Box)</label>
                            <div 
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition min-h-[160px] ${
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
                                    <div className="flex flex-col items-center gap-3 z-20">
                                        <img src={imagePreview} alt="Vista previa" className="max-h-32 rounded-lg object-contain shadow-sm border border-neutral-100" />
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
                                    <div className="flex flex-col items-center text-center gap-2 pointer-events-none">
                                        <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-sm text-neutral-700 font-semibold">Arrastra tu imagen aquí, o haz clic para buscar</p>
                                        <p className="text-xs text-neutral-400 font-medium">Formatos soportados: JPEG, PNG, WEBP (Máx. 5MB)</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end pt-2 border-t border-neutral-100 mt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-sm font-semibold active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 cursor-pointer"
                        >
                            {saving ? "Agregando Producto..." : "Agregar Producto"}
                        </button>
                    </div>
                    
                </form>
            )}
        </div>
    );
}
