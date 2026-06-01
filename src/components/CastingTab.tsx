import React, { useState } from "react";
import { CastingRecord } from "../types";
import { FilePlus2, Trash2, Calendar, Scale, Hammer, Search } from "lucide-react";

interface CastingTabProps {
  records: CastingRecord[];
  onAddRecord: (record: Omit<CastingRecord, "id" | "loss">) => void;
  onDeleteRecord: (id: string) => void;
}

export const CastingTab: React.FC<CastingTabProps> = ({
  records,
  onAddRecord,
  onDeleteRecord,
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [kar, setKar] = useState<string>("");
  const [sabba, setSabba] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Input calculations
  const parsedKar = parseFloat(kar) || 0;
  const parsedSabba = parseFloat(sabba) || 0;
  const computedLoss = parsedKar - parsedSabba; // positive is loss/deficit, negative is surplus/increase
  const computedLossPercent = parsedKar > 0 ? (Math.abs(computedLoss) / parsedKar) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedKar <= 0 || parsedSabba <= 0) {
      alert("الرجاء إدخال أوزان صحيحة أكبر من الصفر");
      return;
    }
    onAddRecord({
      date,
      kar: parsedKar,
      sabba: parsedSabba,
      notes: notes.trim(),
    });
    setKar("");
    setSabba("");
    setNotes("");
  };

  // Filter records
  const filteredRecords = records.filter((r) => {
    if (!searchQuery) return true;
    return (
      r.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.date.includes(searchQuery)
    );
  });

  // Sum Totals
  const totalKar = records.reduce((sum, r) => sum + r.kar, 0);
  const totalSabba = records.reduce((sum, r) => sum + r.sabba, 0);
  const totalLoss = records.reduce((sum, r) => sum + r.loss, 0);
  const averageLossPercent = totalKar > 0 ? (totalLoss / totalKar) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      {/* Input Form Column */}
      <div className="md:col-span-5 lg:col-span-4 space-y-6">
        <div className="bg-[#0f0f0f] rounded-2xl border border-[#222] p-6 shadow-2xl hover:border-[#333] transition-all relative overflow-hidden">
          {/* Subtle top decoration */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C5A028] to-transparent opacity-60" />
          
          <div className="flex items-center gap-3 border-b border-[#222] pb-4 mb-5">
            <div className="p-3 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-xl text-[#C5A028] border border-[#d4af37]/10">
              <Hammer className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-md font-bold text-white font-sans">تسجيل عملية سبك وصهر جديدة</h2>
              <p className="text-[11px] text-[#888] font-sans mt-0.5">تحديد عجز/نقص أو زيادة صب سبيكة الذهب (الصبة)</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-[#aaa] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#888]" /> التاريخ
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-4 py-2.5 text-sm focus:border-[#C5A028] focus:ring-1 focus:ring-[#C5A028] focus:bg-[#070707] focus:outline-none transition-all duration-200 font-mono text-right"
              />
            </div>

            {/* Kar weight */}
            <div>
              <label className="block text-xs font-semibold text-[#aaa] mb-1.5 flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#888]" /> استلام كسر (خام عيار ٢١)
                </span>
                <span className="text-[10px] bg-[#C5A028]/10 text-[#C5A028] px-2 py-0.5 rounded font-bold">قبل الصهر</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  required
                  placeholder="0.000"
                  value={kar}
                  onChange={(e) => setKar(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl pl-14 pr-4 py-2.5 text-sm text-left font-mono focus:border-[#C5A028] focus:ring-1 focus:ring-[#C5A028] focus:bg-[#070707] focus:outline-none transition-all duration-200"
                />
                <span className="absolute left-4 top-3 text-xs text-[#666] font-semibold">غرام</span>
              </div>
            </div>

            {/* Ingot weight */}
            <div>
              <label className="block text-xs font-semibold text-[#aaa] mb-1.5 flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#888]" /> وزن الذهب الخارج بعد الصهر (الصبة)
                </span>
                <span className="text-[10px] bg-emerald-950/40 text-emerald-400 px-2 py-0.5 rounded font-bold">بعد الصهر والصب</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  required
                  placeholder="0.000"
                  value={sabba}
                  onChange={(e) => setSabba(e.target.value)}
                  className="w-full text-white bg-[#141414] border border-[#222] rounded-xl pl-14 pr-4 py-2.5 text-sm text-left font-mono focus:border-[#C5A028] focus:ring-1 focus:ring-[#C5A028] focus:bg-[#070707] focus:outline-none transition-all duration-200"
                />
                <span className="absolute left-4 top-3 text-xs text-[#666] font-semibold">غرام</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-[#aaa] mb-1.5">ملاحظات وشهود الصهر</label>
              <textarea
                rows={2}
                placeholder="مثال: صب كسر عيار 21، صياغة منير، صبة الشجرة..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-white bg-[#141414] border border-[#222] rounded-xl px-4 py-2.5 text-sm focus:border-[#C5A028] focus:ring-1 focus:ring-[#C5A028] focus:bg-[#070707] focus:outline-none transition-all duration-200 resize-none"
              />
            </div>

            {/* Live calculation banner */}
            {parsedKar > 0 && parsedSabba > 0 && (
              <div className="bg-[#1a1a1a] rounded p-3 border border-[#2a2a2a] space-y-1">
                <div className="flex justify-between text-xs text-[#888]">
                  <span>النتيجة المحسوبة:</span>
                  {computedLoss > 0 ? (
                    <span className="font-bold text-rose-400 font-mono">
                      نطالب بنقص (نقص): {computedLoss.toFixed(3)} غرام
                    </span>
                  ) : computedLoss < 0 ? (
                    <span className="font-bold text-emerald-400 font-mono">
                      وفر/زيادة في الصبة: {Math.abs(computedLoss).toFixed(3)} غرام
                    </span>
                  ) : (
                    <span className="font-bold text-white font-mono">
                      موزن تماماً (0.000)
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-xs text-[#888]">
                  <span>نسبة {computedLoss >= 0 ? "عجز" : "زيادة"} الصهر والسبك:</span>
                  <span className={`font-bold font-mono ${computedLoss >= 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {computedLossPercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#C5A028] hover:bg-[#d9b132] text-[#0a0a0a] font-bold py-2.5 px-4 rounded transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(197,160,40,0.15)]"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>تسجيل عملية السبك والصهر</span>
            </button>
          </form>
        </div>
      </div>

      {/* Table & Logs Column */}
      <div className="md:col-span-7 lg:col-span-8 space-y-4">
        {/* Search */}
        <div className="bg-[#141414] p-4 rounded border border-[#2a2a2a] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#666] absolute right-3 top-3" />
            <input
              type="text"
              placeholder="البحث باليوم، التاريخ أو الملاحظة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-right text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded pl-3 pr-9 py-2 text-xs focus:border-[#C5A028] focus:bg-[#0c0c0c] focus:outline-none transition-colors"
            />
          </div>
          <div className="text-xs text-[#888] font-medium">
            تصفية النتائج: عرض <span className="text-[#C5A028] font-bold">{filteredRecords.length}</span> من أصل <span className="text-[#C5A028] font-bold">{records.length}</span> عملية سبك وصهر
          </div>
        </div>

        {/* Table representation */}
        <div className="bg-[#141414] rounded border border-[#2a2a2a] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-[#1a1a1a] border-b border-[#2a2a2a] text-[#888] text-xs">
                <tr>
                  <th className="px-4 py-3.5 text-center font-bold">حذف</th>
                  <th className="px-4 py-3.5 font-bold">ملاحظات</th>
                  <th className="px-4 py-3.5 text-center font-bold">% نسبة عجز/زيادة</th>
                  <th className="px-4 py-3.5 text-left font-bold font-mono">النقص (-) أو الزيادة (+)</th>
                  <th className="px-4 py-3.5 text-left font-bold font-mono">وزن الصبة الناتجة</th>
                  <th className="px-4 py-3.5 text-left font-bold font-mono">استلام كسر (خام ٢١)</th>
                  <th className="px-4 py-3.5 font-bold text-center">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-[#666] text-xs">
                      لا توجد سجلات سبك أو صهر مدخلة حالياً. استخدم النموذج للتسجيل أو اضغط على زر بيانات الدفتر التجريبية.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => {
                    const isProfit = record.loss < 0;
                    const absoluteLoss = Math.abs(record.loss);
                    const pct = record.kar > 0 ? (absoluteLoss / record.kar) * 100 : 0;
                    return (
                      <tr key={record.id} className="hover:bg-[#1a1a1a]/40 transition-colors">
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => onDeleteRecord(record.id)}
                            className="p-1 text-[#666] hover:text-rose-400 rounded hover:bg-rose-950/20 transition-colors cursor-pointer"
                            title="حذف هذا السجل"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-[#888] max-w-[200px] truncate" title={record.notes}>
                          {record.notes || "-"}
                        </td>
                        <td className="px-4 py-3 text-center font-mono">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${isProfit ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/40' : 'bg-rose-950/30 text-rose-400 border border-rose-900/40'}`}>
                            {pct.toFixed(2)}% {isProfit ? "زيادة" : "نقص"}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-left font-mono font-medium ${isProfit ? 'text-emerald-400 bg-emerald-950/10' : 'text-rose-400 bg-rose-950/10'}`}>
                          {isProfit ? `+${absoluteLoss.toFixed(3)}` : `-${absoluteLoss.toFixed(3)}`}
                        </td>
                        <td className="px-4 py-3 text-left font-mono text-[#e0e0e0]">
                          {record.sabba.toFixed(3)}
                        </td>
                        <td className="px-4 py-3 text-left font-mono text-white font-semibold bg-[#1a1a1a]/30">
                          {record.kar.toFixed(3)}
                        </td>
                        <td className="px-4 py-3 text-center text-[#888] text-xs whitespace-nowrap">
                          {record.date}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Aggregated Info row */}
              {records.length > 0 && (
                <tfoot className="bg-[#0f0f0f] divide-y divide-[#222] text-[#fff] text-xs">
                  <tr className="font-bold border-t border-[#2a2a2a]">
                    <td className="px-4 py-3 text-center text-[#C5A028]">المجموع</td>
                    <td className="px-4 py-3 text-[#888]">ملخص الصهر عيار ٢١ للصب والسباكة</td>
                    <td className="px-4 py-3 text-center font-mono text-[#C5A028]">
                      {(Math.abs(totalLoss) / totalKar * 100).toFixed(2)}% <span className="text-[10px] text-[#888]">({totalLoss >= 0 ? "متوسط العجز" : "وفر صافي"})</span>
                    </td>
                    <td className={`px-4 py-3 text-left font-mono ${totalLoss >= 0 ? 'text-rose-400 bg-rose-950/30' : 'text-emerald-400 bg-emerald-950/30'}`}>
                      {totalLoss >= 0 ? `-${totalLoss.toFixed(3)}` : `+${Math.abs(totalLoss).toFixed(3)}`} غرام
                    </td>
                    <td className="px-4 py-3 text-left font-mono text-[#e0e0e0]">
                      {totalSabba.toFixed(3)} غرام
                    </td>
                    <td className="px-4 py-3 text-left font-mono text-[#C5A028] bg-[#141414]">
                      {totalKar.toFixed(3)} غرام
                    </td>
                    <td className="px-4 py-3 text-center text-[#666]">-</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
