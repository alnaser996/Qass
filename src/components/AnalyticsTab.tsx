import React, { useState } from "react";
import { CastingRecord, TreeCastingRecord, RollingRecord, ProductionRecord } from "../types";
import { 
  Share2, 
  Scale, 
  Percent, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle, 
  Shield, 
  TrendingDown, 
  Flame, 
  TreePine, 
  Layers, 
  Award, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Calendar, 
  Sparkles, 
  History,
  Info,
  Printer,
  X,
  FileText
} from "lucide-react";

interface AnalyticsTabProps {
  castingRecords: CastingRecord[];
  treeCastingRecords: TreeCastingRecord[];
  rollingRecords: RollingRecord[];
  productionRecords: ProductionRecord[];
}

interface UnifiedOperation {
  id: string;
  date: string;
  type: "casting" | "tree_casting" | "rolling" | "production";
  typeName: string;
  weightBefore: number;
  weightAfter: number;
  damagedWeight: number;
  loss: number;
  details: string;
  notes: string;
  extraInfo: string;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  castingRecords,
  treeCastingRecords,
  rollingRecords,
  productionRecords,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; val: number } | null>(null);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  
  // Filtering and searching states
  const [filterType, setFilterType] = useState<"all" | "casting" | "tree_casting" | "rolling" | "production">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Math Calculations for General Statistics - Overridden exactly with User's requested workshop numbers
  const totalGoldInflow = 521.600;
  const totalNetFinishedGold = 881.150;
  const totalAbsoluteGoldLoss = 1.800;
  const totalRecoverableScrap = 21.200;

  // Efficiency Percentages and custom stats as requested
  const globalLossRate = 0.35; // 1.800g is exactly 0.35% of total inflow
  const goldDefectAlarm = false; // "حالة الورشة مستقرة وضمن المتوقع"

  // Exact stage loss values requested by the user
  const castingLossTotal = 0.400; // 0.08%
  const castingInputTotal = 500.000;
  
  const treeCastingLossTotal = 0.700; // 0.17%
  const treeCastingInputTotal = 411.765;
  
  const rollingLossTotal = 0.700; // 0.11%
  const rollingInputTotal = 636.364;

  const productionBeadsTotal = 498.650; // إجمالي وزن الإنتاج النهائي الجاهز والمسلم

  // Build exact required dateTimeline requested by the user:
  // 05-09, 05-10, 05-15, 05-18, 05-22, 05-28, 05-29
  const dateTimeline = [
    { date: "05-09", loss: 0.05 },
    { date: "05-10", loss: 0.70 },
    { date: "05-15", loss: 0.35 },
    { date: "05-18", loss: 0.20 },
    { date: "05-22", loss: 0.15 },
    { date: "05-28", loss: 0.05 },
    { date: "05-29", loss: 0.30 }, // Sum matches exactly 1.800g when combined!
  ];

  // Custom Inline SVG Sparkline/Graph renderer
  const renderTrendCanvas = () => {
    if (dateTimeline.length < 2) {
      return (
        <div className="flex flex-col items-center justify-center h-48 bg-slate-500/5 border border-dashed border-[#333] rounded-xl px-4 text-center">
          <HelpCircle className="w-8 h-8 text-[#555] mb-2" />
          <p className="text-xs text-[#888] font-sans">
            الرجاء إدخال بيانات على الأقل ليومين مختلفين لعرض منحنى تذبذب العجز والفاقد اليومي
          </p>
        </div>
      );
    }

    const width = 500;
    const height = 180;
    const padding = 25;
    const maxLoss = 0.84; // Peak level specified by user

    const points = dateTimeline.map((item, index) => {
      const x = padding + (index / (dateTimeline.length - 1)) * (width - padding * 2);
      const y = height - padding - (item.loss / maxLoss) * (height - padding * 2);
      return { x, y, date: item.date, loss: item.loss };
    });

    // Create SVG Path line
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    // Grid lines precisely mapping to 0.84g, 0.56g, 0.28g, 0.00g
    const gridLines = [
      { label: "0.84g", y: padding },
      { label: "0.56g", y: padding + (1/3) * (height - padding * 2) },
      { label: "0.28g", y: padding + (2/3) * (height - padding * 2) },
      { label: "0.00g", y: height - padding },
    ];

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-black rounded-xl overflow-hidden shadow-inner border border-[#2a2a2a]">
          {/* Grid lines with precise user-specified values */}
          {gridLines.map((line, idx) => (
            <g key={idx}>
              <line
                x1={padding}
                y1={line.y}
                x2={width - padding}
                y2={line.y}
                stroke="#161616"
                strokeWidth="0.75"
                strokeDasharray="4 4"
              />
              <text
                x={padding + 4}
                y={line.y - 4}
                fill="#555"
                fontSize="8"
                fontFamily="monospace"
                direction="ltr"
                className="text-left font-mono font-semibold"
              >
                {line.label}
              </text>
            </g>
          ))}

          {/* Area fill behind the curve */}
          {points.length > 0 && (
            <path
              d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
              fill="url(#goldGradientArea)"
              opacity="0.12"
            />
          )}

          {/* Golden Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Plot Circles */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.label === pt.date ? "6" : "4"}
              fill={hoveredPoint?.label === pt.date ? "#fbbf24" : "#f59e0b"}
              stroke="#000"
              strokeWidth="1.5"
              className="transition-all cursor-pointer"
              onMouseEnter={() => setHoveredPoint({ x: pt.x, y: pt.y, label: pt.date, val: pt.loss })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {/* Timeline Dates label at bottom */}
          {points.map((pt, i) => {
            const shortDate = pt.date; // Use "05-09" directly as it is already short formatted in dateTimeline
            return (
              <text
                key={i}
                x={pt.x}
                y={height - 8}
                fill="#666"
                fontSize="8"
                textAnchor="middle"
                fontFamily="monospace"
                className="font-semibold"
              >
                {shortDate}
              </text>
            );
          })}

          <defs>
            <linearGradient id="goldGradientArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute bg-neutral-900 border border-amber-500/30 rounded-lg p-2 text-[11px] text-right text-white shadow-xl pointer-events-none transition-all"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 30}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="font-semibold text-amber-400">التاريخ: 2026-{hoveredPoint.label}</div>
            <div className="text-[10px] text-slate-300 font-mono">
              إجمالي عجز النقص: {hoveredPoint.val.toFixed(3)} غرام
            </div>
          </div>
        )}
      </div>
    );
  };

  // Compile Unified operations list for listing and searching
  const unifiedOperations: UnifiedOperation[] = [
    ...castingRecords.map(r => ({
      id: r.id,
      date: r.date,
      type: "casting" as const,
      typeName: "السبك والصهر",
      weightBefore: r.kar ?? 0,
      weightAfter: r.sabba ?? 0,
      damagedWeight: 0,
      loss: r.loss ?? 0,
      details: "صهر الكسر والذهب القديم وتجهيز السبيكة",
      notes: r.notes || "لا توجد ملاحظات تسجيلية",
      extraInfo: "عملية صهر وتحضير العيار الموحد",
    })),
    ...treeCastingRecords.map(r => ({
      id: r.id,
      date: r.date,
      type: "tree_casting" as const,
      typeName: "صبة الشجرة والفاكيوم",
      weightBefore: r.inputWeight ?? 0,
      weightAfter: r.productionWeight ?? 0,
      damagedWeight: r.damagedWeight ?? 0,
      loss: r.loss ?? 0,
      details: r.productionDetails || "صب وتفريغ شجرة مصوغات بالفاكيوم المتكامل",
      notes: r.notes || "تم التدقيق والمطابقة الكاملة",
      extraInfo: `عدد قطع الإنتاج الصالحة: ${r.productionCount ?? 0} قطعة`,
    })),
    ...rollingRecords.map(r => {
      const wBefore = r.weightBefore ?? (r as any).before ?? 0;
      const wAfter = r.weightAfter ?? (r as any).after ?? 0;
      const dWeight = r.damagedWeight ?? (r as any).damaged ?? 0;
      const desc = r.details || (r as any).notes || "سحب سلك ودرفلة شريط ذهب";
      const stageStr = r.stageType === "bombing" ? "تفجير وتجريد" : r.stageType === "repair" ? "تصليح يدوي" : "غلق فاكيوم";
      return {
        id: r.id,
        date: r.date,
        type: "rolling" as const,
        typeName: "التفجير، التصليح والفاكيوم",
        weightBefore: wBefore,
        weightAfter: wAfter,
        damagedWeight: dWeight,
        loss: r.loss ?? (wBefore - (wAfter + dWeight)),
        details: `[${stageStr}] ${desc}`,
        notes: r.notes || "لا يوجد ملاحظات إضافية",
        extraInfo: `عدد قطع العمل الحالي: ${r.piecesCount ?? 1} قطعة`,
      };
    }),
    ...productionRecords.map(r => {
      const fWeight = r.finalWeight ?? (r as any).beadWeight ?? (r as any).productionWeight ?? 0;
      const lossVal = (r as any).loss ?? 0;
      const dWeight = (r as any).damaged ?? 0;
      return {
        id: r.id,
        date: r.date,
        type: "production" as const,
        typeName: "تسليم الإنتاج الكامل المنجز",
        weightBefore: fWeight + lossVal + dWeight, // Constructed starting weight
        weightAfter: fWeight,
        damagedWeight: dWeight,
        loss: lossVal,
        details: r.details || "تثبيت وصياغة المشغولات النهائية وتسليمها",
        notes: r.notes || "تم فحص الجودة بنجاح",
        extraInfo: `الموظف المستلم للإنتاج: ${r.receiverName} (${r.piecesCount} قطع)`,
      };
    })
  ];

  // Filtering based on multiple parameters
  const filteredOperations = unifiedOperations.filter((op) => {
    // 1. Process Type filter
    if (filterType !== "all" && op.type !== filterType) return false;

    // 2. Keyword Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchDetails = op.details.toLowerCase().includes(query);
      const matchNotes = op.notes.toLowerCase().includes(query);
      const matchTypeName = op.typeName.toLowerCase().includes(query);
      const matchExtra = op.extraInfo.toLowerCase().includes(query);
      if (!matchDetails && !matchNotes && !matchTypeName && !matchExtra) return false;
    }

    // 3. Start Date filter
    if (startDate && op.date < startDate) return false;

    // 4. End Date filter
    if (endDate && op.date > endDate) return false;

    return true;
  }).sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
  });

  return (
    <div className="space-y-8 print-root-container">
      {/* Top action control panel */}
      <div className="bg-gradient-to-l from-amber-500/10 via-neutral-900 to-[#0e0e0e] rounded-2xl border border-neutral-800 p-5 md:p-6 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-5 no-print animate-fadeIn">
        <div className="space-y-1 text-center md:text-right">
          <h4 className="text-sm md:text-base font-bold text-[#C5A028] flex items-center gap-2 justify-center md:justify-start">
            <Sparkles className="w-4 h-4 text-[#C5A028]" />
            <span>نظام التقارير الذكي وإصدار الـ PDF لعام 2026</span>
          </h4>
          <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
            يمكنك الآن معاينة حركة الدفتر التجريبية الكاملة وجرد النقيصة لمراحل الصهر والشجرة والفاكيوم والتسليم بدقة معمل العبسلي، مع ميزة التصدير لملفات PDF والطباعة المباشرة.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsPrintPreviewOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-extrabold text-xs px-6 py-3 rounded-xl cursor-pointer flex items-center gap-2.5 shadow-[0_4px_20px_rgba(197,160,40,0.25)] transition-all duration-300"
          >
            <Printer className="w-4 h-4 stroke-[2]" />
            <span>معاينة وطباعة التقرير الشامل (PDF)</span>
          </button>
        </div>
      </div>

      {/* Advanced Unified Inventory Section (Matches USER REQUEST exactly) */}
      <div className="bg-[#141414] rounded border border-[#2a2a2a] p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#2a2a2a] pb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
              <History className="w-5 h-5 text-[#C5A028]" />
              <span>التقرير الشامل وجرد النقيصة لكل العمليات السابقة حسب التاريخ</span>
            </h3>
            <p className="text-xs text-[#888] mt-0.5">
              جرد وفهرسة شاملة للنقيصة والعجز لكل وزن بالتفصيل حسب التاريخ والمرحلة لجميع الأقسام الأربعة
            </p>
          </div>

          <button
            onClick={() => {
              setFilterType("all");
              setSearchQuery("");
              setStartDate("");
              setEndDate("");
            }}
            className="text-xs text-[#C5A028] bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] px-3 py-1.5 rounded transition-all cursor-pointer"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>

        {/* Filters control block */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs font-sans">
          {/* Quick Filter buttons */}
          <div className="md:col-span-4 space-y-2">
            <span className="block text-xs font-semibold text-[#888] mb-1">القسم / نوع المرحلة</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`px-2.5 py-1.5 rounded border transition-colors cursor-pointer ${filterType === "all" ? "bg-[#C5A028] text-black font-semibold border-transparent" : "bg-[#1a1a1a] text-[#888] border-[#222] hover:text-white"}`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => setFilterType("casting")}
                className={`px-2.5 py-1.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${filterType === "casting" ? "bg-[#C5A028] text-black font-semibold border-transparent" : "bg-[#1a1a1a] text-[#888] border-[#222] hover:text-white"}`}
              >
                <Flame className="w-3 h-3" /> السبك وصهر الكسر
              </button>
              <button
                type="button"
                onClick={() => setFilterType("tree_casting")}
                className={`px-2.5 py-1.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${filterType === "tree_casting" ? "bg-[#C5A028] text-black font-semibold border-transparent" : "bg-[#1a1a1a] text-[#888] border-[#222] hover:text-white"}`}
              >
                <TreePine className="w-3 h-3" /> صبة الشجرة
              </button>
              <button
                type="button"
                onClick={() => setFilterType("rolling")}
                className={`px-2.5 py-1.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${filterType === "rolling" ? "bg-[#C5A028] text-black font-semibold border-transparent" : "bg-[#1a1a1a] text-[#888] border-[#222] hover:text-white"}`}
              >
                <Layers className="w-3 h-3" /> تفجير وتصليح وفاكيوم
              </button>
              <button
                type="button"
                onClick={() => setFilterType("production")}
                className={`px-2.5 py-1.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${filterType === "production" ? "bg-[#C5A028] text-black font-semibold border-transparent" : "bg-[#1a1a1a] text-[#888] border-[#222] hover:text-white"}`}
              >
                <Award className="w-3 h-3" /> تسليم الإنتاج
              </button>
            </div>
          </div>

          {/* Date range filters */}
          <div className="md:col-span-4 grid grid-cols-2 gap-2">
            <div>
              <span className="block text-xs font-semibold text-[#888] mb-1">من تاريخ</span>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-xs text-right text-mono focus:border-[#C5A028] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <span className="block text-xs font-semibold text-[#888] mb-1">إلى تاريخ</span>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-xs text-right text-mono focus:border-[#C5A028] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Text Search input */}
          <div className="md:col-span-3">
            <span className="block text-xs font-semibold text-[#888] mb-1">بحث في تفاصيل وملاحظات العمل</span>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#666] absolute right-2.5 top-2.5" />
              <input
                type="text"
                placeholder="ابحث بالموظف، الوجبة، عيار، النقيصة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-right text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded pl-3 pr-8 py-2 text-xs focus:border-[#C5A028] focus:outline-none"
              />
            </div>
          </div>

          {/* Sort order toggle button */}
          <div className="md:col-span-1 flex flex-col justify-end">
            <button
              onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
              className="w-full flex items-center justify-center gap-1 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-[#ccc] hover:text-white py-2 rounded transition-colors cursor-pointer"
              title={sortOrder === "desc" ? "الترتيب الحالي: من الأحدث للأقدم" : "الترتيب الحالي: من الأقدم للأحدث"}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#C5A028]" />
              <span>{sortOrder === "desc" ? "الأحدث" : "الأقدم"}</span>
            </button>
          </div>
        </div>

        {/* Summary analysis card for the filtered subset */}
        <div className="bg-[#1a1a1a] rounded p-4 border border-[#222] grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans">
          <div className="space-y-1">
            <span className="text-[#666]">مجموع العمليات المفلترة:</span>
            <div className="font-semibold text-white">{filteredOperations.length} عملية مسجلة</div>
          </div>
          <div className="space-y-1">
            <span className="text-[#666]">إجمالي الوزن الداخل (قبل):</span>
            <div className="font-semibold text-amber-500 font-mono">
              {filteredOperations.reduce((sum, op) => sum + op.weightBefore, 0).toFixed(3)} غرام
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[#666]">إجمالي الوزن المستخرج (بعد):</span>
            <div className="font-semibold text-emerald-400 font-mono">
              {filteredOperations.reduce((sum, op) => sum + op.weightAfter, 0).toFixed(3)} غرام
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[#666]">إجمالي النقيصة والعجز الفعلي:</span>
            <div className="font-semibold text-rose-400 font-mono flex items-center gap-1">
              <span>{filteredOperations.reduce((sum, op) => sum + op.loss, 0).toFixed(3)} غرام</span>
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            </div>
          </div>
        </div>

        {/* Master Ledger Inventory Table style */}
        <div className="border border-[#222] rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-[#1a1a1a] border-b border-[#222] text-[#888] text-xs font-sans">
                <tr>
                  <th className="px-3 py-3 font-semibold text-center w-24">تاريخ العملية</th>
                  <th className="px-3 py-3 font-semibold text-center w-36">نوع المرحلة والعملية</th>
                  <th className="px-3 py-3 font-semibold text-left font-mono">الوزن قبل (الخام/المدخل)</th>
                  <th className="px-3 py-3 font-semibold text-left font-mono">الوزن بعد (الصافي)</th>
                  <th className="px-3 py-3 font-semibold text-left font-mono">الريزة والتالف المعاد</th>
                  <th className="px-3 py-3 font-semibold text-left font-mono text-rose-400">النقيصة (العجز)</th>
                  <th className="px-3 py-3 font-semibold text-center">% النقص</th>
                  <th className="px-3 py-3 font-semibold">تفاصيل ومواصفات العملية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e] font-sans">
                {filteredOperations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-[#666] text-xs">
                      لا توجد عمليات تطابق معايير البحث والفرز في تتبع جرد النقيصة. يرجى تعديل خيارات التصفية.
                    </td>
                  </tr>
                ) : (
                  filteredOperations.map((op, idx) => {
                    const isMelting = op.type === "casting";
                    const isTree = op.type === "tree_casting";
                    const isRolling = op.type === "rolling";
                    const isProd = op.type === "production";

                    const lossPct = op.weightBefore > 0 ? (Math.max(0, op.loss) / op.weightBefore) * 100 : 0;
                    
                    // Style badges for different categories
                    let badgeBg = "bg-amber-950/20 text-amber-500 border border-amber-900/30";
                    let badgeIcon = <Flame className="w-3 h-3 text-amber-500" />;
                    if (isTree) {
                      badgeBg = "bg-blue-950/20 text-blue-400 border border-blue-900/30";
                      badgeIcon = <TreePine className="w-3 h-3 text-blue-400" />;
                    } else if (isRolling) {
                      badgeBg = "bg-purple-950/20 text-purple-400 border border-purple-900/30";
                      badgeIcon = <Layers className="w-3 h-3 text-purple-400" />;
                    } else if (isProd) {
                      badgeBg = "bg-emerald-950/20 text-emerald-400 border border-emerald-900/30";
                      badgeIcon = <Award className="w-3 h-3 text-emerald-400" />;
                    }

                    return (
                      <tr key={idx} className="hover:bg-[#1a1a1a]/30 transition-all font-sans">
                        {/* Date */}
                        <td className="px-3 py-3.5 text-center text-[#888] font-mono text-xs whitespace-nowrap">
                          {op.date}
                        </td>

                        {/* Process Type Badge */}
                        <td className="px-3 py-3.5 text-center">
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded font-medium ${badgeBg}`}>
                            {badgeIcon}
                            <span>{op.typeName}</span>
                          </span>
                        </td>

                        {/* Weight Before */}
                        <td className="px-3 py-3.5 text-left font-mono text-white text-xs bg-[#1a1a1a]/20">
                          {op.weightBefore.toFixed(3)}
                        </td>

                        {/* Weight After */}
                        <td className="px-3 py-3.5 text-left font-mono text-[#ccc] text-xs">
                          {op.weightAfter.toFixed(3)}
                        </td>

                        {/* Damaged / Scrap */}
                        <td className="px-3 py-3.5 text-left font-mono text-[#C5A028] text-xs">
                          {op.damagedWeight > 0 ? `${op.damagedWeight.toFixed(3)}` : "-"}
                        </td>

                        {/* Absolute Loss (العجز) */}
                        <td className="px-3 py-3.5 text-left font-mono text-rose-400 text-xs bg-[#b91c1c]/5 font-semibold">
                          {op.loss > 0 ? op.loss.toFixed(3) : op.loss < 0 ? `+${Math.abs(op.loss).toFixed(3)} (ربح)` : "0.000"}
                        </td>

                        {/* Loss percentage */}
                        <td className="px-3 py-3.5 text-center font-mono text-xs">
                          {op.loss > 0 ? (
                            <span className="text-rose-400 font-bold bg-[#7f1d1d]/15 px-1.5 py-0.5 rounded border border-rose-950/20">
                              {lossPct.toFixed(2)}%
                            </span>
                          ) : op.loss < 0 ? (
                            <span className="text-emerald-400 font-bold bg-[#064e3b]/15 px-1.5 py-0.5 rounded border border-emerald-950/20">
                              فوائض
                            </span>
                          ) : (
                            <span className="text-[#64748b]">-</span>
                          )}
                        </td>

                        {/* Description & specs details */}
                        <td className="px-3 py-3.5 text-xs text-[#ccc] max-w-[280px]">
                          <div className="font-semibold text-[#efefef] line-clamp-1">{op.details}</div>
                          {op.extraInfo && (
                            <div className="text-[10px] text-[#888] mt-0.5 font-medium">{op.extraInfo}</div>
                          )}
                          {op.notes && op.notes !== "لا توجد ملاحظات تسجيلية" && (
                            <div className="text-[9px] text-[#666] line-clamp-1 mt-0.5 italic">*(ملاحظة: {op.notes})</div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Interactive Print & PDF Preview Modal */}
      {isPrintPreviewOpen && (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-md z-50 overflow-y-auto p-4 md:p-8 no-print flex flex-col items-center">
          {/* Top Sticky bar for controlling Actions on-screen */}
          <div className="w-full max-w-4xl bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 mb-6 flex justify-between items-center sticky top-2 backdrop-blur z-50 shadow-2xl">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-500/10 text-[#C5A028] rounded-xl border border-amber-500/20">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">معاينة المستند الرسمي</h3>
                <p className="text-[10px] text-neutral-400">راجع البيانات والتقارير قبل الحفظ بصيغة PDF</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="bg-[#C5A028] hover:bg-amber-600 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 transition-all shadow-[0_4px_12px_rgba(197,160,40,0.25)]"
              >
                <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>طباعة أو حفظ PDF</span>
              </button>
              <button
                onClick={() => setIsPrintPreviewOpen(false)}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 border border-neutral-700 transition"
              >
                <X className="w-3.5 h-3.5" />
                <span>إلغاء</span>
              </button>
            </div>
          </div>

          {/* Simulated A4 Paper White Layout */}
          <div className="print-paper bg-white text-black w-full max-w-4xl p-10 md:p-16 rounded-2xl shadow-2xl border border-neutral-200 flex flex-col space-y-8 text-right selection:bg-amber-100">
            {/* Header Block */}
            <div className="flex flex-col md:flex-row justify-between items-center border-b-2 border-neutral-200 pb-6 gap-6">
              {/* Logo / Title right */}
              <div className="text-center md:text-right space-y-1">
                <div className="inline-block bg-[#aa8010] text-white px-2 py-1 rounded text-[10px] font-bold tracking-widest font-sans mb-1 uppercase">
                  معمل قاسم العبسلي للصياغة والصب الفني
                </div>
                <h1 className="text-xl md:text-2xl font-extrabold text-neutral-800">جرد نقيصة الذهب المتراكمة</h1>
                <p className="text-[11px] text-neutral-500 font-medium">سجل تدقيق عجز الصهر، صبة الشجرة، الدرفلة والفاكيوم الكامل</p>
              </div>

              {/* Logo icon center */}
              <div className="hidden md:flex flex-col items-center justify-center p-3 border-2 border-[#cbd5e0] rounded-full">
                <Scale className="w-8 h-8 text-[#aa8010] stroke-[1.5]" />
              </div>

              {/* Info block left */}
              <div className="text-center md:text-left text-xs text-neutral-500 space-y-1 font-mono font-medium">
                <div>تاريخ التقـرير: <span className="text-neutral-800 font-bold">2026-06-01</span></div>
                <div>رقم المستنـد: <span className="text-neutral-800 font-bold">QAS-2026-DE-928</span></div>
                <div>العيار المعتمد: <span className="text-neutral-800 font-bold">عيار ٢١ الموحد</span></div>
                <div>الحالة العامة: <span className="text-emerald-700 font-bold underline decoration-double">مستقرة وضمن الأمان</span></div>
              </div>
            </div>

            {/* Samples Notebook Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider border-r-4 border-[#aa8010] pr-2">
                سجل حركة الدفتر التجريبي الشامل (التفصيلي والفرز):
              </h3>
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#edf2f7] text-neutral-700 font-bold border-b border-neutral-300">
                    <tr>
                      <th className="px-3 py-2 font-semibold text-center">التاريخ</th>
                      <th className="px-3 py-2 font-semibold">مرحلة ونوع عملية الجرد</th>
                      <th className="px-3 py-2 font-semibold text-left font-mono">الوزن قبل (غ)</th>
                      <th className="px-3 py-2 font-semibold text-left font-mono">الوزن بعد (غ)</th>
                      <th className="px-3 py-2 font-semibold text-left font-mono">التالف/الريزة</th>
                      <th className="px-3 py-2 font-semibold text-left font-mono text-rose-700 font-bold">النقص (العجز)</th>
                      <th className="px-3 py-2 font-semibold text-center">التقييم الفني</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-250 text-neutral-700">
                    <tr>
                      <td className="px-3 py-2.5 text-center font-mono">2026-05-09</td>
                      <td className="px-3 py-2.5 font-semibold">سبك وصهر كسر عيار ٢١ بكر</td>
                      <td className="px-3 py-2.5 text-left font-mono">100.000</td>
                      <td className="px-3 py-2.5 text-left font-mono">99.950</td>
                      <td className="px-3 py-2.5 text-left font-mono">0.000</td>
                      <td className="px-3 py-2.5 text-left font-mono text-rose-600 font-sans font-bold">0.050 غ</td>
                      <td className="px-3 py-2.5 text-center text-emerald-700 font-bold">مستقر تبارك الله</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2.5 text-center font-mono">2026-05-10</td>
                      <td className="px-3 py-2.5 font-semibold">صب شجرة الأقراط والأساور الفاكيوم</td>
                      <td className="px-3 py-2.5 text-left font-mono">200.000</td>
                      <td className="px-3 py-2.5 text-left font-mono">199.300</td>
                      <td className="px-3 py-2.5 text-left font-mono">0.000</td>
                      <td className="px-3 py-2.5 text-left font-mono text-rose-600 font-sans font-bold">0.700 غ</td>
                      <td className="px-3 py-2.5 text-center text-amber-700 font-bold">عجز طبيعي مسموح</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2.5 text-center font-mono">2026-05-15</td>
                      <td className="px-3 py-2.5 font-semibold">درفلة شريط ذهب وتفجير الفضة</td>
                      <td className="px-3 py-2.5 text-left font-mono">150.000</td>
                      <td className="px-3 py-2.5 text-left font-mono">149.650</td>
                      <td className="px-3 py-2.5 text-left font-mono">0.000</td>
                      <td className="px-3 py-2.5 text-left font-mono text-rose-600 font-sans font-bold">0.350 غ</td>
                      <td className="px-3 py-2.5 text-center text-emerald-700 font-bold">مستقر تبارك الله</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2.5 text-center font-mono">2026-05-18</td>
                      <td className="px-3 py-2.5 font-semibold">صياغة حبات الدبل والأزرار المسلمة</td>
                      <td className="px-3 py-2.5 text-left font-mono">120.000</td>
                      <td className="px-3 py-2.5 text-left font-mono">119.800</td>
                      <td className="px-3 py-2.5 text-left font-mono">0.000</td>
                      <td className="px-3 py-2.5 text-left font-mono text-rose-600 font-sans font-bold">0.200 غ</td>
                      <td className="px-3 py-2.5 text-center text-amber-700 font-bold">عجز طبيعي مسموح</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2.5 text-center font-mono">2026-05-22</td>
                      <td className="px-3 py-2.5 font-semibold">تسوية يد وتصليح اللحام شمعة</td>
                      <td className="px-3 py-2.5 text-left font-mono">80.000</td>
                      <td className="px-3 py-2.5 text-left font-mono">79.850</td>
                      <td className="px-3 py-2.5 text-left font-mono">0.000</td>
                      <td className="px-3 py-2.5 text-left font-mono text-rose-600 font-sans font-bold">0.150 غ</td>
                      <td className="px-3 py-2.5 text-center text-emerald-700 font-bold">مستقر تبارك الله</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2.5 text-center font-mono">2026-05-28</td>
                      <td className="px-3 py-2.5 font-semibold">دورة صهر بوطة الكسر الأولية</td>
                      <td className="px-3 py-2.5 text-left font-mono">50.000</td>
                      <td className="px-3 py-2.5 text-left font-mono">49.950</td>
                      <td className="px-3 py-2.5 text-left font-mono">0.000</td>
                      <td className="px-3 py-2.5 text-left font-mono text-rose-600 font-sans font-bold">0.050 غ</td>
                      <td className="px-3 py-2.5 text-center text-emerald-700 font-bold">ممتاز آمن للغاية</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2.5 text-center font-mono">2026-05-29</td>
                      <td className="px-3 py-2.5 font-semibold">تسليم المشغولات والإنتاج الكامل النهائي</td>
                      <td className="px-3 py-2.5 text-left font-mono">110.000</td>
                      <td className="px-3 py-2.5 text-left font-mono">109.700</td>
                      <td className="px-3 py-2.5 text-left font-mono">0.000</td>
                      <td className="px-3 py-2.5 text-left font-mono text-rose-600 font-sans font-bold">0.300 غ</td>
                      <td className="px-3 py-2.5 text-center text-amber-700 font-bold">عجز طبيعي مسموح</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signatures & Certification stamps */}
            <div className="pt-8 border-t border-neutral-200 grid grid-cols-3 gap-6 text-center text-xs text-neutral-600 font-sans">
              <div className="space-y-4">
                <span className="font-bold text-neutral-800 text-[11px] block">مسؤول التدقيق الفني:</span>
                <span className="text-[10px] block opacity-40">____________________</span>
                <span className="text-[10px] block font-mono text-neutral-400">توقيع أخصائي الوزن</span>
              </div>
              <div className="space-y-4 flex flex-col items-center">
                <span className="font-bold text-neutral-800 text-[11px] block">ختم معمل قاسم العبسلي:</span>
                <div className="border border-amber-500/20 text-[#aa8010] bg-amber-50/30 px-3 py-1.5 rounded-full font-bold text-[9px] uppercase tracking-wider select-none transform rotate-[-3deg] border-dashed">
                  مصب قاسم العبسلي الرسمي
                </div>
                <span className="text-[9px] font-mono text-neutral-400">تحت طائلة جرد الذهب</span>
              </div>
              <div className="space-y-4">
                <span className="font-bold text-neutral-800 text-[11px] block">إعتماد إدارة المعمل المالي:</span>
                <span className="text-[10px] block opacity-40">____________________</span>
                <span className="text-[10px] block font-mono text-neutral-400">توقيع المدير المسؤول</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

