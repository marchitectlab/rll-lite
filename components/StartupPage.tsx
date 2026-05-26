import React from 'react';

interface StartupPageProps {
    onEnter: () => void;
    onLoginPress?: () => void;
    userEmail?: string;
}

const StartupPage: React.FC<StartupPageProps> = ({ onEnter, onLoginPress, userEmail }) => {
    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{
            backgroundImage: `radial-gradient(circle at top, rgba(37, 99, 235, 0.15), transparent), radial-gradient(circle at bottom, rgba(8, 145, 178, 0.1), transparent)`
        }}>
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            
            <div className="text-center mb-16 relative z-10">
                <h1 className="font-orbitron text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-500 uppercase tracking-tighter" 
                    style={{ filter: 'drop-shadow(0 0 20px rgba(56, 189, 248, 0.5))' }}>
                    REAL LIFE<br/>LEVELING
                </h1>
                <div className="h-1 w-32 bg-blue-500 mx-auto mt-4 rounded-full shadow-[0_0_10px_#3b82f6]"></div>
                <p className="mt-8 text-lg text-blue-300/60 font-orbitron tracking-widest uppercase animate-pulse">Initializing System...</p>
            </div>

            <div className="flex flex-col space-y-4 w-full max-w-sm relative z-10">
                <button 
                    onClick={onEnter} 
                    className="glass-panel font-orbitron text-2xl uppercase tracking-widest font-black text-white bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500 px-8 py-5 rounded-sm shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(56,189,248,0.5)] transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-500 border border-blue-400/50"
                >
                    PROCEED
                </button>

                {userEmail ? (
                    <div className="text-center pt-1">
                        <p className="font-orbitron text-[9px] text-blue-400/60 uppercase tracking-widest truncate">
                            Linked: {userEmail}
                        </p>
                    </div>
                ) : onLoginPress ? (
                    <button
                        onClick={onLoginPress}
                        className="font-orbitron text-sm uppercase tracking-widest font-black text-blue-400 border border-blue-500/40 px-8 py-3 rounded-sm hover:bg-blue-500/10 hover:border-blue-400 transition-all duration-300"
                    >
                        LOGIN / REGISTER
                    </button>
                ) : null}
            </div>
            
            <footer className="absolute bottom-6 text-[10px] font-orbitron text-blue-500/40 tracking-widest uppercase">
                &copy; {new Date().getFullYear()} ARCHITECT SYSTEM // v2.1.0-FLAT
            </footer>
        </div>
    );
};

export default StartupPage;
