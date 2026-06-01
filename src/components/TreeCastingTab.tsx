import React, { useState } from "react";
import { TreeCastingRecord } from "../types";
import { FilePlus2, Trash2, Calendar, Scale, TreePine, Search, UploadCloud, Eye, Image as ImageIcon, XCircle, CheckCircle, EyeOff, AlertTriangle, Clock } from "lucide-react";

interface TreeCastingTabProps {
  records: TreeCastingRecord[];
  onAddRecord: (record: Omit<TreeCastingRecord, "id" | "loss"> & { isPending?: boolean }) => void;
  onDeleteRecord: (id: string) => void;
  onUpdateRecord: (
    id: string,
    productionWeight: number,
    damagedWeight: number,
    productionCount: number,
    productionDetails: string,
    damagedCount: number,
    damagedDetails: string,
    notes?: string,
    productionImage?: string,
    damagedImage?: string
  ) => void;
}

export const TreeCastingTab: React.FC<TreeCastingTabProps> = ({
  records,
  onAddRecord,
  onDeleteRecord,
  onUpdateRecord,
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [time, setTime] = useState<string>(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  });
  const [inputWeight, setInputWeight] = useState<string>("");
  const [productionWeight, setProductionWeight] = useState<string>("");
  const [damagedWeight, setDamagedWeight] = useState<string>("");
  const [isPendingRecord, setIsPendingRecord] = useState<boolean>(false);
  
  // Production info
  const [productionCount, setProductionCount] = useState<string>("");
  const [productionDetails, setProductionDetails] = useState<string>("");
  const [productionImage, setProductionImage] = useState<string>("");

  // Damaged info
  const [damagedCount, setDamagedCount] = useState<string>("");
  const [damagedDetails, setDamagedDetails] = useState<string>("");
  const [damagedImage, setDamagedImage] = useState<string>("");

  const [notes, setNotes] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Modal / Update state for Tree
  const [updatingRecordId, setUpdatingRecordId] = useState<string | null>(null);
  const [upProdWeight, setUpProdWeight] = useState<string>("");
  const [upDamagedWeight, setUpDamagedWeight] = useState<string>("");
  const [upProdCount, setUpProdCount] = useState<string>("");
  const [upProdDetails, setUpProdDetails] = useState<string>("");
  const [upDamagedCount, setUpDamagedCount] = useState<string>("");
  const [upDamagedDetails, setUpDamagedDetails] = useState<string>("");
  const [upNotes, setUpNotes] = useState<string>("");
  const [upProdImage, setUpProdImage] = useState<string>("");
  const [upDamagedImage, setUpDamagedImage] = useState<string>("");

  // Parsed values
  const parsedInput = parseFloat(inputWeight) || 0;
  const parsedProd = parseFloat(productionWeight) || 0;
  const parsedDamaged = parseFloat(damagedWeight) || 0;
  const parsedProdCount = parseInt(productionCount) || 0;
  const parsedDamagedCount = parseInt(damagedCount) || 0;

  // The loss/difference computation
  // Loss = input_gold - (production_gold + damaged_gold)
  const computedLoss = parsedInput - (parsedProd + parsedDamaged);
  const computedLossPercent = parsedInput > 0 ? (Math.abs(computedLoss) / parsedInput) * 100 : 0;

  // Handle image conversion to Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "production" | "damaged") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "production") {
          setProductionImage(reader.result as string);
        } else {
          setDamagedImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = (type: "production" | "damaged") => {
    if (type === "production") {
      setProductionImage("");
    } else {
      setDamagedImage("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedInput <= 0) {
      alert("الرجاء إدخال وزن الذهب المدخل للشجرة بشكل صحيح.");
      return;
    }
    if (!isPendingRecord && parsedProd <= 0 && parsedDamaged <= 0) {
      alert("يجب إدخال وزن إنتاج صافٍ أو وزن تالف أكبر من الصفر، أو اختيار وضع تسجيل القبل ع حدة.");
      return;
    }

    onAddRecord({
      date,
      time,
      inputWeight: parsedInput,
      productionWeight: isPendingRecord ? undefined : parsedProd,
      damagedWeight: isPendingRecord ? undefined : parsedDamaged,
      productionCount: isPendingRecord ? undefined : parsedProdCount,
      productionDetails: isPendingRecord ? "" : productionDetails.trim(),
      productionImage: isPendingRecord ? "" : productionImage,
      damagedCount: isPendingRecord ? undefined : parsedDamagedCount,
      damagedDetails: isPendingRecord ? "" : damagedDetails.trim(),
      damagedImage: isPendingRecord ? "" : damagedImage,
      notes: notes.trim(),
      isPending: isPendingRecord,
    });

    // Reset fields
    setInputWeight("");
    setProductionWeight("");
    setDamagedWeight("");
    setProductionCount("");
    setProductionDetails("");
    setProductionImage("");
    setDamagedCount("");
    setDamagedDetails("");
    setDamagedImage("");
    setNotes("");

    // Reset time to current
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setTime(`${hours}:${minutes}`);
  };

  const handleOpenUpdate = (record: TreeCastingRecord) => {
    setUpdatingRecordId(record.id);
    setUpProdWeight("");
    setUpDamagedWeight("");
    setUpProdCount("");
    setUpProdDetails("");
    setUpDamagedCount("");
    setUpDamagedDetails("");
    setUpNotes(record.notes || "");
    setUpProdImage("");
    setUpDamagedImage("");
  };

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedUpProd = parseFloat(upProdWeight) || 0;
    const parsedUpDamaged = parseFloat(upDamagedWeight) || 0;
    const parsedUpProdCount = parseInt(upProdCount) || 0;
    const parsedUpDamagedCount = parseInt(upDamagedCount) || 0;

    if (parsedUpProd <= 0 && parsedUpDamaged <= 0) {
      alert("يجب إدخال وزن إنتاج أو تالف صحيح أكبر من الصفر.");
      return;
    }

    if (updatingRecordId) {
      onUpdateRecord(
        updatingRecordId,
        parsedUpProd,
        parsedUpDamaged,
        parsedUpProdCount,
        upProdDetails.trim(),
        parsedUpDamagedCount,
        upDamagedDetails.trim(),
        upNotes.trim(),
        upProdImage,
        upDamagedImage
      );
      setUpdatingRecordId(null);
    }
  };

  const filteredRecords = records.filter((r) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.notes?.toLowerCase().includes(query) ||
      r.productionDetails?.toLowerCase().includes(query) ||
      r.damagedDetails?.toLowerCase().includes(query) ||
      r.date.includes(query)
    );
  });

  // Calculate Aggregates for completed trees
  const completedRecords = records.filter(r => !r.isPending);
  const totalInput = records.reduce((sum, r) => sum + r.inputWeight, 0);
  const totalProd = completedRecords.reduce((sum, r) => sum + (r.productionWeight ?? 0), 0);
  const totalDamaged = completedRecords.reduce((sum, r) => sum + (r.damagedWeight ?? 0), 0);
  const totalLoss = completedRecords.reduce((sum, r) => sum + (r.loss ?? 0), 0);
  const totalProdCount = completedRecords.reduce((sum, r) => sum + (r.productionCount ?? 0), 0);
  const totalDamagedCount = completedRecords.reduce((sum, r) => sum + (r.damagedCount ?? 0), 0);
  
  const completedInputSum = completedRecords.reduce((sum, r) => sum + r.inputWeight, 0);
  const averageLossPercent = completedInputSum > 0 ? (totalLoss / completedInputSum) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Registration Form */}
        <div className="md:col-span-12 lg:col-span-5 space-y-6">
          <div className="bg-[#0f0f0f] rounded-2xl border border-[#222] p-6 shadow-2xl hover:border-[#333] transition-all relative overflow-hidden">
            {/* Subtle top decoration */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C5A028] to-transparent opacity-60" />
            
            <div className="flex items-center gap-3 border-b border-[#222] pb-4 mb-5">
              <div className="p-3 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-xl text-[#C5A028] border border-[#d4af37]/10">
                <TreePine className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h2 className="text-md font-bold text-white font-sans">سبك وجداول صبة الشجرة</h2>
                <p className="text-[11px] text-[#888] font-sans mt-0.5">تتبع الذهب الصافي من صبة الشمع مع رصد النقص والتالف والمشغولات بالصور</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 font-sans">
              
              {/* Mode Selector for Before & After */}
              <div className="bg-[#141414] p-1.5 rounded-xl border border-[#222] flex gap-1.5 mb-2">
                <button
                  type="button"
                  onClick={() => setIsPendingRecord(false)}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    !isPendingRecord
                      ? "bg-[#C5A028] text-neutral-950 shadow-sm"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                  }`}
                >
                  العملية كاملة (قبل + بعد)
                </button>
                <button
                  type="button"
                  onClick={() => setIsPendingRecord(true)}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    isPendingRecord
                      ? "bg-amber-500/20 text-[#C5A028] border border-amber-500/30 font-extrabold"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                  }`}
                >
                  تسجيل القبل فقط ⏳
                </button>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#aaa] mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#888]" /> التاريخ
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] focus:ring-1 focus:ring-[#C5A028] focus:bg-[#070707] focus:outline-none transition-all duration-200 font-mono text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#aaa] mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#888]" /> الوقت
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] focus:ring-1 focus:ring-[#C5A028] focus:bg-[#070707] focus:outline-none transition-all duration-200 font-mono text-right"
                  />
                </div>
              </div>

              {/* Gold Input Weight */}
              <div>
                <label className="block text-xs font-semibold text-[#aaa] mb-1.5 flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-yellow-500" /> وزن الذهب المدخل للشجرة
                  </span>
                  <span className="text-[10px] bg-[#C5A028]/10 text-[#C5A028] px-2 py-0.5 rounded font-bold">الوزن المشحون</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={inputWeight}
                    onChange={(e) => setInputWeight(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl pl-14 pr-4 py-2.5 text-sm text-left font-mono focus:border-[#C5A028] focus:ring-1 focus:ring-[#C5A028] focus:bg-[#070707] focus:outline-none transition-all duration-200"
                  />
                  <span className="absolute left-4 top-3 text-xs text-[#666] font-semibold">غرام</span>
                </div>
              </div>

              {/* Master Split Grid: Production vs Damaged */}
              {!isPendingRecord ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#222] pt-4 animate-fadeIn">
                  {/* Right: Fine Production Area */}
                  <div className="space-y-4 bg-[#111] p-3 rounded border border-emerald-950/20">
                    <h3 className="text-xs font-bold text-emerald-400 border-b border-[#222] pb-1.5 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> مخرجات الإنتاج الصافي
                    </h3>
                    
                    {/* Production Weight */}
                    <div>
                      <label className="block text-[11px] text-[#888] mb-1">الوزن الصافي السليم</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.00"
                          value={productionWeight}
                          onChange={(e) => setProductionWeight(e.target.value)}
                          className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded pl-8 pr-2 py-1.5 text-xs text-left font-mono focus:border-[#C5A028] focus:outline-none"
                        />
                        <span className="absolute left-2 top-2 text-[10px] text-[#555] font-mono">g</span>
                      </div>
                    </div>

                    {/* Production Count */}
                    <div>
                      <label className="block text-[11px] text-[#888] mb-1">عدد قطع الإنتاج</label>
                      <input
                        type="number"
                        placeholder="قطع"
                        value={productionCount}
                        onChange={(e) => setProductionCount(e.target.value)}
                        className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1.5 text-xs font-mono focus:border-[#C5A028] focus:outline-none"
                      />
                    </div>

                    {/* Production Details */}
                    <div>
                      <label className="block text-[11px] text-[#888] mb-1">تفصيل قطع الإنتاج</label>
                      <textarea
                        rows={1.5}
                        placeholder="خواتم، سلاسل..."
                        value={productionDetails}
                        onChange={(e) => setProductionDetails(e.target.value)}
                        className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1.5 text-xs focus:border-[#C5A028] focus:outline-none"
                      />
                    </div>

                    {/* Production Image Upload */}
                    <div>
                      <label className="block text-[11px] text-[#888] mb-1">صورة الإنتاج</label>
                      {productionImage ? (
                        <div className="relative border border-[#333] rounded overflow-hidden aspect-video group">
                          <img src={productionImage} alt="الإنتاج" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => clearImage("production")}
                            className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-rose-950 text-white rounded-full transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center border border-dashed border-[#333] hover:border-emerald-500/50 rounded p-2 text-center cursor-pointer transition-colors bg-[#161616]">
                          <UploadCloud className="w-5 h-5 text-[#555]" />
                          <span className="text-[10px] text-[#666] mt-1">اضغط لرفع صورة</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, "production")}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Left: Damaged/Scrap Area */}
                  <div className="space-y-4 bg-[#111] p-3 rounded border border-rose-950/20">
                    <h3 className="text-xs font-bold text-rose-400 border-b border-[#222] pb-1.5 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" /> مخرجات التالف والرمال
                    </h3>

                    {/* Damaged Weight */}
                    <div>
                      <label className="block text-[11px] text-[#888] mb-1">وزن التالف / الخردة</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.00"
                          value={damagedWeight}
                          onChange={(e) => setDamagedWeight(e.target.value)}
                          className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded pl-8 pr-2 py-1.5 text-xs text-left font-mono focus:border-[#C5A028] focus:outline-none"
                        />
                        <span className="absolute left-2 top-2 text-[10px] text-[#555] font-mono">g</span>
                      </div>
                    </div>

                    {/* Damaged Count */}
                    <div>
                      <label className="block text-[11px] text-[#888] mb-1">عدد قطع التالف</label>
                      <input
                        type="number"
                        placeholder="قطع تالفة"
                        value={damagedCount}
                        onChange={(e) => setDamagedCount(e.target.value)}
                        className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1.5 text-xs font-mono focus:border-[#C5A028] focus:outline-none"
                      />
                    </div>

                    {/* Damaged Details */}
                    <div>
                      <label className="block text-[11px] text-[#888] mb-1">تفصيل أسباب التلف</label>
                      <textarea
                        rows={1.5}
                        placeholder="فقاعات هواء، صب ناقص..."
                        value={damagedDetails}
                        onChange={(e) => setDamagedDetails(e.target.value)}
                        className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1.5 text-xs focus:border-[#C5A028] focus:outline-none"
                      />
                    </div>

                    {/* Damaged Image Upload */}
                    <div>
                      <label className="block text-[11px] text-[#888] mb-1">صورة التالف</label>
                      {damagedImage ? (
                        <div className="relative border border-[#333] rounded overflow-hidden aspect-video group">
                          <img src={damagedImage} alt="التالف" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => clearImage("damaged")}
                            className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-rose-950 text-white rounded-full transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center border border-dashed border-[#333] hover:border-rose-500/50 rounded p-2 text-center cursor-pointer transition-colors bg-[#161616]">
                          <UploadCloud className="w-5 h-5 text-[#555]" />
                          <span className="text-[10px] text-[#666] mt-1">اضغط لرفع صورة</span>
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
              ) : (
                <div className="bg-amber-950/10 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-200 animate-fadeIn space-y-2">
                  <p className="flex items-center gap-1.5 font-bold text-amber-400">
                    <Clock className="w-4 h-4" /> تم تمكين وضع "قبل الصب فقط" לשجرة
                  </p>
                  <p className="text-[11px] text-[#888] leading-relaxed">
                    سيتم حفظ وزن الذهب الكافي المشحون في المصب الشمعي (القبل) وتأجيل تسجيل مخرجات الإنتاج والتالف لكي تحافظ على استمرارية العمل وتسجيلهم عند تصفية الشجرة.
                  </p>
                </div>
              )}

              {/* General Note */}
              <div>
                <label className="block text-xs font-semibold text-[#888] mb-1.5">ملاحظات عامة للشجرة</label>
                <textarea
                  rows={2}
                  placeholder="بلاتين، كود الشمع المعتمد، تفاصيل إضافية للوجبة..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-sm focus:border-[#C5A028] focus:bg-[#0c0c0c] focus:outline-none transition-colors"
                />
              </div>

              {/* Computation Banner */}
              {parsedInput > 0 && (parsedProd > 0 || parsedDamaged > 0) && (
                <div className="bg-[#1a1a1a] rounded p-4 border border-[#2a2a2a] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#888]">إجمالي المخرجات (إنتاج + تالف):</span>
                    <span className="font-mono text-white font-bold">{(parsedProd + parsedDamaged).toFixed(3)} غرام</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-[#222] pt-1.5">
                    <span className="text-[#888]">نقيصة وعجز / زيادة صبة الشجرة:</span>
                    {computedLoss > 0 ? (
                      <span className="font-bold text-rose-400 font-mono flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-500" /> نقص: {computedLoss.toFixed(3)} غرام ({computedLossPercent.toFixed(2)}%)
                      </span>
                    ) : computedLoss < 0 ? (
                      <span className="font-bold text-emerald-400 font-mono">
                        زيادة: {Math.abs(computedLoss).toFixed(3)} غرام ({computedLossPercent.toFixed(2)}%)
                      </span>
                    ) : (
                      <span className="font-bold text-white font-mono">توازن كامل (0.00)</span>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#C5A028] hover:bg-[#d9b132] text-[#0a0a0a] font-bold py-2.5 px-4 rounded transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(197,160,40,0.15)]"
              >
                <FilePlus2 className="w-4 h-4" />
                <span>ترحيل وتسجيل صبة الشجرة</span>
              </button>
            </form>
          </div>
        </div>

        {/* List Records View Table */}
        <div className="md:col-span-12 lg:col-span-7 space-y-4">
          <div className="bg-[#141414] p-4 rounded border border-[#2a2a2a] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#666] absolute right-3 top-3" />
              <input
                type="text"
                placeholder="البحث بالبيانات، اليوم أو الملاحظات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-right text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded pl-3 pr-9 py-2 text-xs focus:border-[#C5A028] focus:bg-[#0c0c0c] focus:outline-none transition-colors"
              />
            </div>
            <div className="text-xs text-[#888] font-medium">
              تصفية النتائج: عرض <span className="text-[#C5A028] font-bold">{filteredRecords.length}</span> من أصل <span className="text-[#C5A028] font-bold">{records.length}</span> سجل شجرة
            </div>
          </div>

          <div className="bg-[#141414] rounded border border-[#2a2a2a] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-[#1a1a1a] border-b border-[#2a2a2a] text-[#888] text-xs">
                  <tr>
                    <th className="px-3 py-3 text-center font-bold">حذف</th>
                    <th className="px-3 py-3 font-bold text-center">صور المخرجات</th>
                    <th className="px-3 py-3 font-bold">تفاصيل الإنتاج والتالف</th>
                    <th className="px-3 py-3 text-center font-bold">% العجز/الوفر</th>
                    <th className="px-3 py-3 text-left font-bold font-mono">النقص/العجز</th>
                    <th className="px-3 py-3 text-left font-bold font-mono">الإنتاج + التالف</th>
                    <th className="px-3 py-3 text-left font-bold font-mono">وزن المدخل</th>
                    <th className="px-3 py-3 font-bold text-center">التاريخ / الوقت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-[#666] text-xs">
                        لا يوجد أي سجلات لصبة الشجرة حالياً. أدخل البيانات في النموذج أعلاه.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => {
                      const isPending = record.isPending;
                      const isProfit = !isPending && record.loss !== undefined && record.loss < 0;
                      const absLoss = !isPending && record.loss !== undefined ? Math.abs(record.loss) : 0;
                      const pct = !isPending && record.inputWeight > 0 && record.loss !== undefined ? (absLoss / record.inputWeight) * 100 : 0;
                      return (
                        <tr key={record.id} className="hover:bg-[#1a1a1a]/40 transition-colors">
                          {/* Delete Action */}
                          <td className="px-3 py-3 text-center">
                            <button
                              onClick={() => onDeleteRecord(record.id)}
                              className="p-1 text-[#666] hover:text-rose-400 rounded hover:bg-rose-950/20 transition-colors cursor-pointer"
                              title="حذف هذا السجل"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>

                          {/* Images Output Cell */}
                          <td className="px-3 py-3">
                            {isPending ? (
                              <span className="text-[10px] text-amber-500 italic">معلق</span>
                            ) : (
                              <div className="flex justify-center items-center gap-2">
                                {record.productionImage ? (
                                  <button
                                    type="button"
                                    onClick={() => setZoomImage(record.productionImage || null)}
                                    className="relative group block w-8 h-8 rounded border border-[#333] overflow-hidden hover:border-[#C5A028] transition-colors"
                                    title="عرض صورة الإنتاج"
                                  >
                                    <img src={record.productionImage} alt="الإنتاج" className="w-full h-full object-cover" />
                                    <span className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <Eye className="w-3 h-3 text-[#C5A028]" />
                                    </span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-[#444] font-serif" title="لا توجد صورة للإنتاج">لا إنتاج</span>
                                )}

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
                                  <span className="text-[10px] text-[#444]" title="لا توجد صورة للتالف">لا تالف</span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Details & description cell */}
                          <td className="px-3 py-3 text-[#ccc] max-w-[200px] text-xs">
                            {isPending ? (
                              <div className="text-[11px] text-amber-500/90 leading-tight font-sans font-bold flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> تحت الصب الشمعي
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {/* Production details */}
                                {((record.productionCount ?? 0) > 0 || record.productionDetails) && (
                                  <div className="text-[11px] text-emerald-400/90 leading-tight">
                                    <span className="font-bold">الإنتاج ({record.productionCount} قطع):</span>{" "}
                                    <span className="text-[#aaa]">{record.productionDetails || "بدون تفاصيل"}</span>
                                  </div>
                                )}
                                
                                {/* Damaged details */}
                                {((record.damagedCount ?? 0) > 0 || record.damagedDetails) && (
                                  <div className="text-[11px] text-rose-400/90 leading-tight">
                                    <span className="font-bold">التالف ({record.damagedCount} قطع):</span>{" "}
                                    <span className="text-[#aaa]">{record.damagedDetails || "بدون تفاصيل"}</span>
                                  </div>
                                )}

                                {record.notes && (
                                  <div className="text-[10px] text-yellow-500/80 italic">
                                    * {record.notes}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Loss percentage */}
                          <td className="px-3 py-3 text-center font-mono">
                            {isPending ? (
                              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                                معلّق ⏳
                              </span>
                            ) : (
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${isProfit ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/40' : 'bg-rose-950/30 text-rose-400 border border-rose-900/40'}`}>
                                {pct.toFixed(2)}% {isProfit ? "زيادة" : "نقص"}
                              </span>
                            )}
                          </td>

                          {/* Shortage/Excess weight cell */}
                          <td className={`px-3 py-3 text-left font-mono font-bold ${isPending ? 'text-amber-500 bg-amber-950/5' : (isProfit ? 'text-emerald-400 bg-emerald-950/10' : 'text-rose-400 bg-rose-950/10')}`}>
                            {isPending ? (
                              <span className="text-[11px] text-amber-500/90 font-sans font-bold">بانتظار الصب</span>
                            ) : isProfit ? (
                              `+${absLoss.toFixed(3)}`
                            ) : (
                              `-${absLoss.toFixed(3)}`
                            )}
                          </td>

                          {/* Raw outputs weight (prod + damaged) */}
                          <td className="px-3 py-3 text-left font-mono text-[#e0e0e0]">
                            {isPending ? (
                              <button
                                onClick={() => handleOpenUpdate(record)}
                                className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-neutral-950 text-[11px] font-black rounded-lg shadow-[0_2px_10px_rgba(197,160,40,0.2)] hover:scale-105 active:scale-95 transition-all text-center cursor-pointer font-sans whitespace-nowrap"
                                title="إدخال مخرجات صب الشجرة"
                              >
                                إكمال الشجرة 🌳
                              </button>
                            ) : (
                              <div className="leading-tight">
                                <div>{((record.productionWeight ?? 0) + (record.damagedWeight ?? 0)).toFixed(3)}</div>
                                <div className="text-[10px] text-[#666]">({(record.productionWeight ?? 0).toFixed(2)} س + {(record.damagedWeight ?? 0).toFixed(2)} ت)</div>
                              </div>
                            )}
                          </td>

                          {/* Input Weight */}
                          <td className="px-3 py-3 text-left font-mono text-white bg-[#1a1a1a]/30">
                            {record.inputWeight.toFixed(3)}
                          </td>

                          {/* Date */}
                          <td className="px-3 py-3 text-center text-[#888] text-xs whitespace-nowrap">
                            <div>{record.date}</div>
                            {record.time && (
                              <div className="text-[#C5A028] font-mono text-[10px] mt-0.5">{record.time}</div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>

                {records.length > 0 && (
                  <tfoot className="bg-[#0f0f0f] divide-y divide-[#222] text-[#fff] text-xs font-mono">
                    <tr className="font-bold border-t border-[#2a2a2a]">
                      <td className="px-3 py-3 text-center text-[#C5A028] font-sans" colSpan={2}>المجموع</td>
                      <td className="px-3 py-3 text-[#888] text-right font-sans">
                        إجمالي صبات السلسلة والشجر:{" "}
                        <span className="text-emerald-400 font-bold">{totalProdCount} صالحة</span> {" | "}
                        <span className="text-rose-400 font-bold">{totalDamagedCount} تألفة</span>
                      </td>
                      <td className="px-3 py-3 text-center text-[#C5A028]">
                        {(Math.abs(totalLoss) / totalInput * 100).toFixed(2)}% <span className="text-[9px] text-[#888] font-sans">({totalLoss >= 0 ? "عجز" : "زيادة"})</span>
                      </td>
                      <td className={`px-3 py-3 text-left font-bold ${totalLoss >= 0 ? 'text-rose-400 bg-rose-950/30' : 'text-emerald-400 bg-emerald-950/30'}`}>
                        {totalLoss >= 0 ? `-${totalLoss.toFixed(3)}` : `+${Math.abs(totalLoss).toFixed(3)}`} غرام
                      </td>
                      <td className="px-3 py-3 text-left text-white leading-tight">
                        {(totalProd + totalDamaged).toFixed(3)} غرام
                        <div className="text-[9px] text-[#777] font-sans">({totalProd.toFixed(2)} صافي + {totalDamaged.toFixed(2)} تالف)</div>
                      </td>
                      <td className="px-3 py-3 text-left text-[#C5A028] bg-[#141414]">
                        {totalInput.toFixed(3)} غرام
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

      {/* Full Scale Image Preview Modal */}
      {zoomImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-center items-center p-4" onClick={() => setZoomImage(null)}>
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
            <img src={zoomImage} alt="معاينة كاملة" className="max-w-full max-h-full object-contain rounded border border-[#2a2a2a] shadow-2xl" />
            <button
              type="button"
              className="absolute top-2 right-2 text-white/50 hover:text-white bg-[#1a1a1a]/80 p-2.5 rounded-full transition-colors cursor-pointer"
              onClick={() => setZoomImage(null)}
            >
              <EyeOff className="w-6 h-6" />
            </button>
          </div>
          <p className="text-[#888] text-xs mt-4 font-sans text-center">اضغط في أي مكان للإغلاق مع المعاينة الكاملة</p>
        </div>
      )}

      {/* Complete/Update Tree Casting Modal */}
      {updatingRecordId && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100] p-4 animate-fadeIn backdrop-blur-sm">
          <div className="bg-[#0f0f0f] border border-[#222] rounded-2xl p-6 max-w-lg w-full shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C5A028] to-transparent opacity-80" />
            
            <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
              <TreePine className="w-5 h-5 text-[#C5A028]" /> إكمال صبة الشجرة (تسجيل البعد)
            </h3>
            <p className="text-[11px] text-[#888] mb-4 leading-relaxed">
              قم بتسجيل تفاصيل مخرجات الشجرة (الإنتاج الصافي والتالف ونسب العجز التفصيلية في الورشة)
            </p>

            <form onSubmit={handleSaveUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                {/* Production Area */}
                <div className="space-y-3 bg-[#111] p-3 rounded-xl border border-emerald-950/20">
                  <h4 className="text-[11px] font-bold text-emerald-400 border-b border-[#222] pb-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> مخرجات الإنتاج الصافي
                  </h4>
                  
                  <div>
                    <label className="block text-[10px] text-[#888] mb-0.5">الوزن الصافي السليم</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        required
                        placeholder="0.000"
                        value={upProdWeight}
                        onChange={(e) => setUpProdWeight(e.target.value)}
                        className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1 text-xs text-left font-mono focus:border-[#C5A028] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#888] mb-0.5">عدد قطع الإنتاج</label>
                    <input
                      type="number"
                      placeholder="قطع"
                      value={upProdCount}
                      onChange={(e) => setUpProdCount(e.target.value)}
                      className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1 text-xs font-mono focus:border-[#C5A028] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#888] mb-0.5">تفصيل قطع الإنتاج</label>
                    <textarea
                      rows={1.5}
                      placeholder="خواتم..."
                      value={upProdDetails}
                      onChange={(e) => setUpProdDetails(e.target.value)}
                      className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1 text-xs focus:border-[#C5A028] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#888] mb-0.5">صورة الإنتاج</label>
                    {upProdImage ? (
                      <div className="relative border border-neutral-800 rounded overflow-hidden aspect-video">
                        <img src={upProdImage} alt="الإنتاج" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setUpProdImage("")} className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 hover:bg-rose-950 text-white rounded-full"><XCircle className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center border border-dashed border-neutral-800 rounded p-1 text-center cursor-pointer bg-neutral-900/30">
                        <UploadCloud className="w-4 h-4 text-neutral-600" />
                        <span className="text-[8px] text-neutral-500 mt-0.5 font-sans">اضغط للرفع</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const r = new FileReader();
                            r.onloadend = () => setUpProdImage(r.result as string);
                            r.readAsDataURL(file);
                          }
                        }} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Damaged Area */}
                <div className="space-y-3 bg-[#111] p-3 rounded-xl border border-rose-950/20">
                  <h4 className="text-[11px] font-bold text-rose-400 border-b border-[#222] pb-1 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> مخرجات التالف والرمال
                  </h4>

                  <div>
                    <label className="block text-[10px] text-[#888] mb-0.5">وزن التالف / الخردة</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        placeholder="0.000"
                        value={upDamagedWeight}
                        onChange={(e) => setUpDamagedWeight(e.target.value)}
                        className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1 text-xs text-left font-mono focus:border-[#C5A028] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#888] mb-0.5">عدد قطع التالف</label>
                    <input
                      type="number"
                      placeholder="قطع"
                      value={upDamagedCount}
                      onChange={(e) => setUpDamagedCount(e.target.value)}
                      className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1 text-xs font-mono focus:border-[#C5A028] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#888] mb-0.5">تفصيل التالف</label>
                    <textarea
                      rows={1.5}
                      placeholder="أسباب التلف..."
                      value={upDamagedDetails}
                      onChange={(e) => setUpDamagedDetails(e.target.value)}
                      className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1 text-xs focus:border-[#C5A028] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#888] mb-0.5">صورة التالف</label>
                    {upDamagedImage ? (
                      <div className="relative border border-neutral-800 rounded overflow-hidden aspect-video">
                        <img src={upDamagedImage} alt="التالف" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setUpDamagedImage("")} className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 hover:bg-rose-950 text-white rounded-full"><XCircle className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center border border-dashed border-neutral-800 rounded p-1 text-center cursor-pointer bg-neutral-900/30">
                        <UploadCloud className="w-4 h-4 text-neutral-600" />
                        <span className="text-[8px] text-neutral-500 mt-0.5 font-sans">اضغط للرفع</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const r = new FileReader();
                            r.onloadend = () => setUpDamagedImage(r.result as string);
                            r.readAsDataURL(file);
                          }
                        }} />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#aaa] mb-1">
                  ملاحظات أو شهود إضافيين على تصفية الشجرة
                </label>
                <textarea
                  rows={2}
                  placeholder="مثال: تمت تصفية الشمع والصب وقياس النقيصة تماماً..."
                  value={upNotes}
                  onChange={(e) => setUpNotes(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] focus:ring-1 focus:outline-none resize-none font-sans"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-grow py-2.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-neutral-950 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-[0_4px_12px_rgba(197,160,40,0.2)]"
                >
                  حفظ تصفية الشجرة وحساب العجز
                </button>
                <button
                  type="button"
                  onClick={() => setUpdatingRecordId(null)}
                  className="py-2.5 px-4 bg-[#1a1a1a] hover:bg-[#252525] text-[#aaa] font-bold rounded-xl text-xs border border-neutral-800 cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
