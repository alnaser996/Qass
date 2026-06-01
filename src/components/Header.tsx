import React from "react";
import { ListFilter, Sparkles, Database, Download, Upload, Trash2, ShieldCheck, Scale, Sun, Moon } from "lucide-react";

interface HeaderProps {
  onImportDemo: () => void;
  onClearData: () => void;
  onExportJSON: () => void;
  onImportJSON: (event: React.ChangeEvent<HTMLInputElement>) => void;
  recordCount: { casting: number; treeCasting: number; rolling: number; production: number };
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onImportDemo,
  onClearData,
  onExportJSON,
  onImportJSON,
  recordCount,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="bg-gradient-to-b from-[#111] to-[#0a0a0a] border-b border-[#222] text-[#e0e0e0] py-7 px-4 md:px-8 shadow-2xl relative overflow-hidden">
      {/* Sleek top ambient glow line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#C5A028] to-transparent opacity-80" />
      
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-6 relative z-10">
        {/* Title and Branding */}
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-right">
          <div className="p-3.5 bg-gradient-to-br from-[#d4af37] to-[#aa8010] rounded-xl shadow-[0_0_20px_rgba(197,160,40,0.25)] flex items-center justify-center border border-yellow-500/30">
            <Scale className="w-9 h-9 text-black stroke-[1.75]" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="text-[10px] uppercase tracking-wider bg-[#C5A028]/10 text-[#C5A028] border border-[#C5A028]/35 px-2.5 py-0.5 rounded-full font-bold">
                إدارة الجرد والرقابة الفنية
              </span>
              <span className="text-[10px] bg-neutral-900 text-neutral-400 border border-neutral-800 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A028]" /> تخزين محلي مشفر تلقائياً
              </span>
            </div>
            <h1 className="text-2xl md:text-3.5xl font-extrabold text-[#C5A028] tracking-tight mt-1 bg-gradient-to-l from-yellow-400 via-amber-200 to-yellow-600 bg-clip-text text-transparent drop-shadow-sm font-sans">
              جرد نقيصة معمل قاسم العبسلي
            </h1>
            <p className="text-[#999] text-xs md:text-sm max-w-2xl leading-relaxed">
              نظام الرقابة والتدقيق الاحترافي المطور لتتبع وحساب عجز ونقيصة الذهب بدقة مطلقة عبر دورة التصنيع الكاملة: من الصهر المبدئي وصب الحبات الشجرية مروراً بالدرفلة وتصليح الفاكيوم وصولاً للمشغولات النهائية الجاهزة للتسليم.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onToggleTheme}
            className="flex items-center justify-center p-2 bg-[#1a1a1a] hover:bg-neutral-800 text-[#C5A028] border border-[#2a2a2a] rounded cursor-pointer transition-all duration-200"
            title={theme === "light" ? "التحول إلى الوضع الداكن (أسود)" : "التحول إلى الوضع المضيء (أبيض)"}
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button
            onClick={onImportDemo}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#C5A028] hover:text-[#0a0a0a] text-[#C5A028] border border-[#333] rounded text-sm transition-all shadow-sm font-medium group cursor-pointer"
            title="تحميل البيانات التجريبية المماثلة لدفاتر الورشة"
          >
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>بيانات الدفتر التجريبية</span>
          </button>

          <button
            onClick={onExportJSON}
            className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] hover:bg-[#C5A028] hover:text-[#0a0a0a] text-[#888] hover:text-[#0a0a0a] border border-[#2a2a2a] rounded text-sm transition-all cursor-pointer"
            title="تصدير نسخة احتياطية من جميع السجلات"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">حفظ نسخة احتياطية</span>
          </button>

          <label className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] hover:bg-[#C5A028] hover:text-[#0a0a0a] text-[#888] hover:text-[#0a0a0a] border border-[#2a2a2a] rounded text-sm transition-all cursor-pointer">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">استعادة نسخة</span>
            <input
              type="file"
              accept=".json"
              onChange={onImportJSON}
              className="hidden"
            />
          </label>

          <button
            onClick={onClearData}
            className="flex items-center gap-2 px-3 py-2 bg-rose-950/20 hover:bg-rose-900/40 text-rose-400 border border-rose-900/40 rounded text-sm transition-all cursor-pointer"
            title="مسح جميع السجلات الحالية لبدء دفتر جديد"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">تصفير الدفتر</span>
          </button>
        </div>
      </div>

      {/* Mini Stats Banner */}
      <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-[#2a2a2a] grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-[#141414] rounded p-2.5 border border-[#2a2a2a]">
          <span className="block text-xs text-[#888] font-medium">سجلات السبك والصهر</span>
          <span className="text-xl font-bold text-[#e0e0e0] font-mono mt-0.5 block">
            {recordCount.casting}
          </span>
        </div>
        <div className="bg-[#141414] rounded p-2.5 border border-[#2a2a2a]">
          <span className="block text-xs text-[#888] font-medium font-serif">صبات الشجرة المصبوبة</span>
          <span className="text-xl font-bold text-[#C5A028] font-mono mt-0.5 block">
            {recordCount.treeCasting}
          </span>
        </div>
        <div className="bg-[#141414] rounded p-2.5 border border-[#2a2a2a]">
          <span className="block text-xs text-[#888] font-medium">سجلات التفجير والتصليح والفاكيوم</span>
          <span className="text-xl font-bold text-[#e0e0e0] font-mono mt-0.5 block">
            {recordCount.rolling}
          </span>
        </div>
        <div className="bg-[#141414] rounded p-2.5 border border-[#2a2a2a]">
          <span className="block text-xs text-[#888] font-medium">سجلات وجبات الصياغة</span>
          <span className="text-xl font-bold text-[#e0e0e0] font-mono mt-0.5 block">
            {recordCount.production}
          </span>
        </div>
      </div>
    </header>
  );
};
