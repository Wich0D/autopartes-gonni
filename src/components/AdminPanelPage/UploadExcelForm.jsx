"use client";

import { useState, useEffect, useRef } from "react";
import { FaFileDownload, FaFileUpload, FaTrash, FaCloudUploadAlt } from "react-icons/fa";
import { supabase } from "@/utils/supabase";

export default function UploadExcelForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    
    const [providers, setProviders] = useState([]);
    const [selectedProvider, setSelectedProvider] = useState("");
    const [newProviderName, setNewProviderName] = useState("");
    const [providerWebsite, setProviderWebsite] = useState("");
    const [isNewProvider, setIsNewProvider] = useState(false);
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [uploadError, setUploadError] = useState(null);

    // Cargar proveedores al montar
    useEffect(() => {
        async function fetchProviders() {
            try {
                const { data, error } = await supabase
                    .from("proveedores")
                    .select("id, nombre_proveedor")
                    .order("nombre_proveedor", { ascending: true });

                if (error) throw error;
                setProviders(data || []);
            } catch (err) {
                console.error("Error loading providers for upload form:", err);
            }
        }
        fetchProviders();
    }, []);

    const handleDownloadTemplate = async () => {
        try {
            setIsDownloading(true);
            const response = await fetch('/api/generar-plantilla');
            
            if (!response.ok) {
                throw new Error("No se pudo generar la plantilla.");
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "plantilla_productos.xlsx";
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error("Error al descargar plantilla:", error);
            alert("Ocurrió un error al intentar descargar la plantilla.");
        } finally {
            setIsDownloading(false);
        }
    };

    // Funciones para manejar arrastrar y soltar
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
        const isValidExcel = file.name.endsWith(".xlsx") || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        if (!isValidExcel) {
            alert("Por favor, selecciona un archivo de Excel válido (.xlsx).");
            return;
        }
        setSelectedFile(file);
        setUploadResult(null);
        setUploadError(null);
    };

    const removeFile = () => {
        setSelectedFile(null);
        setUploadResult(null);
        setUploadError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Lógica para procesar la subida
    const isFormValid = () => {
        if (!selectedFile) return false;
        if (isNewProvider) {
            return newProviderName.trim().length > 0;
        } else {
            return selectedProvider !== "";
        }
    };

    const handleUploadData = async () => {
        if (!isFormValid()) return;
        
        setIsUploading(true);
        setUploadResult(null);
        setUploadError(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('isNewProvider', isNewProvider);
            if (isNewProvider) {
                formData.append('newProviderName', newProviderName.trim());
                formData.append('providerWebsite', providerWebsite.trim());
            } else {
                formData.append('selectedProvider', selectedProvider);
            }

            // Obtener la sesión actual para pasar el token
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch('/api/procesar-excel', {
                method: 'POST',
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Error al procesar el archivo.");
            }

            setUploadResult(result);
            
            // Si hay errores, decodificamos el Base64 y lo descargamos
            if (result.errores > 0 && result.errorBase64) {
                const byteCharacters = atob(result.errorBase64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "errores_productos.xlsx";
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            }
            
            // Actualizar la lista de proveedores si se creó uno nuevo
            if (isNewProvider && result.newProviderId) {
                setProviders(prev => [...prev, { id: result.newProviderId, nombre_proveedor: newProviderName.trim() }].sort((a,b) => a.nombre_proveedor.localeCompare(b.nombre_proveedor)));
                setIsNewProvider(false);
                setSelectedProvider(result.newProviderId);
                setNewProviderName("");
                setProviderWebsite("");
            }

        } catch (error) {
            console.error("Error subiendo datos:", error);
            setUploadError(error.message);
        } finally {
            setIsUploading(false);
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Cargar archivo Excel</span>
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
                <div className="w-full bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 flex flex-col gap-6 animate-slideDown">
                    
                    {/* Sección 1: Descargar */}
                    <div className="flex flex-col gap-2">
                        <h3 className="text-lg font-bold text-neutral-800">1. Descargar Plantilla</h3>
                        <p className="text-sm text-neutral-600">
                            Descarga la plantilla oficial en formato Excel. Las columnas de Marca y Categoría ya vienen preconfiguradas con las opciones actuales de la base de datos.
                        </p>
                        
                        <div className="mt-2">
                            <button
                                onClick={handleDownloadTemplate}
                                disabled={isDownloading}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-semibold shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 cursor-pointer"
                            >
                                <FaFileDownload className="text-lg" />
                                {isDownloading ? "Generando archivo..." : "Descargar Plantilla"}
                            </button>
                        </div>
                    </div>

                    <div className="w-full h-px bg-neutral-100 my-2"></div>

                    {/* Sección 2: Subir y Configurar */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-bold text-neutral-800">2. Subir Archivo</h3>
                            <p className="text-sm text-neutral-600">
                                Sube el archivo Excel completado. Una vez cargado, podrás configurar el proveedor para estos productos.
                            </p>
                        </div>
                        
                        {/* Drag and Drop Zone */}
                        <div 
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition min-h-[140px] mt-2 ${
                                dragActive ? "border-cyan-500 bg-cyan-50" : "border-neutral-300 hover:border-neutral-400 bg-neutral-50"
                            }`}
                        >
                            <input 
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            
                            {selectedFile ? (
                                <div className="flex flex-col items-center gap-2 z-20">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-1">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <span className="text-sm text-neutral-800 font-bold truncate max-w-[250px]">{selectedFile.name}</span>
                                    <button 
                                        type="button" 
                                        onClick={removeFile}
                                        className="mt-2 flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition cursor-pointer"
                                    >
                                        <FaTrash /> Eliminar archivo
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center gap-2 pointer-events-none">
                                    <FaFileUpload className="text-3xl text-neutral-400" />
                                    <p className="text-sm text-neutral-700 font-semibold">Arrastra tu archivo Excel completado aquí</p>
                                    <p className="text-xs text-neutral-400 font-medium">Formatos soportados: .xlsx</p>
                                </div>
                            )}
                        </div>

                        {/* Mensajes de feedback de la subida */}
                        {uploadError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold animate-fadeIn">
                                {uploadError}
                            </div>
                        )}
                        {uploadResult && (
                            <div className={`${uploadResult.errores > 0 ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'} border px-4 py-3 rounded-xl text-sm font-semibold animate-fadeIn flex flex-col gap-1`}>
                                <span>{uploadResult.errores > 0 ? 'Carga Parcial' : '¡Carga exitosa!'}</span>
                                <span className="font-normal text-xs opacity-90">
                                    Procesados: {uploadResult.totalProcesados} | Insertados: {uploadResult.insertados} | Errores: {uploadResult.errores || 0}
                                </span>
                                {uploadResult.errores > 0 && (
                                    <span className="font-bold text-xs mt-1">
                                        Se ha descargado un archivo "errores_productos.xlsx" con las filas que fallaron. Por favor, corrige los errores y vuelve a subir ese mismo archivo.
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Inputs disabled when no file is selected */}
                        <div className={`flex flex-col gap-5 mt-4 transition-opacity duration-300 ${!selectedFile ? 'opacity-50' : 'opacity-100'}`}>
                            
                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-neutral-800">
                                    <input 
                                        type="checkbox"
                                        checked={isNewProvider}
                                        onChange={(e) => setIsNewProvider(e.target.checked)}
                                        disabled={!selectedFile}
                                        className="w-4.5 h-4.5 rounded border-neutral-300 text-cyan-600 focus:ring-cyan-600 cursor-pointer disabled:opacity-50"
                                    />
                                    <span>¿Es un proveedor nuevo?</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {!isNewProvider ? (
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">
                                            Proveedor Global para la carga *
                                        </label>
                                        <select 
                                            value={selectedProvider} 
                                            onChange={(e) => setSelectedProvider(e.target.value)} 
                                            disabled={!selectedFile}
                                            className="border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition bg-white disabled:bg-neutral-100 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <option value="">Selecciona un Proveedor</option>
                                            {providers.map(p => (
                                                <option key={p.id} value={p.id}>{p.nombre_proveedor}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col gap-1 animate-fadeIn">
                                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">
                                                Nombre del Nuevo Proveedor *
                                            </label>
                                            <input 
                                                type="text" 
                                                value={newProviderName}
                                                onChange={(e) => setNewProviderName(e.target.value)}
                                                disabled={!selectedFile}
                                                placeholder="Ej: AutoPartes Express"
                                                className="border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition bg-white disabled:bg-neutral-100 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                        
                                        <div className="flex flex-col gap-1 animate-fadeIn">
                                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">
                                                Sitio Web del Proveedor (Opcional)
                                            </label>
                                            <input 
                                                type="url" 
                                                value={providerWebsite}
                                                onChange={(e) => setProviderWebsite(e.target.value)}
                                                disabled={!selectedFile}
                                                placeholder="Ej: https://proveedor.com"
                                                className="border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition bg-white disabled:bg-neutral-100 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            {/* Acción de carga */}
                            <div className="flex justify-end pt-4 border-t border-neutral-100 mt-2">
                                <button
                                    type="button"
                                    onClick={handleUploadData}
                                    disabled={!isFormValid() || isUploading}
                                    className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-sm font-semibold active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 cursor-pointer w-full md:w-auto"
                                >
                                    <FaCloudUploadAlt className="text-lg" />
                                    {isUploading ? "Procesando Archivo..." : "Cargar Datos"}
                                </button>
                            </div>

                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
