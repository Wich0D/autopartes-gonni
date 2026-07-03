"use client";

import { useState, useEffect } from "react";
import BrandCard from "./BrandCard";
import marcas from "@/utils/data/marcas.json";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function useItemsPerPage() {
  const [itemsPerPage, setItemsPerPage] = useState(10); // por defecto lg: 5 columnas * 2 filas

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerPage(4); // móvil: 2 col * 2 filas
      } else if (width < 768) {
        setItemsPerPage(6); // sm: 3 col * 2 filas
      } else if (width < 1024) {
        setItemsPerPage(8); // md: 4 col * 2 filas
      } else {
        setItemsPerPage(10); // lg+: 5 col * 2 filas
      }
    }

    handleResize(); // llamado inicial
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return itemsPerPage;
}

export default function BrandsSection() {
  const itemsPerPage = useItemsPerPage();
  const [currentPage, setCurrentPage] = useState(0);

  // Páginas totales
  const totalPages = Math.ceil(marcas.length / itemsPerPage);

  // Asegura que la página actual esté en rango al cambiar la resolución
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, Math.max(0, totalPages - 1)));
  }, [itemsPerPage, totalPages]);

  const handlePrev = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  const startIndex = currentPage * itemsPerPage;
  const visibleBrands = marcas.slice(startIndex, startIndex + itemsPerPage);

  return (
    <section className="flex flex-col items-center justify-center mt-10 px-4 w-full max-w-7xl mb-12">
      <h2 className="text-center text-2xl sm:text-3xl font-bold">Venta de refacciones a multimarcas</h2>

      <div className="w-full h-auto mt-1 p-4">
        <p className="text-black/70 text-center text-md mb-6">
          En GONNI tenemos un amplio catálogo de refacciones para diferentes marcas de autos. ¡Encuentra la que necesitas!
        </p>

        <div className="flex items-center justify-between gap-2 sm:gap-4 w-full relative">
          {/* Botón Izquierdo */}
          <button
            onClick={handlePrev}
            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white hover:bg-neutral-800 text-black hover:text-white rounded-full shadow-md hover:shadow-lg border border-neutral-200 hover:border-neutral-700 transition-all duration-300 z-10 shrink-0 cursor-pointer"
            aria-label="Anterior"
          >
            <FaChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>

          {/* Contenedor de las Tarjetas */}
          <div className="w-full overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 py-2 min-h-[320px] sm:min-h-[270px] md:min-h-[250px]">
              {visibleBrands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </div>
          </div>

          {/* Botón Derecho */}
          <button
            onClick={handleNext}
            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white hover:bg-neutral-800 text-black hover:text-white rounded-full shadow-md hover:shadow-lg border border-neutral-200 hover:border-neutral-700 transition-all duration-300 z-10 shrink-0 cursor-pointer"
            aria-label="Siguiente"
          >
            <FaChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>

        {/* Puntos Indicadores de Página */}
        <div className="flex justify-center flex-wrap gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentPage === idx ? "bg-red-600 w-6" : "bg-neutral-300 hover:bg-neutral-400"
              }`}
              aria-label={`Ir a la página ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
