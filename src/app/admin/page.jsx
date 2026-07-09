"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/utils/supabase";

export default function AdminPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        async function checkSession() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    router.push("/admin/panel");
                } else {
                    setCheckingSession(false);
                }
            } catch (err) {
                console.error("Error checking session:", err);
                setCheckingSession(false);
            }
        }
        checkSession();
    }, [router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                setError(authError.message === "Invalid login credentials"
                    ? "Credenciales incorrectas. Por favor, verifica tu correo y contraseña."
                    : authError.message
                );
                setLoading(false);
            } else {
                router.push("/admin/panel");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Ocurrió un error inesperado. Inténtalo de nuevo.");
            setLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <div className="w-full min-h-[60vh] flex flex-col justify-center items-center gap-4 text-white">
                <div className="w-12 h-12 border-4 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <p className="text-neutral-400 font-medium">Verificando sesión...</p>
            </div>
        );
    }

    return (
        <div className="w-full md:min-h-screen flex justify-center items-center p-4">
            <div className="bg-black border border-neutral-900 px-8 py-12 md:px-10 md:py-14 rounded-3xl flex flex-col items-center justify-center gap-4 text-white w-full max-w-[420px] shadow-2xl transition-all duration-300 hover:shadow-red-950/20 hover:border-neutral-800">
                <div className="w-full flex justify-end items-center mb-2">
                    <span className="bg-white/30 text-white/80 px-3 py-2 rounded-full text-xs font-semibold">
                        Admin
                    </span>
                </div>



                <Image
                    src="/gonni_logo.png"
                    alt="Logo"
                    width={160}
                    height={160}
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                    priority
                />


                <h1 className="text-2xl font-bold tracking-tight mt-2">Inicia Sesión</h1>
                <p className="text-sm text-neutral-400 text-center mb-2">
                    Ingresa tus credenciales de administrador para continuar al panel.
                </p>

                {error && (
                    <div className="w-full bg-red-950/40 border border-red-900/50 text-red-400 p-3 rounded-lg text-sm flex items-start gap-2 animate-fadeIn">
                        <svg className="w-5 h-5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                            Email:
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="correo@ejemplo.com"
                            className="bg-neutral-900/50 border border-neutral-800 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all duration-200 placeholder-neutral-600"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="password" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                            Contraseña:
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="bg-neutral-900/50 border border-neutral-800 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all duration-200 placeholder-neutral-600"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black py-2.5 rounded-xl font-bold cursor-pointer hover:bg-neutral-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-2 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Iniciando sesión...</span>
                            </>
                        ) : (
                            <span>Iniciar Sesión</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
