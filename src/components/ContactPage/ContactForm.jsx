"use client";

import { useState } from "react";
import { FaPaperPlane, FaWhatsapp } from "react-icons/fa";

export default function ContactForm() {
  const [nombre, setNombre] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!nombre.trim() || !asunto.trim() || !mensaje.trim()) {
      alert("Por favor, completa todos los campos del formulario.");
      return;
    }

    const toEmail = "autopartesgonni@gmail.com";
    const subjectLine = `Contacto Web: ${asunto}`;
    
    const emailBody = `Hola Autopartes GONNI,

He enviado un mensaje a través del formulario de contacto de la página web:

• Nombre del Cliente: ${nombre}
• Asunto: ${asunto}

Detalle del Mensaje:
--------------------------------------------------
${mensaje}
--------------------------------------------------

Quedo atento a sus comentarios. Saludos cordiales.`;

    // URL directa para abrir el redactor de Gmail
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmail)}&su=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(emailBody)}`;
    
    // Abrir en pestaña nueva
    window.open(gmailUrl, "_blank");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 mt-2">
      {/* Nombre */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-neutral-300 tracking-wide" htmlFor="name">
          Nombre Completo
        </label>
        <input
          id="name"
          type="text"
          placeholder="Escribe tu nombre..."
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-neutral-900/60 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all duration-200 text-sm"
        />
      </div>

      {/* Asunto */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-neutral-300 tracking-wide" htmlFor="subject">
          Asunto del mensaje
        </label>
        <input
          id="subject"
          type="text"
          placeholder="¿En qué podemos ayudarte?"
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-neutral-900/60 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all duration-200 text-sm"
        />
      </div>

      {/* Mensaje */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-neutral-300 tracking-wide" htmlFor="message">
          Tu Mensaje o Cotización
        </label>
        <textarea
          id="message"
          placeholder="Describe las autopartes que necesitas..."
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-neutral-900/60 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all duration-200 text-sm min-h-[120px] max-h-[240px] resize-y"
        />
      </div>

      {/* Botón de Enviar */}
      <button
        type="submit"
        className="w-full mt-2 py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(220,38,38,0.25)] hover:shadow-[0_0_30px_rgba(220,38,38,0.45)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer border border-red-500"
      >
        <FaPaperPlane size={14} />
        Enviar por Gmail
      </button>

      {/* Separador */}
      <div className="flex items-center justify-center my-1 w-full">
        <div className="h-[1px] bg-neutral-800 flex-1"></div>
        <span className="text-neutral-400 text-xs px-3 font-semibold uppercase tracking-wider">o</span>
        <div className="h-[1px] bg-neutral-800 flex-1"></div>
      </div>

      {/* Botón de WhatsApp */}
      <a
        href="https://wa.me/525651824849"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3.5 px-6 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(22,163,74,0.25)] hover:shadow-[0_0_30px_rgba(22,163,74,0.45)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer border border-green-500 text-center"
      >
        <FaWhatsapp size={18} />
        Contactar por WhatsApp
      </a>
    </form>
  );
}
