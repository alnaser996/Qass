import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { CastingTab } from "./components/CastingTab";
import { TreeCastingTab } from "./components/TreeCastingTab";
import { RollingTab } from "./components/RollingTab";
import { ProductionTab } from "./components/ProductionTab";
import { AnalyticsTab } from "./components/AnalyticsTab";
import { CastingRecord, RollingRecord, ProductionRecord, TreeCastingRecord } from "./types";
import { Hammer, Layers, Award, TrendingDown, ClipboardList, TreePine } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"casting" | "tree_casting" | "rolling" | "production" | "analytics">("casting");

  // State arrays for registers
  const [castingRecords, setCastingRecords] = useState<CastingRecord[]>([]);
  const [treeCastingRecords, setTreeCastingRecords] = useState<TreeCastingRecord[]>([]);
  const [rollingRecords, setRollingRecords] = useState<RollingRecord[]>([]);
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>([]);

  // Local Storage Load
  useEffect(() => {
    const savedCasting = localStorage.getItem("gold_loss_casting");
    const savedTreeCasting = localStorage.getItem("gold_loss_tree_casting");
    const savedRolling = localStorage.getItem("gold_loss_rolling");
    const savedProduction = localStorage.getItem("gold_loss_production");

    const demoIds = ["cast-1", "cast-2", "tree-1", "roll-1", "roll-2", "roll-3", "prod-1", "prod-2"];

    if (savedCasting) {
      const parsed = JSON.parse(savedCasting);
      setCastingRecords(parsed.filter((r: any) => !demoIds.includes(r.id)));
    }
    if (savedTreeCasting) {
      const parsed = JSON.parse(savedTreeCasting);
      setTreeCastingRecords(parsed.filter((r: any) => !demoIds.includes(r.id)));
    }
    if (savedRolling) {
      try {
        const parsed = JSON.parse(savedRolling);
        if (Array.isArray(parsed)) {
          const migrated = parsed.map((r: any) => {
            const weightBefore = r.weightBefore !== undefined ? Number(r.weightBefore) : (r.before !== undefined ? Number(r.before) : 0);
            const weightAfter = r.weightAfter !== undefined ? Number(r.weightAfter) : (r.after !== undefined ? Number(r.after) : 0);
            const damagedWeight = r.damagedWeight !== undefined ? Number(r.damagedWeight) : (r.damaged !== undefined ? Number(r.damaged) : 0);
            const piecesCount = r.piecesCount !== undefined ? Number(r.piecesCount) : 1;
            const details = r.details || r.notes || "عملية سحب ودرفلة سابقة";
            const stageType = r.stageType || "bombing";
            const loss = r.loss !== undefined ? Number(r.loss) : (weightBefore - (weightAfter + damagedWeight));
            return {
              ...r,
              stageType,
              weightBefore,
              weightAfter,
              damagedWeight,
              piecesCount,
              details,
              loss,
            };
          });
          setRollingRecords(migrated.filter((r: any) => !demoIds.includes(r.id)));
        } else {
          setRollingRecords([]);
        }
      } catch (err) {
        console.error("Failed to migrate old rolling records:", err);
        setRollingRecords([]);
      }
    }
    if (savedProduction) {
      try {
        const parsed = JSON.parse(savedProduction);
        if (Array.isArray(parsed)) {
          const migrated = parsed.map((r: any) => {
            const finalWeight = r.finalWeight !== undefined ? Number(r.finalWeight) : (r.beadWeight !== undefined ? Number(r.beadWeight) : Number(r.productionWeight || 0));
            const piecesCount = r.piecesCount !== undefined ? Number(r.piecesCount) : 1;
            const details = r.details || r.notes || "عقد أو غوايش صياغة سابقة";
            const receiverName = r.receiverName || "الموظف المستلم";
            return {
              ...r,
              finalWeight,
              piecesCount,
              details,
              receiverName,
            };
          });
          setProductionRecords(migrated.filter((r: any) => !demoIds.includes(r.id)));
        } else {
          setProductionRecords([]);
        }
      } catch (err) {
        console.error("Failed to migrate old production records:", err);
        setProductionRecords([]);
      }
    }
  }, []);

  // Save changes to Local Storage
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Seeding ledger data mirroring the notebook's handwriting exactly!
  const seedDemoLedger = () => {
    const demoCasting: CastingRecord[] = [
      {
        id: "cast-1",
        date: "2026-05-09",
        kar: 404.05,
        sabba: 404.00,
        loss: 0.05, // 404.05 - 404.00
        notes: "سبك وصهر سبيكة النواة الكبرى - عيار 21 مخصص",
      },
      {
        id: "cast-2",
        date: "2026-05-29",
        kar: 117.55,
        sabba: 117.20,
        loss: 0.35, 
        notes: "سبك وصهر سبيكة الكسر الفرعي عيار 21",
      },
    ];

    const demoTreeCasting: TreeCastingRecord[] = [
      {
        id: "tree-1",
        date: "2026-05-10",
        inputWeight: 404.00, // ingot from cast-1
        productionWeight: 382.50,
        damagedWeight: 20.80,
        loss: 0.70, // 404 - (382.5 + 20.8) = 0.70 نقص
        productionCount: 45,
        productionDetails: "أساور ليزر عيار 21 نقية وخواتم لؤلؤ",
        damagedCount: 3,
        damagedDetails: "زوائد صب على العروق وعيوب صب الركيزة في قطعتين",
        notes: "صبة الشجرة الأولى لخط إنتاج الأساور الكبرى",
      }
    ];

    const demoRolling: RollingRecord[] = [
      {
        id: "roll-1",
        stageType: "bombing",
        date: "2026-05-15",
        weightBefore: 404.00,
        weightAfter: 403.45,
        loss: 0.35,
        damagedWeight: 0.20,
        piecesCount: 24,
        details: "تفجير وتجريد أحجار وجبة خواتم الصياغة الصغرى عيار 21",
        notes: "عملية تفجير للوجبة للتخلص من الشوائب بعد الصب المباشر",
      },
      {
        id: "roll-2",
        stageType: "repair",
        date: "2026-05-18",
        weightBefore: 120.50,
        weightAfter: 120.30,
        loss: 0.20,
        piecesCount: 15,
        details: "تصليح أساور وسحب طوق وتعديل لحام عينات عيار 21",
        notes: "تصليح يدوي قبل تجهيز مرحلة صب الفاكيوم النهائي",
      },
      {
        id: "roll-3",
        stageType: "vacuum",
        date: "2026-05-22",
        weightBefore: 117.20,
        weightAfter: 116.85,
        loss: 0.15,
        damagedWeight: 0.20,
        piecesCount: 50,
        details: "سحب وغلق الفاكيوم لوجبة أقراط الأذن والتعليقات الصافية",
        notes: "جودة الفاكيوم عالية ولله الحمد، العجز قليل جداً نسبة للمخرجات",
      },
    ];

    const demoProduction: ProductionRecord[] = [
      {
        id: "prod-1",
        date: "2026-05-15",
        finalWeight: 382.15,
        piecesCount: 45,
        details: "أساور صب وحلقان ناعمة وجلب كاملة عيار 21",
        receiverName: "أبو أحمد (أمين المعرض الرئيسي)",
        notes: "تم تسليم الإنتاج كاملاً ومطابقة الوزن مع الدفتر اليدوي",
      },
      {
        id: "prod-2",
        date: "2026-05-28",
        finalWeight: 116.50,
        piecesCount: 12,
        details: "سلاسل وقلادات سبيكة ذهبية ليزر مجرورة عيار 21",
        receiverName: "المهندس جاسم غانم",
        notes: "تم التعبئة في علب الهدايا والصرف الفوري للزبائن",
      },
    ];

    setCastingRecords(demoCasting);
    setTreeCastingRecords(demoTreeCasting);
    setRollingRecords(demoRolling);
    setProductionRecords(demoProduction);

    saveToStorage("gold_loss_casting", demoCasting);
    saveToStorage("gold_loss_tree_casting", demoTreeCasting);
    saveToStorage("gold_loss_rolling", demoRolling);
    saveToStorage("gold_loss_production", demoProduction);
  };

  const handleClearData = () => {
    if (window.confirm("هل أنت متأكد من رغبتك في تصفير الدفتر ومسح جميع السجلات؟ لا يمكن التراجع عن هذا الإجراء.")) {
      setCastingRecords([]);
      setTreeCastingRecords([]);
      setRollingRecords([]);
      setProductionRecords([]);
      localStorage.removeItem("gold_loss_casting");
      localStorage.removeItem("gold_loss_tree_casting");
      localStorage.removeItem("gold_loss_rolling");
      localStorage.removeItem("gold_loss_production");
    }
  };

  // Add Casting record helper
  const handleAddCasting = (record: Omit<CastingRecord, "id" | "loss">) => {
    const computedLoss = record.kar - record.sabba; // allows negative values (gain)
    const newRecord: CastingRecord = {
      ...record,
      id: `cast-${Date.now()}`,
      loss: computedLoss,
    };
    const updated = [newRecord, ...castingRecords];
    setCastingRecords(updated);
    saveToStorage("gold_loss_casting", updated);
  };

  const handleDeleteCasting = (id: string) => {
    const updated = castingRecords.filter((r) => r.id !== id);
    setCastingRecords(updated);
    saveToStorage("gold_loss_casting", updated);
  };

  // Add Tree Casting record helper
  const handleAddTreeCasting = (record: Omit<TreeCastingRecord, "id" | "loss">) => {
    const computedLoss = record.inputWeight - (record.productionWeight + record.damagedWeight);
    const newRecord: TreeCastingRecord = {
      ...record,
      id: `tree-${Date.now()}`,
      loss: computedLoss,
    };
    const updated = [newRecord, ...treeCastingRecords];
    setTreeCastingRecords(updated);
    saveToStorage("gold_loss_tree_casting", updated);
  };

  const handleDeleteTreeCasting = (id: string) => {
    const updated = treeCastingRecords.filter((r) => r.id !== id);
    setTreeCastingRecords(updated);
    saveToStorage("gold_loss_tree_casting", updated);
  };

  // Add Rolling record helper
  const handleAddRolling = (record: Omit<RollingRecord, "id" | "loss">) => {
    const computedLoss = record.weightBefore - (record.weightAfter + (record.damagedWeight || 0));
    const newRecord: RollingRecord = {
      ...record,
      id: `roll-${Date.now()}`,
      loss: computedLoss,
    };
    const updated = [newRecord, ...rollingRecords];
    setRollingRecords(updated);
    saveToStorage("gold_loss_rolling", updated);
  };

  const handleDeleteRolling = (id: string) => {
    const updated = rollingRecords.filter((r) => r.id !== id);
    setRollingRecords(updated);
    saveToStorage("gold_loss_rolling", updated);
  };

  // Add Production record helper
  const handleAddProduction = (record: Omit<ProductionRecord, "id">) => {
    const newRecord: ProductionRecord = {
      ...record,
      id: `prod-${Date.now()}`,
    };
    const updated = [newRecord, ...productionRecords];
    setProductionRecords(updated);
    saveToStorage("gold_loss_production", updated);
  };

  const handleDeleteProduction = (id: string) => {
    const updated = productionRecords.filter((r) => r.id !== id);
    setProductionRecords(updated);
    saveToStorage("gold_loss_production", updated);
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const backup = {
      casting: castingRecords,
      treeCasting: treeCastingRecords,
      rolling: rollingRecords,
      production: productionRecords,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `دفتر_نقيصة_الذهب_نسخة_احتياطية_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.casting || parsed.treeCasting || parsed.rolling || parsed.production) {
            setCastingRecords(parsed.casting || []);
            setTreeCastingRecords(parsed.treeCasting || []);
            setRollingRecords(parsed.rolling || []);
            setProductionRecords(parsed.production || []);

            saveToStorage("gold_loss_casting", parsed.casting || []);
            saveToStorage("gold_loss_tree_casting", parsed.treeCasting || []);
            saveToStorage("gold_loss_rolling", parsed.rolling || []);
            saveToStorage("gold_loss_production", parsed.production || []);
            alert("تم استيراد النسخة الاحتياطية بنجاح وتحديث السجلات!");
          } else {
            alert("تنسيق الملف غير صحيح أو لا يحتوي على بنية تتبع فاقد الذهب");
          }
        } catch (error) {
          alert("فشل قراءة الملف، تأكد من اختيار ملف تصدير صحيح بامتداد .json");
        }
      };
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] flex flex-col font-sans" dir="rtl">
      {/* Premium Branded Header */}
      <Header
        onImportDemo={seedDemoLedger}
        onClearData={handleClearData}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        recordCount={{
          casting: castingRecords.length,
          treeCasting: treeCastingRecords.length,
          rolling: rollingRecords.length,
          production: productionRecords.length,
        }}
      />

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Premium Navigation Tabs bar */}
        <div className="flex bg-[#0f0f0f]/90 border border-[#222] rounded-2xl p-1 md:p-1.5 overflow-x-auto gap-1 sticky top-3 backdrop-blur-md z-30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] scrollbar-none">
          {/* Casting Tab */}
          <button
            onClick={() => setActiveTab("casting")}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 md:py-3.5 rounded-xl font-bold text-[11px] md:text-xs lg:text-sm whitespace-nowrap cursor-pointer transition-all duration-300 ${
              activeTab === "casting"
                ? "bg-gradient-to-r from-amber-500/20 to-yellow-600/10 text-[#C5A028] border border-amber-500/35 shadow-[0_0_15px_rgba(197,160,40,0.15)] font-extrabold"
                : "border border-transparent text-[#888] hover:text-[#fff] hover:bg-[#1a1a1a]/50"
            }`}
          >
            <ClipboardList className="w-4 h-4 text-[#C5A028]" />
            <span className="opacity-60 text-[10px] font-mono select-none">٠١.</span>
            <span>السبك والصهر</span>
          </button>

          {/* Tree Casting Tab */}
          <button
            onClick={() => setActiveTab("tree_casting")}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 md:py-3.5 rounded-xl font-bold text-[11px] md:text-xs lg:text-sm whitespace-nowrap cursor-pointer transition-all duration-300 ${
              activeTab === "tree_casting"
                ? "bg-gradient-to-r from-amber-500/20 to-yellow-600/10 text-[#C5A028] border border-amber-500/35 shadow-[0_0_15px_rgba(197,160,40,0.15)] font-extrabold"
                : "border border-transparent text-[#888] hover:text-[#fff] hover:bg-[#1a1a1a]/50"
            }`}
          >
            <TreePine className="w-4 h-4 text-[#C5A028]" />
            <span className="opacity-60 text-[10px] font-mono select-none">٠٢.</span>
            <span>صبة الشجرة بالصور</span>
          </button>

          {/* Rolling / Tabour Tab */}
          <button
            onClick={() => setActiveTab("rolling")}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 md:py-3.5 rounded-xl font-bold text-[11px] md:text-xs lg:text-sm whitespace-nowrap cursor-pointer transition-all duration-300 ${
              activeTab === "rolling"
                ? "bg-gradient-to-r from-amber-500/20 to-yellow-600/10 text-[#C5A028] border border-amber-500/35 shadow-[0_0_15px_rgba(197,160,40,0.15)] font-extrabold"
                : "border border-transparent text-[#888] hover:text-[#fff] hover:bg-[#1a1a1a]/50"
            }`}
          >
            <Layers className="w-4 h-4 text-[#C5A028]" />
            <span className="opacity-60 text-[10px] font-mono select-none">٠٣.</span>
            <span>التفجير والفاكيوم</span>
          </button>

          {/* Production Tab */}
          <button
            onClick={() => setActiveTab("production")}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 md:py-3.5 rounded-xl font-bold text-[11px] md:text-xs lg:text-sm whitespace-nowrap cursor-pointer transition-all duration-300 ${
              activeTab === "production"
                ? "bg-gradient-to-r from-amber-500/20 to-yellow-600/10 text-[#C5A028] border border-amber-500/35 shadow-[0_0_15px_rgba(197,160,40,0.15)] font-extrabold"
                : "border border-transparent text-[#888] hover:text-[#fff] hover:bg-[#1a1a1a]/50"
            }`}
          >
            <Award className="w-4 h-4 text-[#C5A028]" />
            <span className="opacity-60 text-[10px] font-mono select-none">٠٤.</span>
            <span>تسليم المشغولات النهائية</span>
          </button>

          {/* Analytics Overview Tab */}
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 md:py-3.5 rounded-xl font-bold text-[11px] md:text-xs lg:text-sm whitespace-nowrap cursor-pointer transition-all duration-300 mr-auto ${
              activeTab === "analytics"
                ? "bg-gradient-to-r from-rose-500/20 to-amber-500/10 text-rose-400 border border-rose-500/35 shadow-[0_0_15px_rgba(239,68,68,0.15)] font-extrabold"
                : "border border-transparent text-[#888] hover:text-rose-400 hover:bg-[#1a1a1a]/50"
            }`}
          >
            <TrendingDown className="w-4 h-4 text-rose-500" />
            <span className="opacity-60 text-[10px] font-mono select-none">٠٥.</span>
            <span>تتبع وجرد النقيصة الشامل</span>
          </button>
        </div>

        {/* Dynamic Tab Render with Slide-In animation layout container */}
        <div className="pt-2 animate-fadeIn">
          {activeTab === "casting" && (
            <CastingTab
              records={castingRecords}
              onAddRecord={handleAddCasting}
              onDeleteRecord={handleDeleteCasting}
            />
          )}

          {activeTab === "tree_casting" && (
            <TreeCastingTab
              records={treeCastingRecords}
              onAddRecord={handleAddTreeCasting}
              onDeleteRecord={handleDeleteTreeCasting}
            />
          )}

          {activeTab === "rolling" && (
            <RollingTab
              records={rollingRecords}
              onAddRecord={handleAddRolling}
              onDeleteRecord={handleDeleteRolling}
            />
          )}

          {activeTab === "production" && (
            <ProductionTab
              records={productionRecords}
              onAddRecord={handleAddProduction}
              onDeleteRecord={handleDeleteProduction}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsTab
              castingRecords={castingRecords}
              treeCastingRecords={treeCastingRecords}
              rollingRecords={rollingRecords}
              productionRecords={productionRecords}
            />
          )}
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="bg-[#0f0f0f] border-t border-[#2a2a2a] py-6 text-center text-xs text-[#555]">
        <p dir="rtl" className="max-w-7xl mx-auto px-4">
          نظام نقيصة الذهب المتكامل للورش والصياغة © {new Date().getFullYear()} - تم صياغة وتصميم النظام خصيصاً لتتبع وزن السبيكة، عيار الشغل، وعجز الدرفلة بدقة تامة.
        </p>
      </footer>
    </div>
  );
}
