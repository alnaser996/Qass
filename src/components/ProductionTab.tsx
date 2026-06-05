import React, { useState } from "react";
import { ProductionRecord } from "../types";
import { FilePlus2, Trash2, Calendar, Scale, Search, Users, ShieldCheck, UploadCloud, XCircle, EyeOff, Clock, Edit } from "lucide-react";

interface ProductionTabProps {
  records: ProductionRecord[];
  onAddRecord: (record: Omit<ProductionRecord, "id">) => void;
  onDeleteRecord: (id: string) => void;
  onUpdateRecord?: (
    id: string,
    finalWeight: number,
    piecesCount: number,
    details: string,
    receiverName: string,
    notes?: string,
    beforeImage?: string,
    afterImage?: string,
    date?: string,
    time?: string
  ) => void;
}

export const ProductionTab: React.FC<ProductionTabProps> = ({
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
  const [finalWeight, setFinalWeight] = useState<string>("");
  const [piecesCount, setPiecesCount] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [receiverName, setReceiverName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Before & After base64 image states
  const [beforeImage, setBeforeImage] = useState<string>("");
  const [afterImage, setAfterImage] = useState<string>("");

  // General Edit Modal State
  const [editingRecord, setEditingRecord] = useState<ProductionRecord | null>(null);
  const [editingFinalWeight, setEditingFinalWeight] = useState<string>("");
  const [editingPiecesCount, setEditingPiecesCount] = useState<string>("");
  const [editingDetails, setEditingDetails] = useState<string>("");
  const [editingReceiverName, setEditingReceiverName] = useState<string>("");
  const [editingDate, setEditingDate] = useState<string>("");
  const [editingTime, setEditingTime] = useState<string>("");
  const [editingNotes, setEditingNotes] = useState<string>("");

  const handleOpenGeneralEdit = (record: ProductionRecord) => {
    setEditingRecord(record);
    setEditingFinalWeight(String(record.finalWeight));
    setEditingPiecesCount(String(record.piecesCount));
    setEditingDetails(record.details || "");
    setEditingReceiverName(record.receiverName || "");
    setEditingDate(record.date);
    setEditingTime(record.time || "");
    setEditingNotes(record.notes || "");
  };

  const handleSaveGeneralEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const parsedWeight = parseFloat(editingFinalWeight) || 0;
    const parsedPieces = parseInt(editingPiecesCount, 10) || 0;

    if (parsedWeight <= 0) {
      alert("الرجاء إدخال وزن إنتاج نهائي صحيح أكبر من الصفر");
      return;
    }
    if (parsedPieces <= 0) {
      alert("الرجاء إدخال عدد قطع صحيح");
      return;
    }
    if (!editingReceiverName.trim()) {
      alert("الرجاء إدخال اسم المستلم");
      return;
    }

    if (onUpdateRecord) {
      onUpdateRecord(
        editingRecord.id,
        parsedWeight,
        parsedPieces,
        editingDetails.trim(),
        editingReceiverName.trim(),
        editingNotes.trim(),
        editingRecord.beforeImage,
        editingRecord.afterImage,
        editingDate,
        editingTime
      );
    }

    setEditingRecord(null);
    alert("تم تعديل سجل التسليم النهائي وتحديث جميع البيانات بنجاح! 🏆⚖️");
  };

  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "before" | "after") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "before") {
          setBeforeImage(reader.result as string);
        } else {
          setAfterImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedWeight = parseFloat(finalWeight) || 0;
    const parsedPieces = parseInt(piecesCount, 10) || 0;

    if (parsedWeight <= 0) {
      alert("الرجاء إدخال وزن الإنتاج النهائي بشكل صحيح");
      return;
    }
    if (parsedPieces <= 0) {
      alert("الرجاء إدخال عدد قطع منتجة صحيح");
      return;
    }
    if (!details.trim()) {
      alert("الرجاء إدخال تفاصيل المشغولات");
      return;
    }
    if (!afterImage) {
      alert("⚠️ توثيق العهدة إلزامي بالتقاط صورة! الرجاء إرفاق أو تصوير قطعة الإنتاج النهائي عيار 21 لتتمكن من الضغط على حفظ وعرض العينة في الألبوم.");
      return;
    }
    if (!receiverName.trim()) {
      alert("الرجاء إدخال اسم الموظف المستلم");
      return;
    }

    onAddRecord({
      date,
      time,
      finalWeight: parsedWeight,
      piecesCount: parsedPieces,
      details: details.trim(),
      receiverName: receiverName.trim(),
      image: afterImage || undefined,
      notes: notes.trim() || undefined,
      beforeImage: beforeImage || undefined,
      afterImage: afterImage || undefined,
    });

    setFinalWeight("");
    setPiecesCount("");
    setDetails("");
    setReceiverName("");
    setBeforeImage("");
    setAfterImage("");
    setNotes("");

    // Reset time values
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setTime(`${hours}:${minutes}`);
    alert("تم ترحيل وتسليم وجبة الإنتاج الجاهزة بالصور ⚖️");
  };

  const filteredRecords = records.filter((r) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const rDetails = r.details || "";
    const rReceiver = r.receiverName || "";
    const rNotes = r.notes || "";
    return (
      rDetails.toLowerCase().includes(searchLower) ||
      rReceiver.toLowerCase().includes(searchLower) ||
      rNotes.toLowerCase().includes(searchLower) ||
      r.date.includes(searchQuery)
    );
  });

  const totalWeight = records.reduce((sum, r) => sum + (r.finalWeight ?? 0), 0);
  const totalPieces = records.reduce((sum, r) => sum + (r.piecesCount ?? 1), 0);
  const employeeStats = records.reduce((acc, r) => {
    const name = r.receiverName || "غير محدد";
    const w = r.finalWeight ?? 0;
    acc[name] = (acc[name] || 0) + w;
    return acc;
  }, {} as Record<string, number>);

  const sortedEmployees = (Object.entries(employeeStats) as [string, number][]).sort((a, b) => b[1] - a[1]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
      {/* Input Form Column */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <div className="bg-[#0f0f0f] rounded-2xl border border-[#222] p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C5A028] to-transparent opacity-60" />

          <div className="flex items-center gap-3 border-b border-[#222] pb-4 mb-5">
            <div className="p-3 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-xl text-[#C5A028] border border-[#d4af37]/10">
              <ShieldCheck className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-md font-bold text-white">تسليم المشغولات الفاخرة</h2>
              <p className="text-[11px] text-[#888] mt-0.5">توثيق وزن الإنتاج الكامل، عدد المشغولات والموظف الفني</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Final Gold weight */}
            <div>
              <label className="block text-xs font-bold text-[#e0e0e0] mb-1 flex justify-between">
                <span>الوزن النهائي المنتج (الكامل)</span>
                <span className="text-[10px] text-emerald-400">الوزن المسلم للفرز</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  required
                  placeholder="0.000"
                  value={finalWeight}
                  onChange={(e) => setFinalWeight(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl pl-12 pr-4 py-2.5 text-sm font-mono text-left focus:border-[#C5A028] outline-none"
                />
                <span className="absolute left-3 top-3 text-[11px] text-[#555] font-bold">غرام</span>
              </div>
            </div>

            {/* Pieces count */}
            <div>
              <label className="block text-xs font-bold text-[#e0e0e0] mb-1">عدد قطع الإنتاج الصافية</label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="0"
                  value={piecesCount}
                  onChange={(e) => setPiecesCount(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl pl-12 pr-4 py-2.5 text-sm font-mono text-left focus:border-[#C5A028] outline-none"
                />
                <span className="absolute left-3 top-3 text-[11px] text-[#555] font-bold">قطعة</span>
              </div>
            </div>

            {/* Details (المشغولات) */}
            <div>
              <label className="block text-[11px] font-semibold text-[#aaa] mb-1">وصف مخرجات الصياغة والجاهز عيار 21</label>
              <input
                type="text"
                required
                placeholder="أساور ليزر، قلادات فيروز نقية..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none"
              />
            </div>

            {/* Dual before/after image upload */}
            <div className="grid grid-cols-2 gap-2.5 bg-[#141414] p-3 rounded-xl border border-[#222]">
              <div>
                <label className="block text-[9px] text-[#888] mb-1">صورة قبل الختم والتلميع</label>
                {beforeImage ? (
                  <div className="relative border border-[#222] rounded-lg overflow-hidden h-14 bg-black">
                    <img src={beforeImage} alt="قبل" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setBeforeImage("")} className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 text-white rounded-full"><XCircle className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-1 border border-dashed border-[#222] rounded-lg h-14 cursor-pointer bg-black text-[9px] text-[#666]">
                    <UploadCloud className="w-4 h-4" />
                    <span>صورة قبل</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "before")} />
                  </label>
                )}
              </div>
              <div>
                <label className="block text-[9px] text-[#C5A028] font-bold mb-1">صورة الإنتاج النهائي لعيار 21 * <span className="text-rose-450 text-[8px] font-black">(مطلوب إجباري 📸)</span></label>
                {afterImage ? (
                  <div className="relative border border-[#222] rounded-lg overflow-hidden h-14 bg-black">
                    <img src={afterImage} alt="بعد" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setAfterImage("")} className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 text-white rounded-full"><XCircle className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-1 border border-dashed border-[#C5A028]/40 hover:border-[#C5A028] rounded-lg h-14 cursor-pointer bg-black text-[9px] text-[#C5A028] font-black transition-colors">
                    <UploadCloud className="w-4 h-4 text-[#C5A028] animate-bounce" />
                    <span>إرفاق صورة للمشغولات *</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "after")} />
                  </label>
                )}
              </div>
            </div>

            {/* Receiver name */}
            <div>
              <label className="block text-xs font-semibold text-[#aaa] mb-1 flex items-center gap-1">
                <Users className="w-4 h-4 text-[#C5A028]" /> اسم الموظف المستلم للعهدة الكاملة
              </label>
              <input
                type="text"
                required
                placeholder="اسم أمين الصالة أو مستلم المعرض الرئيسي..."
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] text-[#aaa]">ملاحظات مطابقة أو أرقام الصناديق</label>
              <textarea
                rows={2}
                placeholder="رقم صندوق العرض، توجيهات الشحن..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-[#C5A028] outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#C5A028] hover:bg-[#d9b132] text-neutral-950 font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FilePlus2 className="w-4.5 h-4.5" />
              <span>تسجيل وتسليم المصاغ الجاهز ⚖️</span>
            </button>
          </form>
        </div>

        {/* Dynamic Employees Leaderboard */}
        {sortedEmployees.length > 0 && (
          <div className="bg-[#141414] rounded-2xl border border-[#222] p-5">
            <h3 className="text-xs font-extrabold text-[#C5A028] tracking-wider mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> ترتيب الموظفين المستلمين للمصاغ الجاهز
            </h3>
            <div className="space-y-2.5 text-xs text-[#ccc]">
              {sortedEmployees.map(([name, weight], idx) => {
                const ratio = totalWeight > 0 ? (weight / totalWeight) * 100 : 0;
                return (
                  <div key={idx} className="bg-[#1a1a1a] p-2.5 rounded-xl border border-[#222]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white">{name}</span>
                      <span className="font-mono text-emerald-400 font-bold">{weight.toFixed(3)} غرام</span>
                    </div>
                    <div className="w-full bg-[#0d0d0d] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#C5A028] h-1.5 rounded-full" style={{ width: `${ratio}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Table Column */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        {/* Filtration bar */}
        <div className="bg-[#141414] p-4 rounded-2xl border border-[#222] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#555] absolute right-3 top-3.5" />
            <input
              type="text"
              placeholder="البحث بالموظف، نوع العيارات أو الملاحظة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-right text-white bg-[#181818] border border-[#222] rounded-xl pl-3 pr-9 py-2.5 text-xs focus:border-[#C5A028] outline-none"
            />
          </div>
          <div className="text-xs text-[#888] font-medium">
            تصفية التسليم: عرض <span className="text-[#C5A028] font-bold">{filteredRecords.length}</span> من أصل <span className="text-[#C5A028] font-bold">{records.length}</span> وجبة مُسلّمة
          </div>
        </div>

        {/* Ledger Entries Table */}
        <div className="bg-[#141414] rounded-2xl border border-[#222] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-[#181818] border-b border-[#222] text-[#888] text-xs">
                <tr>
                  <th className="px-3 py-3.5 text-center font-bold w-16">الإجراءات</th>
                  <th className="px-3 py-3 text-center font-bold">صور المعاينة</th>
                  <th className="px-3 py-3.5 font-bold">الموظف المستلم للعهدة</th>
                  <th className="px-3 py-3.5 font-bold">ملاحظات تسليم الوجبة</th>
                  <th className="px-3 py-3.5 font-bold">تفاصيل المشغولات والجاهز عيار 21</th>
                  <th className="px-3 py-3.5 text-center font-bold font-mono">عدد قطع الصقل الفاخر</th>
                  <th className="px-3 py-3.5 text-left font-bold font-mono">الوزن الصافي المنتج</th>
                  <th className="px-3 py-3.5 text-center font-bold w-24">التاريخ / الوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-[#666] text-xs">
                      لا يوجد أي سجلات تسليم إنتاج جاهز حالياً بالدفتر.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => {
                    const weightVal = record.finalWeight ?? 0;
                    const piecesCountVal = record.piecesCount ?? 1;
                    const detailsStr = record.details || "مجهول";
                    const receiver = record.receiverName || "مستلم غير مسجل";
                    const notesStr = record.notes || "-";

                    return (
                      <tr key={record.id} className="hover:bg-[#1a1a1a]/40 transition-colors">
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

                        {/* Pictures Preview Grid (قبل / بعد) */}
                        <td className="px-2 py-3 text-center whitespace-nowrap">
                          <div className="flex justify-center items-center gap-1.5 mx-auto">
                            {/* Before Image */}
                            {record.beforeImage ? (
                              <button
                                type="button"
                                onClick={() => setZoomImage(record.beforeImage || null)}
                                className="relative group w-7 h-7 rounded border border-[#222] overflow-hidden hover:border-[#C5A028] transition-colors"
                                title="صورة القطع قبل الصقل والختم"
                              >
                                <img src={record.beforeImage} alt="قبل الصقل" className="w-full h-full object-cover" />
                                <span className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white">قبل</span>
                              </button>
                            ) : (
                              <span className="text-[8px] text-[#444]" title="لا صورة قبل">بلا قبل</span>
                            )}

                            {/* After Production Image */}
                            {record.afterImage || record.image ? (
                              <button
                                type="button"
                                onClick={() => setZoomImage(record.afterImage || record.image || null)}
                                className="relative group w-7 h-7 rounded border border-[#222] overflow-hidden hover:border-emerald-500 transition-colors"
                                title="صورة المعرض النهائية"
                              >
                                <img src={record.afterImage || record.image} alt="بعد الصب" className="w-full h-full object-cover" />
                                <span className="absolute inset-0 bg-emerald-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white">بعد</span>
                              </button>
                            ) : (
                              <span className="text-[8px] text-[#444]" title="لا صورة بعد">بلا بعد</span>
                            )}
                          </div>
                        </td>

                        {/* Receiver name */}
                        <td className="px-3 py-4 font-bold text-white text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span>{receiver}</span>
                          </div>
                        </td>

                        {/* Notes */}
                        <td className="px-3 py-4 text-xs text-[#888] max-w-[150px] truncate" title={notesStr}>
                          {notesStr}
                        </td>

                        {/* Details */}
                        <td className="px-3 py-4 text-xs text-[#ccc] font-medium truncate max-w-[140px]" title={detailsStr}>
                          {detailsStr}
                        </td>

                        {/* Pieces quantity */}
                        <td className="px-3 py-4 text-center font-mono text-xs text-[#ccc]">
                          {piecesCountVal} قطعة
                        </td>

                        {/* Final weight value */}
                        <td className="px-3 py-4 text-emerald-400 text-left font-bold bg-[#11241f]/30 font-mono">
                          {weightVal.toFixed(3)}
                        </td>

                        {/* DateTime */}
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

              {/* Summary calculations */}
              {records.length > 0 && (
                <tfoot className="bg-[#0f0f0f] divide-y divide-[#222] text-[#fff] text-xs">
                  <tr className="font-bold border-t border-[#222]">
                    <td className="px-3 py-3.5 text-center text-[#C5A028]" colSpan={2}>المجموع النهائي</td>
                    <td className="px-3 py-3.5 font-bold text-[#C5A028]" colSpan={2}>{sortedEmployees.length} موظف مستلم</td>
                    <td className="px-3 py-3.5 text-[#888]">جرد تسليم مشغولات الورشة الفنية</td>
                    <td className="px-3 py-3.5 text-center font-mono text-white text-xs">
                      {totalPieces} قطعة جاهزة
                    </td>
                    <td className="px-3 py-3.5 text-left font-mono text-emerald-400 bg-emerald-950/30 font-bold">
                      {totalWeight.toFixed(3)} غرام
                    </td>
                    <td className="px-3 py-3.5 text-[#666] text-center">-</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* Interactive magnifier lightbox view */}
      {zoomImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-center items-center p-4 cursor-pointer" onClick={() => setZoomImage(null)}>
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center p-1" onClick={(e) => e.stopPropagation()}>
            <img src={zoomImage} alt="الإنتاج الفاخر بدقة عالية" className="max-w-full max-h-full object-contain rounded-2xl border border-[#333] shadow-2xl" />
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

      {/* General Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100] p-4 animate-fadeIn backdrop-blur-sm text-right font-sans" dir="rtl">
          <div className="bg-[#0f0f0f] border border-[#222] rounded-2xl p-6 max-w-md w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C5A028] to-transparent opacity-80" />
            
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 font-sans text-right">
              <Edit className="w-5 h-5 text-[#C5A028]" /> تعديل بيانات وجبة التسليم النهائية
            </h3>
            <p className="text-[11px] text-[#888] mb-4 leading-relaxed text-right">
              تحديث الوزن الصافي الإجمالي، عدد القطع المسلّمة، اسم مستلم الوجبة، والملاحظات بدقة.
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

              {/* Final Weight */}
              <div>
                <label className="block text-xs font-semibold text-[#aaa] mb-1.5 text-right flex justify-between">
                  <span>الوزن الصافي الإجمالي (غرام)</span>
                  <span className="text-[11px] text-emerald-400 font-bold font-mono">الوزن المسلّم للعهدة</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={editingFinalWeight}
                    onChange={(e) => setEditingFinalWeight(e.target.value)}
                    className="w-full text-white bg-[#141414] border border-[#222] rounded-xl pl-12 pr-4 py-2 text-sm font-mono text-left focus:border-[#C5A028] outline-none"
                  />
                  <span className="absolute left-4 top-2 text-xs text-[#666] font-semibold">غرام</span>
                </div>
              </div>

              {/* Pieces Count */}
              <div>
                <label className="block text-xs font-semibold text-[#aaa] mb-1.5 text-right">عدد قطع الصقل الفاخر الكلي</label>
                <input
                  type="number"
                  required
                  value={editingPiecesCount}
                  onChange={(e) => setEditingPiecesCount(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs text-center focus:border-[#C5A028] outline-none"
                />
              </div>

              {/* Details of items */}
              <div>
                <label className="block text-xs font-semibold text-[#aaa] mb-1.5 text-right">تفاصيل المشغولات عيار 21</label>
                <input
                  type="text"
                  required
                  value={editingDetails}
                  onChange={(e) => setEditingDetails(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs text-right focus:border-[#C5A028] outline-none"
                />
              </div>

              {/* Receiver name */}
              <div>
                <label className="block text-xs font-semibold text-[#aaa] mb-1.5 text-right">الموظف المستلم</label>
                <input
                  type="text"
                  required
                  value={editingReceiverName}
                  onChange={(e) => setEditingReceiverName(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-3 py-2 text-xs text-right focus:border-[#C5A028] outline-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#aaa] mb-1.5 text-right">ملاحظات إضافية</label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات وتفاصيل التسليم..."
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
    </div>
  );
};
