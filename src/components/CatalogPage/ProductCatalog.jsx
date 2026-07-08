"use client";

import { useState, useMemo } from "react";
import ProductFilters from "./ProductFilters";
import ProductTable from "./ProductTable";

const MOCK_PRODUCTS = [
  { id: 1, modelo: "TS-III 1.6L", anio_inicial: 1992, anio_final: 2017, marca: "NISSAN", categoria: "Abrazadera", codigo: "ABR-TS3-01", precio: "120.00" },
  { id: 2, modelo: "AUDI Q2", anio_inicial: 2018, anio_final: 2020, marca: "AUDI", categoria: "Alerón", codigo: "ADAQ218RH", precio: "3944.00" },
  { id: 3, modelo: "SENTRA 2.0L", anio_inicial: 2013, anio_final: 2019, marca: "NISSAN", categoria: "Amortiguador", codigo: "AMO-SN13-D", precio: "1850.00" },
  { id: 4, modelo: "JETTA A6 2.5L", anio_inicial: 2011, anio_final: 2018, marca: "VOLKSWAGEN", categoria: "Filtro de Aire", codigo: "FIL-JT6-25", precio: "320.00" },
  { id: 5, modelo: "COROLLA 1.8L", anio_inicial: 2014, anio_final: 2019, marca: "TOYOTA", categoria: "Balatas", codigo: "BAL-CR14-F", precio: "850.00" },
  { id: 6, modelo: "CHEVY 1.6L", anio_inicial: 1996, anio_final: 2012, marca: "CHEVROLET", categoria: "Bomba de Agua", codigo: "BOM-CH96", precio: "640.00" },
  { id: 7, modelo: "CIVIC 1.5T", anio_inicial: 2016, anio_final: 2021, marca: "HONDA", categoria: "Filtro de Aceite", codigo: "FIL-CV16", precio: "210.00" },
  { id: 8, modelo: "RANGER 2.3L", anio_inicial: 2020, anio_final: 2023, marca: "FORD", categoria: "Faro Principal", codigo: "FAR-FR20-L", precio: "4200.00" },
  { id: 9, modelo: "MARCH 1.6L", anio_inicial: 2012, anio_final: 2020, marca: "NISSAN", categoria: "Bujía", codigo: "BUJ-MR12", precio: "95.00" },
  { id: 10, modelo: "AVEO 1.6L", anio_inicial: 2008, anio_final: 2017, marca: "CHEVROLET", categoria: "Balatas", codigo: "BAL-AV08-R", precio: "550.00" },
  { id: 11, modelo: "HILUX 2.7L", anio_inicial: 2016, anio_final: 2022, marca: "TOYOTA", categoria: "Amortiguador", codigo: "AMO-HL16-T", precio: "2100.00" },
  { id: 12, modelo: "VERSA 1.6L", anio_inicial: 2012, anio_final: 2019, marca: "NISSAN", categoria: "Filtro de Cabina", codigo: "FIL-VR12", precio: "180.00" },
  { id: 13, modelo: "MAZDA 3 2.5L", anio_inicial: 2014, anio_final: 2018, marca: "MAZDA", categoria: "Bomba de Agua", codigo: "BOM-MZ14", precio: "1150.00" },
  { id: 14, modelo: "IBIZA 1.6L", anio_inicial: 2010, anio_final: 2017, marca: "SEAT", categoria: "Faro Principal", codigo: "FAR-IB10-R", precio: "3100.00" },
  { id: 15, modelo: "GOLF A7 1.4T", anio_inicial: 2015, anio_final: 2020, marca: "VOLKSWAGEN", categoria: "Bujía", codigo: "BUJ-GF15", precio: "280.00" }
];

export default function ProductCatalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [enableYearRange, setEnableYearRange] = useState(false);
  const [minYear, setMinYear] = useState(1992);
  const [maxYear, setMaxYear] = useState(2023);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Get unique brands and categories for filter options
  const brands = useMemo(() => {
    return Array.from(new Set(MOCK_PRODUCTS.map((p) => p.marca))).sort();
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(MOCK_PRODUCTS.map((p) => p.categoria))).sort();
  }, []);

  // Filter products based on search query, selected brand, and selected category
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
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
  }, [searchQuery, selectedBrand, selectedCategory, enableYearRange, minYear, maxYear]);

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
    setMinYear(1992);
    setMaxYear(2023);
    setCurrentPage(1);
  };

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
