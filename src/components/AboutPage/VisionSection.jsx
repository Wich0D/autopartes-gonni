import Image from "next/image";

export default function VisionSection() {
    return (
        <section className="w-full max-w-7xl flex flex-col md:flex-row-reverse items-center justify-between gap-10 py-12 md:py-20 px-6 md:px-16">
            <div className="w-full md:w-1/2 flex flex-col items-end md:text-right">
                <h2 className="font-black text-3xl sm:text-4xl text-neutral-900 tracking-tight">Visión</h2>
                <div className="flex items-center gap-1.5 mt-2.5 mb-6">
                    <span className="w-2 h-1.5 sm:h-2 bg-black rounded-full"></span>
                    <span className="w-3 h-1.5 sm:h-2 bg-black rounded-full"></span>
                    <span className="w-3 h-1.5 sm:h-2 bg-black rounded-full"></span>
                    <span className="w-16 sm:w-20 h-1.5 sm:h-2 bg-black rounded-full"></span>
                </div>
                <p className="font-light text-neutral-700 text-lg sm:text-xl leading-relaxed">
                    Ser líderes en proporcionar una cultura de innovación, diversidad, servicio y
                    responsabilidad, a toda la cadena de valor de nuestros clientes, socios comerciales
                    y colaboradores.
                </p>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
                <Image
                    src="/vision.png"
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
