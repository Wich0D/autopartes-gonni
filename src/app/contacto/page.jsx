import ContactForm from "@/components/ContactPage/ContactForm";

export const metadata = {
    title: "Contacto y Cotizaciones",
    description: "Ponte en contacto con Autopartes GONNI. Cotiza tus refacciones de forma personalizada o visítanos directamente en nuestra sucursal.",
};

export default function ContactPage() {
    return (
        <div className="w-full min-h-[calc(100vh-6rem)] py-12 flex flex-col justify-center items-center bg-[url('/bg-textures/fondo_carbono.jpg')] bg-cover bg-center bg-no-repeat text-white px-4">
            <section className="backdrop-blur-md bg-black/50 border border-neutral-800/80 px-6 sm:px-8 py-8 sm:py-10 rounded-3xl flex flex-col items-center max-w-lg w-full shadow-2xl transition-all duration-300
            border-white/20 border-2">
                <span className="border-white/40 border-2 text-white/40  px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(239,68,68,0.08)]">
                    No te quedes con dudas
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2 text-center">
                    Mándanos un mensaje
                </h1>
                <p className="text-neutral-400 text-xs sm:text-sm text-center mb-6 max-w-xs">
                    Completa el formulario para abrir una plantilla con tu cotización lista para enviar desde tu Gmail.
                </p>

                <ContactForm />
            </section>
        </div>
    );
}