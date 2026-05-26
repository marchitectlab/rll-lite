
import React, { useState, useRef } from 'react';
import { Player, CompletedQuest, DungeonHistoryEntry, Achievement, Difficulty, Inventory, ShopItem } from '../types';
import { XP_PER_DIFFICULTY, DUNGEONS } from '../constants';

interface ReportExportProps {
    player: Player;
    completedQuests: CompletedQuest[];
    dungeonHistory: DungeonHistoryEntry[];
    achievements: Record<string, Achievement>;
    inventory: Inventory;
    onUpgradePro: () => void;
}

type ReportType = 'daily' | 'monthly' | 'stats';
type AspectRatio = 'square' | 'landscape' | 'portrait';

const RESOLUTION = 4;

const RANK_COLORS: Record<string, string> = {
    E: '#9ca3af',
    D: '#4ade80',
    C: '#fb923c',
    B: '#818cf8',
    A: '#c084fc',
    S: '#facc15',
    'S+': '#ff0000',
    X: '#ff0000'
};

export const ReportExport: React.FC<ReportExportProps> = ({ player, completedQuests, dungeonHistory, inventory, onUpgradePro }) => {
    const [reportType, setReportType] = useState<ReportType>('daily');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('landscape');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isGenerating, setIsGenerating] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const truncateText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
        let width = ctx.measureText(text).width;
        if (width <= maxWidth) return text;
        let truncated = text;
        while (width > maxWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
            width = ctx.measureText(truncated + '...').width;
        }
        return truncated + '...';
    };

    const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
        if (ctx.measureText(text).width < maxWidth) return [text];
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    };

    const getReportActivities = (dateStr: string) => {
        const quests = completedQuests.filter(q => q.completedAt.startsWith(dateStr));
        const dungeons = dungeonHistory.filter(d => {
            const dDate = new Date(d.completedAt).toISOString().split('T')[0];
            return dDate === dateStr && d.status === 'cleared';
        });
        
        let totalXp = quests.reduce((sum, q) => sum + (XP_PER_DIFFICULTY[q.difficulty] || 0), 0);
        dungeons.forEach(d => {
            const dData = DUNGEONS.find(dd => dd.id === d.id);
            totalXp += dData?.rewards?.xp || 0;
        });

        return { quests, dungeons, totalXp };
    };

    const drawReport = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        setIsGenerating(true);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let baseWidth = 1920;
        let baseHeight = 1080;

        if (aspectRatio === 'square') { baseWidth = 1080; baseHeight = 1080; }
        else if (aspectRatio === 'portrait') { baseWidth = 1080; baseHeight = 1920; }

        canvas.width = baseWidth * RESOLUTION;
        canvas.height = baseHeight * RESOLUTION;
        ctx.scale(RESOLUTION, RESOLUTION);

        // --- BACKGROUND ---
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, baseWidth, baseHeight);

        const gradient = ctx.createLinearGradient(0, 0, 0, baseHeight);
        gradient.addColorStop(0, 'rgba(15, 23, 42, 0.5)');
        gradient.addColorStop(1, 'rgba(2, 6, 23, 1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, baseWidth, baseHeight);

        // HUD Border
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(40, 40, baseWidth - 80, baseHeight - 80);

        // Scanlines simulation
        ctx.fillStyle = 'rgba(56, 189, 248, 0.02)';
        for (let i = 0; i < baseHeight; i += 4) {
            ctx.fillRect(0, i, baseWidth, 1);
        }

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';

        if (reportType === 'stats') {
            ctx.font = 'bold 42px Orbitron, sans-serif';
            ctx.fillStyle = '#38bdf8';
            ctx.fillText('SYSTEM STATUS OVERVIEW', 100, 110);

            ctx.font = 'bold 84px Orbitron, sans-serif';
            ctx.fillStyle = '#fff';
            ctx.fillText(truncateText(ctx, player.name.toUpperCase(), baseWidth * 0.5), 100, 220);

            ctx.font = 'bold 36px Orbitron, sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(`SYNCHRONIZATION LEVEL: ${player.level}`, 100, 290);
            
            ctx.font = 'bold 72px Orbitron, sans-serif';
            ctx.fillStyle = RANK_COLORS[player.rank] || '#fff';
            ctx.fillText(`RANK: ${player.rank}`, 100, 400);

            // Attributes
            ctx.font = 'bold 32px Orbitron, sans-serif';
            ctx.fillStyle = '#60a5fa';
            let yPos = 560;
            Object.entries(player.attributes).forEach(([key, val]) => {
                ctx.textAlign = 'left';
                ctx.fillText(key.toUpperCase(), 100, yPos);
                ctx.fillStyle = '#fff';
                ctx.fillText(`${val}`, 380, yPos);
                ctx.fillStyle = '#60a5fa';
                yPos += 70;
            });

            // Equipment List (Right side)
            ctx.textAlign = 'right';
            ctx.font = 'bold 32px Orbitron, sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('ACTIVE LOADOUT', baseWidth - 100, 560);
            let eqY = 630;
            ctx.font = '26px Orbitron, sans-serif';
            (Object.entries(inventory.equipment) as [string, ShopItem | null][]).forEach(([slot, item]) => {
                if (item) {
                   ctx.fillStyle = RANK_COLORS[item.rank] || '#fff';
                   ctx.fillText(`${slot.toUpperCase()}: ${truncateText(ctx, item.name, 450)}`, baseWidth - 100, eqY);
                   eqY += 50;
                }
            });

        } else if (reportType === 'daily') {
            const data = getReportActivities(selectedDate);
            const dateObj = new Date(selectedDate);

            ctx.font = 'bold 42px Orbitron, sans-serif';
            ctx.fillStyle = '#38bdf8';
            ctx.fillText('DAILY SYNCHRONIZATION LOG', 100, 110);

            ctx.font = '28px Orbitron, sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase(), 100, 165);

            ctx.font = 'bold 84px Orbitron, sans-serif';
            ctx.fillStyle = '#22c55e';
            ctx.fillText('COMPLETE', 100, 310);

            ctx.font = 'bold 42px Orbitron, sans-serif';
            ctx.fillStyle = '#fff';
            ctx.fillText(`TOTAL YIELD: ${data.totalXp} XP`, 100, 390);

            ctx.font = 'bold 32px Orbitron, sans-serif';
            ctx.fillStyle = '#38bdf8';
            ctx.fillText('CLEAR RECORDS:', 100, 510);

            let qY = 580;
            ctx.font = '24px Orbitron, sans-serif';
            const allActivities = [...data.quests.map(q => ({ text: `[${q.difficulty}] ${q.name}`, color: RANK_COLORS[q.difficulty] })), 
                                   ...data.dungeons.map(d => ({ text: `[${d.grade}] GATE: ${d.name}`, color: RANK_COLORS[d.grade] }))];
            
            allActivities.slice(0, 12).forEach(act => {
                ctx.fillStyle = act.color || '#cbd5e1';
                const lines = wrapText(ctx, `> ${act.text}`, baseWidth - 250);
                lines.forEach(line => {
                    if (qY < baseHeight - 120) {
                        ctx.fillText(line, 120, qY);
                        qY += 45;
                    }
                });
            });

            // Watermark
            ctx.save();
            ctx.globalAlpha = 0.02;
            ctx.textAlign = 'right';
            ctx.font = 'bold 600px Orbitron, sans-serif';
            ctx.fillStyle = RANK_COLORS[player.rank];
            ctx.fillText(player.rank, baseWidth - 40, baseHeight - 40);
            ctx.restore();
        } else if (reportType === 'monthly') {
             const date = new Date(selectedDate);
             const year = date.getFullYear();
             const month = date.getMonth();
             const monthName = date.toLocaleString('default', { month: 'long' }).toUpperCase();

             ctx.font = 'bold 42px Orbitron, sans-serif';
             ctx.fillStyle = '#38bdf8';
             ctx.fillText(`${monthName} ${year} ARCHIVE`, 100, 110);

             const daysInMonth = new Date(year, month + 1, 0).getDate();
             const firstDay = new Date(year, month, 1).getDay();
             const padding = firstDay === 0 ? 6 : firstDay - 1;

             const gridX = 100;
             const gridY = 240;
             const cellSizeX = (baseWidth - 200) / 7;
             const cellSizeY = (baseHeight - 380) / 6;

             ctx.font = 'bold 24px Orbitron, sans-serif';
             ctx.fillStyle = '#60a5fa';
             ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].forEach((d, i) => {
                 ctx.fillText(d, gridX + i * cellSizeX + 15, gridY - 25);
             });

             for (let day = 1; day <= daysInMonth; day++) {
                 const x = gridX + ((day + padding - 1) % 7) * cellSizeX;
                 const y = gridY + Math.floor((day + padding - 1) / 7) * cellSizeY;

                 const dStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                 const dayData = getReportActivities(dStr);
                 
                 ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
                 ctx.strokeRect(x, y, cellSizeX - 15, cellSizeY - 15);
                 
                 if (dayData.totalXp > 0) {
                     ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
                     ctx.fillRect(x, y, cellSizeX - 15, cellSizeY - 15);
                     ctx.fillStyle = '#38bdf8';
                     ctx.font = 'bold 18px Orbitron, sans-serif';
                     ctx.fillText(`+${dayData.totalXp} XP`, x + 15, y + cellSizeY - 35);
                 }

                 ctx.fillStyle = '#475569';
                 ctx.font = 'bold 22px Orbitron, sans-serif';
                 ctx.fillText(`${day}`, x + 15, y + 35);
             }
        }

        // Footer
        ctx.textAlign = 'center';
        ctx.font = 'bold 18px Orbitron, sans-serif';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.fillText('R.L.L SYSTEM REPORT', baseWidth / 2, baseHeight - 60);

        const dataURL = canvas.toDataURL('image/png');
        const fileName = `Report_${reportType}_${selectedDate}.png`;
        const isNative = (window as any).Capacitor?.isNativePlatform();

        if (isNative) {
            try {
                const { Filesystem, Directory } = await import('@capacitor/filesystem');
                const { Share } = await import('@capacitor/share');
                // Strip data URL prefix — write raw base64 WITHOUT encoding param (binary file)
                const base64Data = dataURL.split(',')[1];
                await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Cache,
                });
                const fileUri = await Filesystem.getUri({
                    directory: Directory.Cache,
                    path: fileName,
                });
                await Share.share({
                    title: 'R.L.L System Report',
                    text: 'Your R.L.L progress report',
                    url: fileUri.uri,
                    dialogTitle: 'Save your Report',
                });
            } catch (e) {
                console.error('Error exporting report on Android', e);
            }
        } else {
            const link = document.createElement('a');
            link.download = fileName;
            link.href = dataURL;
            link.click();
        }
        setIsGenerating(false);
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-blue-500/30 p-8 rounded-lg shadow-2xl max-w-4xl mx-auto scanline-effect">
            <h2 className="font-orbitron text-2xl text-blue-300 mb-8 border-b border-blue-500/20 pb-4 uppercase font-black tracking-widest neon-text">SYSTEM REPORTS</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
                <div className="space-y-8">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.3em]">Report Classification</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['daily', 'monthly', 'stats'] as ReportType[]).map(t => (
                                <button key={t} onClick={() => setReportType(t)} className={`font-orbitron p-3 text-[9px] border rounded-sm transition-all font-black tracking-widest uppercase ${reportType === t ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(56,189,248,0.4)]' : 'border-slate-700 text-slate-500 hover:border-blue-500/50 hover:text-blue-300'}`}>{t}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.3em]">Dimensions</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['landscape', 'square', 'portrait'] as AspectRatio[]).map(r => (
                                <button key={r} onClick={() => setAspectRatio(r)} className={`font-orbitron p-3 text-[9px] border rounded-sm transition-all font-black tracking-widest uppercase ${aspectRatio === r ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(56,189,248,0.4)]' : 'border-slate-700 text-slate-500 hover:border-blue-500/50 hover:text-blue-300'}`}>{r}</button>
                            ))}
                        </div>
                    </div>
                    {reportType !== 'stats' && (
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.3em]">Temporal Marker</label>
                            <input type={reportType === 'daily' ? 'date' : 'month'} value={reportType === 'daily' ? selectedDate : selectedDate.slice(0, 7)} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-sm p-3 font-orbitron text-[11px] text-blue-400 focus:outline-none focus:border-blue-500/50 uppercase tracking-widest" />
                        </div>
                    )}
                </div>
                <div className="flex flex-col justify-center items-center p-8 bg-slate-950/40 rounded-sm border border-slate-800 text-center">
                    <div className="space-y-3 w-full">
                        <button onClick={onUpgradePro} className="w-full font-orbitron bg-blue-700/80 text-white py-5 rounded-sm uppercase font-black text-xs tracking-[0.4em] hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] transition-all border border-blue-400/30">
                            INITIATE RENDER
                        </button>
                        <div className="flex items-center justify-center gap-2 text-[9px] font-orbitron font-black text-yellow-500/60 uppercase tracking-widest">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            <span>Pro feature</span>
                        </div>
                    </div>
                </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};
