import React, { createContext, useContext, useState, useEffect } from 'react';

const FullscreenContext = createContext();

export const FullscreenProvider = ({ children }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            try {
                await document.documentElement.requestFullscreen();
            } catch (err) {
                console.error("Error al activar pantalla completa:", err);
            }
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    };

    const salirDePantallaCompleta = () => {
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    return (
        <FullscreenContext.Provider value={{ isFullscreen, toggleFullscreen, salirDePantallaCompleta }}>
            {children}
        </FullscreenContext.Provider>
    );
};

export const useFullscreen = () => useContext(FullscreenContext);