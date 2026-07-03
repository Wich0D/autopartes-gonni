import Image from "next/image";

export default function BrandCard({ brand }) {
  return (
    <div className="flex flex-col items-center p-3 bg-white border border-neutral-200 rounded-2xl shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-black/20 group cursor-pointer">
      {/* Square logo container */}
      <div className="w-full aspect-square bg-neutral-50 flex items-center justify-center p-3 rounded-xl relative overflow-hidden">
        {brand.logo ? (
          <Image
            src={brand.logo}
            alt={brand.nombre_marca}
            width={80}
            height={80}
            className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-neutral-400 font-extrabold text-2xl bg-neutral-100 rounded-lg">
            {brand.nombre_marca.charAt(0)}
          </div>
        )}
      </div>

      {/* Brand text details */}
      <div className="flex flex-col items-center mt-2.5 text-center">
        <span className="text-[8px] sm:text-xs text-neutral-800 font-medium uppercase tracking-wider">
          Refacciones para
        </span>
        <span className="text-xs sm:text-sm text-black font-bold mt-0.5 group-hover:text-red-600 transition-colors">
          {brand.nombre_marca}
        </span>
      </div>
    </div>
  );
}
