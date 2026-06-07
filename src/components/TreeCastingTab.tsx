import React, { useState } from "react";
import { TreeCastingRecord } from "../types";
import { FilePlus2, Trash2, Calendar, Scale, TreePine, Search, UploadCloud, Eye, EyeOff, XCircle, CheckCircle2, Clock, Info, Layers, Award, RefreshCcw, Edit } from "lucide-react";

interface TreeCastingTabProps {
  records: TreeCastingRecord[];
  onAddRecord: (record: Omit<TreeCastingRecord, "id" | "loss"> & { isPending?: boolean }) => void;
  onDeleteRecord: (id: string) => void;
  onUpdateRecord: (
    id: string,
    inputWeight: number,
    productionWeight?: number,
    damagedWeight?: number,
    productionCount?: number,
    productionDetails?: string,
    damagedCount?: number,
    damagedDetails?: string,
    notes?: string,
    productionImage?: string,
    damagedImage?: string,
    afterImage?: string,
    date?: string,
    time?: string,
    varianceReason?: string
  ) => void;
}

export const TreeCastingTab: React.FC<TreeCastingTabProps> = ({
  records,
  onAddRecord,
  onDeleteRecord,
  onUpdateRecord,
}) => {
  // Navigation for registration steps ("قبل صفحة بعد صفحة ומثل هسة")
  const [formMode, setFormMode] = useState<"before" | "after" | "both">("before");

  // State parameters - Before Step
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [time, setTime] = useState<string>(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  });
  const [inputWeight, setInputWeight] = useState<string>("");
  const [beforeImage, setBeforeImage] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // State parameters - After Step (Integrative & both)
  const [productionWeight, setProductionWeight] = useState<string>("");
  const [productionCount, setProductionCount] = useState<string>("");
  const [productionDetails, setProductionDetails] = useState<string>("");
  const [productionImage, setProductionImage] = useState<string>("");

  const [damagedWeight, setDamagedWeight] = useState<string>("");
  const [damagedCount, setDamagedCount] = useState<string>("");
  const [damagedDetails, setDamagedDetails] = useState<string>("");
  const [damagedImage, setDamagedImage] = useState<string>("");

  // Standalone updates
  const [selectedPendingId, setSelectedPendingId] = useState<string>("");
  const [afterFormProductionWeight, setAfterFormProductionWeight] = useState<string>("");
  const [afterFormProductionCount, setAfterFormProductionCount] = useState<string>("");
  const [afterFormProductionDetails, setAfterFormProductionDetails] = useState<string>("");
  const [afterFormProductionImage, setAfterFormProductionImage] = useState<string>("");

  const [afterFormDamagedWeight, setAfterFormDamagedWeight] = useState<string>("");
  const [afterFormDamagedCount, setAfterFormDamagedCount] = useState<string>("");
  const [afterFormDamagedDetails, setAfterFormDamagedDetails] = useState<string>("");
  const [afterFormDamagedImage, setAfterFormDamagedImage] = useState<string>("");
  const [afterFormNotes, setAfterFormNotes] = useState<string>("");
  const [varianceReason, setVarianceReason] = useState<string>("");
  const [afterFormVarianceReason, setAfterFormVarianceReason] = useState<string>("");
  const [updatingVarianceReason, setUpdatingVarianceReason] = useState<string>("");

  // Global UI utilities
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showPromoted, setShowPromoted] = useState<boolean>(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Modal updates (triggered via table rows)
  const [updatingRecordId, setUpdatingRecordId] = useState<string | null>(null);
  const [upProdWeight, setUpProdWeight] = useState<string>("");
  const [upProdCount, setUpProdCount] = useState<string>("");
  const [upProdDetails, setUpProdDetails] = useState<string>("");
  const [upProdImage, setUpProdImage] = useState<string>("");

  const [upDamagedWeight, setUpDamagedWeight] = useState<string>("");
  const [upDamagedCount, setUpDamagedCount] = useState<string>("");
  const [upDamagedDetails, setUpDamagedDetails] = useState<string>("");
  const [upDamagedImage, setUpDamagedImage] = useState<string>("");
  const [upNotes, setUpNotes] = useState<string>("");

  // Parsed weights
  const parsedInput = parseFloat(inputWeight) || 0;
  const parsedProd = parseFloat(productionWeight) || 0;
  const parsedDamaged = parseFloat(damagedWeight) || 0;

  const handleImageFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "before" | "production" | "damaged" | "afterFormProd" | "afterFormDamag" | "modalProd" | "modalDamag"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => {
        const result = r.result as string;
        if (type === "before") setBeforeImage(result);
        else if (type === "production") setProductionImage(result);
        else if (type === "damaged") setDamagedImage(result);
        else if (type === "afterFormProd") setAfterFormProductionImage(result);
        else if (type === "afterFormDamag") setAfterFormDamagedImage(result);
        else if (type === "modalProd") setUpProdImage(result);
        else if (type === "modalDamag") setUpDamagedImage(result);
      };
      r.readAsDataURL(file);
    }
  };

  // 1. Submit Before Step only (create a pending record)
  const handleBeforeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedInput <= 0) {
      alert("الرجاء إدخال وزن الذهب المدخل للشجرة بشكل صحيح مسبقاً");
      return;
    }

    onAddRecord({
      date,
      time,
      inputWeight: parsedInput,
      productionWeight: undefined,
      damagedWeight: undefined,
      productionCount: undefined,
      productionDetails: "",
      productionImage: undefined,
      damagedCount: undefined,
      damagedDetails: "",
      damagedImage: undefined,
      notes: notes.trim(),
      isPending: true,
      beforeImage,
      afterImage: undefined,
    });

    setInputWeight("");
    setBeforeImage("");
    setNotes("");
    
    // Automatically switch to step 2 to suggest immediate continuation or subsequent collection
    setFormMode("after");
    alert("تم ترحيل بيانات شحن الشجرة بالوزن المسبق ⏳");
  };

  // 2. Submit integration full process immediately
  const handleBothSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedInput <= 0) {
      alert("الرجاء إدخال وزن الذهب المدخل للشجرة بشكل صحيح");
      return;
    }
    if (parsedProd <= 0 && parsedDamaged <= 0) {
      alert("الرجاء إدخال وزن إنتاج إيجابي أو وزن تالف لتجنيب الأخطاء");
      return;
    }

    onAddRecord({
      date,
      time,
      inputWeight: parsedInput,
      productionWeight: parsedProd,
      damagedWeight: parsedDamaged,
      productionCount: parseInt(productionCount) || undefined,
      productionDetails: productionDetails.trim(),
      productionImage,
      damagedCount: parseInt(damagedCount) || undefined,
      damagedDetails: damagedDetails.trim(),
      damagedImage,
      notes: notes.trim(),
      varianceReason: varianceReason.trim(),
      isPending: false,
      beforeImage,
      afterImage: productionImage,
    });

    setInputWeight("");
    setProductionWeight("");
    setProductionCount("");
    setProductionDetails("");
    setProductionImage("");
    setDamagedWeight("");
    setDamagedCount("");
    setDamagedDetails("");
    setDamagedImage("");
    setBeforeImage("");
    setNotes("");
    setVarianceReason("");
  };

  // 3. Complete standalone pending tree
  const handleStandaloneAfterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const upProd = parseFloat(afterFormProductionWeight) || 0;
    const upDamag = parseFloat(afterFormDamagedWeight) || 0;
    const prodCt = parseInt(afterFormProductionCount) || 0;
    const damCt = parseInt(afterFormDamagedCount) || 0;

    if (!selectedPendingId) {
      alert("الرجاء تحديد الشجرة المعلقة لتصفيتها أولاً");
      return;
    }
    if (upProd <= 0 && upDamag <= 0) {
      alert("الرجاء إدخال وزن الإنتاج الصافي أو التالف بعد الكسر المباشر");
      return;
    }

    const pendingItem = records.find(r => r.id === selectedPendingId);
    const originalInputWeight = pendingItem ? pendingItem.inputWeight : 0;
    onUpdateRecord(
      selectedPendingId,
      originalInputWeight,
      upProd,
      upDamag,
      prodCt,
      afterFormProductionDetails.trim(),
      damCt,
      afterFormDamagedDetails.trim(),
      afterFormNotes.trim(),
      afterFormProductionImage,
      afterFormDamagedImage,
      afterFormProductionImage,
      undefined,
      undefined,
      afterFormVarianceReason.trim()
    );

    setSelectedPendingId("");
    setAfterFormProductionWeight("");
    setAfterFormProductionCount("");
    setAfterFormProductionDetails("");
    setAfterFormProductionImage("");
    setAfterFormDamagedWeight("");
    setAfterFormDamagedCount("");
    setAfterFormDamagedDetails("");
    setAfterFormDamagedImage("");
    setAfterFormNotes("");
    setAfterFormVarianceReason("");

    alert("تم تصفية الشجرة وحساب فاقد صب الفاكيوم بدقة تامة ⚖️");
  };

  // Trigger modal in-row update
  const handleOpenUpdate = (record: TreeCastingRecord) => {
    setUpdatingRecordId(record.id);
    setUpProdWeight("");
    setUpProdCount("");
    setUpProdDetails("");
    setUpProdImage("");
    setUpDamagedWeight("");
    setUpDamagedCount("");
    setUpDamagedDetails("");
    setUpDamagedImage("");
    setUpNotes(record.notes || "");
    setUpdatingVarianceReason(record.varianceReason || "");
  };

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedUpProd = parseFloat(upProdWeight) || 0;
    const parsedUpDam = parseFloat(upDamagedWeight) || 0;
    const parsedUpProdCount = parseInt(upProdCount) || 0;
    const parsedUpDamCount = parseInt(upDamagedCount) || 0;

    if (parsedUpProd <= 0 && parsedUpDam <= 0) {
      alert("الرجاء إدخال الأوزان الناتجة والمستخلصة لإكمال العملية");
      return;
    }

    if (updatingRecordId) {
      const updatingRecord = records.find(r => r.id === updatingRecordId);
      const originalInputWeight = updatingRecord ? updatingRecord.inputWeight : 0;
      onUpdateRecord(
        updatingRecordId,
        originalInputWeight,
        parsedUpProd,
        parsedUpDam,
        parsedUpProdCount,
        upProdDetails.trim(),
        parsedUpDamCount,
        upDamagedDetails.trim(),
        upNotes.trim(),
        upProdImage,
        upDamagedImage,
        upProdImage,
        undefined,
        undefined,
        updatingVarianceReason.trim()
      );
      setUpdatingRecordId(null);
      setUpdatingVarianceReason("");
    }
  };

  // General Edit Modal State (Allows editing absolutely anything including InputWeight, ProductionWeight, and DamagedWeight)
  const [editingRecord, setEditingRecord] = useState<TreeCastingRecord | null>(null);
  const [editingInputWeight, setEditingInputWeight] = useState<string>("");
  const [editingProductionWeight, setEditingProductionWeight] = useState<string>("");
  const [editingDamagedWeight, setEditingDamagedWeight] = useState<string>("");
  const [editingProductionCount, setEditingProductionCount] = useState<string>("");
  const [editingProductionDetails, setEditingProductionDetails] = useState<string>("");
  const [editingDamagedCount, setEditingDamagedCount] = useState<string>("");
  const [editingDamagedDetails, setEditingDamagedDetails] = useState<string>("");
  const [editingDate, setEditingDate] = useState<string>("");
  const [editingTime, setEditingTime] = useState<string>("");
  const [editingNotes, setEditingNotes] = useState<string>("");
  const [editingProductionImage, setEditingProductionImage] = useState<string>("");
  const [editingDamagedImage, setEditingDamagedImage] = useState<string>("");
  const [editingVarianceReason, setEditingVarianceReason] = useState<string>("");

  const handleOpenGeneralEdit = (record: TreeCastingRecord) => {
    setEditingRecord(record);
    setEditingInputWeight(String(record.inputWeight));
    setEditingProductionWeight(record.productionWeight !== undefined ? String(record.productionWeight) : "");
    setEditingDamagedWeight(record.damagedWeight !== undefined ? String(record.damagedWeight) : "");
    setEditingProductionCount(record.productionCount !== undefined ? String(record.productionCount) : "");
    setEditingProductionDetails(record.productionDetails || "");
    setEditingDamagedCount(record.damagedCount !== undefined ? String(record.damagedCount) : "");
    setEditingDamagedDetails(record.damagedDetails || "");
    setEditingDate(record.date);
    setEditingTime(record.time || "");
    setEditingNotes(record.notes || "");
    setEditingProductionImage(record.productionImage || "");
    setEditingDamagedImage(record.damagedImage || "");
    setEditingVarianceReason(record.varianceReason || "");
  };

  const handleSaveGeneralEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const parsedInputVal = parseFloat(editingInputWeight) || 0;
    if (parsedInputVal <= 0) {
      alert("الرجاء إدخال وزن مدخل للشجرة صحيح أكبر من الصفر");
      return;
    }

    const hasProd = editingProductionWeight.trim() !== "";
    const parsedProdVal = hasProd ? parseFloat(editingProductionWeight) : undefined;
    if (hasProd && (parsedProdVal === undefined || parsedProdVal < 0)) {
      alert("الرجاء إدخال وزن إنتاج صافي صحيح");
      return;
    }

    const hasDamaged = editingDamagedWeight.trim() !== "";
    const parsedDamagedVal = hasDamaged ? parseFloat(editingDamagedWeight) : undefined;
    if (hasDamaged && (parsedDamagedVal === undefined || parsedDamagedVal < 0)) {
      alert("الرجاء إدخال وزن تالف شمع وزوائد صحيح");
      return;
    }

    onUpdateRecord(
      editingRecord.id,
      parsedInputVal,
      parsedProdVal,
      parsedDamagedVal,
      editingProductionCount ? parseInt(editingProductionCount) : undefined,
      editingProductionDetails.trim(),
      editingDamagedCount ? parseInt(editingDamagedCount) : undefined,
      editingDamagedDetails.trim(),
      editingNotes.trim(),
      editingProductionImage,
      editingDamagedImage,
      editingProductionImage,
      editingDate,
      editingTime,
      editingVarianceReason.trim()
    );

    setEditingRecord(null);
    setEditingVarianceReason("");
    alert("تم تعديل سجل الشجرة وتحديث جميع الأوزان والنسب بنجاح! 🌳");
  };

  // Active Pending tree castings
  const pendingRecords = records.filter((r) => r.isPending);

  // Filter lists
  const filteredRecords = records.filter((r) => {
    if (!showPromoted && r.isPromoted) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.notes?.toLowerCase().includes(q) ||
      r.productionDetails?.toLowerCase().includes(q) ||
      r.date.includes(q)
    );
  });

  // Aggregate stats
  const completedRecords = records.filter((r) => !r.isPending);
  const totalInput = records.reduce((sum, r) => sum + r.inputWeight, 0);
  const totalProd = completedRecords.reduce((sum, r) => sum + (r.productionWeight ?? 0), 0);
  const totalDamaged = completedRecords.reduce((sum, r) => sum + (r.damagedWeight ?? 0), 0);
  const totalLoss = completedRecords.reduce((sum, r) => sum + (r.loss ?? 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
      {/* Registration Side Panel */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <div className="bg-[#0f0f0f] rounded-2xl border border-[#222] p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C5A028] to-transparent opacity-60" />

          <div className="flex items-center gap-3 border-b border-[#222] pb-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-xl text-[#C5A028] border border-[#d4af37]/10">
              <TreePine className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-md font-bold text-white">تسجيل صب الشجرة الشمعية</h2>
              <p className="text-[11px] text-[#888] mt-0.5">شحن الذهب واستخلاص المشغولات وتوثيق التالف والناقص</p>
            </div>
          </div>

          {/* Tab Sub-navigation ("قبل صفحة بعد صفحة ומثل هسة") */}
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
                  ? "bg-[#181818] text-white border border-[#2c2c2c] font-black"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              ترحيل كامل ✍️
            </button>
          </div>

          {/* MODE 1: Before form only */}
          {formMode === "before" && (
            <form onSubmit={handleBeforeSubmit} className="space-y-4 animate-fadeIn">
              <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl text-[11px] text-amber-500 flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <span>قم بتثبيت وزن الذهب الصافي عيار 21 المشحون في كوكبة الشمع مع التقاط <strong>صورة قبل</strong> للصب في الفرن الدوار.</span>
              </div>

              {/* Date / Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#aaa] mb-1">تاريخ الشحن</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-2 text-xs font-mono text-right focus:border-[#C5A028] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#aaa] mb-1">وقت الشحن</label>
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
                <label className="block text-xs font-bold text-[#e0e0e0] mb-1 flex justify-between">
                  <span>الذهب المشحون بالشجرة (غرام)</span>
                  <span className="text-[10px] text-[#C5A028]">القبل</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={inputWeight}
                    onChange={(e) => setInputWeight(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl pl-12 pr-4 py-2.5 text-sm text-left font-mono focus:border-[#C5A028] outline-none"
                  />
                  <span className="absolute left-3 top-3 text-[11px] text-[#555] font-bold">غرام</span>
                </div>
              </div>

              {/* Upload Before Image */}
              <div>
                <label className="block text-[11px] font-semibold text-[#aaa] mb-1">صورة شجرة الشمع قبل التغطيس والصب</label>
                {beforeImage ? (
                  <div className="relative border border-[#222] rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center">
                    <img src={beforeImage} alt="شجرة قبل" className="w-full h-full object-contain" />
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
                    <span className="text-xs text-[#666] mt-1.5">تحميل صورة الشجرة الجيرية/الشمع</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e, "before")} />
                  </label>
                )}
              </div>

              {/* Initial notes */}
              <div>
                <label className="block text-[11px] text-[#aaa] mb-1">الملاحظات أو رقم صبة الخزانة</label>
                <textarea
                  rows={2}
                  placeholder="رقم الوجبة، عيار صياغة الفاكيوم..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#C5A028] hover:bg-[#d9b132] text-neutral-950 font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer flex justify-center items-center gap-2"
              >
                <FilePlus2 className="w-4.5 h-4.5" />
                <span>شحن وتثبيت الشجرة المعلقة ⏳</span>
              </button>
            </form>
          )}

          {/* MODE 2: After calculation/collection standalone */}
          {formMode === "after" && (
            <form onSubmit={handleStandaloneAfterSubmit} className="space-y-4 animate-fadeIn">
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl text-[11px] text-emerald-400 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>اختر شجرة معلقة من قائمة الوجبات الجارية لإثبات واستلام المشغولات الجاهزة وحساب الفاقد والناقص المباشر.</span>
              </div>

              {/* Selection Dropdown */}
              <div>
                <label className="block text-xs font-bold text-[#e0e0e0] mb-1">تحديد الشجرة المعلقة لتصفيتها:</label>
                {pendingRecords.length === 0 ? (
                  <div className="bg-[#141414] border border-dashed border-[#222] text-center p-6 rounded-xl text-[#555] text-xs">
                    لا توجد أشجار معلقة بالانتظار حالياً. توجه إلى قسم "القبل" لشحن شجرة جديدة!
                  </div>
                ) : (
                  <select
                    required
                    value={selectedPendingId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedPendingId(id);
                      const rec = records.find(r => r.id === id);
                      if (rec) setAfterFormNotes(rec.notes || "");
                    }}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2.5 text-xs focus:border-[#C5A028] outline-none"
                  >
                    <option value="">-- حدد الوجبة المعلقة من الدفتر --</option>
                    {pendingRecords.map((r) => (
                      <option key={r.id} value={r.id}>
                        شحنة ذهب: {r.inputWeight.toFixed(3)}g | تاريخ: {r.date} ({r.time || ""})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedPendingId && (
                <div className="space-y-4 pt-1 animate-fadeIn">
                  {/* Production weight */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#aaa] mb-1">وزن الإنتاج الصافي (g)</label>
                      <input
                        type="number"
                        step="0.001"
                        required
                        placeholder="0.000"
                        value={afterFormProductionWeight}
                        onChange={(e) => setAfterFormProductionWeight(e.target.value)}
                        className="w-full text-white bg-[#141414] border border-emerald-950 font-mono text-left rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#aaa] mb-1">عدد قطع الإنتاج الصافي</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={afterFormProductionCount}
                        onChange={(e) => setAfterFormProductionCount(e.target.value)}
                        className="w-full text-white bg-[#141414] border border-[#222] font-mono text-left rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none"
                      />
                    </div>
                  </div>

                  {/* Production Details */}
                  <div>
                    <label className="block text-[11px] text-[#aaa] mb-1">تفاصيل المشغولات السليمة</label>
                    <input
                      type="text"
                      placeholder="قرط ليزر، خواتم دبل عريضة..."
                      value={afterFormProductionDetails}
                      onChange={(e) => setAfterFormProductionDetails(e.target.value)}
                      className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none"
                    />
                  </div>

                  {/* After Image upload */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#aaa] mb-1">صورة المشغولات المستخلصة (البعد)</label>
                    {afterFormProductionImage ? (
                      <div className="relative border border-[#222] rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center">
                        <img src={afterFormProductionImage} alt="إنتاج" className="w-full h-full object-contain" />
                        <button type="button" onClick={() => setAfterFormProductionImage("")} className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-rose-950 text-white rounded-full"><XCircle className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-1.5 border border-dashed border-[#222] rounded-xl p-3 cursor-pointer text-xs text-[#666] hover:border-emerald-500/40 bg-[#141414]">
                        <UploadCloud className="w-4.5 h-4.5" />
                        <span>تحميل صورة المشغولات الجاهزة 📤</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e, "afterFormProd")} />
                      </label>
                    )}
                  </div>

                  <hr className="border-[#222]" />

                  {/* Damaged Weight */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#aaa] mb-1">وزن تالف الشجرة / الخردة (g)</label>
                      <input
                        type="number"
                        step="0.001"
                        placeholder="0.000"
                        value={afterFormDamagedWeight}
                        onChange={(e) => setAfterFormDamagedWeight(e.target.value)}
                        className="w-full text-white bg-[#141414] border border-rose-950 font-mono text-left rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#aaa] mb-1">عدد القطع التالفة</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={afterFormDamagedCount}
                        onChange={(e) => setAfterFormDamagedCount(e.target.value)}
                        className="w-full text-white bg-[#141414] border border-[#222] font-mono text-left rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none"
                      />
                    </div>
                  </div>

                  {/* Damaged Details */}
                  <div>
                    <label className="block text-[11px] text-[#aaa] mb-1">أماكن عيوب الصب أو زوائد العروق</label>
                    <input
                      type="text"
                      placeholder="زوائد أسفل ذراع الشق..."
                      value={afterFormDamagedDetails}
                      onChange={(e) => setAfterFormDamagedDetails(e.target.value)}
                      className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none"
                    />
                  </div>

                  {/* Damaged Image */}
                  <div>
                    <label className="block text-[10px] text-[#888] mb-1">صورة التالف أو الخنزيرة المكسورة</label>
                    {afterFormDamagedImage ? (
                      <div className="relative border border-[#222] rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center">
                        <img src={afterFormDamagedImage} alt="تالف" className="w-full h-full object-contain" />
                        <button type="button" onClick={() => setAfterFormDamagedImage("")} className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-rose-950 text-white rounded-full"><XCircle className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-1.5 border border-dashed border-[#222] rounded-xl p-3 cursor-pointer text-xs text-[#666] hover:border-rose-500/35 bg-[#141414]">
                        <UploadCloud className="w-4.5 h-4.5" />
                        <span>تحميل صورة التالف والخردة</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e, "afterFormDamag")} />
                      </label>
                    )}
                  </div>

                  {/* General notes */}
                  <div>
                    <label className="block text-[11px] text-[#aaa] mb-1">ملاحظات التصفية الإضافية</label>
                    <textarea
                      rows={2}
                      placeholder="ملاحظات الإنتاج والتسليم..."
                      value={afterFormNotes}
                      onChange={(e) => setAfterFormNotes(e.target.value)}
                      className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none resize-none"
                    />
                  </div>

                  {/* Variance Reason */}
                  <div>
                    <label className="block text-[11px] text-[#aaa] mb-1">سبب النقص أو الزيادة (إن وجد)</label>
                    <input
                      type="text"
                      placeholder="امثلة: تطاير كشط الذهب بالجران، عجز كيميائي في الفرن..."
                      value={afterFormVarianceReason}
                      onChange={(e) => setAfterFormVarianceReason(e.target.value)}
                      className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-neutral-950 font-black py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer flex justify-center items-center gap-2"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5" />
                    <span>تأكيد واستخلاص الشجرة بنجاح ⚖️</span>
                  </button>
                </div>
              )}
            </form>
          )}

          {/* MODE 3: BOTH (IMMEDIATE REGISTRATION) */}
          {formMode === "both" && (
            <form onSubmit={handleBothSubmit} className="space-y-4 animate-fadeIn font-sans">
              <div className="bg-[#141414] p-3 rounded-lg text-[10px] border border-[#222] text-[#888] mb-1 leading-relaxed">
                ✍️ <strong>الترحيل الكامل المباشر:</strong> قم بتوثيق العملية بمخرجاتها كاملة دفعة واحدة في حال اكتمال صب وتصفية وجرد الشجرة فعلياً.
              </div>

              {/* Input details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#aaa] mb-1">تاريخ الصب</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-2 text-xs font-mono text-right focus:border-[#C5A028] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#aaa] mb-1">وقت الصب</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-2 text-xs font-mono text-right focus:border-[#C5A028] outline-none"
                  />
                </div>
              </div>

              {/* Weights input / output */}
              <div className="bg-[#141414] p-3.5 rounded-xl border border-[#222] space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#e0e0e0] mb-1">١. وزن المدخل ( g )</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={inputWeight}
                    onChange={(e) => setInputWeight(e.target.value)}
                    className="w-full text-white bg-black border border-[#22) block rounded-lg px-2.5 py-2 text-xs text-left font-mono focus:border-[#C5A028] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-emerald-400 mb-1">٢. وزن الإنتاج الصافي ( g )</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={productionWeight}
                    onChange={(e) => setProductionWeight(e.target.value)}
                    className="w-full text-white bg-black border border-[#222] rounded-lg px-2.5 py-2 text-xs text-left font-mono focus:border-[#C5A028] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-rose-400 mb-1">٣. وزن التالف / الخردة ( g )</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={damagedWeight}
                    onChange={(e) => setDamagedWeight(e.target.value)}
                    className="w-full text-white bg-black border border-[#222] rounded-lg px-2.5 py-2 text-xs text-left font-mono focus:border-[#C5A028] outline-none"
                  />
                </div>
              </div>

              {/* Before image & production details */}
              <div className="grid grid-cols-2 gap-2.5 bg-[#141414] p-3 rounded-xl border border-[#222]">
                <div>
                  <label className="block text-[9px] text-[#888] mb-1">صورة قبل الصب</label>
                  {beforeImage ? (
                    <div className="relative border border-[#222] rounded-lg overflow-hidden h-14 bg-black">
                      <img src={beforeImage} alt="قبل" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setBeforeImage("")} className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 text-white rounded-full"><XCircle className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-1.5 border border-dashed border-[#22) block rounded-lg h-14 cursor-pointer bg-black text-[9px] text-[#666]">
                      <UploadCloud className="w-4 h-4" />
                      <span>صورة قبل</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e, "before")} />
                    </label>
                  )}
                </div>
                <div>
                  <label className="block text-[9px] text-[#888] mb-1">صورة بعد (الإنتاج)</label>
                  {productionImage ? (
                    <div className="relative border border-[#222] rounded-lg overflow-hidden h-14 bg-black">
                      <img src={productionImage} alt="بعد" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setProductionImage("")} className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 text-white rounded-full"><XCircle className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-1.5 border border-dashed border-[#222] rounded-lg h-14 cursor-pointer bg-black text-[9px] text-[#666]">
                      <UploadCloud className="w-4 h-4" />
                      <span>صورة بعد</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e, "production")} />
                    </label>
                  )}
                </div>
              </div>

              {/* Standard info */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-[#aaa] mb-1">عدد القطع المستلمة</label>
                  <input type="number" placeholder="0" value={productionCount} onChange={(e) => setProductionCount(e.target.value)} className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-1.5 text-xs text-left font-mono focus:border-[#C5A028] outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] text-[#aaa] mb-1">وصف المخرجات</label>
                  <input type="text" placeholder="خواتم، سلاسل..." value={productionDetails} onChange={(e) => setProductionDetails(e.target.value)} className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-1.5 text-xs focus:border-[#C5A028] outline-none" />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] text-[#aaa]">ملاحظات ترحيل الفاكيوم</label>
                <textarea rows={2} placeholder="تفاصيل إضافية للدفتر..." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none resize-none" />
              </div>

              {/* Variance Reason */}
              <div>
                <label className="block text-[11px] text-[#aaa]">سبب النقص أو الزيادة (إن وجد)</label>
                <input
                  type="text"
                  placeholder="أمثلة: فاقد تفتير الجبس، عينات مجتزأة، تطاير فاقد..."
                  value={varianceReason}
                  onChange={(e) => setVarianceReason(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#C5A028] hover:bg-[#d9b132] text-neutral-950 font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all"
              >
                ترحيل سجل الشجرة بالكامل 🌳
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Tables & Ledger Column */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        {/* Search bar */}
        <div className="bg-[#141414] p-4 rounded-2xl border border-[#222] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#555] absolute right-3 top-3.5" />
              <input
                type="text"
                placeholder="البحث بالوصف، التاريخ أو التالف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-right text-white bg-[#181818] border border-[#222] rounded-xl pl-3 pr-9 py-2.5 text-xs focus:border-[#C5A028] outline-none"
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
            عرض <span className="text-[#C5A028] font-bold">{filteredRecords.length}</span> من أصل <span className="text-[#C5A028] font-bold">{records.length}</span> صبة شجرة شمعية
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
                  <th className="px-3 py-3 text-center font-bold">صور المعاينة</th>
                  <th className="px-3 py-3 font-bold">مخرجات الإنتاج السالم والتالف</th>
                  <th className="px-3 py-3 text-center font-bold">% نسبة العجز</th>
                  <th className="px-3 py-3 text-left font-bold font-mono">طبيعة العجز (-)</th>
                  <th className="px-3 py-3 text-[#fecdd3] text-left font-bold font-mono">وزن التالف (البعد)</th>
                  <th className="px-3 py-3 text-[#a7f3d0] text-left font-bold font-mono">وزن المخرجات (البعد)</th>
                  <th className="px-3 py-3 text-[#fef08a] text-left font-bold font-mono">الوزن المشحون (القبل)</th>
                  <th className="px-3 py-3 text-center font-bold">التاريخ / الوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-[#666] text-xs">
                      لا توجد سجلات صب فاكيوم مدخلة حالياً. استخدم اللوحة الجانبية لبدء التتبع.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => {
                    const isPending = record.isPending;
                    const isProfit = !isPending && record.loss !== undefined && record.loss < 0;
                    const lossAbs = !isPending && record.loss !== undefined ? Math.abs(record.loss) : 0;
                    const pct = !isPending && record.inputWeight > 0 && record.loss !== undefined ? (lossAbs / record.inputWeight) * 100 : 0;
                    
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

                        {/* Automatic promotions / Variance Reason */}
                        <td className="px-2 py-4 text-center max-w-[155px] truncate" title={record.varianceReason}>
                          {isPending ? (
                            <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">⏳ في جبس الشجرة</span>
                          ) : record.varianceReason ? (
                            <span className="text-amber-400 bg-amber-500/5 px-2 py-1 rounded border border-amber-500/10 font-sans text-[11px]">
                              {record.varianceReason}
                            </span>
                          ) : (
                            <span className="text-[#555]">-</span>
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
                                title="صورة الشفرة قبل الصب"
                              >
                                <img src={record.beforeImage} alt="قبل" className="w-full h-full object-cover" />
                                <span className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white">قبل</span>
                              </button>
                            ) : (
                              <span className="text-[8px] text-[#444]" title="لا توجد صورة قبل">بلا قبل</span>
                            )}

                            {/* After Production Image */}
                            {isPending ? (
                              <span className="w-6.5 h-6.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center rounded text-[8px] font-bold animate-pulse" title="قيد التصفية في الجبس والفرن">
                                ⏳
                              </span>
                            ) : record.productionImage || record.afterImage ? (
                              <button
                                type="button"
                                onClick={() => setZoomImage(record.productionImage || record.afterImage || null)}
                                className="relative group w-6.5 h-6.5 rounded border border-[#222] overflow-hidden hover:border-emerald-500 transition-colors"
                                title="صورة المشغولات الناتجة"
                              >
                                <img src={record.productionImage || record.afterImage} alt="إنتاج" className="w-full h-full object-cover" />
                                <span className="absolute inset-0 bg-emerald-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white">بعد</span>
                              </button>
                            ) : (
                              <span className="text-[8px] text-[#444]" title="لا توجد صورة بعد">بلا بعد</span>
                            )}

                            {/* Damaged components Image */}
                            {!isPending && record.damagedImage ? (
                              <button
                                type="button"
                                onClick={() => setZoomImage(record.damagedImage || null)}
                                className="relative group w-6.5 h-6.5 rounded border border-[#222] overflow-hidden hover:border-rose-500 transition-all"
                                title="صورة القطع التالفة"
                              >
                                <img src={record.damagedImage} alt="تالف" className="w-full h-full object-cover" />
                                <span className="absolute inset-0 bg-rose-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[7px] text-rose-200">تالف</span>
                              </button>
                            ) : null}
                          </div>
                        </td>

                        {/* Production details description */}
                        <td className="px-3 py-4 text-[#aaa] max-w-[140px] truncate">
                          {isPending ? (
                            <span className="text-[#888] italic">شحنة خام جير بالانتظار</span>
                          ) : (
                            <div>
                              <div className="font-bold text-white text-[11px] truncate">{record.productionDetails || "إنتاج صافي"}</div>
                              {record.damagedDetails && (
                                <div className="text-[10px] text-rose-400 mt-0.5 truncate">تالف: {record.damagedDetails}</div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Deficit ratio pct */}
                        <td className="px-3 py-4 text-center font-mono">
                          {isPending ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              قيد الصهر ⏳
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
                            <span className="text-[9px] font-sans">معلق بالجبسة الدوارة</span>
                          ) : isProfit ? (
                            `+${lossAbs.toFixed(3)}`
                          ) : (
                            `-${lossAbs.toFixed(3)}`
                          )}
                        </td>

                        {/* Damaged Weight */}
                        <td className="px-3 py-4 text-left font-mono text-rose-400">
                          {isPending ? "-" : (record.damagedWeight?.toFixed(3) || "0.000")}
                          {!isPending && record.damagedCount !== undefined && record.damagedCount > 0 && (
                            <span className="text-[9px] text-[#666] mr-1">({record.damagedCount}ق)</span>
                          )}
                        </td>

                        {/* Production Weight */}
                        <td className="px-3 py-4 text-left font-mono text-emerald-400 font-bold">
                          {isPending ? (
                            <button
                              onClick={() => handleOpenUpdate(record)}
                              className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-neutral-950 text-[10px] font-bold rounded flex items-center justify-center gap-1 hover:scale-105 active:scale-95 transition-all text-center cursor-pointer"
                            >
                              تصفية الشجرة ⚖️
                            </button>
                          ) : (
                            record.productionWeight?.toFixed(3)
                          )}
                          {!isPending && record.productionCount !== undefined && record.productionCount > 0 && (
                            <span className="text-[9px] text-[#666] mr-1">({record.productionCount}ق)</span>
                          )}
                        </td>

                        {/* Input weight (قبل) */}
                        <td className="px-3 py-4 text-left font-mono text-white font-bold bg-[#1a1a1a]/30">
                          {record.inputWeight.toFixed(3)}
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

              {/* Aggregation Summary table footer */}
              {records.length > 0 && (
                <tfoot className="bg-[#0f0f0f] divide-y divide-[#222] text-[#fff] text-xs">
                  <tr className="font-bold border-t border-[#222]">
                    <td className="px-3 py-3 text-center text-[#C5A028]" colSpan={3}>المجموع الشامل</td>
                    <td className="px-3 py-3 text-[#777]">ملخص جرد صب وتصفية أشجار الذهب عيار ٢١</td>
                    <td className="px-3 py-3 text-center font-mono text-[#C5A028]">
                      {totalInput > 0 ? (Math.abs(totalLoss) / totalInput * 100).toFixed(2) : "0.00"}% <span className="text-[10px] text-[#888]">({totalLoss >= 0 ? "عجز كلي" : "وفر صافي"})</span>
                    </td>
                    <td className={`px-3 py-3 text-left font-mono ${totalLoss >= 0 ? 'text-rose-400 bg-rose-950/30' : 'text-emerald-400 bg-emerald-950/30'}`}>
                      {totalLoss >= 0 ? `-${totalLoss.toFixed(3)}` : `+${Math.abs(totalLoss).toFixed(3)}`} غرام
                    </td>
                    <td className="px-3 py-3 text-left font-mono text-[#e0e0e0]">
                      {totalDamaged.toFixed(3)} غرام
                    </td>
                    <td className="px-3 py-3 text-left font-mono text-[#e0e0e0]">
                      {totalProd.toFixed(3)} غرام
                    </td>
                    <td className="px-3 py-3 text-left font-mono text-[#C5A028] bg-[#141414]">
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

      {/* High-Resolution Zoom Overlap Lightbox */}
      {zoomImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-center items-center p-4 animate-fadeIn" onClick={() => setZoomImage(null)}>
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center p-1" onClick={(e) => e.stopPropagation()}>
            <img src={zoomImage} alt="شجرة الذهب زوم بدقة عالية" className="max-w-full max-h-full object-contain rounded-2xl border border-[#333] shadow-2xl" />
            <button
              type="button"
              className="absolute top-2 right-2 text-[#aaa] hover:text-white bg-black/85 hover:bg-neutral-800 p-2 rounded-full cursor-pointer transition-all"
              onClick={() => setZoomImage(null)}
            >
              <EyeOff className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[#64748b] text-xs mt-3 text-center">اضغط خارج الإطار للتصغير والعودة للوحة الدفتر</p>
        </div>
      )}

      {/* Row complete modal (In row update click) */}
      {updatingRecordId && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100] p-4 animate-fadeIn backdrop-blur-sm">
          <div className="bg-[#0f0f0f] border border-[#222] rounded-2xl p-6 max-w-md w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C5A028] to-transparent opacity-80" />
            
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 text-right">
              <Scale className="w-5 h-5 text-[#C5A028]" /> إكمال وتصفية صبة شجرة الذهب (البعد)
            </h3>
            <p className="text-[11px] text-[#888] mb-4 text-right">
              أدخل البيانات والأوزان المستخلصة من عملية الفك والتنظيف لحساب نسبة العجز في الشحنة.
            </p>

            <form onSubmit={handleSaveUpdate} className="space-y-4 max-h-[72vh] overflow-y-auto px-1">
              {/* Product weight */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#aaa] mb-1">الإنتاج الصافي المستخلص</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={upProdWeight}
                    onChange={(e) => setUpProdWeight(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-1.5 text-xs text-left font-mono focus:border-[#C5A028]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#aaa] mb-1">عدد قطع السليم</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={upProdCount}
                    onChange={(e) => setUpProdCount(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-1.5 text-xs text-left font-mono focus:border-[#C5A028]"
                  />
                </div>
              </div>

              {/* Product description */}
              <div>
                <label className="block text-xs text-[#aaa] mb-1">بيان تفاصيل الصياغة</label>
                <input
                  type="text"
                  placeholder="مثال: غوايش صب ناعمة عيار 21..."
                  value={upProdDetails}
                  onChange={(e) => setUpProdDetails(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-1.5 text-xs focus:border-[#C5A028]"
                />
              </div>

              {/* Product Image */}
              <div>
                <label className="block text-xs text-[#aaa] mb-1">صورة الإنتاج الصافي المستخلص</label>
                {upProdImage ? (
                  <div className="relative border border-[#222] rounded-xl h-24 overflow-hidden bg-black flex items-center justify-center">
                    <img src={upProdImage} alt="الإنتاج" className="w-full h-full object-contain" />
                    <button type="button" onClick={() => setUpProdImage("")} className="absolute top-1 right-1 p-1 bg-black/80 text-white rounded-full"><XCircle className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-1.5 border border-dashed border-[#222] rounded-xl p-3 cursor-pointer text-xs text-[#666] hover:border-[#C5A028] bg-[#141414]">
                    <UploadCloud className="w-4 h-4 text-[#555]" />
                    <span>تحميل صورة مشغولات الإنتاج</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e, "modalProd")} />
                  </label>
                )}
              </div>

              {/* Damaged info */}
              <div className="grid grid-cols-2 gap-3 border-t border-[#222] pt-3">
                <div>
                  <label className="block text-xs text-[#aaa] mb-1">الذهب التالف / الخردة</label>
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
                  <label className="block text-xs text-[#aaa] mb-1">عدد قطع التالف</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={upDamagedCount}
                    onChange={(e) => setUpDamagedCount(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-1.5 text-xs text-left font-mono focus:border-[#C5A028]"
                  />
                </div>
              </div>

              {/* Damaged Details */}
              <div>
                <label className="block text-xs text-[#aaa] mb-1">وصف العيوب أو التلف في الصب</label>
                <input
                  type="text"
                  placeholder="زوائد بالركيزة أو كسر بفقاعة..."
                  value={upDamagedDetails}
                  onChange={(e) => setUpDamagedDetails(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-2.5 py-1.5 text-xs focus:border-[#C5A028]"
                />
              </div>

              {/* Damaged Image */}
              <div>
                <label className="block text-xs text-[#aaa] mb-1">صورة التالف أو الخنزيرة المعيبة</label>
                {upDamagedImage ? (
                  <div className="relative border border-[#222] rounded-xl h-24 overflow-hidden bg-black flex items-center justify-center">
                    <img src={upDamagedImage} alt="التالف" className="w-full h-full object-contain" />
                    <button type="button" onClick={() => setUpDamagedImage("")} className="absolute top-1 right-1 p-1 bg-black/80 text-white rounded-full"><XCircle className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-1.5 border border-dashed border-[#222] rounded-xl p-3 cursor-pointer text-xs text-[#666] hover:border-[#C5A028] bg-[#141414]">
                    <UploadCloud className="w-4 h-4 text-[#555]" />
                    <span>تحميل صورة التالف والخردة</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e, "modalDamag")} />
                  </label>
                )}
              </div>

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

              {/* Variance Reason */}
              <div>
                <label className="block text-xs text-[#aaa] mb-1">سبب النقص أو الزيادة</label>
                <input
                  type="text"
                  placeholder="أدخل سبب النقص أو الزيادة للشجرة..."
                  value={updatingVarianceReason}
                  onChange={(e) => setUpdatingVarianceReason(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-1.5 text-xs focus:border-[#C5A028] focus:ring-1 focus:outline-none"
                />
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="submit"
                  className="flex-grow py-2 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-neutral-950 font-black rounded-xl text-xs hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  حفظ وتصفية الشجرة ⚖️
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
              <Edit className="w-5 h-5 text-[#C5A028]" /> تعديل أوزان وبيانات صب الشجرة والفاكيوم
            </h3>
            <p className="text-[11px] text-[#888] mb-4 leading-relaxed text-right">
              تصفح وتحديث الأوزان المسجلة مسبقاً، تفاصيل العجز والوفر والملاحظات الكاملة.
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

              {/* Input Weight (الوزن المشحون) */}
              <div>
                <label className="block text-xs font-semibold text-[#aaa] mb-1.5 text-right flex justify-between">
                  <span>الوزن المشحون القبل (غرام)</span>
                  <span className="text-[11px] text-amber-500 font-bold font-mono">الوزن قبل الصب</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={editingInputWeight}
                    onChange={(e) => setEditingInputWeight(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl pl-12 pr-4 py-2 text-sm font-mono text-left focus:border-[#C5A028] outline-none"
                  />
                  <span className="absolute left-4 top-2 text-xs text-[#666] font-semibold">غرام</span>
                </div>
              </div>

              {/* Double Column for Production and Damaged weights */}
              <div className="grid grid-cols-2 gap-3">
                {/* Production Weight */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#aaa] mb-1 text-right flex justify-between">
                    <span>وزن الإنتاج الصافي</span>
                    <span className="text-[10px] text-emerald-400">البعد</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      placeholder="غير معبأ"
                      value={editingProductionWeight}
                      onChange={(e) => setEditingProductionWeight(e.target.value)}
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

              {/* Double Column for Counts */}
              <div className="grid grid-cols-2 gap-3 text-right">
                {/* Production Count */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#aaa] mb-1 text-right">عدد قطع الإنتاج</label>
                  <input
                    type="number"
                    value={editingProductionCount}
                    onChange={(e) => setEditingProductionCount(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-1.5 text-xs text-center focus:border-[#C5A028] outline-none"
                  />
                </div>

                {/* Damaged Count */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#aaa] mb-1 text-right">عدد قطع الخردة التالفة</label>
                  <input
                    type="number"
                    value={editingDamagedCount}
                    onChange={(e) => setEditingDamagedCount(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-1.5 text-xs text-center focus:border-[#C5A028] outline-none"
                  />
                </div>
              </div>

              {/* Descriptions & Details */}
              <div className="space-y-2 text-right">
                <div>
                  <label className="block text-[11px] font-semibold text-[#aaa] mb-1">بيانات وتفاصيل قطع الإنتاج السليم</label>
                  <input
                    type="text"
                    value={editingProductionDetails}
                    onChange={(e) => setEditingProductionDetails(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-1.5 text-xs text-right focus:border-[#C5A028] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#aaa] mb-1">وصف عيوب قطع الخردة التالفة</label>
                  <input
                    type="text"
                    value={editingDamagedDetails}
                    onChange={(e) => setEditingDamagedDetails(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-1.5 text-xs text-right focus:border-[#C5A028] outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#aaa] mb-1.5 text-right">الملاحظات العامة</label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات وتفاصيل تصفية الشجرة..."
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-1.5 text-xs text-right focus:border-[#C5A028] outline-none resize-none"
                />
              </div>

              {/* Variance Reason */}
              <div>
                <label className="block text-xs font-semibold text-[#aaa] mb-1.5 text-right">سبب النقص أو الزيادة</label>
                <input
                  type="text"
                  placeholder="أدخل سبب النقص أو الزيادة..."
                  value={editingVarianceReason}
                  onChange={(e) => setEditingVarianceReason(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-1.5 text-xs text-right focus:border-[#C5A028] outline-none"
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
    </div>
  );
};
