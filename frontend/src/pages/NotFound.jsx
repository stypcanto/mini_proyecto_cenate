import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
    const canvasRef = useRef(null);

    // 🌌 Partículas flotantes tipo "espacio"
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const particles = Array.from({ length: 100 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 2 + 1,
            dx: (Math.random() - 0.5) * 0.5,
            dy: (Math.random() - 0.5) * 0.5,
        }));

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = "rgba(255,255,255,0.7)";
            particles.forEach((p) => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();

                p.x += p.dx;
                p.y += p.dy;

                if (p.x < 0 || p.x > width) p.dx *= -1;
                if (p.y < 0 || p.y > height) p.dy *= -1;
            });
            requestAnimationFrame(draw);
        };

        draw();

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#030b20] via-[#081a3c] to-[#030b20] text-white">
            {/* 🌌 Canvas de partículas */}
            <canvas ref={canvasRef} className="absolute inset-0 -z-10"></canvas>

            {/* 💥 Texto principal */}
            <h1 className="text-[8rem] md:text-[11rem] font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 animate-pulse drop-shadow-2xl">
                404
            </h1>

            {/* ⚠️ Mensaje descriptivo */}
            <div className="text-center mt-6 space-y-3">
                <div className="flex justify-center">
                    <AlertTriangle className="w-12 h-12 text-yellow-400 animate-bounce" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">Oops... ¡Página no encontrada!</h2>
                <p className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
                    Te perdiste en el universo digital 🌌 <br /> No te preocupes, hay una ruta
                    de regreso segura.
                </p>
            </div>

            {/* 🚀 Botón para volver */}
            <div className="mt-10">
                <Link
                    to="/"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 hover:shadow-cyan-400/30"
                >
                    <Home className="w-5 h-5" />
                    Volver al inicio
                </Link>
            </div>

            {/* ✨ Pie cósmico */}
            <div className="absolute bottom-8 text-sm text-gray-400 opacity-70 text-center">
                © {new Date().getFullYear()} CENATE · Explorando el infinito digital 🚀
            </div>
        </div>
    );
};

export default NotFound;