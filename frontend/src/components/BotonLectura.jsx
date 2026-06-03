import { useState, useEffect } from 'react';

const BotonLectura = ({ texto, onStateChange, className, speakingClassName }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const toggleVoz = (e) => {
        // Evitamos que el clic se propague si está dentro de otro botón/enlace
        if (e) e.stopPropagation(); 

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            if (onStateChange) onStateChange(false);
        } else {
            window.speechSynthesis.cancel(); 
            const utterance = new SpeechSynthesisUtterance(texto);
            utterance.lang = 'es-MX';
            utterance.rate = 1;

            utterance.onend = () => {
                setIsSpeaking(false);
                if (onStateChange) onStateChange(false);
            };
            
            utterance.onerror = () => {
                setIsSpeaking(false);
                if (onStateChange) onStateChange(false);
            };

            setIsSpeaking(true);
            if (onStateChange) onStateChange(true);
            window.speechSynthesis.speak(utterance);
        }
    };

    useEffect(() => {
        return () => {
            if (isSpeaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, [isSpeaking]);

    return (
        <button
            type="button"
            className={`${className} ${isSpeaking ? speakingClassName : ''}`}
            onClick={toggleVoz}
            title={isSpeaking ? "Detener lectura" : "Escuchar anuncio"}
        >
            {isSpeaking ? (
                <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ width: '24px', height: '24px' }}>
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                    </svg>
                    <span>Detener lectura</span>
                </>
            ) : (
                <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ width: '24px', height: '24px' }}>
                        <path d="M11 5L6 9H2V15H6L11 19V5Z" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                    <span>Escuchar anuncio</span>
                </>
            )}
        </button>
    );
};

export default BotonLectura;