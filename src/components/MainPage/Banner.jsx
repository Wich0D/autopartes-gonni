import Image from "next/image";
import Link from "next/link";

export default function Banner() {
  return (
    <section className="w-full flex flex-col justify-center items-center py-12 px-4 md:py-20 md:px-8 bg-[url('/bg-textures/fondo_carbono.jpg')] bg-cover bg-center bg-no-repeat text-white">
      <Image
        src={"/gonni_logo.png"}
        alt="Background image"
        width={400}
        height={300}
        priority
        className="w-48 h-auto sm:w-64 md:w-80 lg:w-[400px] drop-shadow-2xl transition-all duration-300"
      />
      <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl italic text-center max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mt-4 md:mt-6 leading-tight transition-all duration-300">
        Encuentra la refacción exacta para tu vehículo
      </h1>
      <Link
        href="/catalogo"
        className="relative overflow-hidden group bg-white hover:bg-neutral-800 text-black hover:text-white text-base sm:text-lg md:text-xl font-bold px-4 py-2.5 md:px-6 md:py-3 mt-6 md:mt-8 flex items-center gap-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg border border-transparent hover:border-neutral-700"
      >
        {/* Glass reflection/shine effect */}
        <span className="absolute inset-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-[20deg] -translate-x-[150%] group-hover:animate-shine-loop pointer-events-none" />
        <span className="relative z-10">Ver Catálogo</span>
      </Link>
    </section>
  );
}
