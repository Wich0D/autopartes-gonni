"use client";

import { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";

export default function ProductTable({
  filteredProducts,
  paginatedProducts,
  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage,
  resetFilters,
}) {
  const [inputPage, setInputPage] = useState(currentPage.toString());

  useEffect(() => {
    setInputPage(currentPage.toString());
  }, [currentPage]);

  const handlePageInputChange = (e) => {
    const val = e.target.value;
    setInputPage(val);
    const pageNum = parseInt(val, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const handlePageInputBlur = () => {
    const pageNum = parseInt(inputPage, 10);
    if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
      setInputPage(currentPage.toString());
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage === 1) {
        pages.push(1, 2, 3);
      } else if (currentPage === totalPages) {
        pages.push(totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(currentPage - 1, currentPage, currentPage + 1);
      }
    }
    return pages;
  };
  // Helper to build WhatsApp custom message
  const getWhatsAppLink = (product) => {
    const phone = "525651824849";
    const text = encodeURIComponent(
      `Hola GONNI, me interesa cotizar el siguiente producto:\n\n` +
      `- *Modelo*: ${product.modelo}\n` +
      `- *Año*: ${product.anio_inicial} de ${product.anio_final}\n` +
      `- *Marca*: ${product.marca}\n` +
      `- *Categoría*: ${product.categoria}\n` +
      `- *Código*: ${product.codigo}\n\n` +
      `¿Me podrían dar precio y disponibilidad? ¡Gracias!`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  // Helper to color brand badges
  const getBrandBadgeClass = () => {
    return "bg-neutral-200 text-neutral-700 border border-neutral-300";
  };

  return (
    <>
      {filteredProducts.length > 0 ? (
        <div className="w-full">
          {/* Desktop Table View */}
          <div className="hidden md:block w-full bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black border-b border-neutral-200 text-white uppercase tracking-wider text-xs font-semibold text-center">
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Modelo</th>
                  <th className="px-6 py-4">Año</th>
                  <th className="px-6 py-4">Marca</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4 text-right">Cotización</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-300 text-neutral-700 text-sm text-center">
                {paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-neutral-50/40 transition-colors"
                  >
                    <td className="px-6 py-4.5 font-mono text-neutral-500 font-medium">
                      {product.codigo}
                    </td>
                    <td className="px-6 py-4.5 font-bold text-neutral-900">
                      {product.modelo}
                    </td>
                    <td className="px-6 py-4.5 text-neutral-600 font-medium">
                      {product.anio_inicial} de {product.anio_final}
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`inline-block w-32 text-center px-1.5 py-1 rounded-full text-xs font-bold ${getBrandBadgeClass()}`}>
                        {product.marca}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="inline-block w-32 text-center px-1.5 py-1 rounded-full text-xs font-bold bg-black text-white border border-black">
                        {product.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <a
                        href={getWhatsAppLink(product)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-[#27a154] hover:bg-emerald-700 active:bg-emerald-800 text-white px-3.5 py-1.5 rounded-md text-xs font-bold tracking-wide shadow-sm hover:shadow transition cursor-pointer"
                      >
                        <FaWhatsapp size={15} />
                        Cotizar
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
            {paginatedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col gap-4 shadow-sm hover:shadow transition"
              >
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Modelo</span>
                    <h3 className="font-bold text-neutral-950 text-sm">
                      {product.modelo}
                    </h3>
                  </div>
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Código</span>
                    <span className="font-mono text-neutral-600 font-bold block mt-0.5">
                      {product.codigo}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border-t border-neutral-100 pt-3">
                  <div>
                    <span className="text-neutral-400 block mb-1">Marca</span>
                    <span className={`inline-block w-32 text-center px-1.5 py-1 rounded-full text-xs font-bold ${getBrandBadgeClass()}`}>
                      {product.marca}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block mb-1">Categoría</span>
                    <span className="inline-block w-32 text-center px-1.5 py-1 rounded-full text-xs font-bold bg-black text-white border border-black">
                      {product.categoria}
                    </span>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-3 text-xs">
                  <span className="text-neutral-400 block mb-0.5">Año</span>
                  <span className="font-semibold text-neutral-700 block">
                    {product.anio_inicial} de {product.anio_final}
                  </span>
                </div>

                <a
                  href={getWhatsAppLink(product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#27a154] hover:bg-emerald-700 active:bg-emerald-800 text-white py-3 rounded-md text-sm font-bold tracking-wide shadow-sm transition"
                >
                  <FaWhatsapp size={18} />
                  Cotizar por WhatsApp
                </a>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-neutral-200 px-4 py-4 sm:px-6 mt-4 gap-4">
              <div>
                <p className="text-sm text-neutral-600 text-center sm:text-left">
                  Mostrando del <span className="font-semibold">{((currentPage - 1) * itemsPerPage) + 1}</span> al{" "}
                  <span className="font-semibold">
                    {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
                  </span>{" "}
                  de <span className="font-semibold">{filteredProducts.length}</span> resultados
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {/* Navigation Controls */}
                <div className="flex items-center gap-1.5">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-3 py-2 rounded-xl text-sm font-semibold text-neutral-900 ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 bg-white disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    Anterior
                  </button>

                  {/* 3 Page Numbers Window */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                          currentPage === page
                            ? "z-10 bg-red-600 text-white animate-fade-in"
                            : "text-neutral-900 ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 bg-white"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-3 py-2 rounded-xl text-sm font-semibold text-neutral-900 ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 bg-white disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    Siguiente
                  </button>
                </div>

                {/* Direct Page Input selector */}
                <div className="flex items-center gap-2 text-sm text-neutral-600 border-l border-neutral-200 pl-3 h-8">
                  <span>Ir a:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={inputPage}
                    onChange={handlePageInputChange}
                    onBlur={handlePageInputBlur}
                    className="w-14 px-2 py-1 text-center font-semibold text-neutral-950 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span>de {totalPages}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 text-center flex flex-col items-center justify-center gap-4">
          <p className="text-neutral-500 font-medium">
            No se encontraron autopartes que coincidan con los filtros seleccionados.
          </p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-xl text-sm font-bold shadow transition cursor-pointer"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </>
  );
}
