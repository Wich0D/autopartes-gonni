import { FaWhatsapp, FaEnvelope, FaClock, FaMapMarkerAlt } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="w-full bg-neutral-950 text-white border-t border-neutral-900 pt-16 pb-8 flex flex-col items-center">
            <div className="w-full max-w-7xl px-6 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
                {/* Contacto */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-white relative after:content-[''] after:absolute after:w-12 after:h-[2px] after:bg-red-600 after:bottom-[-6px] after:left-0">
                        Contacto
                    </h3>
                    <div className="mt-4 flex flex-col gap-3">
                        <a 
                            href="https://wa.me/525651824849" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors duration-300 group w-fit"
                        >
                            <div className="p-2 bg-neutral-900 rounded-lg group-hover:bg-green-600/20 group-hover:text-green-500 transition-colors duration-300">
                                <FaWhatsapp size={18} />
                            </div>
                            <span className="text-sm">+52 56 5182 4849</span>
                        </a>
                        <a 
                            href="mailto:autopartesgonni@gmail.com" 
                            className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors duration-300 group w-fit"
                        >
                            <div className="p-2 bg-neutral-900 rounded-lg group-hover:bg-red-600/20 group-hover:text-red-500 transition-colors duration-300">
                                <FaEnvelope size={18} />
                            </div>
                            <span className="text-sm">autopartesgonni@gmail.com</span>
                        </a>
                    </div>
                </div>

                {/* Horario de Atención */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-white relative after:content-[''] after:absolute after:w-12 after:h-[2px] after:bg-red-600 after:bottom-[-6px] after:left-0">
                        Horario de atención
                    </h3>
                    <div className="mt-4 flex flex-col gap-4">
                        <div className="flex items-start gap-3 text-neutral-400">
                            <div className="p-2 bg-neutral-900 rounded-lg">
                                <FaClock size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Lunes a viernes</span>
                                <span className="text-sm text-neutral-300 mt-0.5">9:00 AM - 6:00 PM</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 text-neutral-400">
                            <div className="p-2 bg-neutral-900 rounded-lg">
                                <FaClock size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Sábados</span>
                                <span className="text-sm text-neutral-300 mt-0.5">9:00 AM - 3:00 PM</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ubicación */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-white relative after:content-[''] after:absolute after:w-12 after:h-[2px] after:bg-red-600 after:bottom-[-6px] after:left-0">
                        Ubicación
                    </h3>
                    <div className="mt-4 flex flex-col gap-4">
                        <div className="flex gap-3 text-neutral-400">
                            <div className="shrink-0 p-2 bg-neutral-900 rounded-lg h-fit">
                                <FaMapMarkerAlt size={16} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-neutral-300 font-bold uppercase">FOTON VILLAHERMOSA (GRUPO GRUMARMEX)</span>
                                <span className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                                    AV. UNIVERSIDAD S/N, ESQ, Av de La Ceibas, Magisterial, 86040 Villahermosa, Tab.
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3 text-neutral-400">
                            <div className="shrink-0 p-2 bg-neutral-900 rounded-lg h-fit">
                                <FaMapMarkerAlt size={16} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-neutral-300 font-bold uppercase">FIAT CHRYSLER STELLANTIS (GRUPO GRUMARMEX)</span>
                                <span className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                                    Libramiento Sur Poniente Km 0700 Tapachula, 30798 Córdoba, Chis.
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3 text-neutral-400">
                            <div className="shrink-0 p-2 bg-neutral-900 rounded-lg h-fit">
                                <FaMapMarkerAlt size={16} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-neutral-300 font-bold uppercase">GWM TLALNEPANTLA (GRUPO SATELITE)</span>
                                <span className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                                    Av Mario Colin 320, Centro Industrial Tlalnepantla, 54030 Tlalnepantla, Méx
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3 text-neutral-400">
                            <div className="shrink-0 p-2 bg-neutral-900 rounded-lg h-fit">
                                <FaMapMarkerAlt size={16} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-neutral-300 font-bold uppercase">HERTZ AVASA</span>
                                <span className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                                    AV. PRESIDENTE MAZARYK 61 302, POLANCO IV SECCION, 11550 Mexico, Ciudad de México.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full max-w-7xl px-6 md:px-8 mt-12 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-neutral-500 text-sm text-center sm:text-left">
                    © {new Date().getFullYear()} Gonni Autopartes. Todos los derechos reservados.
                </p>
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span>Confianza y Calidad Automotriz</span>
                </div>
            </div>
        </footer>
    );
}