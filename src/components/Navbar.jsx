"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaSearch, FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <>
            <nav className="fixed top-0 left-0 w-full h-24 px-4 md:px-8 bg-black flex items-center justify-between shadow-md z-50" >
                {/* Mobile Menu Trigger */}
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden text-white p-2 hover:text-neutral-400 focus:outline-none transition-colors"
                    aria-label="Abrir menú"
                >
                    <FaBars size={24} />
                </button>

                {/* Logo - Centered on Mobile, Left on Desktop */}
                <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
                    <Link
                        href="/"
                        className="flex items-center"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <Image src={"/gonni_logo_2.png"} alt="Logo" width={100} height={100} priority className="h-16 w-auto object-contain" />
                    </Link>
                </div>

                {/* Desktop Navigation Links */}
                <ul className="hidden md:flex items-center gap-8 text-white list-none m-0 p-0 font-bold">
                    <li className="relative py-2 text-neutral-300 hover:text-white cursor-pointer transition-colors duration-300 after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-0 after:left-0 after:bg-white after:origin-center after:transition-transform after:duration-300 hover:after:scale-x-100">
                        <Link href="/">Inicio</Link>
                    </li>
                    <li className="relative py-2 text-neutral-300 hover:text-white cursor-pointer transition-colors duration-300 after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-0 after:left-0 after:bg-white after:origin-center after:transition-transform after:duration-300 hover:after:scale-x-100">
                        <Link href="/acercade">Acerca de</Link>
                    </li>
                    <li className="relative py-2 text-neutral-300 hover:text-white cursor-pointer transition-colors duration-300 after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-0 after:left-0 after:bg-white after:origin-center after:transition-transform after:duration-300 hover:after:scale-x-100">
                        <Link href="/catalogo">Catálogo</Link>
                    </li>
                    <li className="relative py-2 text-neutral-300 hover:text-white cursor-pointer transition-colors duration-300 after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-0 after:left-0 after:bg-white after:origin-center after:transition-transform after:duration-300 hover:after:scale-x-100">
                        <Link href="/contacto">Contacto</Link>
                    </li>
                    <li className="bg-white text-black/60 text-sm px-3 py-1 flex items-center gap-3 rounded-full">
                        <FaSearch size={20} className="cursor-pointer" />
                        <input type="text" placeholder="Busca un producto" className="w-40 h-8 rounded-sm px-2 border-none outline-none focus:ring-0" />
                    </li>
                </ul>

                {/* Mobile Search Toggle */}
                <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="md:hidden text-white p-2 hover:text-neutral-400 focus:outline-none transition-colors"
                    aria-label="Buscar producto"
                >
                    <FaSearch size={22} />
                </button>
            </nav>

            {/* Mobile Search Dropdown Overlay */}
            <div
                className={`fixed left-0 w-full bg-neutral-900 border-t border-neutral-800 shadow-lg z-40 transition-all duration-300 ease-in-out md:hidden ${isSearchOpen ? "top-24 opacity-100 visible py-4 px-4" : "top-12 opacity-0 invisible h-0 overflow-hidden"
                    }`}
            >
                <div className="relative flex items-center bg-white text-black/60 px-4 py-2 rounded-full shadow-inner">
                    <FaSearch size={18} className="text-neutral-500 mr-2" />
                    <input
                        type="text"
                        placeholder="Busca un producto..."
                        className="w-full bg-transparent border-none outline-none text-base placeholder-neutral-400 focus:ring-0 text-black"
                    />
                </div>
            </div>

            {/* Mobile Sidebar Back-drop */}
            <div
                onClick={() => setIsSidebarOpen(false)}
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
            />

            {/* Mobile Sidebar Panel */}
            <div
                className={`fixed top-0 left-0 w-72 h-full bg-neutral-950 text-white z-50 shadow-2xl transition-transform duration-300 ease-out transform md:hidden ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full p-6">
                    {/* Sidebar Header with Logo and Close Button */}
                    <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
                        <Link href="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center">
                            <Image src={"/gonni_logo_2.png"} alt="Logo" width={90} height={90} priority className="h-12 w-auto object-contain" />
                        </Link>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="text-neutral-400 hover:text-white focus:outline-none p-1 transition-colors"
                            aria-label="Cerrar menú"
                        >
                            <FaTimes size={22} />
                        </button>
                    </div>

                    {/* Navigation list */}
                    <ul className="flex flex-col gap-6 text-lg font-semibold list-none m-0 p-0 pt-8">
                        <li>
                            <Link
                                href="/"
                                onClick={() => setIsSidebarOpen(false)}
                                className="block py-2 text-neutral-300 hover:text-white transition-colors"
                            >
                                Inicio
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/acercade"
                                onClick={() => setIsSidebarOpen(false)}
                                className="block py-2 text-neutral-300 hover:text-white cursor-pointer transition-colors"
                            >
                                Acerca de
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/catalogo"
                                onClick={() => setIsSidebarOpen(false)}
                                className="block py-2 text-neutral-300 hover:text-white transition-colors"
                            >
                                Catálogo
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/contacto"
                                onClick={() => setIsSidebarOpen(false)}
                                className="block py-2 text-neutral-300 hover:text-white transition-colors"
                            >
                                Contacto
                            </Link>
                        </li>
                    </ul>

                    {/* Footer / Copyright in Sidebar */}
                    <div className="mt-auto pt-6 border-t border-neutral-800 text-neutral-500 text-xs text-center">
                        &copy; 2026 Autopartes GONNI
                    </div>
                </div>
            </div>
        </>
    );
}