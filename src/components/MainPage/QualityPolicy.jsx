import Image from "next/image";
import { RiUserHeartLine, RiTeamLine } from "react-icons/ri";
import { HiTrendingUp } from "react-icons/hi";

export default function QualityPolicy() {
  return (
    <section className="w-full flex justify-center px-4 mb-16">
      <div className="bg-[url('/bg-textures/bg_metal.png')] bg-cover bg-center bg-no-repeat text-white flex flex-col p-6 md:p-10 rounded-3xl md:rounded-4xl max-w-full 
      md:max-w-4/5 lg:max-w-3/5 w-full gap-6 items-center border border-neutral-900 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-8 items-center w-full">
          <div className="w-full md:w-2/3 flex flex-col">
            <h2 className="text-left text-2xl sm:text-3xl font-bold border-b-2 border-white pb-2 mb-4">Política de Calidad</h2>
            <p className="text-neutral-300 text-base sm:text-lg leading-relaxed mb-6">
              En GONNI, nuestro compromiso es ofrecer una gran variedad de refacciones
              automotrices, proporcionando un servicio de calidad basado en el crecimiento,
              desarrollo y satisfacción de nuestros clientes.
            </p>
            <h3 className="text-lg sm:text-xl font-semibold mb-4 ">Objetivos de Calidad</h3>
            <ul className="space-y-4">
              <li className="flex items-start sm:items-center gap-4">
                <div className="flex-shrink-0 p-2 bg-neutral-900 rounded-xl border border-neutral-800 shadow-inner">
                  <RiUserHeartLine size={24} />
                </div>
                <span className="text-base sm:text-lg text-neutral-300">
                  Incrementar la satisfacción de nuestros clientes.
                </span>
              </li>
              <li className="flex items-start sm:items-center gap-4">
                <div className="flex-shrink-0 p-2 bg-neutral-900 rounded-xl border border-neutral-800 shadow-inner">
                  <HiTrendingUp size={24} />
                </div>
                <span className="text-base sm:text-lg text-neutral-300">
                  Incrementar nuestra participación en el mercado de automotores.
                </span>
              </li>
              <li className="flex items-start sm:items-center gap-4">
                <div className="flex-shrink-0 p-2 bg-neutral-900 rounded-xl border border-neutral-800 shadow-inner">
                  <RiTeamLine size={24} />
                </div>
                <span className="text-base sm:text-lg text-neutral-300">
                  Incrementar la satisfacción de los colaboradores.
                </span>
              </li>
            </ul>
          </div>
          <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-6 rounded-2xl self-stretch shadow-inner">
            <Image
              src="/garantia.png"
              alt="Certificado de Calidad"
              width={200}
              height={200}
              className="w-35 h-20 md:w-60 md:h-35 drop-shadow-[0_8px_20px_rgba(220,38,38,0.15)] hover:scale-105 transition-transform duration-300"
            />
            <h3 className="text-lg sm:text-xl font-extrabold  mt-4 tracking-wide uppercase">Garantía</h3>
            <div className="w-8 h-1 bg-white rounded mt-1.5 mb-2"></div>
            <p className="text-center text-sm sm:text-xs font-bold text-white/90">
              6 Meses de Garantía
            </p>
            <p className="text-center text-xs font-medium text-neutral-400 mt-1 max-w-[200px]">
              A partir de la fecha de entrega
            </p>
          </div>
        </div>
        <p className="text-center text-[10px] sm:text-xs text-neutral-500/80 font-medium tracking-wider uppercase">
          * Aplican restricciones para la garantía en partes eléctricas
        </p>
      </div>
    </section>
  );
}
