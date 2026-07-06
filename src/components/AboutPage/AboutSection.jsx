import Image from "next/image";
import AboutImageExhibitor from "./AboutImageExhibitor";

export default function AboutSection() {
    return (
        <section className="relative w-full h-[450px] md:h-[500px] flex flex-col md:flex-row bg-[url('/bg-textures/bg_metal_alt.png')] bg-cover bg-center bg-no-repeat text-white overflow-hidden">
            {/* Exhibidor de imagenes */}
            <div className="absolute inset-0 w-full h-full z-0 md:relative md:w-2/5 xl:w-1/2">
                <AboutImageExhibitor />
            </div>

            {/* Contenido Quiénes Somos */}
            <div className="relative w-full md:w-3/5 xl:w-1/2 flex flex-col items-center justify-center py-12 md:py-16 px-6 md:px-16 text-center h-full">
                {/* Degradado en el lado izquierdo para pantallas lg, por debajo del texto */}
                <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-black via-black/50 to-transparent z-0 hidden lg:block pointer-events-none" />

                {/* Contenido principal sobre el degradado */}
                <div className="relative z-10 flex flex-col items-center justify-center">
                    <Image
                        src={"/gonni_logo.png"}
                        alt="GONNI Logo"
                        width={200}
                        height={100}
                        priority
                        className="w-32 h-auto sm:w-40 md:w-48 lg:w-[280px] drop-shadow-[0_4px_12px_rgba(255,255,255,0.05)] hover:scale-105 transition-transform duration-300 mb-6"
                    />
                    <h1 className="text-3xl sm:text-4xl font-extrabold mb-6">
                        ¿Quiénes somos?
                    </h1>
                    <p className="text-neutral-300 text-base sm:text-lg leading-relaxed max-w-xl">
                        GONNI nace y crece sobre una cultura del servicio, innovación y excelencia. Para
                        nuestra empresa la prioridad número 1 es el servicio, las soluciones a nuestros
                        clientes, socios comerciales y colaboradores, para lograr la mejor experiencia en la
                        industria automotriz.
                    </p>
                </div>
            </div>
        </section>
    );
}
