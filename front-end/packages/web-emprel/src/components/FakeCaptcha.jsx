import React, { useState, useEffect } from 'react';
import { FaSpinner, FaCheck } from 'react-icons/fa';

// NOVO: Importamos o SVG como uma URL, não como um componente.
// Removemos o sufixo "?react".
import captchaIconUrl from '../assets/icons/captcha-icon.svg';

const FakeCaptcha = ({ onChange, resetKey }) => {
    const [status, setStatus] = useState('initial');

    useEffect(() => {
        if (resetKey > 0) {
            setStatus('initial');
            onChange(false);
        }
    }, [resetKey, onChange]);

    const handleClick = () => {
        if (status !== 'initial') return;
        setStatus('loading');
        setTimeout(() => {
            setStatus('success');
            onChange(true);
        }, 1200);
    };

    const getBoxContent = () => {
        switch (status) {
            case 'loading':
                return <FaSpinner className="animate-spin text-blue-600" size={24} />;
            case 'success':
                return <FaCheck className="text-green-600" size={24} />;
            case 'initial':
            default:
                return <div className="w-6 h-6 border-2 border-gray-400 rounded-sm"></div>;
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div 
                className="flex items-center justify-between p-2 pl-3 bg-gray-100 border border-gray-300 rounded-md w-72 cursor-pointer select-none"
                onClick={handleClick}
            >
                <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8">
                        {getBoxContent()}
                    </div>
                    <span className="text-sm text-gray-800">I'm not a robot</span>
                </div>
                {/* ======================= INÍCIO DA CORREÇÃO ======================= */}
                {/* Agora usamos uma tag <img> com a URL importada */}
                <div className="flex flex-col items-center text-center">
                   <img 
                        src={captchaIconUrl}
                        alt="Ícone do CAPTCHA"
                        className="w-8 h-8"
                    />
                   <p className="text-[10px] text-gray-500">FakeCAPTCHA</p>
                </div>
                {/* ======================== FIM DA CORREÇÃO ========================= */}
            </div>
        </div>
    );
};

export default FakeCaptcha;