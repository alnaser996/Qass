import React, { useState } from "react";
import { CastingRecord } from "../types";
import { FilePlus2, Trash2, Calendar, Scale, Hammer, Search, Clock, CheckCircle2, AlertCircle, Eye, EyeOff, UploadCloud, XCircle, TreePine, Layers, Edit } from "lucide-react";

interface CastingTabProps {
  records: CastingRecord[];
  onAddRecord: (record: Omit<CastingRecord, "id" | "loss"> & { isPending?: boolean }) => void;
  onDeleteRecord: (id: string) => void;
  onUpdateRecord: (
    id: string,
    kar: number,
    sabba?: number,
    notes?: string,
    afterImage?: string,
    date?: string,
    time?: string,
    varianceReason?: string
  ) => void;
}

export const CastingTab: React.FC<CastingTabProps> = ({
  records,
  onAddRecord,
  onDeleteRecord,
  onUpdateRecord,
}) => {
  // Current registration steps inside form panel
  const [formMode, setFormMode] = useState<"before" | "after" | "both">("before");
  
  // Before Inputs
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [time, setTime] = useState<string>(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  });
  const [kar, setKar] = useState<string>("");
  const [beforeImage, setBeforeImage] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Both Inputs (only active in 'both' mode)
  const [sabba, setSabba] = useState<string>("");
  const [afterImage, setAfterImage] = useState<string>("");
  const [varianceReason, setVarianceReason] = useState<string>(""); // سبب النقص أو الزيادة

  // Standalone 'after' mode state (for direct form updates)
  const [selectedPendingId, setSelectedPendingId] = useState<string>("");
  const [afterFormSabba, setAfterFormSabba] = useState<string>("");
  const [afterFormImage, setAfterFormImage] = useState<string>("");
  const [afterFormNotes, setAfterFormNotes] = useState<string>("");
  const [afterFormVarianceReason, setAfterFormVarianceReason] = useState<string>(""); // سبب النقص أو الزيادة

  // Global UI
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showPromoted, setShowPromoted] = useState<boolean>(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Modal / Update State (from row click)
  const [updatingRecordId, setUpdatingRecordId] = useState<string | null>(null);
  const [updatingSabba, setUpdatingSabba] = useState<string>("");
  const [updatingNotes, setUpdatingNotes] = useState<string>("");
  const [updatingAfterImage, setUpdatingAfterImage] = useState<string>("");
  const [updatingVarianceReason, setUpdatingVarianceReason] = useState<string>(""); // سبب النقص أو الزيادة

  // Parsed weights
  const parsedKar = parseFloat(kar) || 0;
  const parsedSabba = parseFloat(sabba) || 0;
  const computedLoss = parsedKar - parsedSabba;
  const computedLossPercent = parsedKar > 0 ? (Math.abs(computedLoss) / parsedKar) * 100 : 0;

  // Handle Image Conversion
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>, type: "before" | "after" | "afterForm" | "updatingAfter") => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => {
        const result = r.result as string;
        if (type === "before") setBeforeImage(result);
        else if (type === "after") setAfterImage(result);
        else if (type === "afterForm") setAfterFormImage(result);
        else if (type === "updatingAfter") setUpdatingAfterImage(result);
      };
      r.readAsDataURL(file);
    }
  };

  const handleBeforeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedKar <= 0) {
      alert("الرجاء إدخال وزن الكسر (القبل) بشكل صحيح");
      return;
    }

    onAddRecord({
      date,
      time,
      kar: parsedKar,
      sabba: undefined,
      notes: notes.trim(),
      isPending: true,
      beforeImage,
      afterImage: undefined,
    });

    setKar("");
    setBeforeImage("");
    setNotes("");
    
    // Switch to step 2 automatically if there are pending items to encourage completion
    // setFormMode("after");
  };

  const handleBothSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedKar <= 0) {
      alert("الرجاء إدخال وزن الكسر (القبل) بشكل صحيح");
      return;
    }
    if (parsedSabba <= 0) {
      alert("الرجاء إدخال وزن الصبة الناتجة (البعد)");
      return;
    }

    onAddRecord({
      date,
      time,
      kar: parsedKar,
      sabba: parsedSabba,
      notes: notes.trim(),
      varianceReason: varianceReason.trim(),
      isPending: false,
      beforeImage,
      afterImage,
    });

    setKar("");
    setSabba("");
    setBeforeImage("");
    setAfterImage("");
    setNotes("");
    setVarianceReason("");
  };

  // Standalone 'after' form submission
  const handleStandaloneAfterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedUpSabba = parseFloat(afterFormSabba) || 0;
    if (!selectedPendingId) {
      alert("الرجاء تحديد العملية المعلقة لإكمالها");
      return;
    }
    if (parsedUpSabba <= 0) {
      alert("الرجاء إدخال وزن الصبة الناتجة (الوزن بعد الصهر)");
      return;
    }

    const pendingItem = records.find(r => r.id === selectedPendingId);
    const originalKar = pendingItem ? pendingItem.kar : 0;
    onUpdateRecord(selectedPendingId, originalKar, parsedUpSabba, afterFormNotes.trim(), afterFormImage, undefined, undefined, afterFormVarianceReason.trim());
    
    setSelectedPendingId("");
    setAfterFormSabba("");
    setAfterFormImage("");
    setAfterFormNotes("");
    setAfterFormVarianceReason("");
    alert("تم استلام الصبة وحساب نقيصة الصهر بنجاح!");
  };

  // Row update triggers
  const handleOpenUpdate = (record: CastingRecord) => {
    setUpdatingRecordId(record.id);
    setUpdatingSabba("");
    setUpdatingNotes(record.notes || "");
    setUpdatingAfterImage("");
    setUpdatingVarianceReason(record.varianceReason || "");
  };

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedUpSabba = parseFloat(updatingSabba) || 0;
    if (parsedUpSabba <= 0) {
      alert("الرجاء إدخال وزن صبة صحيح أكبر من الصفر");
      return;
    }
    if (updatingRecordId) {
      const updatingRecord = records.find(r => r.id === updatingRecordId);
      const originalKar = updatingRecord ? updatingRecord.kar : 0;
      onUpdateRecord(updatingRecordId, originalKar, parsedUpSabba, updatingNotes.trim(), updatingAfterImage, undefined, undefined, updatingVarianceReason.trim());
      setUpdatingRecordId(null);
      setUpdatingSabba("");
      setUpdatingNotes("");
      setUpdatingAfterImage("");
      setUpdatingVarianceReason("");
    }
  };

  // General Edit Modal State (Allows editing absolutely anything including Kar and Sabba)
  const [editingRecord, setEditingRecord] = useState<CastingRecord | null>(null);
  const [editingKar, setEditingKar] = useState<string>("");
  const [editingSabba, setEditingSabba] = useState<string>("");
  const [editingDate, setEditingDate] = useState<string>("");
  const [editingTime, setEditingTime] = useState<string>("");
  const [editingNotes, setEditingNotes] = useState<string>("");
  const [editingAfterImage, setEditingAfterImage] = useState<string>("");
  const [editingVarianceReason, setEditingVarianceReason] = useState<string>("");

  const handleOpenGeneralEdit = (record: CastingRecord) => {
    setEditingRecord(record);
    setEditingKar(String(record.kar));
    setEditingSabba(record.sabba !== undefined ? String(record.sabba) : "");
    setEditingDate(record.date);
    setEditingTime(record.time || "");
    setEditingNotes(record.notes || "");
    setEditingAfterImage(record.afterImage || "");
    setEditingVarianceReason(record.varianceReason || "");
  };

  const handleSaveGeneralEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    
    const parsedKarVal = parseFloat(editingKar) || 0;
    if (parsedKarVal <= 0) {
      alert("الرجاء إدخال وزن كسر (القبل) صحيح أكبر من الصفر");
      return;
    }

    const hasSabba = editingSabba.trim() !== "";
    const parsedSabbaVal = hasSabba ? parseFloat(editingSabba) : undefined;
    if (hasSabba && (parsedSabbaVal === undefined || parsedSabbaVal <= 0)) {
      alert("الرجاء إدخال وزن صبة ناتجة صحيح أو تركه فارغاً");
      return;
    }

    onUpdateRecord(
      editingRecord.id,
      parsedKarVal,
      parsedSabbaVal,
      editingNotes.trim(),
      editingAfterImage,
      editingDate,
      editingTime,
      editingVarianceReason.trim()
    );

    setEditingRecord(null);
    setEditingVarianceReason("");
    alert("تم تعديل السجل وتحديث الأوزان وعمليات الحساب بنجاح! ⚖️");
  };

  // Pending records list for dropdown
  const pendingRecords = records.filter((r) => r.isPending);

  // Filters
  const filteredRecords = records.filter((r) => {
    if (!showPromoted && r.isPromoted) return false;
    if (!searchQuery) return true;
    return (
      r.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.date.includes(searchQuery)
    );
  });

  // Aggregated Sum totals
  const completedRecords = records.filter(r => !r.isPending);
  const totalKar = records.reduce((sum, r) => sum + r.kar, 0);
  const totalSabba = completedRecords.reduce((sum, r) => sum + (r.sabba ?? 0), 0);
  const totalLoss = completedRecords.reduce((sum, r) => sum + (r.loss ?? 0), 0);
  const completedKarSum = completedRecords.reduce((sum, r) => sum + r.kar, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Registration Column */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <div className="bg-[#0f0f0f] rounded-2xl border border-[#222] p-6 shadow-2xl hover:border-[#333] transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C5A028] to-transparent opacity-60" />
          
          <div className="flex items-center gap-3 border-b border-[#222] pb-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-xl text-[#C5A028] border border-[#d4af37]/10">
              <Hammer className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-md font-bold text-white font-sans">تسجيل صهر وصب السبيكة</h2>
              <p className="text-[11px] text-[#888] font-sans mt-0.5">تسجيل وجذاذات الأوزان ومقارنة صور القبل والبعد</p>
            </div>
          </div>

          {/* Stepper Navigation bar for القبل / البعد / المباشر */}
          <div className="bg-[#141414] p-1 rounded-xl border border-[#222] flex gap-1 mb-5">
            <button
              type="button"
              onClick={() => setFormMode("before")}
              className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer ${
                formMode === "before"
                  ? "bg-[#C5A028] text-neutral-950 font-black shadow-md"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              ١. تسجيل (القبل) ⏳
            </button>
            <button
              type="button"
              onClick={() => setFormMode("after")}
              className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer ${
                formMode === "after"
                  ? "bg-amber-500/20 text-[#C5A028] border border-amber-500/30 font-black shadow-md"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              ٢. استلام (البعد) ⚖️
            </button>
            <button
              type="button"
              onClick={() => setFormMode("both")}
              className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer ${
                formMode === "both"
                  ? "bg-neutral-800 text-white border border-[#333] font-black"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              ترحيل كامل ✍️
            </button>
          </div>

          {/* MODE 1: BEFORE FORM */}
          {formMode === "before" && (
            <form onSubmit={handleBeforeSubmit} className="space-y-4 animate-fadeIn">
              <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg text-[11px] text-amber-500 mb-1 leading-relaxed">
                📢 <strong>تسجيل القبل:</strong> استخدم هذا القسم لتوثيق كمية الذهب الكسر المستلمة مع الصورة قبل وضعها في الفرن للصهر.
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#aaa] mb-1">التاريخ</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-2 text-xs font-mono text-right focus:border-[#C5A028] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#aaa] mb-1">الوقت</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-2 text-xs font-mono text-right focus:border-[#C5A028] outline-none"
                  />
                </div>
              </div>

              {/* Input weight */}
              <div>
                <label className="block text-xs font-bold text-[#e0e0e0] mb-1 flex justify-between">
                  <span>استلام الكسر (خام صهر عيار ٢١)</span>
                  <span className="text-[10px] text-[#C5A028]">القبل</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={kar}
                    onChange={(e) => setKar(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl pl-12 pr-4 py-2 text-sm text-left font-mono focus:border-[#C5A028] outline-none"
                  />
                  <span className="absolute left-3 top-2.5 text-[11px] text-[#555] font-bold">غرام</span>
                </div>
              </div>

              {/* Before Image Upload */}
              <div>
                <label className="block text-[11px] font-semibold text-[#aaa] mb-1">صورة الذهب/الكسر قبل الصهر</label>
                {beforeImage ? (
                  <div className="relative border border-[#222] rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center">
                    <img src={beforeImage} alt="القبل" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setBeforeImage("")}
                      className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-rose-950 text-white rounded-full"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border border-dashed border-[#222] hover:border-[#C5A028]/35 rounded-xl p-4 text-center cursor-pointer bg-[#141414] transition-colors">
                    <UploadCloud className="w-6 h-6 text-[#555]" />
                    <span className="text-xs text-[#666] mt-1.5 font-sans">اسحب أو اضغط لرفع صورة القبل</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFile(e, "before")}
                    />
                  </label>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] text-[#aaa] mb-1">بيانات الوجبة أو عهدة الصائغ</label>
                <textarea
                  rows={2}
                  placeholder="مثال: ذهب كسر عيار 21 تسليم ورشة أبو علي..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#C5A028] hover:bg-[#d9b132] text-neutral-950 font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
              >
                <FilePlus2 className="w-4 h-4" />
                <span>ترحيل وجدولة الصهر ⏳</span>
              </button>
            </form>
          )}

          {/* MODE 2: STANDALONE AFTER FORM */}
          {formMode === "after" && (
            <form onSubmit={handleStandaloneAfterSubmit} className="space-y-4 animate-fadeIn">
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg text-[11px] text-emerald-400 mb-1 leading-relaxed">
                ⚖️ <strong>إكمال البعد:</strong> اختر من الصبات المعلقة (المطبوخة في الفرن حالياً) لتسجيل وتأكيد وزن السبيكة المنتجة بعد الصهر وحساب النقيصة فوراً.
              </div>

              {/* Selection Dropdown of Pending Castings */}
              <div>
                <label className="block text-xs font-bold text-[#e0e0e0] mb-1">اختر العملية المعلقة (قيد الصهر):</label>
                {pendingRecords.length === 0 ? (
                  <div className="bg-[#141414] border border-dashed border-[#222] text-center p-6 rounded-xl text-[#555] text-xs">
                    لا توجد صبات جارية بانتظار التصفية حالياً. ابدأ بتوثيق الصهر في صفحة "القبل"!
                  </div>
                ) : (
                  <select
                    required
                    value={selectedPendingId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedPendingId(id);
                      const rec = records.find(r => r.id === id);
                      if (rec) {
                        setAfterFormNotes(rec.notes || "");
                      }
                    }}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none"
                  >
                    <option value="">-- حدد الوجبة المعلقة من الدفتر --</option>
                    {pendingRecords.map((r) => (
                      <option key={r.id} value={r.id}>
                        مستلم كسر: {r.kar.toFixed(3)}g | تاريخ: {r.date} ({r.time || ""})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedPendingId && (
                <>
                  {/* Weight After */}
                  <div>
                    <label className="block text-xs font-bold text-emerald-400 mb-1 flex justify-between">
                      <span>وزن السبيكة الواصلة (الصبة)</span>
                      <span className="text-[10px] text-[#C5A028]">البعد</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        required
                        placeholder="0.000"
                        value={afterFormSabba}
                        onChange={(e) => setAfterFormSabba(e.target.value)}
                        className="w-full text-white bg-[#141414] border border-emerald-950 rounded-xl pl-12 pr-4 py-2 text-sm text-left font-mono focus:border-[#C5A028] outline-none"
                      />
                      <span className="absolute left-3 top-2.5 text-[11px] text-emerald-500 font-bold">غرام</span>
                    </div>
                  </div>

                  {/* After Image Upload */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#aaa] mb-1">صورة الصبة المنتجة/سبيكة الذهب</label>
                    {afterFormImage ? (
                      <div className="relative border border-[#222] rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center">
                        <img src={afterFormImage} alt="البعد" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => setAfterFormImage("")}
                          className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-rose-950 text-white rounded-full"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center border border-dashed border-[#222] hover:border-[#C5A028]/35 rounded-xl p-4 text-center cursor-pointer bg-[#141414] transition-colors">
                        <UploadCloud className="w-6 h-6 text-[#555]" />
                        <span className="text-xs text-[#666] mt-1.5 font-sans">اسحب أو اضغط لرفع صورة البعد</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageFile(e, "afterForm")}
                        />
                      </label>
                    )}
                  </div>

                  {/* Notes update */}
                  <div>
                    <label className="block text-[11px] text-[#aaa] mb-1">تحديث الملاحظات والشهود</label>
                    <textarea
                      rows={2}
                      placeholder="ملاحظات بعد الحصول على الصبة والسبك..."
                      value={afterFormNotes}
                      onChange={(e) => setAfterFormNotes(e.target.value)}
                      className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none resize-none"
                    />
                  </div>

                  {/* Variance Reason */}
                  <div>
                    <label className="block text-[11px] text-[#aaa] mb-1">سبب النقص أو الزيادة (العجز أو الوفر)</label>
                    <input
                      type="text"
                      placeholder="مثال: شوائب بالكسر، تطاير كلي، عجز طبيعي بالبوتقة..."
                      value={afterFormVarianceReason}
                      onChange={(e) => setAfterFormVarianceReason(e.target.value)}
                      className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-[#000] font-black py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تصفية وحساب النقيصة فوراً ⚖️</span>
                  </button>
                </>
              )}
            </form>
          )}

          {/* MODE 3: BOTH (INTEGRATED FULL FORM) */}
          {formMode === "both" && (
            <form onSubmit={handleBothSubmit} className="space-y-4 animate-fadeIn">
              <div className="bg-[#141414] p-3 rounded-lg text-[11px] border border-[#222] text-[#888] mb-1 leading-relaxed">
                ✍️ <strong>الترحيل الكامل:</strong> هل قمت بالصهر والوزن بالفعل؟ دخل القبل والبعد وصورهم معاً كإجراء جرد سريع.
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#aaa] mb-1">التاريخ</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-2 text-xs font-mono text-right focus:border-[#C5A028] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#aaa] mb-1">الوقت</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-2 text-xs font-mono text-right focus:border-[#C5A028] outline-none"
                  />
                </div>
              </div>

              {/* Input Weight */}
              <div>
                <label className="block text-xs font-bold text-[#aaa] mb-1">وزن استلام قبل الصهر (الكسر)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={kar}
                    onChange={(e) => setKar(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl pl-12 pr-4 py-2 text-xs text-left font-mono focus:border-[#C5A028] outline-none"
                  />
                  <span className="absolute left-3 top-2.5 text-[11px] text-[#555] font-bold">غرام</span>
                </div>
              </div>

              {/* Output Weight */}
              <div>
                <label className="block text-xs font-bold text-[#aaa] mb-1">وزن صب السبيكة (بعد الصهر)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={sabba}
                    onChange={(e) => setSabba(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl pl-12 pr-4 py-2 text-xs text-left font-mono focus:border-[#C5A028] outline-none"
                  />
                  <span className="absolute left-3 top-2.5 text-[11px] text-[#555] font-bold">غرام</span>
                </div>
              </div>

              {/* Double Image Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] text-[#888] mb-1">صورة قبل الصهر</label>
                  {beforeImage ? (
                    <div className="relative border border-[#222] rounded-lg overflow-hidden h-14 bg-black">
                      <img src={beforeImage} alt="قبل" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setBeforeImage("")} className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 text-white rounded-full"><XCircle className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-1 border border-dashed border-[#222] rounded-lg h-14 cursor-pointer bg-[#141414] text-[9px] text-[#666]">
                      <UploadCloud className="w-4 h-4" />
                      <span>رفع قبل</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e, "before")} />
                    </label>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] text-[#888] mb-1">صورة بعد الصهر</label>
                  {afterImage ? (
                    <div className="relative border border-[#222] rounded-lg overflow-hidden h-14 bg-black">
                      <img src={afterImage} alt="بعد" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setAfterImage("")} className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 text-white rounded-full"><XCircle className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-1 border border-dashed border-[#222] rounded-lg h-14 cursor-pointer bg-[#141414] text-[9px] text-[#666]">
                      <UploadCloud className="w-4 h-4" />
                      <span>رفع بعد</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e, "after")} />
                    </label>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] text-[#aaa] mb-1">ملاحظات وشهود</label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات الصهر والسبك..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none resize-none"
                />
              </div>

              {/* Variance Reason */}
              <div>
                <label className="block text-[11px] text-[#aaa] mb-1">سبب النقص أو الزيادة (العجز أو الوفر)</label>
                <input
                  type="text"
                  placeholder="مثال: تطاير فرن، شوائب صبغية بالذهب، إضافة نحاس..."
                  value={varianceReason}
                  onChange={(e) => setVarianceReason(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none"
                />
              </div>

              {/* Live calc */}
              {parsedKar > 0 && parsedSabba > 0 && (
                <div className="bg-[#141414] p-3 rounded-lg border border-[#222] text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#666]">النقيصة / الوفر:</span>
                    <span className={computedLoss >= 0 ? "text-rose-400 font-bold font-mono" : "text-emerald-400 font-bold font-mono"}>
                      {computedLoss >= 0 ? `-${computedLoss.toFixed(3)}` : `+${Math.abs(computedLoss).toFixed(3)}`}g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666]">النسبة المئوية:</span>
                    <span className="font-mono text-white">{computedLossPercent.toFixed(2)}%</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#C5A028] hover:bg-[#d9b132] text-neutral-950 font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-lg"
              >
                ترحيل السجل بالكامل ⚖️
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Tables Column */}
      <div className="lg:col-span-12 xl:col-span-8 space-y-4">
        {/* Search Header */}
        <div className="bg-[#141414] p-4 rounded-2xl border border-[#222] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#555] absolute right-3 top-3.5" />
              <input
                type="text"
                placeholder="البحث باليوم، التاريخ أو الملاحظة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-right text-white bg-[#181818] border border-[#222] rounded-xl pl-3 pr-9 py-2.5 text-xs focus:border-[#C5A028] outline-none transition-colors"
              />
            </div>
            <label className="flex items-center gap-2 px-3 py-2 bg-[#181818] hover:bg-[#1f1f1f] border border-[#222] rounded-xl cursor-pointer select-none transition-colors text-[11px] text-[#aaa]">
              <input
                type="checkbox"
                checked={showPromoted}
                onChange={(e) => setShowPromoted(e.target.checked)}
                className="accent-[#C5A028] h-3.5 w-3.5 rounded cursor-pointer"
              />
              <span>عرض السجلات المرحلة والأرشيف 📂</span>
            </label>
          </div>
          <div className="text-xs text-[#888] font-medium">
            عرض <span className="text-[#C5A028] font-bold">{filteredRecords.length}</span> من أصل <span className="text-[#C5A028] font-bold">{records.length}</span> عملية صهر
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-[#141414] rounded-2xl border border-[#222] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-[#181818] border-b border-[#222] text-[#888] text-xs">
                <tr>
                  <th className="px-3 py-3 text-center font-bold">الإجراءات</th>
                  <th className="px-3 py-3 text-center font-bold">سبب النقص أو الزيادة</th>
                  <th className="px-3 py-3 text-center font-bold">صور السبيكة</th>
                  <th className="px-3 py-3 font-bold">ملاحظات الصهر</th>
                  <th className="px-3 py-3 text-center font-bold">% نسبة النقيصة</th>
                  <th className="px-3 py-3 text-left font-bold font-mono">طبيعة العجز (-) / الوفر (+)</th>
                  <th className="px-3 py-3 text-left font-bold font-mono">وزن الصبة (البعد)</th>
                  <th className="px-3 py-3 text-left font-bold font-mono">استلام كسر (القبل)</th>
                  <th className="px-3 py-3 font-bold text-center">التاريخ / الوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-[#666] text-xs">
                      لا توجد سجلات سبك وصهر مدخلة حالياً. استخدم لوحة التسجيل لبدء الجرد.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => {
                    const isPending = record.isPending;
                    const isProfit = !isPending && record.loss !== undefined && record.loss < 0;
                    const absoluteLoss = !isPending && record.loss !== undefined ? Math.abs(record.loss) : 0;
                    const pct = !isPending && record.kar > 0 && record.loss !== undefined ? (absoluteLoss / record.kar) * 100 : 0;
                    
                    return (
                      <tr key={record.id} className={`hover:bg-[#1a1a1a]/40 transition-colors ${isPending ? 'bg-amber-950/5 border-r-2 border-r-amber-500/50' : ''}`}>
                        {/* Action delete & edit */}
                        <td className="px-3 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenGeneralEdit(record)}
                              className="p-1 text-[#555] hover:text-[#C5A028] rounded-lg hover:bg-[#C5A028]/10 transition-colors cursor-pointer"
                              title="تعديل الأوزان والسجل"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteRecord(record.id)}
                              className="p-1 text-[#555] hover:text-rose-400 rounded-lg hover:bg-rose-950/20 transition-colors cursor-pointer"
                              title="حذف السجل"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Workflow promotion / Variance Reason */}
                        <td className="px-2 py-4 text-center max-w-[150px] truncate" title={record.varianceReason}>
                          {isPending ? (
                            <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">⏳ بانتظار الصبة</span>
                          ) : record.varianceReason ? (
                            <span className="text-amber-400 bg-amber-500/5 px-2 py-1 rounded border border-amber-500/10 font-sans text-[11px]">
                              {record.varianceReason}
                            </span>
                          ) : (
                            <span className="text-[#555]">-</span>
                          )}
                        </td>

                        {/* Double Image Preview column */}
                        <td className="px-2 py-3 text-center whitespace-nowrap">
                          <div className="flex justify-center items-center gap-1.5 mx-auto">
                            {/* Before Image */}
                            {record.beforeImage ? (
                              <button
                                type="button"
                                onClick={() => setZoomImage(record.beforeImage || null)}
                                className="relative group w-7 h-7 rounded border border-[#222] overflow-hidden hover:border-[#C5A028] transition-colors"
                                title="عرض صورة القبل"
                              >
                                <img src={record.beforeImage} alt="قبل" className="w-full h-full object-cover" />
                                <span className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-[8px] text-white">قبل</span>
                              </button>
                            ) : (
                              <span className="text-[9px] text-[#444]" title="لا صورة قبل">بلا قبل</span>
                            )}

                            {/* After Image */}
                            {isPending ? (
                              <span className="w-7 h-7 bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center rounded text-[10px] font-sans font-bold animate-pulse" title="قيد الطبخ في الفرن">
                                ⏳
                              </span>
                            ) : record.afterImage ? (
                              <button
                                type="button"
                                onClick={() => setZoomImage(record.afterImage || null)}
                                className="relative group w-7 h-7 rounded border border-[#222] overflow-hidden hover:border-emerald-500 transition-colors"
                                title="عرض صورة البعد"
                              >
                                <img src={record.afterImage} alt="بعد" className="w-full h-full object-cover" />
                                <span className="absolute inset-0 bg-emerald-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-[8px] text-white">بعد</span>
                              </button>
                            ) : (
                              <span className="text-[9px] text-[#444]" title="لا صورة بعد">بلا بعد</span>
                            )}
                          </div>
                        </td>

                        {/* Notes */}
                        <td className="px-3 py-4 text-[#ccc] max-w-[150px] truncate" title={record.notes}>
                          {record.notes || "-"}
                        </td>

                        {/* Percent of Loss */}
                        <td className="px-3 py-4 text-center font-mono">
                          {isPending ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                              معلق 👨‍🍳
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isProfit ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/40' : 'bg-rose-950/30 text-rose-400 border border-rose-900/40'}`}>
                              {pct.toFixed(2)}% {isProfit ? "زيادة" : "نقص"}
                            </span>
                          )}
                        </td>

                        {/* Difference / Deficit */}
                        <td className={`px-3 py-4 text-left font-mono font-bold ${isPending ? 'text-amber-500 bg-amber-950/5' : (isProfit ? 'text-emerald-400 bg-emerald-950/10' : 'text-rose-400 bg-rose-950/10')}`}>
                          {isPending ? (
                            <span className="text-amber-500/80 text-[10px] font-sans font-extrabold">في الفرن الكيميائي</span>
                          ) : isProfit ? (
                            `+${absoluteLoss.toFixed(3)}`
                          ) : (
                            `-${absoluteLoss.toFixed(3)}`
                          )}
                        </td>

                        {/* Outer Sabba */}
                        <td className="px-3 py-4 text-left font-mono">
                          {isPending ? (
                            <button
                              onClick={() => handleOpenUpdate(record)}
                              className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-neutral-950 text-[10px] font-black rounded flex items-center justify-center gap-1 hover:scale-105 active:scale-95 transition-all text-center cursor-pointer font-sans"
                            >
                              استلام الصبة ⚖️
                            </button>
                          ) : (
                            record.sabba?.toFixed(3)
                          )}
                        </td>

                        {/* Base Kar */}
                        <td className="px-3 py-4 text-left font-mono text-white font-bold bg-[#1a1a1a]/30">
                          {record.kar.toFixed(3)}
                        </td>

                        {/* Date Time */}
                        <td className="px-3 py-4 text-center text-[#888] text-[10px] md:text-xs whitespace-nowrap">
                          <div>{record.date}</div>
                          {record.time && (
                            <div className="text-[#C5A028] font-mono text-[9px] mt-0.5">{record.time}</div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Aggregated view */}
              {records.length > 0 && (
                <tfoot className="bg-[#0f0f0f] divide-y divide-[#222] text-[#fff] text-xs">
                  <tr className="font-bold border-t border-[#222]">
                    <td className="px-3 py-3 text-center text-[#C5A028]" colSpan={3}>المجموع النهائي</td>
                    <td className="px-3 py-3 text-[#777]">ملخص جرد صب وصهر الذهب عيار ٢١</td>
                    <td className="px-3 py-3 text-center font-mono text-[#C5A028]">
                      {(Math.abs(totalLoss) / totalKar * 100).toFixed(2)}% <span className="text-[10px] text-[#888]">({totalLoss >= 0 ? "عجز كلي" : "وفر صافي"})</span>
                    </td>
                    <td className={`px-3 py-3 text-left font-mono ${totalLoss >= 0 ? 'text-rose-400 bg-rose-950/30' : 'text-emerald-400 bg-emerald-950/30'}`}>
                      {totalLoss >= 0 ? `-${totalLoss.toFixed(3)}` : `+${Math.abs(totalLoss).toFixed(3)}`} غرام
                    </td>
                    <td className="px-3 py-3 text-left font-mono text-[#e0e0e0]">
                      {totalSabba.toFixed(3)} غرام
                    </td>
                    <td className="px-3 py-3 text-left font-mono text-[#C5A028] bg-[#141414]">
                      {totalKar.toFixed(3)} غرام
                    </td>
                    <td className="px-3 py-3 text-center text-[#666]">-</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* Global Scale Image Preview Modal */}
      {zoomImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-center items-center p-4 animate-fadeIn" onClick={() => setZoomImage(null)}>
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img src={zoomImage} alt="معاينة كاملة بدقة عالية" className="max-w-full max-h-full object-contain rounded-2xl border border-[#333] shadow-2xl" />
            <button
              type="button"
              className="absolute top-2 right-2 text-[#aaa] hover:text-white bg-black/80 hover:bg-neutral-800 p-2 rounded-full cursor-pointer transition-colors"
              onClick={() => setZoomImage(null)}
            >
              <EyeOff className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[#888] text-xs mt-3 text-center font-sans">اضغط في أي مكان خارج الصورة أو الزر لإغلاق المعاينة</p>
        </div>
      )}

      {/* Complete/Update Modal (In Row Update click) */}
      {updatingRecordId && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100] p-4 animate-fadeIn backdrop-blur-sm">
          <div className="bg-[#0f0f0f] border border-[#222] rounded-2xl p-6 max-w-sm w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C5A028] to-transparent opacity-80" />
            
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 font-sans text-right">
              <Scale className="w-5 h-5 text-[#C5A028]" /> إكمال صب سبيكة الذهب (الخطوة الثانية: البعد)
            </h3>
            <p className="text-[11px] text-[#888] mb-4 leading-relaxed font-sans text-right">
              أدخل الوزن النهائي بعد صهر الذهب وصب السبيكة لتوثيق فاقد الذهب بدقة مع صالحة صور المعاينة.
            </p>

            <form onSubmit={handleSaveUpdate} className="space-y-4">
              {/* Weight output */}
              <div>
                <label className="block text-xs font-semibold text-[#aaa] mb-1.5 justify-between flex">
                  <span>وزن الصبة الناتجة (غرام)</span>
                  <span className="text-[10px] text-emerald-400">الصبة</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    required
                    autoFocus
                    placeholder="0.000"
                    value={updatingSabba}
                    onChange={(e) => setUpdatingSabba(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl pl-12 pr-4 py-2 text-sm font-mono focus:border-[#C5A028] focus:ring-1 focus:outline-none"
                  />
                  <span className="absolute left-4 top-2 text-xs text-[#666] font-semibold">غرام</span>
                </div>
              </div>

              {/* After image upload */}
              <div>
                <label className="block text-xs font-semibold text-[#aaa] mb-1.5">صورة السبيكة الناتجة</label>
                {updatingAfterImage ? (
                  <div className="relative border border-[#222] rounded-xl h-24 overflow-hidden bg-black flex items-center justify-center">
                    <img src={updatingAfterImage} alt="بعد" className="w-full h-full object-contain" />
                    <button type="button" onClick={() => setUpdatingAfterImage("")} className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-rose-950 text-white rounded-full"><XCircle className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-1.5 border border-dashed border-[#222] rounded-xl p-3 cursor-pointer text-xs text-[#666] hover:border-[#C5A028]/45 bg-[#141414]">
                    <UploadCloud className="w-4 h-4 text-[#555]" />
                    <span>تحميل صورة السبيكة الناتجة</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e, "updatingAfter")} />
                  </label>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#aaa] mb-1.5">ملاحظات تصفية الوجبة</label>
                <textarea
                  rows={2}
                  placeholder="مثال: صب واكتمل الترحيل بنجاح..."
                  value={updatingNotes}
                  onChange={(e) => setUpdatingNotes(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] focus:ring-1 focus:outline-none resize-none"
                />
              </div>

              {/* Variance Reason */}
              <div>
                <label className="block text-xs font-semibold text-[#aaa] mb-1.5">سبب النقص أو الزيادة</label>
                <input
                  type="text"
                  placeholder="أدخل سبب النقص أو الزيادة للدفتر اليدوي..."
                  value={updatingVarianceReason}
                  onChange={(e) => setUpdatingVarianceReason(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] focus:ring-1 focus:outline-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-grow py-2 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-neutral-950 font-black rounded-xl text-xs transition-all cursor-pointer shadow-md"
                >
                  حفظ وتأكيد السجل ⚖️
                </button>
                <button
                  type="button"
                  onClick={() => setUpdatingRecordId(null)}
                  className="py-2 px-4 bg-[#1a1a1a] hover:bg-[#252525] text-[#aaa] font-bold rounded-xl text-xs border border-neutral-800 cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* General Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100] p-4 animate-fadeIn backdrop-blur-sm text-right" dir="rtl">
          <div className="bg-[#0f0f0f] border border-[#222] rounded-2xl p-6 max-w-md w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C5A028] to-transparent opacity-80" />
            
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 font-sans text-right">
              <Edit className="w-5 h-5 text-[#C5A028]" /> تعديل أوزان وبيانات عملية الصهر والسبك
            </h3>
            <p className="text-[11px] text-[#888] mb-4 leading-relaxed font-sans text-right">
              تعديل أوزان الوجبة، وزن الكسر المستلم (القبل) والصبة الناتجة (البعد)، الملاحظات والتاريخ.
            </p>

            <form onSubmit={handleSaveGeneralEdit} className="space-y-4">
              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3 text-right">
                <div>
                  <label className="block text-[11px] font-semibold text-[#aaa] mb-1 text-right">التاريخ</label>
                  <input
                    type="date"
                    required
                    value={editingDate}
                    onChange={(e) => setEditingDate(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-2 text-xs font-mono text-center focus:border-[#C5A028] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#aaa] mb-1 text-right">الوقت</label>
                  <input
                    type="time"
                    required
                    value={editingTime}
                    onChange={(e) => setEditingTime(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-2 text-xs font-mono text-center focus:border-[#C5A028] outline-none"
                  />
                </div>
              </div>

              {/* Before Weight (kar) */}
              <div>
                <label className="block text-xs font-semibold text-[#aaa] mb-1.5 text-right flex justify-between">
                  <span>استلام الكسر القبل (غرام)</span>
                  <span className="text-[10px] text-[#C5A028]">الوزن قبل الصهر</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={editingKar}
                    onChange={(e) => setEditingKar(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl pl-12 pr-4 py-2 text-sm font-mono text-left focus:border-[#C5A028] focus:ring-1 focus:outline-none"
                  />
                  <span className="absolute left-4 top-2 text-xs text-[#666] font-semibold">غرام</span>
                </div>
              </div>

              {/* After Weight (sabba) */}
              <div>
                <label className="block text-xs font-semibold text-[#aaa] mb-1.5 text-right flex justify-between">
                  <span>وزن الصبة الناتجة البعد (غرام)</span>
                  <span className="text-[10px] text-emerald-400">الوزن بعد الصهر</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    placeholder="اتركه فارغاً إذا كانت العملية معلقة"
                    value={editingSabba}
                    onChange={(e) => setEditingSabba(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl pl-12 pr-4 py-2 text-sm font-mono text-left focus:border-[#C5A028] focus:ring-1 focus:outline-none"
                  />
                  <span className="absolute left-4 top-2 text-xs text-[#666] font-semibold">غرام</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#aaa] mb-1.5 text-right">ملاحظات الوجبة</label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات وتفاصيل الصهر..."
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs text-right focus:border-[#C5A028] focus:ring-1 focus:outline-none resize-none"
                />
              </div>

              {/* Variance Reason */}
              <div>
                <label className="block text-xs font-semibold text-[#aaa] mb-1.5 text-right">سبب النقص أو الزيادة</label>
                <input
                  type="text"
                  placeholder="سبب عجز الذهب أو الزيادة..."
                  value={editingVarianceReason}
                  onChange={(e) => setEditingVarianceReason(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs text-right focus:border-[#C5A028] focus:ring-1 focus:outline-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-grow py-2 px-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-neutral-950 font-black rounded-xl text-xs transition-all cursor-pointer shadow-md"
                >
                  حفظ وتأكيد التعديلات ⚖️
                </button>
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="py-2 px-4 bg-[#1a1a1a] hover:bg-[#252525] text-[#aaa] font-bold rounded-xl text-xs border border-neutral-800 cursor-pointer"
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
