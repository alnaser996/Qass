import React, { useState } from "react";
import { RollingRecord } from "../types";
import { FilePlus2, Trash2, Calendar, Scale, Search, UploadCloud, Eye, EyeOff, XCircle, CheckCircle2, Clock, Layers, Flame, Wrench, ShieldAlert, Award, RefreshCcw, Edit } from "lucide-react";

interface RollingTabProps {
  records: RollingRecord[];
  onAddRecord: (record: Omit<RollingRecord, "id" | "loss"> & { isPending?: boolean }) => void;
  onDeleteRecord: (id: string) => void;
  onUpdateRecord: (
    id: string,
    weightBefore: number,
    weightAfter?: number,
    damagedWeight?: number,
    piecesCount?: number,
    details?: string,
    notes?: string,
    image?: string,
    damagedImage?: string,
    afterImage?: string,
    date?: string,
    time?: string
  ) => void;
  onPromoteToProduction?: (id: string) => void;
  onPromoteScrapToCasting?: (id: string) => void;
  onPromoteToNextStage?: (id: string) => void;
  onPromoteSplitStage?: (
    id: string,
    repairWeight: number,
    repairPieces: number,
    vacuumWeight: number,
    vacuumPieces: number
  ) => void;
}

export const RollingTab: React.FC<RollingTabProps> = ({
  records,
  onAddRecord,
  onDeleteRecord,
  onUpdateRecord,
  onPromoteToProduction,
  onPromoteScrapToCasting,
  onPromoteToNextStage,
  onPromoteSplitStage,
}) => {
  // Stepper Sub-navigation ("قبل صفحة بعد صفحة ומثل هسة")
  const [formMode, setFormMode] = useState<"before" | "after" | "both">("before");

  // Stage type inside form
  const [stageType, setStageType] = useState<"bombing" | "repair" | "vacuum">("bombing");

  // Before inputs
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [time, setTime] = useState<string>(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  });
  const [weightBefore, setWeightBefore] = useState<string>("");
  const [beforeImage, setBeforeImage] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Integrated/After inputs (for integrated 'both' mode)
  const [weightAfter, setWeightAfter] = useState<string>("");
  const [damagedWeight, setDamagedWeight] = useState<string>("");
  const [piecesCount, setPiecesCount] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [afterImage, setAfterImage] = useState<string>("");
  const [damagedImage, setDamagedImage] = useState<string>("");

  // Standalone 'after' form updates
  const [selectedPendingId, setSelectedPendingId] = useState<string>("");
  const [afterFormWeightAfter, setAfterFormWeightAfter] = useState<string>("");
  const [afterFormDamagedWeight, setAfterFormDamagedWeight] = useState<string>("");
  const [afterFormPiecesCount, setAfterFormPiecesCount] = useState<string>("");
  const [afterFormDetails, setAfterFormDetails] = useState<string>("");
  const [afterFormImage, setAfterFormImage] = useState<string>("");
  const [afterFormDamagedImage, setAfterFormDamagedImage] = useState<string>("");
  const [afterFormNotes, setAfterFormNotes] = useState<string>("");

  // Search & Fitlers
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStage, setFilterStage] = useState<"all" | "bombing" | "repair" | "vacuum">("all");
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Splitting batch modal state
  const [splitRecord, setSplitRecord] = useState<RollingRecord | null>(null);
  const [splitRepairWeight, setSplitRepairWeight] = useState<string>("");
  const [splitRepairPieces, setSplitRepairPieces] = useState<string>("");
  const [splitVacuumWeight, setSplitVacuumWeight] = useState<string>("");
  const [splitVacuumPieces, setSplitVacuumPieces] = useState<string>("");

  // Modal updates (triggered via row action buttons)
  const [updatingRecordId, setUpdatingRecordId] = useState<string | null>(null);
  const [upWeightAfter, setUpWeightAfter] = useState<string>("");
  const [upDamagedWeight, setUpDamagedWeight] = useState<string>("");
  const [upPiecesCount, setUpPiecesCount] = useState<string>("");
  const [upDetails, setUpDetails] = useState<string>("");
  const [upNotes, setUpNotes] = useState<string>("");
  const [upAfterImage, setUpAfterImage] = useState<string>("");
  const [upDamagedImage, setUpDamagedImage] = useState<string>("");

  // Parsed calculations
  const parsedBefore = parseFloat(weightBefore) || 0;
  const parsedAfter = parseFloat(weightAfter) || 0;
  const parsedDamaged = parseFloat(damagedWeight) || 0;

  const handleImageFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "before" | "after" | "damaged" | "afterFormImg" | "afterFormDamImg" | "modalImg" | "modalDamImg"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => {
        const result = r.result as string;
        if (type === "before") setBeforeImage(result);
        else if (type === "after") setAfterImage(result);
        else if (type === "damaged") setDamagedImage(result);
        else if (type === "afterFormImg") setAfterFormImage(result);
        else if (type === "afterFormDamImg") setAfterFormDamagedImage(result);
        else if (type === "modalImg") setUpAfterImage(result);
        else if (type === "modalDamImg") setUpDamagedImage(result);
      };
      r.readAsDataURL(file);
    }
  };

  // 1. Submit Before Step only (Pending ⏳)
  const handleBeforeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedBefore <= 0) {
      alert("الرجاء إدخال الوزن قبل العملية بشكل صحيح");
      return;
    }

    onAddRecord({
      stageType,
      date,
      time,
      weightBefore: parsedBefore,
      weightAfter: undefined,
      damagedWeight: undefined,
      piecesCount: parseInt(piecesCount) || undefined,
      details: details.trim(),
      image: undefined,
      notes: notes.trim(),
      isPending: true,
      beforeImage,
      afterImage: undefined,
    });

    setWeightBefore("");
    setBeforeImage("");
    setDetails("");
    setNotes("");
    
    // Automatically switch to step 2 to suggest immediate continuation or subsequent collection
    setFormMode("after");
    alert("تم ترحيل وجدولة السجل قيد المعالجة الفنية ⏳");
  };

  // 2. Submit integrated both together
  const handleBothSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedBefore <= 0) {
      alert("الرجاء إدخال الوزن قبل العملية بشكل صحيح");
      return;
    }
    if (parsedAfter <= 0) {
      alert("الرجاء إدخال وزن المخرجات النهائي بعد السحب");
      return;
    }

    onAddRecord({
      stageType,
      date,
      time,
      weightBefore: parsedBefore,
      weightAfter: parsedAfter,
      damagedWeight: parsedDamaged || undefined,
      piecesCount: parseInt(piecesCount) || undefined,
      details: details.trim(),
      image: afterImage || undefined,
      notes: notes.trim(),
      isPending: false,
      beforeImage,
      afterImage,
      damagedImage: damagedImage || undefined,
    });

    setWeightBefore("");
    setWeightAfter("");
    setDamagedWeight("");
    setPiecesCount("");
    setDetails("");
    setBeforeImage("");
    setAfterImage("");
    setDamagedImage("");
    setNotes("");
  };

  // 3. Complete standalone pending record
  const handleStandaloneAfterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const upAfter = parseFloat(afterFormWeightAfter) || 0;
    const upDam = parseFloat(afterFormDamagedWeight) || 0;
    const count = parseInt(afterFormPiecesCount) || undefined;

    if (!selectedPendingId) {
      alert("الرجاء تحديد العملية المعلقة لإغلاق ملفها الفني");
      return;
    }
    if (upAfter <= 0) {
      alert("الرجاء إدخال الوزن النهائي بعد العملية بدقة تامة");
      return;
    }

    const pendingItem = records.find(r => r.id === selectedPendingId);
    const originalWeightBefore = pendingItem ? pendingItem.weightBefore : 0;
    onUpdateRecord(
      selectedPendingId,
      originalWeightBefore,
      upAfter,
      upDam || undefined,
      countKey(count),
      afterFormDetails.trim(),
      afterFormNotes.trim(),
      afterFormImage,
      afterFormDamagedImage,
      afterFormImage
    );

    setSelectedPendingId("");
    setAfterFormWeightAfter("");
    setAfterFormDamagedWeight("");
    setAfterFormPiecesCount("");
    setAfterFormDetails("");
    setAfterFormImage("");
    setAfterFormDamagedImage("");
    setAfterFormNotes("");

    alert("تم تصفية العجز وإرسال القطع للجرد النهائي ⚖️");
  };

  const countKey = (val: any) => {
    return val !== undefined ? Number(val) : undefined;
  };

  // Row update triggers
  const handleOpenUpdate = (record: RollingRecord) => {
    setUpdatingRecordId(record.id);
    setUpWeightAfter("");
    setUpDamagedWeight("");
    setUpPiecesCount(record.piecesCount ? String(record.piecesCount) : "");
    setUpDetails(record.details || "");
    setUpNotes(record.notes || "");
    setUpAfterImage("");
    setUpDamagedImage("");
  };

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedUpAfter = parseFloat(upWeightAfter) || 0;
    const parsedUpDam = parseFloat(upDamagedWeight) || 0;
    
    if (parsedUpAfter <= 0) {
      alert("الرجاء إدخال الوزن بعد العملية بشكل صحيح");
      return;
    }

    if (updatingRecordId) {
      const updatingRecord = records.find(r => r.id === updatingRecordId);
      const originalWeightBefore = updatingRecord ? updatingRecord.weightBefore : 0;
      onUpdateRecord(
        updatingRecordId,
        originalWeightBefore,
        parsedUpAfter,
        parsedUpDam || undefined,
        parseInt(upPiecesCount) || undefined,
        upDetails.trim(),
        upNotes.trim(),
        upAfterImage,
        upDamagedImage,
        upAfterImage
      );
      setUpdatingRecordId(null);
    }
  };

  // General Edit Modal State (Allows editing absolutely anything including WeightBefore, WeightAfter, and DamagedWeight)
  const [editingRecord, setEditingRecord] = useState<RollingRecord | null>(null);
  const [editingWeightBefore, setEditingWeightBefore] = useState<string>("");
  const [editingWeightAfter, setEditingWeightAfter] = useState<string>("");
  const [editingDamagedWeight, setEditingDamagedWeight] = useState<string>("");
  const [editingPiecesCount, setEditingPiecesCount] = useState<string>("");
  const [editingDetails, setEditingDetails] = useState<string>("");
  const [editingDate, setEditingDate] = useState<string>("");
  const [editingTime, setEditingTime] = useState<string>("");
  const [editingNotes, setEditingNotes] = useState<string>("");
  const [editingImage, setEditingImage] = useState<string>("");
  const [editingDamagedImage, setEditingDamagedImage] = useState<string>("");

  const handleOpenGeneralEdit = (record: RollingRecord) => {
    setEditingRecord(record);
    setEditingWeightBefore(String(record.weightBefore));
    setEditingWeightAfter(record.weightAfter !== undefined ? String(record.weightAfter) : "");
    setEditingDamagedWeight(record.damagedWeight !== undefined ? String(record.damagedWeight) : "");
    setEditingPiecesCount(record.piecesCount !== undefined ? String(record.piecesCount) : "");
    setEditingDetails(record.details || "");
    setEditingDate(record.date);
    setEditingTime(record.time || "");
    setEditingNotes(record.notes || "");
    setEditingImage(record.image || "");
    setEditingDamagedImage(record.damagedImage || "");
  };

  const handleSaveGeneralEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const parsedBeforeVal = parseFloat(editingWeightBefore) || 0;
    if (parsedBeforeVal <= 0) {
      alert("الرجاء إدخال وزن قبل العملية صحيح أكبر من الصفر");
      return;
    }

    const hasAfter = editingWeightAfter.trim() !== "";
    const parsedAfterVal = hasAfter ? parseFloat(editingWeightAfter) : undefined;
    if (hasAfter && (parsedAfterVal === undefined || parsedAfterVal < 0)) {
      alert("الرجاء إدخال وزن بعد العملية صحيح");
      return;
    }

    const hasDamaged = editingDamagedWeight.trim() !== "";
    const parsedDamagedVal = hasDamaged ? parseFloat(editingDamagedWeight) : undefined;
    if (hasDamaged && (parsedDamagedVal === undefined || parsedDamagedVal < 0)) {
      alert("الرجاء إدخال وزن التالف والخردة صحيح");
      return;
    }

    onUpdateRecord(
      editingRecord.id,
      parsedBeforeVal,
      parsedAfterVal,
      parsedDamagedVal,
      editingPiecesCount ? parseInt(editingPiecesCount) : undefined,
      editingDetails.trim(),
      editingNotes.trim(),
      editingImage,
      editingDamagedImage,
      editingImage,
      editingDate,
      editingTime
    );

    setEditingRecord(null);
    alert("تم تعديل السجل وتحديث أوزان ونسب مرحلة التفجير والفاكيوم بنجاح! ⚖️");
  };

  // Pending records in Rolling
  const pendingRecords = records.filter((r) => r.isPending);

  // Filters output
  const filteredRecords = records.filter((r) => {
    if (filterStage !== "all" && r.stageType !== filterStage) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.notes?.toLowerCase().includes(q) ||
      r.details?.toLowerCase().includes(q) ||
      r.date.includes(q)
    );
  });

  // Aggregated Sum calculations for completed entries
  const completedRecords = records.filter((r) => !r.isPending);
  const totalBefore = records.reduce((sum, r) => sum + r.weightBefore, 0);
  const totalAfter = completedRecords.reduce((sum, r) => sum + (r.weightAfter ?? 0), 0);
  const totalDamaged = completedRecords.reduce((sum, r) => sum + (r.damagedWeight ?? 0), 0);
  const totalLoss = completedRecords.reduce((sum, r) => sum + (r.loss ?? 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
      {/* Form Area panel */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <div className="bg-[#0f0f0f] rounded-2xl border border-[#222] p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C5A028] to-transparent opacity-60" />

          {/* Title Header */}
          <div className="flex items-center gap-3 border-b border-[#222] pb-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-xl text-[#C5A028] border border-[#d4af37]/10">
              <Layers className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-md font-bold text-white">تفجير الأحماض وغلق الفاكيوم</h2>
              <p className="text-[11px] text-[#888] mt-0.5">سحب المسارات، التصليح اليدوي، والتنظيف من الركائز</p>
            </div>
          </div>

          {/* Stepper Wizard Navigation ("قبل صفحة بعد صفحة وملوك الصنعة") */}
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
              ٢. تصفية (البعد) ⚖️
            </button>
            <button
              type="button"
              onClick={() => setFormMode("both")}
              className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer ${
                formMode === "both"
                  ? "bg-neutral-900 text-white border border-[#2c2c2c] font-black"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              ترحيل كامل ✍️
            </button>
          </div>

          {/* MODE 1: BEFORE INPUT FORM */}
          {formMode === "before" && (
            <form onSubmit={handleBeforeSubmit} className="space-y-4 animate-fadeIn">
              {/* Type selector */}
              <div>
                <label className="block text-[11px] text-[#aaa] mb-1.5">نوع تصفية المسار الحالي:</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#141414] border border-[#222] rounded-xl text-center">
                  <button
                    type="button"
                    onClick={() => setStageType("bombing")}
                    className={`py-1.5 text-[10px] font-bold rounded-lg cursor-pointer ${stageType === "bombing" ? "bg-amber-500/10 text-[#C5A028] border border-[#C5A028]/30" : "text-[#777] hover:text-white"}`}
                  >
                    💥 تفجير أحماض
                  </button>
                  <button
                    type="button"
                    onClick={() => setStageType("repair")}
                    className={`py-1.5 text-[10px] font-bold rounded-lg cursor-pointer ${stageType === "repair" ? "bg-amber-500/10 text-[#C5A028] border border-[#C5A028]/30" : "text-[#777] hover:text-white"}`}
                  >
                    🛠️ تصليح يدوي
                  </button>
                  <button
                    type="button"
                    onClick={() => setStageType("vacuum")}
                    className={`py-1.5 text-[10px] font-bold rounded-lg cursor-pointer ${stageType === "vacuum" ? "bg-amber-500/10 text-[#C5A028] border border-[#C5A028]/30" : "text-[#777] hover:text-white"}`}
                  >
                    🌀 غلق فاكيوم وبونزة
                  </button>
                </div>
              </div>

              {/* Date / Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#aaa] mb-1">تاريخ التحميل</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-2 text-xs font-mono text-right focus:border-[#C5A028] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#aaa] mb-1">وقت البدء</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-2 text-xs font-mono text-right focus:border-[#C5A028] outline-none"
                  />
                </div>
              </div>

              {/* Input Gold Weight */}
              <div>
                <label className="block text-xs font-bold text-[#e0e0e0] mb-1 flex justify-between">
                  <span>الوزن قبل بدء التشغيل (غرام)</span>
                  <span className="text-[10px] text-[#C5A028]">القبل</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={weightBefore}
                    onChange={(e) => setWeightBefore(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl pl-12 pr-4 py-2.5 text-sm font-mono text-left focus:border-[#C5A028] outline-none"
                  />
                  <span className="absolute left-3 top-3 text-[11px] text-[#555] font-bold">غرام</span>
                </div>
              </div>

              {/* Upload Before Photo */}
              <div>
                <label className="block text-[11px] font-semibold text-[#aaa] mb-1">صورة القطع المستلمة قبل التشغيل الأولي</label>
                {beforeImage ? (
                  <div className="relative border border-[#222] rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center">
                    <img src={beforeImage} alt="قبل التشغيل" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setBeforeImage("")}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/85 text-white rounded-full hover:bg-rose-950 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border border-dashed border-[#222] hover:border-[#C5A028]/35 rounded-xl p-4 text-center cursor-pointer bg-[#141414] transition-colors">
                    <UploadCloud className="w-6 h-6 text-[#555]" />
                    <span className="text-xs text-[#666] mt-1.5">تحميل صورة القطع الخام قبل التشغيل</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e, "before")} />
                  </label>
                )}
              </div>

              {/* Standard inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-[#aaa] mb-1">عدد قطع الدفعة</label>
                  <input type="number" placeholder="0" value={piecesCount} onChange={(e) => setPiecesCount(e.target.value)} className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-1.5 text-xs text-left font-mono focus:border-[#C5A028]" />
                </div>
                <div>
                  <label className="block text-[11px] text-[#aaa] mb-1">وصف مخرجات الوجبة</label>
                  <input type="text" placeholder="مثال: دبل ليزر..." value={details} onChange={(e) => setDetails(e.target.value)} className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-1.5 text-xs focus:border-[#C5A028]" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#aaa]">الملاحظات أو اسم الفني المستلم</label>
                <textarea rows={2} placeholder="مثال: تسليم الفني رامي، كسر للأحماض..." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none resize-none" />
              </div>

              <button
                type="submit"
                className="w-full bg-[#C5A028] hover:bg-[#d9b132] text-neutral-950 font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer flex justify-center items-center gap-2"
              >
                <FilePlus2 className="w-4.5 h-4.5" />
                <span>ترحيل وجدولة السحب المعلق ⏳</span>
              </button>
            </form>
          )}

          {/* MODE 2: STANDALONE AFTER COMPLETION FORM */}
          {formMode === "after" && (
            <form onSubmit={handleStandaloneAfterSubmit} className="space-y-4 animate-fadeIn">
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl text-[11px] text-emerald-400 flex items-start gap-1.5">
                <CheckCircle2 className="w-4.5 h-4.5 mt-0.5 shrink-0" />
                <span>اختر الوجبة المعلقة من الفرن لتسجيل أوزان الاستلام النهائية بدقة مع صور المعاينة بعد السحب والتجفيف.</span>
              </div>

              {/* Selection Dropdown */}
              <div>
                <label className="block text-xs font-bold text-[#e0e0e0] mb-1">اختر الوجبة المعلقة (قيد الفرز):</label>
                {pendingRecords.length === 0 ? (
                  <div className="bg-[#141414] border border-dashed border-[#222] text-center p-6 rounded-xl text-[#555] text-xs">
                    لا توجد دفعات جارية بانتظار الفرز حالياً. توجه إلى قسم "القبل" لتسجيل دفعة جديدة!
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
                        setAfterFormPiecesCount(rec.piecesCount ? String(rec.piecesCount) : "");
                        setAfterFormDetails(rec.details || "");
                      }
                    }}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2.5 text-xs focus:border-[#C5A028] outline-none"
                  >
                    <option value="">-- حدد الوجبة المعلقة من الدفتر --</option>
                    {pendingRecords.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.stageType === "bombing" ? "💥 تفجير أحماض" : r.stageType === "repair" ? "🛠️ تصليح يدوي" : "🌀 غلق فاكيوم وبونزة"} | قبل: {r.weightBefore.toFixed(3)}g | تاريخ: {r.date}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedPendingId && (
                <div className="space-y-4 pt-1 animate-fadeIn">
                  {/* weight outputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#aaa] mb-1">الوزن النهائي الصافي (البعد)</label>
                      <input
                        type="number"
                        step="0.001"
                        required
                        placeholder="0.000"
                        value={afterFormWeightAfter}
                        onChange={(e) => setAfterFormWeightAfter(e.target.value)}
                        className="w-full text-white bg-[#141414] border border-emerald-950 font-mono text-left rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#aaa] mb-1">عدد قطع الاستلام الكاملة</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={afterFormPiecesCount}
                        onChange={(e) => setAfterFormPiecesCount(e.target.value)}
                        className="w-full text-white bg-[#141414] border border-[#222] font-mono text-left rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none"
                      />
                    </div>
                  </div>

                  {/* Details updated */}
                  <div>
                    <label className="block text-[11px] text-[#aaa] mb-1">تفاصيل ومواصفات السبيكة/القطع النهائية</label>
                    <input
                      type="text"
                      placeholder="قرط ليزر مصقول، خواتم دبل عريضة..."
                      value={afterFormDetails}
                      onChange={(e) => setAfterFormDetails(e.target.value)}
                      className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none"
                    />
                  </div>

                  {/* Upload After Image */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#aaa] mb-1">صورة القطع بعد الدرفلة والفرز النهائي</label>
                    {afterFormImage ? (
                      <div className="relative border border-[#222] rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center">
                        <img src={afterFormImage} alt="بعد التشغيل" className="w-full h-full object-contain" />
                        <button type="button" onClick={() => setAfterFormImage("")} className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-rose-950 text-white rounded-full"><XCircle className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-1.5 border border-dashed border-[#222] rounded-xl p-3 cursor-pointer text-xs text-[#666] hover:border-emerald-500/40 bg-[#141414]">
                        <UploadCloud className="w-4.5 h-4.5" />
                        <span>تحميل صورة مشغولات الصنعة بعد الدرفلة 📤</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e, "afterFormImg")} />
                      </label>
                    )}
                  </div>

                  {/* Damaged Weight for non-repair stages */}
                  {records.find(r => r.id === selectedPendingId)?.stageType !== "repair" && (
                    <>
                      <hr className="border-[#222]" />

                      <div>
                        <label className="block text-[11px] text-rose-400 mb-1">وزن تالف الوجبة / الحشوة (غرام)</label>
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          value={afterFormDamagedWeight}
                          onChange={(e) => setAfterFormDamagedWeight(e.target.value)}
                          className="w-full text-white bg-[#141414] border border-rose-950 font-mono text-left rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none"
                        />
                      </div>

                      {/* Damaged Image */}
                      <div>
                        <label className="block text-[10px] text-[#888] mb-1">صورة التالف أو الرايش والخنزيرة المكسورة</label>
                        {afterFormDamagedImage ? (
                          <div className="relative border border-[#222] rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center">
                            <img src={afterFormDamagedImage} alt="تالف" className="w-full h-full object-contain" />
                            <button type="button" onClick={() => setAfterFormDamagedImage("")} className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-rose-950 text-white rounded-full"><XCircle className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center gap-1.5 border border-dashed border-[#222] rounded-xl p-3 cursor-pointer text-xs text-[#666] hover:border-rose-500/35 bg-[#141414]">
                            <UploadCloud className="w-4.5 h-4.5" />
                            <span>تحميل صورة التالف والخسائر المباشرة</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e, "afterFormDamImg")} />
                          </label>
                        )}
                      </div>
                    </>
                  )}

                  {/* General notes */}
                  <div>
                    <label className="block text-[11px] text-[#aaa] mb-1">ملاحظات التصفية وتوجيه القطع</label>
                    <textarea
                      rows={2}
                      placeholder="مثال: تم الترسيب والتسليم بنجاح..."
                      value={afterFormNotes}
                      onChange={(e) => setAfterFormNotes(e.target.value)}
                      className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-neutral-950 font-black py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer flex justify-center items-center gap-2"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5" />
                    <span>تأكيد استلام وتصفية الوجبة ⚖️</span>
                  </button>
                </div>
              )}
            </form>
          )}

          {/* MODE 3: BOTH (IMMEDIATE COMPREHENSIVE SUBMIT) */}
          {formMode === "both" && (
            <form onSubmit={handleBothSubmit} className="space-y-4 animate-fadeIn font-sans">
              <div className="bg-[#141414] p-3 rounded-lg text-[10px] border border-[#222] text-[#888] mb-1 leading-relaxed">
                ✍️ <strong>الترحيل الكامل المباشر:</strong> تدوين كافة بيانات السحب والدرفلة قبل وبعد مع صورهم دفعة واحدة بالدفتر الفني.
              </div>

              {/* Step sub stage */}
              <div>
                <label className="block text-[11px] text-[#aaa] mb-1.5">نوع تصفية المسار الحالي:</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#141414] border border-neutral-800 rounded-xl text-center">
                  <button
                    type="button"
                    onClick={() => setStageType("bombing")}
                    className={`py-1 text-[10px] font-bold rounded-lg ${stageType === "bombing" ? "bg-amber-500/10 text-[#C5A028] border border-[#C5A028]/35" : "text-[#777] hover:text-white"}`}
                  >
                    💥 تفجير أحماض
                  </button>
                  <button
                    type="button"
                    onClick={() => setStageType("repair")}
                    className={`py-1 text-[10px] font-bold rounded-lg ${stageType === "repair" ? "bg-amber-500/10 text-[#C5A028] border border-[#C5A028]/35" : "text-[#777] hover:text-white"}`}
                  >
                    🛠️ تصليح يدوي
                  </button>
                  <button
                    type="button"
                    onClick={() => setStageType("vacuum")}
                    className={`py-1 text-[10px] font-bold rounded-lg ${stageType === "vacuum" ? "bg-amber-500/10 text-[#C5A028] border border-[#C5A028]/35" : "text-[#777] hover:text-white"}`}
                  >
                    🌀 غلق فاكيوم وبونزة
                  </button>
                </div>
              </div>

              {/* Date / Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#aaa] mb-1">تاريخ العملية</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-2 text-xs font-mono text-right focus:border-[#C5A028] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#aaa] mb-1">وقت العملية</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-2 text-xs font-mono text-right focus:border-[#C5A028] outline-none"
                  />
                </div>
              </div>

              {/* Weights */}
              <div className="bg-[#141414] p-3.5 rounded-xl border border-[#222] space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#e0e0e0] mb-1">الوزن قبل بدء التشغيل ( g )</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={weightBefore}
                    onChange={(e) => setWeightBefore(e.target.value)}
                    className="w-full text-white bg-black border border-[#222] rounded-lg px-2.5 py-2 text-xs text-left font-mono focus:border-[#C5A028] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-emerald-400 mb-1">الوزن الصافي النهائي بعد السحب ( g )</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={weightAfter}
                    onChange={(e) => setWeightAfter(e.target.value)}
                    className="w-full text-white bg-black border border-[#222] rounded-lg px-2.5 py-2 text-xs text-left font-mono focus:border-[#C5A028] outline-none"
                  />
                </div>
                {stageType !== "repair" && (
                  <div>
                    <label className="block text-[11px] font-bold text-rose-400 mb-1">وزن تالف الوجبة الجانبي ( g )</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      value={damagedWeight}
                      onChange={(e) => setDamagedWeight(e.target.value)}
                      className="w-full text-white bg-black border border-[#222] rounded-lg px-2.5 py-2 text-xs text-left font-mono focus:border-[#C5A028] outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Dual image upload layout */}
              <div className="grid grid-cols-2 gap-2.5 bg-[#141414] p-3 rounded-xl border border-[#222]">
                <div>
                  <label className="block text-[9px] text-[#888] mb-1">صورة قبل التشغيل</label>
                  {beforeImage ? (
                    <div className="relative border border-[#222] rounded-lg overflow-hidden h-14 bg-black">
                      <img src={beforeImage} alt="قبل" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setBeforeImage("")} className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 text-white rounded-full"><XCircle className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-1 border border-dashed border-[#22) block rounded-lg h-14 cursor-pointer bg-black text-[9px] text-[#666]">
                      <UploadCloud className="w-4 h-4" />
                      <span>صورة قبل</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e, "before")} />
                    </label>
                  )}
                </div>
                <div>
                  <label className="block text-[9px] text-[#888] mb-1">صورة بعد الاستلام</label>
                  {afterImage ? (
                    <div className="relative border border-[#222] rounded-lg overflow-hidden h-14 bg-black">
                      <img src={afterImage} alt="بعد" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setAfterImage("")} className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 text-white rounded-full"><XCircle className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-1 border border-dashed border-[#222] rounded-lg h-14 cursor-pointer bg-black text-[9px] text-[#666]">
                      <UploadCloud className="w-4 h-4" />
                      <span>صورة بعد</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e, "after")} />
                    </label>
                  )}
                </div>
              </div>

              {/* Standard info */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-[#aaa] mb-1">عدد قطع الدفعة</label>
                  <input type="number" placeholder="0" value={piecesCount} onChange={(e) => setPiecesCount(e.target.value)} className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-1.5 text-xs text-left font-mono focus:border-[#C5A028] outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] text-[#aaa] mb-1">وصف المخرجات</label>
                  <input type="text" placeholder="خواتم، سلاسل..." value={details} onChange={(e) => setDetails(e.target.value)} className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-1.5 text-xs focus:border-[#C5A028] outline-none" />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] text-[#aaa]">ملاحظات ترحيل الفني</label>
                <textarea rows={2} placeholder="تفاصيل إضافية للدفتر..." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none resize-none" />
              </div>

              <button
                type="submit"
                className="w-full bg-[#C5A028] hover:bg-[#d9b132] text-neutral-950 font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all"
              >
                ترحيل سجل الأحماض والسحب 🌀
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Tables Column */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        {/* Search header with stage tags */}
        <div className="bg-[#141414] p-4 rounded-2xl border border-[#222] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-[#555] absolute right-3 top-3.5" />
            <input
              type="text"
              placeholder="البحث بالبيان أو التاريخ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-right text-white bg-[#181818] border border-[#222] rounded-xl pl-3 pr-9 py-2.5 text-xs focus:border-[#C5A028]"
            />
          </div>

          {/* Sub stages filters tags */}
          <div className="flex gap-1 overflow-x-auto w-full md:w-auto scrollbar-none">
            {[
              { id: "all", label: "📄 الكل" },
              { id: "bombing", label: "💥 تفجير أحماض" },
              { id: "repair", label: "🛠️ تصليح يدوي" },
              { id: "vacuum", label: "🌀 غلق فاكيوم وبونزة" },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilterStage(btn.id as any)}
                className={`px-3 py-1.5 text-[10px] md:text-xs font-bold rounded-lg whitespace-nowrap cursor-pointer transition-all ${
                  filterStage === btn.id
                    ? "bg-[#C5A028] text-neutral-950 font-extrabold shadow-sm"
                    : "text-neutral-400 border border-neutral-800 hover:text-white hover:bg-neutral-900"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom rolling table ledger */}
        <div className="bg-[#141414] rounded-2xl border border-[#222] overflow-hidden shadow-xl animate-fadeIn">
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-[#181818] border-b border-[#222] text-[#888] text-xs">
                <tr>
                  <th className="px-3 py-3 text-center font-bold">الإجراءات</th>
                  <th className="px-3 py-3 text-center font-bold">الترحيل والمرحلة التالية</th>
                  <th className="px-3 py-3 text-center font-bold">صور المعاينة</th>
                  <th className="px-3 py-3 font-bold">المرحلة والمواصفات</th>
                  <th className="px-3 py-3 text-center font-bold">% نسبة العجز</th>
                  <th className="px-3 py-3 text-left font-bold font-mono">طبيعة العجز (-)</th>
                  <th className="px-3 py-3 text-[#fecdd3] text-left font-bold font-mono">وزن التالف (البعد)</th>
                  <th className="px-3 py-3 text-[#a7f3d0] text-left font-bold font-mono">وزن المخرجات (البعد)</th>
                  <th className="px-3 py-3 text-[#fef08a] text-left font-bold font-mono">وزن المدخل (القبل)</th>
                  <th className="px-3 py-3 text-center font-bold">التاريخ / الوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-[#666] text-xs">
                      لا توجد سجلات تصفية أحماض أو سحب مدخلة حالياً. استخدم لوحة التسجيل لبدء الجرد.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => {
                    const isPending = record.isPending;
                    const isRepair = record.stageType === "repair";
                    const isProfit = !isPending && record.loss !== undefined && record.loss < 0;
                    const lossAbs = !isPending && record.loss !== undefined ? Math.abs(record.loss) : 0;
                    const pct = !isPending && record.weightBefore > 0 && record.loss !== undefined ? (lossAbs / record.weightBefore) * 100 : 0;
                    
                    return (
                      <tr key={record.id} className={`hover:bg-[#1a1a1a]/40 transition-colors ${isPending ? 'bg-amber-950/5 border-r-2 border-r-amber-500/50' : ''}`}>
                        {/* Actions: general edit and delete */}
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
                              className="p-1 text-[#555] hover:text-rose-400 rounded-lg hover:bg-rose-950/20 cursor-pointer"
                              title="حذف السجل"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Automatic promotion actions */}
                        <td className="px-2 py-4 text-center">
                          {isPending ? (
                            <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">⏳ في السحب والدرفلة</span>
                          ) : (
                            <div className="flex flex-col justify-center items-center gap-1.5 min-w-[120px]">
                              {onPromoteToNextStage && record.weightAfter !== undefined && record.weightAfter > 0 && record.stageType !== "vacuum" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (record.stageType === "bombing") {
                                      setSplitRecord(record);
                                      setSplitRepairWeight(record.weightAfter?.toString() || "");
                                      setSplitRepairPieces(record.piecesCount?.toString() || "0");
                                      setSplitVacuumWeight("0");
                                      setSplitVacuumPieces("0");
                                    } else {
                                      onPromoteToNextStage(record.id);
                                    }
                                  }}
                                  className="flex items-center gap-0.5 text-[9.5px] font-bold bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white px-2 py-1 rounded border border-indigo-500/20 transition-all cursor-pointer w-full justify-center"
                                  title={record.stageType === "bombing" ? "خيارات تجزئة وتحويل الوجبة كقطع فردية" : `تحويل الوجبة للمرحلة التالية بوزن (${record.weightAfter.toFixed(3)}غ)`}
                                >
                                  <Layers className="w-2.5 h-2.5" />
                                  <span>
                                    {record.stageType === "bombing" ? "تحويل وتقسيم الوجبة ⚖️" : "تحويل للفاكيوم والطلب 🌀"}
                                  </span>
                                </button>
                              )}
                              {onPromoteToProduction && record.weightAfter !== undefined && record.weightAfter > 0 && (
                                <button
                                  type="button"
                                  onClick={() => onPromoteToProduction(record.id)}
                                  className="flex items-center gap-0.5 text-[9px] font-bold bg-amber-500/10 hover:bg-[#C5A028] text-amber-400 hover:text-neutral-950 px-2 py-1 rounded transition-all cursor-pointer w-full justify-center"
                                  title="ترحيل مشغولات الذهب الصافية كـ(قبل) للمخزن وتسليم الإنتاج"
                                >
                                  <Award className="w-2.5 h-2.5" />
                                  <span>تسليم الوجبة 🏆</span>
                                </button>
                              )}
                              {onPromoteScrapToCasting && record.damagedWeight !== undefined && record.damagedWeight > 0 && (
                                <button
                                  type="button"
                                  onClick={() => onPromoteScrapToCasting(record.id)}
                                  className="flex items-center gap-0.5 text-[8.5px] font-bold bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white px-2 py-0.5 rounded transition-all cursor-pointer w-full justify-center"
                                  title="إرجاع رايش وتالف الدرفلة والأحماض لأفران السبك لإعادة صهره"
                                >
                                  <RefreshCcw className="w-2.5 h-2.5" />
                                  <span>تدوير التالف ♻️</span>
                                </button>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Pictures Preview Grid (قبل / إنتاج / تالف) */}
                        <td className="px-2 py-3 text-center whitespace-nowrap">
                          <div className="flex justify-center items-center gap-1 px-1">
                            {/* Before Image */}
                            {record.beforeImage ? (
                              <button
                                type="button"
                                onClick={() => setZoomImage(record.beforeImage || null)}
                                className="relative group w-6.5 h-6.5 rounded border border-[#222] overflow-hidden hover:border-[#C5A028] transition-colors"
                                title="صورة القطع قبل العملية"
                              >
                                <img src={record.beforeImage} alt="قبل" className="w-full h-full object-cover" />
                                <span className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[7px] text-white">قبل</span>
                              </button>
                            ) : (
                              <span className="text-[8px] text-[#444]" title="لا صورة قبل">بلا قبل</span>
                            )}

                            {/* After Production Image */}
                            {isPending ? (
                              <span className="w-6.5 h-6.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center rounded text-[8px] font-bold animate-pulse" title="قيد التشغيل والتبريد">
                                ⏳
                              </span>
                            ) : record.afterImage || record.image ? (
                              <button
                                type="button"
                                onClick={() => setZoomImage(record.afterImage || record.image || null)}
                                className="relative group w-6.5 h-6.5 rounded border border-[#222] overflow-hidden hover:border-emerald-500 transition-colors"
                                title="صورة القطع بعد العملية ومصقولة"
                              >
                                <img src={record.afterImage || record.image} alt="بعد" className="w-full h-full object-cover" />
                                <span className="absolute inset-0 bg-emerald-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[7px] text-white">بعد</span>
                              </button>
                            ) : (
                              <span className="text-[8px] text-[#444]" title="لا صورة بعد">بلا بعد</span>
                            )}

                            {/* Damaged components Image */}
                            {!isPending && record.damagedImage ? (
                              <button
                                type="button"
                                onClick={() => setZoomImage(record.damagedImage || null)}
                                className="relative group w-6.5 h-6.5 rounded border border-[#222] overflow-hidden hover:border-rose-500 transition-all"
                                title="صورة تالف الصنع"
                              >
                                <img src={record.damagedImage} alt="تالف" className="w-full h-full object-cover" />
                                <span className="absolute inset-0 bg-rose-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[7px] text-rose-200 font-sans">تالف</span>
                              </button>
                            ) : null}
                          </div>
                        </td>

                        {/* Stage details & stage name */}
                        <td className="px-3 py-4 text-[#aaa] max-w-[150px] truncate">
                          <div>
                            <span className="font-extrabold text-white text-[11px]">
                              {record.stageType === "bombing" ? "💥 تفجير أحماض" : record.stageType === "repair" ? "🛠️ تصليح يدوي" : "🌀 غلق فاكيوم وبونزة"}
                            </span>
                            <div className="text-[10px] text-[#666] mt-0.5 truncate" title={record.details || record.notes}>
                              {record.details || record.notes || "تصفية سبيكة صياغة وجرد"}
                            </div>
                          </div>
                        </td>

                        {/* Deficit ratio pct */}
                        <td className="px-3 py-4 text-center font-mono">
                          {isPending ? (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              قيد الفرز ⏳
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isProfit ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/40' : 'bg-rose-950/30 text-rose-400 border border-rose-900/40'}`}>
                              {pct.toFixed(2)}% {isProfit ? "زيادة" : "نقص"}
                            </span>
                          )}
                        </td>

                        {/* Absolute Loss deficit */}
                        <td className={`px-4 py-4 text-left font-mono font-bold ${isPending ? 'text-amber-500 bg-amber-950/5' : (isProfit ? 'text-emerald-400 bg-emerald-950/10' : 'text-rose-400 bg-rose-950/10')}`}>
                          {isPending ? (
                            <span className="text-[9px] font-sans">معلق في الأحماض</span>
                          ) : isProfit ? (
                            `+${lossAbs.toFixed(3)}`
                          ) : (
                            `-${lossAbs.toFixed(3)}`
                          )}
                        </td>

                        {/* Damaged Weight */}
                        <td className="px-3 py-4 text-left font-mono text-rose-400">
                          {isPending ? "-" : (isRepair ? "معفي" : (record.damagedWeight?.toFixed(3) || "0.000"))}
                        </td>

                        {/* Production Weight */}
                        <td className="px-3 py-4 text-left font-mono text-emerald-400 font-bold">
                          {isPending ? (
                            <button
                              onClick={() => handleOpenUpdate(record)}
                              className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-neutral-950 text-[10px] font-bold rounded flex items-center justify-center gap-1 hover:scale-105 active:scale-95 transition-all text-center cursor-pointer font-sans"
                            >
                              استلام بعد السحب ⚖️
                            </button>
                          ) : (
                            record.weightAfter?.toFixed(3)
                          )}
                          {!isPending && record.piecesCount !== undefined && record.piecesCount > 0 && (
                            <span className="text-[9px] text-[#666] mr-1">({record.piecesCount}ق)</span>
                          )}
                        </td>

                        {/* Input weight (قبل) */}
                        <td className="px-3 py-4 text-left font-mono text-white font-bold bg-[#1a1a1a]/30">
                          {record.weightBefore.toFixed(3)}
                        </td>

                        {/* Date Time */}
                        <td className="px-3 py-4 text-center text-[#888] text-[10px] whitespace-nowrap">
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

              {/* Total Aggregate Summary */}
              {records.length > 0 && (
                <tfoot className="bg-[#0f0f0f] divide-y divide-[#222] text-[#fff] text-xs font-sans">
                  <tr className="font-bold border-t border-[#222]">
                    <td className="px-3 py-3 text-center text-[#C5A028]" colSpan={3}>المجموع الشامل</td>
                    <td className="px-3 py-3 text-[#777]">ملخص جرد غلق الفاكيوم والتفجير الدقيق</td>
                    <td className="px-3 py-3 text-center font-mono text-[#C5A028]">
                      {totalBefore > 0 ? (Math.abs(totalLoss) / totalBefore * 100).toFixed(2) : "0.00"}% <span className="text-[10px] text-[#888]">({totalLoss >= 0 ? "عجز كلي" : "وفر صافي"})</span>
                    </td>
                    <td className={`px-3 py-3 text-left font-mono ${totalLoss >= 0 ? 'text-rose-400 bg-rose-950/30' : 'text-emerald-400 bg-emerald-950/30'}`}>
                      {totalLoss >= 0 ? `-${totalLoss.toFixed(3)}` : `+${Math.abs(totalLoss).toFixed(3)}`} غرام
                    </td>
                    <td className="px-3 py-3 text-left font-mono text-[#e0e0e0]">
                      {totalDamaged.toFixed(3)} غرام
                    </td>
                    <td className="px-3 py-3 text-left font-mono text-[#e0e0e0]">
                      {totalAfter.toFixed(3)} غرام
                    </td>
                    <td className="px-3 py-3 text-left font-mono text-[#C5A028] bg-[#141414]">
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

      {/* Lightbox full overlay zoom view */}
      {zoomImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-center items-center p-4 animate-fadeIn" onClick={() => setZoomImage(null)}>
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center p-1" onClick={(e) => e.stopPropagation()}>
            <img src={zoomImage} alt="تفجير وسحب الذهب بدقة عالية" className="max-w-full max-h-full object-contain rounded-2xl border border-[#333] shadow-2xl" />
            <button
              type="button"
              className="absolute top-2 right-2 text-[#aaa] hover:text-white bg-black/85 hover:bg-neutral-800 p-2 rounded-full cursor-pointer transition-all"
              onClick={() => setZoomImage(null)}
            >
              <EyeOff className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[#64748b] text-xs mt-3 text-center">اضغط خارج الصورة للتصغير والعودة للوحة الدفتر</p>
        </div>
      )}

      {/* Row Complete Modal */}
      {updatingRecordId && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100] p-4 animate-fadeIn backdrop-blur-sm">
          <div className="bg-[#0f0f0f] border border-[#222] rounded-2xl p-6 max-w-md w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C5A028] to-transparent opacity-80" />
            
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 text-right">
              <Scale className="w-5 h-5 text-[#C5A028]" /> إكمال وتصفية الوجبة المعلقة (البعد)
            </h3>
            <p className="text-[11px] text-[#888] mb-4 text-right">
              أدخل البيانات والأوزان المستخلصة بعد فك الدفعة وسحبها بدقة لحساب نسبة الفاقد الكيميائي.
            </p>

            <form onSubmit={handleSaveUpdate} className="space-y-4 max-h-[72vh] overflow-y-auto px-1">
              {/* Product weight after */}
              <div className="grid grid-cols-2 gap-3 font-sans">
                <div>
                  <label className="block text-xs text-[#aaa] mb-1">الوزن النهائي بعد التشغيل</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={upWeightAfter}
                    onChange={(e) => setUpWeightAfter(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-1.5 text-xs text-left font-mono focus:border-[#C5A028]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#aaa] mb-1">عدد قطع الاستلام</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={upPiecesCount}
                    onChange={(e) => setUpPiecesCount(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-1.5 text-xs text-left font-mono focus:border-[#C5A028]"
                  />
                </div>
              </div>

              {/* Product description */}
              <div>
                <label className="block text-xs text-[#aaa] mb-1">تفاصيل ومواصفات الدفعة المستلمة</label>
                <input
                  type="text"
                  placeholder="خواتم دبل ليزر مصقولة عيار 21..."
                  value={upDetails}
                  onChange={(e) => setUpDetails(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-1.5 text-xs focus:border-[#C5A028]"
                />
              </div>

              {/* Product Image */}
              <div>
                <label className="block text-xs text-[#aaa] mb-1">صورة المنتجات بعد الدرفلة والفرز</label>
                {upAfterImage ? (
                  <div className="relative border border-[#222] rounded-xl h-24 overflow-hidden bg-black flex items-center justify-center">
                    <img src={upAfterImage} alt="الإنتاج" className="w-full h-full object-contain" />
                    <button type="button" onClick={() => setUpAfterImage("")} className="absolute top-1 right-1 p-1 bg-black/80 text-white rounded-full"><XCircle className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-1.5 border border-dashed border-[#222] rounded-xl p-3 cursor-pointer text-xs text-[#666] hover:border-[#C5A028] bg-[#141414]">
                    <UploadCloud className="w-4 h-4 text-[#555]" />
                    <span>تحميل صورة مشغولات الدرفلة</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e, "modalImg")} />
                  </label>
                )}
              </div>

              {/* Damaged info if not repair */}
              {records.find(r => r.id === updatingRecordId)?.stageType !== "repair" && (
                <div className="space-y-4 border-t border-[#222] pt-3">
                  <div>
                    <label className="block text-xs text-[#aaa] mb-1">الذهب التالف المستخلص (غرام)</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      value={upDamagedWeight}
                      onChange={(e) => setUpDamagedWeight(e.target.value)}
                      className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-1.5 text-xs text-left font-mono focus:border-[#C5A028]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#aaa] mb-1">صورة التالف أو خردة الدرفلة</label>
                    {upDamagedImage ? (
                      <div className="relative border border-[#222] rounded-xl h-24 overflow-hidden bg-black flex items-center justify-center">
                        <img src={upDamagedImage} alt="التالف" className="w-full h-full object-contain" />
                        <button type="button" onClick={() => setUpDamagedImage("")} className="absolute top-1 right-1 p-1 bg-black/80 text-white rounded-full"><XCircle className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-1.5 border border-dashed border-[#222] rounded-xl p-3 cursor-pointer text-xs text-[#666] hover:border-[#C5A028] bg-[#141414]">
                        <UploadCloud className="w-4 h-4 text-[#555]" />
                        <span>تحميل صورة الخردة والتالف</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e, "modalDamImg")} />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs text-[#aaa] mb-1">ملاحظات تصفية الوجبة</label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات واستلام ورشة أبو علي..."
                  value={upNotes}
                  onChange={(e) => setUpNotes(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-1.5 text-xs focus:border-[#C5A028] focus:ring-1 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="submit"
                  className="flex-grow py-2 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-neutral-950 font-black rounded-xl text-xs hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
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
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100] p-4 animate-fadeIn backdrop-blur-sm text-right font-sans" dir="rtl">
          <div className="bg-[#0f0f0f] border border-[#222] rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C5A028] to-transparent opacity-80" />
            
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 font-sans text-right">
              <Edit className="w-5 h-5 text-[#C5A028]" /> تعديل أوزان وبيانات التفجير والفاكيوم
            </h3>
            <p className="text-[11px] text-[#888] mb-4 leading-relaxed text-right">
              مراجعة وتحديث قيم الأوزان قبل وبعد الأحمال، التالف والملاحظات الهندسية بدقة.
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

              {/* Weight Before (الوزن المدخل) */}
              <div>
                <label className="block text-xs font-semibold text-[#aaa] mb-1.5 text-right flex justify-between">
                  <span>الوزن المدخل القبل (غرام)</span>
                  <span className="text-[11px] text-amber-500 font-bold font-mono">الوزن قبل المرحلة</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={editingWeightBefore}
                    onChange={(e) => setEditingWeightBefore(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl pl-12 pr-4 py-2 text-sm font-mono text-left focus:border-[#C5A028] outline-none"
                  />
                  <span className="absolute left-4 top-2 text-xs text-[#666] font-semibold">غرام</span>
                </div>
              </div>

              {/* Double Column for After and Damaged weights */}
              <div className="grid grid-cols-2 gap-3">
                {/* Weight After */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#aaa] mb-1 text-right flex justify-between">
                    <span>وزن المخرجات السليمة</span>
                    <span className="text-[10px] text-emerald-400">البعد</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      placeholder="غير معبأ"
                      value={editingWeightAfter}
                      onChange={(e) => setEditingWeightAfter(e.target.value)}
                      className="w-full text-white bg-[#141414] border border-[#222] rounded-xl pl-10 pr-3 py-2 text-xs font-mono text-left focus:border-[#C5A028] outline-none"
                    />
                    <span className="absolute left-2.5 top-2.5 text-[10px] text-[#555]">جم</span>
                  </div>
                </div>

                {/* Damaged Weight */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#aaa] mb-1 text-right flex justify-between">
                    <span>وزن التالف والخردة</span>
                    <span className="text-[10px] text-rose-400">البعد</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      placeholder="غير معبأ"
                      value={editingDamagedWeight}
                      onChange={(e) => setEditingDamagedWeight(e.target.value)}
                      className="w-full text-white bg-[#141414] border border-[#222] rounded-xl pl-10 pr-3 py-2 text-xs font-mono text-left focus:border-[#C5A028] outline-none"
                    />
                    <span className="absolute left-2.5 top-2.5 text-[10px] text-[#555]">جم</span>
                  </div>
                </div>
              </div>

              {/* Pieces Count and Details */}
              <div className="grid grid-cols-2 gap-3 text-right">
                {/* Pieces Count */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#aaa] mb-1">عدد قطع الدفعة</label>
                  <input
                    type="number"
                    value={editingPiecesCount}
                    onChange={(e) => setEditingPiecesCount(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-1.5 text-xs text-center focus:border-[#C5A028] outline-none"
                  />
                </div>

                {/* Details */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#aaa] mb-1">وصف مخرجات الدفعة</label>
                  <input
                    type="text"
                    value={editingDetails}
                    onChange={(e) => setEditingDetails(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-1.5 text-xs text-right focus:border-[#C5A028] outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#aaa] mb-1.5 text-right">الملاحظات الهندسية</label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات وتفاصيل تصفية المرحلة..."
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-1.5 text-xs text-right focus:border-[#C5A028] outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-grow py-2.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-neutral-950 font-black rounded-xl text-xs transition-all cursor-pointer shadow-md"
                >
                  حفظ وتأكيد التعديلات ⚖️
                </button>
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="py-2.5 px-4 bg-[#1a1a1a] hover:bg-[#252525] text-[#aaa] font-bold rounded-xl text-xs border border-neutral-800 cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Split and Promote Modal */}
      {splitRecord && (() => {
        const totalW = splitRecord.weightAfter || 0;
        const totalP = splitRecord.piecesCount || 0;
        
        const repairWNum = parseFloat(splitRepairWeight) || 0;
        const repairPNum = parseInt(splitRepairPieces) || 0;
        
        const remainingW = Math.max(0, totalW - repairWNum);
        const remainingP = Math.max(0, totalP - repairPNum);

        return (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[110] p-4 animate-fadeIn backdrop-blur-sm text-right font-sans" dir="rtl">
            <div className="bg-[#0f0f0f] border border-[#222] rounded-2xl p-6 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-[#C5A028] to-emerald-500 opacity-80" />
              
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 font-sans text-right">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>خيارات تفرعة وتجزئة الوجبة رقم ({splitRecord.id.replace("roll-", "")})</span>
              </h3>
              <p className="text-[11px] text-[#888] mb-4 leading-relaxed text-right">
                وصلت هذه الوجبة إلى ذروتها في التفجير بوزن صافي قدره <strong className="text-white">({totalW.toFixed(3)} غ)</strong> بعدد <strong className="text-white">({totalP} قطع)</strong>. يمكنك تحويلها بالكامل أو تقسيمها بالتفصيل إلى مرحلتين حسب صلاحية ونظافة القطع:
              </p>

              {/* Quick Presets Buttons */}
              <div className="bg-[#141414] border border-[#222] p-3 rounded-xl mb-4">
                <span className="block text-[10px] text-[#666] mb-2 font-bold">خيارات التوصيل السريعة:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSplitRepairWeight(totalW.toString());
                      setSplitRepairPieces(totalP.toString());
                    }}
                    className="py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-[#C5A028] border border-[#C5A028]/30 rounded-lg text-[10px] font-black transition-all cursor-pointer text-center"
                  >
                    🛠️ تحويل الوجبة كلياً للتصليح
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSplitRepairWeight("0");
                      setSplitReviewPiecesCountZero();
                      function setSplitReviewPiecesCountZero() {
                        setSplitRepairPieces("0");
                      }
                    }}
                    className="py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-black transition-all cursor-pointer text-center"
                  >
                    🌀 تحويل كلي للفاكيوم والطلب
                  </button>
                </div>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (repairWNum < 0 || repairWNum > totalW + 0.0001) {
                    alert("وزن التصليح غير صحيح أو يتجاوز الوزن الإجمالي للوجبة!");
                    return;
                  }
                  if (repairPNum < 0 || repairPNum > totalP) {
                    alert("عدد قطع التصليح غير صحيح!");
                    return;
                  }
                  if (onPromoteSplitStage) {
                    onPromoteSplitStage(
                      splitRecord.id, 
                      repairWNum, 
                      repairPNum, 
                      parseFloat(remainingW.toFixed(3)), 
                      remainingP
                    );
                  }
                  setSplitRecord(null);
                }} 
                className="space-y-4"
              >
                {/* 1. Repair Portion Card */}
                <div className="bg-indigo-950/10 border border-indigo-500/20 p-3.5 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4" /> الجزء المتجه إلى: التصليح اليدوي 🛠️
                    </span>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20">يحتاج تعديلات عينية</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-right">
                    <div>
                      <label className="block text-[10px] text-[#aaa] mb-1">الوزن للتصليح (غرام)</label>
                      <input
                        type="number"
                        step="0.001"
                        max={totalW}
                        min="0"
                        required
                        value={splitRepairWeight}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSplitRepairWeight(val);
                        }}
                        className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-1.5 text-xs text-left font-mono focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#aaa] mb-1">عدد قطع التصليح</label>
                      <input
                        type="number"
                        max={totalP}
                        min="0"
                        required
                        value={splitRepairPieces}
                        onChange={(e) => setSplitRepairPieces(e.target.value)}
                        className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-1.5 text-xs text-left font-mono focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Direct Vacuum/Request Portion Card (Auto-computed) */}
                <div className="bg-emerald-950/10 border border-emerald-500/20 p-3.5 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Flame className="w-4 h-4" /> المجهر التلقائي: غلق فاكيوم وبونزة 🌀
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20">جاهز ومستثنى مباشرة</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-right">
                    <div>
                      <span className="block text-[10px] text-[#666] mb-1">الوزن المتبقي المتجه للفاكيوم</span>
                      <div className="w-full bg-[#121212] border border-[#222] rounded-xl px-2.5 py-1.5 text-xs text-left font-mono text-emerald-400 font-bold select-none">
                        {remainingW.toFixed(3)} غ
                      </div>
                    </div>
                    <div>
                      <span className="block text-[10px] text-[#666] mb-1">قطع الفاكيوم المتبقية</span>
                      <div className="w-full bg-[#121212] border border-[#222] rounded-xl px-2.5 py-1.5 text-xs text-left font-mono text-emerald-400 font-bold select-none">
                        {remainingP} قطع
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirm & Cancel Rows */}
                <div className="flex gap-2.5 pt-3">
                  <button
                    type="submit"
                    className="flex-grow py-2.5 px-4 bg-gradient-to-r from-indigo-500 via-amber-500 to-emerald-500 text-neutral-950 font-black rounded-xl text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    🚀 اعتماد التقسيم وصرف القطع
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitRecord(null)}
                    className="py-2.5 px-4 bg-[#1a1a1a] hover:bg-[#252525] text-[#aaa] font-bold rounded-xl text-xs border border-neutral-800 cursor-pointer"
                  >
                    تراجع
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
