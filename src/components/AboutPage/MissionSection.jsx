import Image from "next/image";

export default function MissionSection() {
    return (
        <section className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between gap-10 py-12 md:py-20 px-6 md:px-16">
            <div className="w-full md:w-1/2 flex flex-col items-start text-left">
                <h2 className="font-black text-3xl sm:text-4xl text-neutral-900 tracking-tight">Misión</h2>
                <div className="flex items-center gap-1.5 mt-2.5 mb-6">
                    <span className="w-16 sm:w-20 h-1.5 sm:h-2 bg-black rounded-full"></span>
                    <span className="w-3 h-1.5 sm:h-2 bg-black rounded-full"></span>
                    <span className="w-3 h-1.5 sm:h-2 bg-black rounded-full"></span>
                    <span className="w-2 h-1.5 sm:h-2 bg-black rounded-full"></span>
                </div>
                <p className="font-light text-neutral-700 text-lg sm:text-xl leading-relaxed">
                    Estamos comprometidos a lograr, como prioridad primordial, el servicio. Nuestro
                    compromiso es dar las soluciones a nuestros clientes, socios comerciales y
                    colaboradores, para lograr la mejor experiencia en la industria automotriz.
                </p>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
                <Image
                    src="/mision.png"
                    alt="Auto formado por refacciones"
                    width={500}
                    height={500}
                    className="w-full max-w-[400px] md:max-w-[500px] h-auto object-contain drop-shadow-lg"
                    priority
                />
            </div>
        </section>
    );
}
