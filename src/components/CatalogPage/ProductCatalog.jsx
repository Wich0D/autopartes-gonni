"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductFilters from "./ProductFilters";
import ProductTable from "./ProductTable";
import { supabase } from "@/utils/supabase";

export default function ProductCatalog() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  // Sincronizar selectedBrand y searchQuery con los query params
  useEffect(() => {
    const urlBrand = searchParams?.get("marca");
    if (urlBrand) {
      setSelectedBrand(urlBrand);
    }

    const urlSearch = searchParams?.get("search");
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [enableYearRange, setEnableYearRange] = useState(false);
  
  // Limites del rango de años dinámicos
  const [minLimitYear, setMinLimitYear] = useState(1990);
  const [maxLimitYear, setMaxLimitYear] = useState(2026);
  const [minYear, setMinYear] = useState(1990);
  const [maxYear, setMaxYear] = useState(2026);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch products, brands and categories from Supabase on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // 1. Obtener todos los productos de forma iterativa en bloques de 1000 para superar el limite de PostgREST
        let prodData = [];
        let pageNum = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error: fetchError } = await supabase
            .from("productos")
            .select(`
              id,
              codigo_original,
              modelo,
              anio_inicio,
              anio_final,
              marcas (nombre_marca),
              categorias (nombre_categoria)
            `)
            .eq("visible_en_web", true)
            .range(pageNum * pageSize, (pageNum + 1) * pageSize - 1);

          if (fetchError) throw fetchError;

          prodData = [...prodData, ...(data || [])];

          if (!data || data.length < pageSize) {
            hasMore = false;
          } else {
            pageNum++;
          }
        }

        // 2. Obtener categorias directamente de su tabla de base de datos
        const { data: catData, error: catError } = await supabase
          .from("categorias")
          .select("nombre_categoria")
          .order("nombre_categoria", { ascending: true });

        if (catError) throw catError;

        // 3. Obtener marcas directamente de su tabla de base de datos
        const { data: brandData, error: brandError } = await supabase
          .from("marcas")
          .select("nombre_marca")
          .order("nombre_marca", { ascending: true });

        if (brandError) throw brandError;

        // Formatear al esquema esperado por la tabla y filtros
        const formattedProducts = (prodData || []).map((prod) => ({
          id: prod.id,
          codigo: prod.codigo_original || "",
          modelo: prod.modelo || "",
          anio_inicial: prod.anio_inicio || 1990,
          anio_final: prod.anio_final || 2026,
          marca: prod.marcas?.nombre_marca || "SIN MARCA",
          categoria: prod.categorias?.nombre_categoria || "SIN CATEGORIA",
        }));

        // Calcular limites dinamicos de años basados en los productos de la base de datos
        const yearsStart = formattedProducts.map((p) => p.anio_inicial).filter((y) => y > 0);
        const yearsEnd = formattedProducts.map((p) => p.anio_final).filter((y) => y > 0);
        const calculatedMin = yearsStart.length > 0 ? Math.min(...yearsStart) : 1990;
        const calculatedMax = yearsEnd.length > 0 ? Math.max(...yearsEnd) : 2026;

        setMinLimitYear(calculatedMin);
        setMaxLimitYear(calculatedMax);
        setMinYear(calculatedMin);
        setMaxYear(calculatedMax);
        
        setProducts(formattedProducts);
        setCategories((catData || []).map((c) => c.nombre_categoria).filter(Boolean));
        setBrands((brandData || []).map((b) => b.nombre_marca).filter(Boolean));
      } catch (err) {
        console.error("Error fetching data from Supabase:", err);
        setError("Ocurrió un error al cargar el catálogo de autopartes. Por favor, intenta de nuevo.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter products based on search query, selected brand, and selected category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.modelo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categoria.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.marca.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBrand = selectedBrand ? product.marca === selectedBrand : true;
      const matchesCategory = selectedCategory ? product.categoria === selectedCategory : true;
      const matchesYear = enableYearRange
        ? (product.anio_inicial <= maxYear && product.anio_final >= minYear)
        : true;

      return matchesSearch && matchesBrand && matchesCategory && matchesYear;
    });
  }, [products, searchQuery, selectedBrand, selectedCategory, enableYearRange, minYear, maxYear]);

  // Handle pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedBrand("");
    setSelectedCategory("");
    setEnableYearRange(false);
    setMinYear(minLimitYear);
    setMaxYear(maxLimitYear);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-6 animate-pulse pb-10">
        {/* Filters Skeleton */}
        <div className="h-32 bg-neutral-200/60 rounded-2xl w-full" />
        {/* Table Skeleton */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden w-full">
          <div className="h-12 bg-neutral-300/40 w-full" />
          <div className="divide-y divide-neutral-200">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="h-16 bg-neutral-50/20 flex items-center px-6 justify-between">
                <div className="h-4 bg-neutral-200/80 rounded w-1/6" />
                <div className="h-4 bg-neutral-200/80 rounded w-1/4" />
                <div className="h-4 bg-neutral-200/80 rounded w-1/12" />
                <div className="h-4 bg-neutral-200/80 rounded w-1/6" />
                <div className="h-4 bg-neutral-200/80 rounded w-1/6" />
                <div className="h-8 bg-neutral-200/80 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-red-50/50 border border-red-200/80 text-red-700 px-6 py-8 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center gap-3">
        <p className="font-extrabold text-xl">Error al cargar productos</p>
        <p className="text-sm text-red-600 max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
        >
          Reintentar Carga
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <ProductFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        enableYearRange={enableYearRange}
        setEnableYearRange={setEnableYearRange}
        minYear={minYear}
        setMinYear={setMinYear}
        maxYear={maxYear}
        setMaxYear={setMaxYear}
        minLimitYear={minLimitYear}
        maxLimitYear={maxLimitYear}
        brands={brands}
        categories={categories}
        resetFilters={resetFilters}
        setCurrentPage={setCurrentPage}
      />
      <ProductTable
        filteredProducts={filteredProducts}
        paginatedProducts={paginatedProducts}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        resetFilters={resetFilters}
      />
    </div>
  );
}

