import React, { useState } from "react";
import { RollingRecord } from "../types";
import {
  FilePlus2,
  Trash2,
  Calendar,
  Scale,
  Search,
  UploadCloud,
  Eye,
  EyeOff,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Layers,
  Wrench,
  Flame,
  Wind
} from "lucide-react";

interface RollingTabProps {
  records: RollingRecord[];
  onAddRecord: (record: Omit<RollingRecord, "id" | "loss">) => void;
  onDeleteRecord: (id: string) => void;
}

export const RollingTab: React.FC<RollingTabProps> = ({
  records,
  onAddRecord,
  onDeleteRecord,
}) => {
  // Current active stage selection in the registration form
  const [stageType, setStageType] = useState<"bombing" | "repair" | "vacuum">("bombing");

  // General fields
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [weightBefore, setWeightBefore] = useState<string>("");
  const [weightAfter, setWeightAfter] = useState<string>("");
  const [damagedWeight, setDamagedWeight] = useState<string>("");
  const [piecesCount, setPiecesCount] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Base64 Images
  const [image, setImage] = useState<string>("");
  const [damagedImage, setDamagedImage] = useState<string>("");

  // Search & Filters for tabular view
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStage, setFilterStage] = useState<"all" | "bombing" | "repair" | "vacuum">("all");
  
  // Image zoom preview state
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Parsing values
  const parsedBefore = parseFloat(weightBefore) || 0;
  const parsedAfter = parseFloat(weightAfter) || 0;
  const parsedDamaged = parseFloat(damagedWeight) || 0;
  const parsedPieces = parseInt(piecesCount) || 0;

  // Loss = (Before) - (After + Damaged)
  const computedLoss = parsedBefore - (parsedAfter + parsedDamaged);
  const computedLossPct = parsedBefore > 0 ? (Math.abs(computedLoss) / parsedBefore) * 100 : 0;

  // Image Upload helper
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "main" | "damaged"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "main") {
          setImage(reader.result as string);
        } else {
          setDamagedImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = (type: "main" | "damaged") => {
    if (type === "main") {
      setImage("");
    } else {
      setDamagedImage("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedBefore <= 0) {
      alert("الرجاء إدخال الوزن قبل العملية بشكل صحيح.");
      return;
    }
    if (parsedAfter <= 0) {
      alert("الرجاء إدخال الوزن بعد العملية بشكل صحيح.");
      return;
    }

    onAddRecord({
      stageType,
      date,
      weightBefore: parsedBefore,
      weightAfter: parsedAfter,
      damagedWeight: stageType !== "repair" ? parsedDamaged : undefined,
      damagedImage: stageType !== "repair" && damagedImage ? damagedImage : undefined,
      piecesCount: parsedPieces,
      details: details.trim(),
      image: image ? image : undefined,
      notes: notes.trim(),
    });

    // Reset Form
    setWeightBefore("");
    setWeightAfter("");
    setDamagedWeight("");
    setPiecesCount("");
    setDetails("");
    setNotes("");
    setImage("");
    setDamagedImage("");
  };

  // Filter records based on state
  const filteredRecords = records.filter((r) => {
    // 1. Stage type filter
    if (filterStage !== "all" && r.stageType !== filterStage) return false;

    // 2. Text search query filter
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.details?.toLowerCase().includes(query) ||
      r.notes?.toLowerCase().includes(query) ||
      r.date.includes(query)
    );
  });

  // Aggregated totals with fallbacks to support existing user records safely without NaN
  const totalBefore = records.reduce((sum, r) => sum + (r.weightBefore ?? (r as any).before ?? 0), 0);
  const totalAfter = records.reduce((sum, r) => sum + (r.weightAfter ?? (r as any).after ?? 0), 0);
  const totalDamaged = records.reduce((sum, r) => sum + (r.damagedWeight ?? (r as any).damaged ?? 0), 0);
  const totalLoss = records.reduce((sum, r) => sum + (r.loss ?? 0), 0);
  const totalPieces = records.reduce((sum, r) => sum + (r.piecesCount ?? r.damagedWeight !== undefined ? r.piecesCount : 1), 0);

  const avgLossPct = totalBefore > 0 ? (totalLoss / totalBefore) * 100 : 0;

  // Language Dictionary for UI
  const stageLabels = {
    bombing: {
      title: "مرحلة التفجير والتجريد أحماض",
      icon: <Flame className="w-5 h-5" />,
      beforeLabel: "الوزن قبل التفجير",
      afterLabel: "الوزن بعد التفجير",
      hasDamaged: true,
      damagedLabel: "وزن التالف (ريزة/خردة)",
      desc: "تتبع فقدان الذهب ونقيصته بعد عمليات التفجير وحمامات التجريد بالحمض وتأثيرها على وزن المشغولات.",
    },
    repair: {
      title: "مرحلة الدعم والتصليح والصيانة",
      icon: <Wrench className="w-5 h-5" />,
      beforeLabel: "الوزن قبل التصليح",
      afterLabel: "الوزن بعد التصليح",
      hasDamaged: false,
      damagedLabel: "",
      desc: "رصد المعالجة الفنية ولحام العيوب قبل صب الشجرة النهائي وحساب عجز المبرد والتعديل اليدوي.",
    },
    vacuum: {
      title: "مرحلة التفريغ وضغط الفاكيوم",
      icon: <Wind className="w-5 h-5" />,
      beforeLabel: "الوزن قبل الفاكيوم",
      afterLabel: "الوزن بعد الفاكيوم",
      hasDamaged: true,
      damagedLabel: "وزن تالف الفاكيوم وجدرانه",
      desc: "مراقبة صب الفاكيوم لجزئيات الذهب المسحوبة بالكامل ورصد التوالف الناتجة من ضغوط القوالب.",
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Dynamic Multi-Stage Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0f0f0f] rounded-2xl border border-[#222] p-6 shadow-2xl hover:border-[#333] transition-all relative overflow-hidden">
            {/* Subtle top decoration */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C5A028] to-transparent opacity-60" />

            {/* Stage Selector Tabs in Form Header */}
            <div className="flex bg-[#070707] p-1.5 rounded-xl border border-[#222] mb-6 justify-between gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setStageType("bombing");
                  setImage("");
                  setDamagedImage("");
                }}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                  stageType === "bombing"
                    ? "bg-gradient-to-br from-[#C5A028]/20 to-transparent text-[#C5A028] border border-[#C5A028]/35 font-extrabold shadow-sm"
                    : "text-[#888] hover:text-[#fff] hover:bg-[#151515] border border-transparent"
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>١. التفجير</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStageType("repair");
                  setImage("");
                  setDamagedImage("");
                }}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                  stageType === "repair"
                    ? "bg-gradient-to-br from-[#C5A028]/20 to-transparent text-[#C5A028] border border-[#C5A028]/30 font-extrabold shadow-sm"
                    : "text-[#888] hover:text-[#fff] hover:bg-[#151515] border border-transparent"
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>٢. التصليح</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStageType("vacuum");
                  setImage("");
                  setDamagedImage("");
                }}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                  stageType === "vacuum"
                    ? "bg-gradient-to-br from-[#C5A028]/20 to-transparent text-[#C5A028] border border-[#C5A028]/30 font-extrabold shadow-sm"
                    : "text-[#888] hover:text-[#fff] hover:bg-[#151515] border border-transparent"
                }`}
              >
                <Wind className="w-3.5 h-3.5" />
                <span>٣. الفاكيوم</span>
              </button>
            </div>

            {/* Stage Information Banner */}
            <div className="flex items-center gap-3 border-b border-[#222] pb-4 mb-5">
              <div className="p-3 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-xl text-[#C5A028] border border-[#d4af37]/10">
                {stageLabels[stageType].icon}
              </div>
              <div>
                <h2 className="text-md font-bold text-white font-sans">
                  {stageLabels[stageType].title}
                </h2>
                <p className="text-[11px] text-[#888] font-sans leading-relaxed mt-1">
                  {stageLabels[stageType].desc}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Process Date */}
              <div>
                <label className="block text-xs font-semibold text-[#aaa] mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#888]" /> تاريخ العملية
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-4 py-2.5 text-sm focus:border-[#C5A028] focus:ring-1 focus:ring-[#C5A028] focus:bg-[#070707] focus:outline-none transition-all duration-200 font-mono text-right"
                />
              </div>

              {/* Weight Grid: Before & After */}
              <div className="grid grid-cols-2 gap-4">
                {/* Weight Before */}
                <div>
                  <label className="block text-xs font-semibold text-[#888] mb-1.5 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-yellow-500/80" /> {stageLabels[stageType].beforeLabel}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      required
                      placeholder="0.00"
                      value={weightBefore}
                      onChange={(e) => setWeightBefore(e.target.value)}
                      className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded pl-8 pr-2.5 py-2 text-sm text-left font-mono focus:border-[#C5A028] focus:bg-[#0c0c0c] focus:outline-none"
                    />
                    <span className="absolute left-2.5 top-2.5 text-[10px] text-[#555] font-mono">g</span>
                  </div>
                </div>

                {/* Weight After */}
                <div>
                  <label className="block text-xs font-semibold text-[#888] mb-1.5 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-emerald-500/80" /> {stageLabels[stageType].afterLabel}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      required
                      placeholder="0.00"
                      value={weightAfter}
                      onChange={(e) => setWeightAfter(e.target.value)}
                      className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded pl-8 pr-2.5 py-2 text-sm text-left font-mono focus:border-[#C5A028] focus:bg-[#0c0c0c] focus:outline-none"
                    />
                    <span className="absolute left-2.5 top-2.5 text-[10px] text-[#555] font-mono">g</span>
                  </div>
                </div>
              </div>

              {/* Damaged Area (Omitted for Repair type) */}
              {stageLabels[stageType].hasDamaged && (
                <div className="bg-[#111] p-3 rounded border border-rose-950/20 space-y-3">
                  <div className="flex justify-between items-center border-b border-[#222] pb-1.5">
                    <h3 className="text-xs font-bold text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> فاقد وتالف العملية
                    </h3>
                    <span className="text-[10px] text-[#666]">تتبع ريز الهدر المادي</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                    {/* Damaged Weight */}
                    <div>
                      <label className="block text-[11px] text-[#888] mb-1">{stageLabels[stageType].damagedLabel}</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.00"
                          value={damagedWeight}
                          onChange={(e) => setDamagedWeight(e.target.value)}
                          className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded pl-8 pr-2 py-1.5 text-xs text-left font-mono focus:border-[#C5A028] focus:outline-none"
                        />
                        <span className="absolute left-2 top-2 text-[9px] text-[#444] font-mono">g</span>
                      </div>
                    </div>

                    {/* Damaged Image Upload */}
                    <div>
                      <label className="block text-[11px] text-[#888] mb-1">صورة التالف</label>
                      {damagedImage ? (
                        <div className="relative border border-[#333] rounded overflow-hidden aspect-video max-h-12 flex items-center bg-black">
                          <img src={damagedImage} alt="تالف" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => clearImage("damaged")}
                            className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 hover:bg-[#800] text-white rounded-full"
                          >
                            <XCircle className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-1 border border-dashed border-[#2a2a2a] hover:border-rose-500/30 rounded p-1.5 cursor-pointer text-center bg-[#151515] transition-colors">
                          <UploadCloud className="w-3.5 h-3.5 text-[#555]" />
                          <span className="text-[9px] text-[#666]">رفع صورة التالف</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, "damaged")}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Pieces Details Area */}
              <div className="bg-[#111] p-3 rounded border border-[#222] space-y-3">
                <div className="flex justify-between items-center border-b border-[#222] pb-1.5">
                  <h3 className="text-xs font-bold text-[#c5a028] flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" /> المشغولات الخاضعة للعملية
                  </h3>
                  <span className="text-[10px] text-[#666]">تفاصيل القطع المنتهية</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Pieces Count */}
                  <div>
                    <label className="block text-[11px] text-[#888] mb-1">عدد قطع الشغل</label>
                    <input
                      type="number"
                      placeholder="عدد القطع"
                      required
                      value={piecesCount}
                      onChange={(e) => setPiecesCount(e.target.value)}
                      className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-xs font-mono focus:border-[#C5A028] focus:outline-none"
                    />
                  </div>

                  {/* Main Product Image */}
                  <div>
                    <label className="block text-[11px] text-[#888] mb-1">صورة المشغولات / القطع</label>
                    {image ? (
                      <div className="relative border border-[#333] rounded overflow-hidden aspect-video max-h-12 flex items-center bg-black">
                        <img src={image} alt="المشغولات" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => clearImage("main")}
                          className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 hover:bg-[#800] text-white rounded-full"
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-1 border border-dashed border-[#2a2a2a] hover:border-emerald-500/30 rounded p-1.5 cursor-pointer text-center bg-[#151515] transition-colors">
                        <UploadCloud className="w-3.5 h-3.5 text-[#555]" />
                        <span className="text-[9px] text-[#666]">رفع صورة للقطع</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, "main")}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Details text area */}
                <div>
                  <label className="block text-[11px] text-[#888] mb-1">تفصيل مواصفات القطع والعيوب</label>
                  <textarea
                    rows={2}
                    placeholder="مثال: أساور مبرومة مجدولة، حبل ليزر، فصوص زجاجية متضررة..."
                    required
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-xs focus:border-[#C5A028] focus:outline-none"
                  />
                </div>
              </div>

              {/* General Session Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#888] mb-1.5">ملاحظات وعهدة الورشة</label>
                <textarea
                  rows={2}
                  placeholder="بلاتين مضاف، عينة للفحص الكيميائي، اسم الفني المشرف..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-sm focus:border-[#C5A028] focus:bg-[#0c0c0c] focus:outline-none transition-colors"
                />
              </div>

              {/* Real-time Computations */}
              {parsedBefore > 0 && parsedAfter > 0 && (
                <div className="bg-[#1a1a1a] rounded p-4 border border-[#222] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#888]">إجمالي مخرجات المعادلة (بعد + تالف):</span>
                    <span className="font-mono text-white font-bold">
                      {(parsedAfter + (stageType !== "repair" ? parsedDamaged : 0)).toFixed(3)} غرام
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-[#222]/80 pt-2">
                    <span className="text-[#888]">عجز المبرد وفقد العملية:</span>
                    {computedLoss > 0 ? (
                      <span className="font-bold text-rose-400 font-mono flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-500 animate-pulse" /> نقص: {computedLoss.toFixed(3)} غرام ({computedLossPct.toFixed(2)}%)
                      </span>
                    ) : computedLoss < 0 ? (
                      <span className="font-bold text-emerald-400 font-mono">
                        وفر إيجابي: {Math.abs(computedLoss).toFixed(3)} غرام ({computedLossPct.toFixed(2)}%)
                      </span>
                    ) : (
                      <span className="font-bold text-white font-mono">متوازن بالكامل (0.000)</span>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#C5A028] hover:bg-[#d9b132] text-[#0a0a0a] font-bold py-2.5 px-4 rounded transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(197,160,40,0.15)]"
              >
                <FilePlus2 className="w-4 h-4" />
                <span>ترحيل وتسجيل لدفتر الورشة</span>
              </button>
            </form>
          </div>
        </div>

        {/* Dynamic List Ledger View */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filtering and search console */}
          <div className="bg-[#141414] p-4 rounded border border-[#2a2a2a] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-56">
                <Search className="w-4 h-4 text-[#666] absolute right-3 top-3" />
                <input
                  type="text"
                  placeholder="البحث بالبيانات، مواصفات أو التاريخ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-right text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded pl-3 pr-9 py-2 text-xs focus:border-[#C5A028] focus:bg-[#0c0c0c] focus:outline-none transition-colors"
                />
              </div>

              {/* Stage Type filter dropdown */}
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value as any)}
                className="bg-[#1a1a1a] text-white border border-[#2a2a2a] rounded px-2.5 py-1.5 text-xs text-right focus:border-[#C5A028] focus:outline-none"
              >
                <option value="all">كل المراحل</option>
                <option value="bombing">التفجير وحمض التجريد</option>
                <option value="repair">الدعم والتصليح اليدوي</option>
                <option value="vacuum">مرحلة الفاكيوم</option>
              </select>
            </div>

            <div className="text-xs text-[#888] font-medium whitespace-nowrap self-end md:self-center">
              تصفية النتائج: عرض{" "}
              <span className="text-[#C5A028] font-bold">
                {filteredRecords.length}
              </span>{" "}
              من أصل{" "}
              <span className="text-[#C5A028] font-bold">
                {records.length}
              </span>{" "}
              عملية تفصيلية
            </div>
          </div>

          <div className="bg-[#141414] rounded border border-[#2a2a2a] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-[#1a1a1a] border-b border-[#2a2a2a] text-[#888] text-xs">
                  <tr>
                    <th className="px-3 py-3 text-center font-bold">حذف</th>
                    <th className="px-3 py-3 font-bold text-center">الصور المرفقة</th>
                    <th className="px-3 py-3 font-bold">تفاصيل ومواصفات المشغولات</th>
                    <th className="px-3 py-3 text-center font-bold">% العجز</th>
                    <th className="px-3 py-3 text-left font-bold font-mono">نقص العملية</th>
                    <th className="px-3 py-3 text-left font-bold font-mono">التعويض (بعد + تالف)</th>
                    <th className="px-3 py-3 text-left font-bold font-mono">الوزن قبل</th>
                    <th className="px-3 py-3 font-bold text-center">المرحلة والتاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-[#666] text-xs">
                        لا توجد سجلات مطابقة للتصفية الحالية. أدخل العملية في النموذج لبدء التتبع الفني للورشة.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => {
                      // Safe properties extraction with old and new schema support and fallback definitions to avoid crashing on undefined values
                      const wBefore = record.weightBefore ?? (record as any).before ?? 0;
                      const wAfter = record.weightAfter ?? (record as any).after ?? 0;
                      const dWeight = record.damagedWeight ?? (record as any).damaged ?? 0;
                      const pieces = record.piecesCount ?? 1;
                      const isProfit = (record.loss ?? 0) < 0;
                      const absLoss = Math.abs(record.loss ?? (wBefore - (wAfter + dWeight)));
                      const pct = wBefore > 0 ? (absLoss / wBefore) * 100 : 0;
                      
                      return (
                        <tr key={record.id} className="hover:bg-[#1a1a1a]/40 transition-colors">
                          {/* Delete Operation */}
                          <td className="px-3 py-3 text-center">
                            <button
                              onClick={() => onDeleteRecord(record.id)}
                              className="p-1 text-[#666] hover:text-rose-400 rounded hover:bg-rose-950/20 transition-colors cursor-pointer"
                              title="حذف هذا السجل"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>

                          {/* Image Gallery Cell */}
                          <td className="px-3 py-3">
                            <div className="flex justify-center items-center gap-2">
                              {/* Main image */}
                              {record.image ? (
                                <button
                                  type="button"
                                  onClick={() => setZoomImage(record.image || null)}
                                  className="relative group block w-8 h-8 rounded border border-[#333] overflow-hidden hover:border-[#C5A028] transition-colors"
                                  title="عرض صورة المشغولات"
                                >
                                  <img src={record.image} alt="المشغولات" className="w-full h-full object-cover" />
                                  <span className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Eye className="w-3 h-3 text-[#C5A028]" />
                                  </span>
                                </button>
                              ) : (
                                <span className="text-[9px] text-[#444] font-serif" title="لا توجد صورة للقطع">لا صورة</span>
                              )}

                              {/* Damaged image */}
                              {record.damagedImage ? (
                                <button
                                  type="button"
                                  onClick={() => setZoomImage(record.damagedImage || null)}
                                  className="relative group block w-8 h-8 rounded border border-rose-950/30 overflow-hidden hover:border-rose-500 transition-colors"
                                  title="عرض صورة التالف"
                                >
                                  <img src={record.damagedImage} alt="التالف" className="w-full h-full object-cover" />
                                  <span className="absolute inset-0 bg-rose-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Eye className="w-3 h-3 text-rose-400" />
                                  </span>
                                </button>
                              ) : (
                                record.stageType !== "repair" && (
                                  <span className="text-[9px] text-[#444]" title="لا توجد صورة للتالف">بلا تالف</span>
                                )
                              )}
                            </div>
                          </td>

                          {/* Technical details and counts cell */}
                          <td className="px-3 py-3 text-[#ccc] max-w-[200px] text-xs">
                            <div className="space-y-1">
                              <div className="leading-snug text-[11px]">
                                <span className="text-[#888] font-bold">المواصفات ({pieces} قطع):</span>{" "}
                                <span className="text-white">{record.details || (record as any).notes || "سجل سحب ودرفلة"}</span>
                              </div>

                              {dWeight > 0 ? (
                                <div className="text-[10px] text-rose-400/90 leading-tight">
                                  <span>وزن الهدر/التالف:</span> <span className="font-mono">{dWeight.toFixed(3)}g</span>
                                </div>
                              ) : null}

                              {record.notes && (
                                <div className="text-[10px] text-yellow-500/80 italic leading-none pt-0.5">
                                  * {record.notes}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Loss percentage */}
                          <td className="px-3 py-3 text-center font-mono text-xs">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isProfit
                                  ? "bg-emerald-950/30 text-emerald-400 border border-emerald-900/40"
                                  : "bg-rose-950/30 text-rose-400 border border-rose-900/40"
                              }`}
                            >
                              {pct.toFixed(2)}% {isProfit ? "زيادة" : "نقص"}
                            </span>
                          </td>

                          {/* Shortage/Excess weight cell */}
                          <td
                            className={`px-3 py-3 text-left font-mono font-bold ${
                              isProfit ? "text-emerald-400 bg-emerald-950/10" : "text-rose-400 bg-rose-950/10"
                            }`}
                          >
                            {isProfit ? `+${absLoss.toFixed(3)}` : `-${absLoss.toFixed(3)}`}
                          </td>

                          {/* Secondary Weights (After + Damaged) */}
                          <td className="px-3 py-3 text-left font-mono text-[#ccc] text-xs">
                            <div className="leading-tight">
                              <div>{(wAfter + dWeight).toFixed(3)}</div>
                              <div className="text-[9px] text-[#666]">
                                ({wAfter.toFixed(2)}صافي
                                {dWeight > 0
                                  ? ` + ${dWeight.toFixed(2)}ت`
                                  : ""})
                              </div>
                            </div>
                          </td>

                          {/* Raw input weight before */}
                          <td className="px-3 py-3 text-left font-mono text-white bg-[#1a1a1a]/30">
                            {wBefore.toFixed(3)}
                          </td>

                          {/* Process badge & Date */}
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <div className="flex flex-col items-center gap-1">
                              {record.stageType === "bombing" ? (
                                <span className="bg-amber-950/30 text-amber-400 border border-amber-900/40 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <Flame className="w-2.5 h-2.5" /> تفجير أحماض
                                </span>
                              ) : record.stageType === "repair" ? (
                                <span className="bg-sky-950/30 text-sky-400 border border-sky-900/40 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <Wrench className="w-2.5 h-2.5" /> معالجة وصيانة
                                </span>
                              ) : (
                                <span className="bg-purple-950/30 text-purple-400 border border-purple-900/40 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <Wind className="w-2.5 h-2.5" /> صب فاكيوم
                                </span>
                              )}
                              <span className="text-[10px] text-[#555] font-mono">{record.date}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>

                {records.length > 0 && (
                  <tfoot className="bg-[#0f0f0f] divide-y divide-[#222] text-[#fff] text-xs font-mono">
                    <tr className="font-bold border-t border-[#2a2a2a]">
                      <td className="px-3 py-3 text-center text-[#C5A028] font-sans" colSpan={2}>
                        المجموع
                      </td>
                      <td className="px-3 py-3 text-[#888] text-right font-sans">
                        إجمالي عهدة المعادن والمشغولات:{" "}
                        <span className="text-[#C5A028] font-bold">{totalPieces} قطع مشروعة</span>
                      </td>
                      <td className="px-3 py-3 text-center text-[#C5A028]">
                        {((totalLoss / totalBefore) * 100).toFixed(2)}%{" "}
                        <span className="text-[9px] text-[#888] font-sans">
                          ({totalLoss >= 0 ? "متوسط العجز" : "زيادة وإيضاح"})
                        </span>
                      </td>
                      <td
                        className={`px-3 py-3 text-left font-bold ${
                          totalLoss >= 0 ? "text-rose-400 bg-rose-950/30" : "text-emerald-400 bg-emerald-950/30"
                        }`}
                      >
                        {totalLoss >= 0 ? `-${totalLoss.toFixed(3)}` : `+${Math.abs(totalLoss).toFixed(3)}`} غرام
                      </td>
                      <td className="px-3 py-3 text-left text-[#ccc] leading-tight text-xs">
                        {(totalAfter + totalDamaged).toFixed(3)} غرام
                        <div className="text-[9px] text-[#666] font-sans">
                          ({totalAfter.toFixed(2)} صافي + {totalDamaged.toFixed(2)} تالف متراكم)
                        </div>
                      </td>
                      <td className="px-3 py-3 text-left text-[#C5A028] bg-[#141414]">
                        {totalBefore.toFixed(3)} غرام
                      </td>
                      <td className="px-3 py-3 text-center text-[#666]">-</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Full Scale Image Modal previewer */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-center items-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
            <img
              src={zoomImage}
              alt="معاينة فنية كاملة"
              className="max-w-full max-h-full object-contain rounded border border-[#2a2a2a] shadow-2xl"
            />
            <button
              type="button"
              className="absolute top-2 right-2 text-white/50 hover:text-white bg-[#1a1a1a]/80 p-2.5 rounded-full cursor-pointer transition-colors"
              onClick={() => setZoomImage(null)}
            >
              <EyeOff className="w-6 h-6" />
            </button>
          </div>
          <p className="text-[#888] text-xs mt-4 font-sans text-center">اضغط في أي مكان للإرسال وإغلاق المعاينة</p>
        </div>
      )}
    </div>
  );
};
