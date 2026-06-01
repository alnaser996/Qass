import React, { useState } from "react";
import { ProductionRecord } from "../types";
import { FilePlus2, Trash2, Calendar, Scale, Search, Users, ShieldCheck, ClipboardList, UploadCloud, XCircle, Image, EyeOff } from "lucide-react";

interface ProductionTabProps {
  records: ProductionRecord[];
  onAddRecord: (record: Omit<ProductionRecord, "id">) => void;
  onDeleteRecord: (id: string) => void;
}

export const ProductionTab: React.FC<ProductionTabProps> = ({
  records,
  onAddRecord,
  onDeleteRecord,
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [finalWeight, setFinalWeight] = useState<string>("");
  const [piecesCount, setPiecesCount] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [receiverName, setReceiverName] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImage("");
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
    if (!receiverName.trim()) {
      alert("الرجاء إدخال اسم الموظف المستلم");
      return;
    }

    onAddRecord({
      date,
      finalWeight: parsedWeight,
      piecesCount: parsedPieces,
      details: details.trim(),
      receiverName: receiverName.trim(),
      image: image || undefined,
      notes: notes.trim() || undefined,
    });

    setFinalWeight("");
    setPiecesCount("");
    setDetails("");
    setReceiverName("");
    setImage("");
    setNotes("");
  };

  // Filter records based on search query
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

  // Calculate totals
  const totalWeight = records.reduce((sum, r) => sum + (r.finalWeight ?? (r as any).beadWeight ?? 0), 0);
  const totalPieces = records.reduce((sum, r) => sum + (r.piecesCount ?? 1), 0);
  const employeeStats = records.reduce((acc, r) => {
    const name = r.receiverName || "غير محدد";
    const w = r.finalWeight ?? (r as any).beadWeight ?? 0;
    acc[name] = (acc[name] || 0) + w;
    return acc;
  }, {} as Record<string, number>);

  // For visual representation sort employees by weight received
  const sortedEmployees = (Object.entries(employeeStats) as [string, number][]).sort((a, b) => b[1] - a[1]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Input Form Column */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-[#0f0f0f] rounded-2xl border border-[#222] p-6 shadow-2xl hover:border-[#333] transition-all relative overflow-hidden">
          {/* Subtle top decoration */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C5A028] to-transparent opacity-60" />

          <div className="flex items-center gap-3 border-b border-[#222] pb-4 mb-5 font-sans">
            <div className="p-3 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-xl text-[#C5A028] border border-[#d4af37]/10">
              <ShieldCheck className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-md font-bold text-white font-sans">تسليم وجبة إنتاج جاهزة</h2>
              <p className="text-[11px] text-[#888] mt-0.5">توثيق وزن الإنتاج الكامل، عدد المشغولات والمستلم</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-[#aaa] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#888]" /> تاريخ التسجيل والتسليم
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-4 py-2.5 text-sm focus:border-[#C5A028] focus:ring-1 focus:ring-[#C5A028] focus:bg-[#070707] focus:outline-none transition-all duration-200 font-mono text-right"
              />
            </div>

            {/* Final Gold weight */}
            <div>
              <label className="block text-xs font-semibold text-[#888] mb-1.5 flex justify-between items-center">
                <span>الوزن النهائي المنتج (الكامل)</span>
                <span className="text-[10px] text-emerald-400 font-medium">الوزن الكلي المسلم للوجبة</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  required
                  placeholder="0.000"
                  value={finalWeight}
                  onChange={(e) => setFinalWeight(e.target.value)}
                  className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded pl-12 pr-3 py-2 text-sm text-left font-mono focus:border-[#C5A028] focus:bg-[#0c0c0c] focus:outline-none transition-colors"
                />
                <span className="absolute left-3 top-2.5 text-xs text-[#666] font-medium">غرام</span>
              </div>
            </div>

            {/* Pieces count */}
            <div>
              <label className="block text-xs font-semibold text-[#888] mb-1.5 flex justify-between items-center">
                <span>عدد القطع المنتجة</span>
                <span className="text-[10px] text-[#C5A028] font-medium">إجمالي الأعداد الجاهزة</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="0"
                  value={piecesCount}
                  onChange={(e) => setPiecesCount(e.target.value)}
                  className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded pl-12 pr-3 py-2 text-sm text-left font-mono focus:border-[#C5A028] focus:bg-[#0c0c0c] focus:outline-none transition-colors"
                />
                <span className="absolute left-3 top-2.5 text-xs text-[#666] font-medium">قطعة</span>
              </div>
            </div>

            {/* Details (المشغولات) */}
            <div>
              <label className="block text-xs font-semibold text-[#888] mb-1.5 flex justify-between items-center">
                <span>تفاصيل المشغولات والإنتاج</span>
                <span className="text-[10px] text-[#888]">مثل: أساور، خواتم، قلادات عيار 21</span>
              </label>
              <input
                type="text"
                required
                placeholder="تفاصيل ونوع العينات الجاهزة بالتفصيل..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-sm focus:border-[#C5A028] focus:bg-[#0c0c0c] focus:outline-none transition-colors text-right"
              />
            </div>

            {/* Full Production Image Upload */}
            <div>
              <label className="block text-xs font-semibold text-[#888] mb-1.5 flex justify-between items-center">
                <span>صورة الإنتاج الكامل</span>
                <span className="text-[10px] text-[#C5A028] font-medium">اختياري - للتوثيق المرئي والجمالي</span>
              </label>
              {image ? (
                <div className="relative border border-[#333] rounded overflow-hidden aspect-video max-h-32 flex items-center justify-center bg-black">
                  <img src={image} alt="معاينة الشغل الكامل" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-1.5 right-1.5 p-1.5 bg-black/80 hover:bg-rose-600 text-white rounded-full transition-colors"
                    title="حذف الصورة"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-[#2a2a2a] hover:border-[#C5A028]/50 rounded-lg p-4 cursor-pointer text-center bg-[#1a1a1a] transition-all group">
                  <UploadCloud className="w-6 h-6 text-[#555] group-hover:text-[#C5A028] transition-colors" />
                  <span className="text-xs text-[#666] group-hover:text-[#ccc] transition-colors">اسحب أو انقر لرفع صورة الوجبة الجاهزة</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>

            {/* Receiver name */}
            <div>
              <label className="block text-xs font-semibold text-[#888] mb-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#C5A028]" /> اسم الموظف المستلم للإنتاج الجاهز أو الكامل
              </label>
              <input
                type="text"
                required
                placeholder="أدخل اسم الموظف أو أمين الصالة المسلم إليه..."
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-sm focus:border-[#C5A028] focus:bg-[#0c0c0c] focus:outline-none transition-colors text-right"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-[#888] mb-1.5">ملاحظات إضافية</label>
              <textarea
                rows={2}
                placeholder="موقع التسليم، رقم الطلبية، أو دقة المطابقة..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-sm focus:border-[#C5A028] focus:bg-[#0c0c0c] focus:outline-none transition-colors text-right"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#C5A028] hover:bg-[#d9b132] text-[#0a0a0a] font-bold py-2.5 px-4 rounded transition-all shadow-[0_0_15px_rgba(197,160,40,0.15)] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>تسجيل وتسليم كمية الإنتاج</span>
            </button>
          </form>
        </div>

        {/* Dynamic Employees Leaderboard of Delivery Recipient weights */}
        {sortedEmployees.length > 0 && (
          <div className="bg-[#141414] rounded border border-[#2a2a2a] p-5">
            <h3 className="text-xs font-extrabold text-[#C5A028] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> ترتيب الموظفين المستلمين للمصاغ الجاهز
            </h3>
            <div className="space-y-2.5 text-xs text-[#ccc]">
              {sortedEmployees.map(([name, weight], idx) => {
                const ratio = totalWeight > 0 ? (weight / totalWeight) * 100 : 0;
                return (
                  <div key={idx} className="bg-[#1a1a1a] p-2.5 rounded border border-[#222]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white whitespace-nowrap">{name}</span>
                      <span className="font-mono text-emerald-400 font-semibold">{weight.toFixed(3)} غرام</span>
                    </div>
                    <div className="w-full bg-[#0d0d0d] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#C5A028] h-1.5 rounded-full"
                        style={{ width: `${ratio}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Table Column */}
      <div className="lg:col-span-8 space-y-4">
        {/* Filtration bar */}
        <div className="bg-[#141414] p-4 rounded border border-[#2a2a2a] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#666] absolute right-3 top-3" />
            <input
              type="text"
              placeholder="البحث بالموظف، نوع المشغولات والعيارات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-right text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded pl-3 pr-9 py-2 text-xs focus:border-[#C5A028] focus:bg-[#0c0c0c] focus:outline-none transition-colors"
            />
          </div>
          <div className="text-xs text-[#888] font-medium">
            تصفية الإنتاج: عرض <span className="text-[#C5A028] font-bold">{filteredRecords.length}</span> من أصل <span className="text-[#C5A028] font-bold">{records.length}</span> وجبة إنتاج مُسلّمة
          </div>
        </div>

        {/* Ledger Entries Table */}
        <div className="bg-[#141414] rounded border border-[#2a2a2a] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-[#1a1a1a] border-b border-[#2a2a2a] text-[#888] text-xs">
                <tr>
                  <th className="px-3 py-3.5 text-center font-bold w-12">حذف</th>
                  <th className="px-3 py-3.5 font-bold">ملاحظات عامة</th>
                  <th className="px-3 py-3.5 font-bold">الموظف المستلم للعهدة الكاملة</th>
                  <th className="px-3 py-3.5 font-bold">تفاصيل المشغولات والجاهز عيار 21</th>
                  <th className="px-3 py-3.5 text-center font-bold">عدد القطع المنتجة</th>
                  <th className="px-3 py-3.5 text-left font-bold font-mono">الوزن النهائي المنتج</th>
                  <th className="px-3 py-3.5 text-center font-bold w-24">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-[#666] text-xs">
                      لا يوجد أي سجلات تسليم إنتاج حالياً. استخدم النموذج لتسجيل الوجبات والقطع المسلمة إلى المحلات أو المعارض.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => {
                    const weightVal = record.finalWeight ?? (record as any).beadWeight ?? 0;
                    const piecesCountVal = record.piecesCount ?? 1;
                    const detailsStr = record.details || (record as any).notes || "مجهول";
                    const receiver = record.receiverName || "مستلم غير مسجل";
                    const notesStr = record.notes || "-";

                    return (
                      <tr key={record.id} className="hover:bg-[#1a1a1a]/40 transition-colors">
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => onDeleteRecord(record.id)}
                            className="p-1 text-[#666] hover:text-rose-400 rounded hover:bg-rose-950/20 transition-colors cursor-pointer"
                            title="حذف السجل"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="px-3 py-3 text-[#min-w-100px] text-xs text-[#888] max-w-[150px] truncate" title={notesStr}>
                          {notesStr}
                        </td>
                        <td className="px-3 py-3 font-semibold text-white text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span>{receiver}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs text-[#ccc] font-medium font-sans">
                          <div className="flex items-center gap-3">
                            {/* Product Image */}
                            {record.image ? (
                              <div
                                onClick={() => setZoomImage(record.image || null)}
                                className="w-11 h-11 rounded border border-[#333] overflow-hidden cursor-pointer hover:border-[#C5A028] transition-all bg-black flex-shrink-0 flex items-center justify-center p-0.5 shadow-md"
                                title="انقر لتكبير صورة الإنتاج الكامل"
                              >
                                <img src={record.image} alt="صورة الإنتاج الكامل" className="w-full h-full object-cover rounded" />
                              </div>
                            ) : (
                              <div className="w-11 h-11 rounded border border-dashed border-[#222] bg-[#111] flex items-center justify-center flex-shrink-0 text-[#333]" title="لا توجد صورة">
                                <Image className="w-4 h-4 text-xs" />
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-[#f0f0f0]">{detailsStr}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center font-mono text-xs text-[#ccc]">
                          {piecesCountVal} قطعة
                        </td>
                        <td className="px-3 py-3 text-[#00ffc4] text-left font-bold bg-[#11241f]/30 font-mono">
                          {weightVal.toFixed(3)}
                        </td>
                        <td className="px-3 py-3 text-center text-[#888] text-xs whitespace-nowrap">
                          {record.date}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Totals Row */}
              {records.length > 0 && (
                <tfoot className="bg-[#0f0f0f] divide-y divide-[#222] text-[#fff] text-xs">
                  <tr className="font-bold border-t border-[#2a2a2a] bg-[#1a1a1a]/30">
                    <td className="px-3 py-3.5 text-center text-[#C5A028]">المجموع</td>
                    <td className="px-3 py-3.5 text-[#888]">ملخص استلام الوجبات التراكمي وتحديثات القطع</td>
                    <td className="px-3 py-3.5 font-medium text-[#C5A028]">{sortedEmployees.length} موظف مستلم</td>
                    <td className="px-3 py-3.5 text-white">-</td>
                    <td className="px-3 py-3.5 text-center font-mono text-white text-xs font-bold">
                      {totalPieces} قطعة جاهزة
                    </td>
                    <td className="px-3 py-3.5 text-left font-mono text-[#00ffc4] bg-[#11241f]/50 font-bold">
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

      {/* Full Scale Image Modal previewer */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-center items-center p-4 cursor-pointer"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={zoomImage}
              alt="معاينة فنية كاملة للإنتاج"
              className="max-w-full max-h-full object-contain rounded border border-[#2a2a2a] shadow-2xl"
            />
            <button
              type="button"
              className="absolute top-2 right-2 text-white/50 hover:text-white bg-[#1a1a1a]/80 p-2.5 rounded-full cursor-pointer transition-all"
              onClick={() => setZoomImage(null)}
            >
              <EyeOff className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[#888] text-xs mt-4 font-sans text-center">اضغط في أي مكان للإغلاق</p>
        </div>
      )}
    </div>
  );
};
