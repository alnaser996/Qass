import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { CastingTab } from "./components/CastingTab";
import { TreeCastingTab } from "./components/TreeCastingTab";
import { RollingTab } from "./components/RollingTab";
import { ProductionTab } from "./components/ProductionTab";
import { AnalyticsTab } from "./components/AnalyticsTab";
import { CastingRecord, RollingRecord, ProductionRecord, TreeCastingRecord } from "./types";
import { Hammer, Layers, Award, TrendingDown, ClipboardList, TreePine, Flame, Wind, Wrench } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"casting" | "tree_casting" | "bombing" | "repair" | "vacuum" | "production" | "analytics">("casting");

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("gold_loss_theme") as "dark" | "light") || "dark";
  });

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("gold_loss_theme", nextTheme);
  };

  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark");
    } else {
      document.body.classList.remove("light-theme");
      document.body.classList.add("dark");
    }
  }, [theme]);

  // State arrays for registers
  const [castingRecords, setCastingRecords] = useState<CastingRecord[]>([]);
  const [treeCastingRecords, setTreeCastingRecords] = useState<TreeCastingRecord[]>([]);
  const [rollingRecords, setRollingRecords] = useState<RollingRecord[]>([]);
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Save changes to Netlify Blobs and local cache
  const saveToStorage = async (key: string, data: any) => {
    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, data }),
      });
      if (!res.ok) {
        console.error("فشل حفظ البيانات في السيرفر:", res.statusText);
      }
    } catch (err) {
      console.error("فشل الاتصال بالسيرفر لحفظ البيانات:", err);
    }
  };

  // Load data from Netlify Blobs with Local Storage fallback migration
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/data");
        if (!res.ok) {
          throw new Error("فشل تحميل البيانات من السيرفر");
        }
        const serverData = await res.json();

        const demoIds = ["cast-1", "cast-2", "tree-1", "roll-1", "roll-2", "roll-3", "prod-1", "prod-2"];

        // Check if there is data on the server
        const hasServerData =
          (serverData.casting && serverData.casting.length > 0) ||
          (serverData.treeCasting && serverData.treeCasting.length > 0) ||
          (serverData.rolling && serverData.rolling.length > 0) ||
          (serverData.production && serverData.production.length > 0);

        if (hasServerData) {
          setCastingRecords((serverData.casting || []).filter((r: any) => !demoIds.includes(r.id)));
          setTreeCastingRecords((serverData.treeCasting || []).filter((r: any) => !demoIds.includes(r.id)));
          setRollingRecords((serverData.rolling || []).filter((r: any) => !demoIds.includes(r.id)));
          setProductionRecords((serverData.production || []).filter((r: any) => !demoIds.includes(r.id)));
        } else {
          // Fallback to localStorage migration
          const savedCasting = localStorage.getItem("gold_loss_casting");
          const savedTreeCasting = localStorage.getItem("gold_loss_tree_casting");
          const savedRolling = localStorage.getItem("gold_loss_rolling");
          const savedProduction = localStorage.getItem("gold_loss_production");

          let finalCasting: CastingRecord[] = [];
          let finalTreeCasting: TreeCastingRecord[] = [];
          let finalRolling: RollingRecord[] = [];
          let finalProduction: ProductionRecord[] = [];

          if (savedCasting) {
            const parsed = JSON.parse(savedCasting);
            finalCasting = parsed.filter((r: any) => !demoIds.includes(r.id));
            setCastingRecords(finalCasting);
            await saveToStorage("gold_loss_casting", finalCasting);
          }
          if (savedTreeCasting) {
            const parsed = JSON.parse(savedTreeCasting);
            finalTreeCasting = parsed.filter((r: any) => !demoIds.includes(r.id));
            setTreeCastingRecords(finalTreeCasting);
            await saveToStorage("gold_loss_tree_casting", finalTreeCasting);
          }
          if (savedRolling) {
            try {
              const parsed = JSON.parse(savedRolling);
              if (Array.isArray(parsed)) {
                finalRolling = parsed.map((r: any) => {
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
                finalRolling = finalRolling.filter((r: any) => !demoIds.includes(r.id));
                setRollingRecords(finalRolling);
                await saveToStorage("gold_loss_rolling", finalRolling);
              }
            } catch (err) {
              console.error("Failed to migrate old rolling records:", err);
            }
          }
          if (savedProduction) {
            try {
              const parsed = JSON.parse(savedProduction);
              if (Array.isArray(parsed)) {
                finalProduction = parsed.map((r: any) => {
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
                finalProduction = finalProduction.filter((r: any) => !demoIds.includes(r.id));
                setProductionRecords(finalProduction);
                await saveToStorage("gold_loss_production", finalProduction);
              }
            } catch (err) {
              console.error("Failed to migrate old production records:", err);
            }
          }
        }
      } catch (err: any) {
        console.error("Error loading data:", err);
        setLoadError(err.message || "حدث خطأ غير متوقع أثناء تحميل البيانات");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
      saveToStorage("gold_loss_casting", []);
      saveToStorage("gold_loss_tree_casting", []);
      saveToStorage("gold_loss_rolling", []);
      saveToStorage("gold_loss_production", []);
      localStorage.removeItem("gold_loss_casting");
      localStorage.removeItem("gold_loss_tree_casting");
      localStorage.removeItem("gold_loss_rolling");
      localStorage.removeItem("gold_loss_production");
    }
  };

  // Add Casting record helper
  const handleAddCasting = (record: Omit<CastingRecord, "id" | "loss"> & { isPending?: boolean }) => {
    const computedLoss = record.isPending ? undefined : record.kar - (record.sabba ?? 0);
    const newRecord: CastingRecord = {
      ...record,
      id: `cast-${Date.now()}`,
      loss: computedLoss,
    };
    const updated = [newRecord, ...castingRecords];
    setCastingRecords(updated);
    saveToStorage("gold_loss_casting", updated);
  };

  const handleUpdateCasting = (
    id: string,
    kar: number,
    sabba?: number,
    notes?: string,
    afterImage?: string,
    date?: string,
    time?: string,
    varianceReason?: string
  ) => {
    const updated = castingRecords.map((r) => {
      if (r.id === id) {
        const updatedKar = kar;
        const updatedSabba = sabba;
        const computedLoss = updatedSabba !== undefined ? (updatedKar - updatedSabba) : undefined;
        return {
          ...r,
          kar: updatedKar,
          sabba: updatedSabba,
          loss: computedLoss,
          varianceReason: varianceReason !== undefined ? varianceReason : r.varianceReason,
          isPending: updatedSabba === undefined,
          notes: notes !== undefined ? notes : r.notes,
          afterImage: afterImage || r.afterImage,
          date: date || r.date,
          time: time || r.time,
        };
      }
      return r;
    });
    setCastingRecords(updated);
    saveToStorage("gold_loss_casting", updated);
  };

  const handleDeleteCasting = (id: string) => {
    const updated = castingRecords.filter((r) => r.id !== id);
    setCastingRecords(updated);
    saveToStorage("gold_loss_casting", updated);
  };

  // Add Tree Casting record helper
  const handleAddTreeCasting = (record: Omit<TreeCastingRecord, "id" | "loss"> & { isPending?: boolean }) => {
    const computedLoss = record.isPending ? undefined : record.inputWeight - ((record.productionWeight ?? 0) + (record.damagedWeight ?? 0));
    const newRecord: TreeCastingRecord = {
      ...record,
      id: `tree-${Date.now()}`,
      loss: computedLoss,
    };
    const updated = [newRecord, ...treeCastingRecords];
    setTreeCastingRecords(updated);
    saveToStorage("gold_loss_tree_casting", updated);
  };

  const handleUpdateTreeCasting = (
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
  ) => {
    const updated = treeCastingRecords.map((r) => {
      if (r.id === id) {
        const updatedInput = inputWeight;
        const updatedProd = productionWeight;
        const updatedDam = damagedWeight;
        let computedLoss = undefined;
        if (updatedProd !== undefined || updatedDam !== undefined) {
          computedLoss = updatedInput - ((updatedProd || 0) + (updatedDam || 0));
        }
        return {
          ...r,
          inputWeight: updatedInput,
          productionWeight: updatedProd,
          damagedWeight: updatedDam,
          productionCount: productionCount !== undefined ? productionCount : r.productionCount,
          productionDetails: productionDetails !== undefined ? productionDetails : r.productionDetails,
          damagedCount: damagedCount !== undefined ? damagedCount : r.damagedCount,
          damagedDetails: damagedDetails !== undefined ? damagedDetails : r.damagedDetails,
          loss: computedLoss,
          varianceReason: varianceReason !== undefined ? varianceReason : r.varianceReason,
          isPending: updatedProd === undefined && updatedDam === undefined,
          notes: notes !== undefined ? notes : r.notes,
          productionImage: productionImage || r.productionImage,
          damagedImage: damagedImage || r.damagedImage,
          afterImage: afterImage || productionImage || r.afterImage || r.productionImage,
          date: date || r.date,
          time: time || r.time,
        };
      }
      return r;
    });
    setTreeCastingRecords(updated);
    saveToStorage("gold_loss_tree_casting", updated);
  };

  const handleDeleteTreeCasting = (id: string) => {
    const updated = treeCastingRecords.filter((r) => r.id !== id);
    setTreeCastingRecords(updated);
    saveToStorage("gold_loss_tree_casting", updated);
  };

  // Add Rolling record helper
  const handleAddRolling = (record: Omit<RollingRecord, "id" | "loss"> & { isPending?: boolean }) => {
    const computedLoss = record.isPending ? undefined : record.weightBefore - ((record.weightAfter ?? 0) + (record.damagedWeight || 0));
    const newRecord: RollingRecord = {
      ...record,
      id: `roll-${Date.now()}`,
      loss: computedLoss,
    };
    const updated = [newRecord, ...rollingRecords];
    setRollingRecords(updated);
    saveToStorage("gold_loss_rolling", updated);
  };

  const handleUpdateRolling = (
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
    time?: string,
    varianceReason?: string
  ) => {
    const updated = rollingRecords.map((r) => {
      if (r.id === id) {
        const uBefore = weightBefore;
        const uAfter = weightAfter;
        const uDamaged = damagedWeight || 0;
        const computedLoss = uAfter !== undefined ? (uBefore - (uAfter + uDamaged)) : undefined;
        return {
          ...r,
          weightBefore: uBefore,
          weightAfter: uAfter,
          damagedWeight: damagedWeight,
          piecesCount: piecesCount !== undefined ? piecesCount : r.piecesCount,
          details: details !== undefined ? details : r.details,
          loss: computedLoss,
          varianceReason: varianceReason !== undefined ? varianceReason : r.varianceReason,
          isPending: uAfter === undefined,
          notes: notes !== undefined ? notes : r.notes,
          image: image || r.image,
          damagedImage: damagedImage || r.damagedImage,
          afterImage: afterImage || image || r.afterImage || r.image,
          date: date || r.date,
          time: time || r.time,
        };
      }
      return r;
    });
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

  const handleUpdateProduction = (
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
  ) => {
    const updated = productionRecords.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          finalWeight,
          piecesCount,
          details,
          receiverName,
          notes: notes !== undefined ? notes : r.notes,
          beforeImage: beforeImage || r.beforeImage,
          afterImage: afterImage || r.afterImage,
          date: date || r.date,
          time: time || r.time,
        };
      }
      return r;
    });
    setProductionRecords(updated);
    saveToStorage("gold_loss_production", updated);
  };

  const handleDeleteProduction = (id: string) => {
    const updated = productionRecords.filter((r) => r.id !== id);
    setProductionRecords(updated);
    saveToStorage("gold_loss_production", updated);
  };

  // ============================================
  // WORKFLOW AUTO-PROMOTION (AUTOMATIC TRANSITIONS)
  // ============================================

  const handlePromoteCastingToTree = (castingId: string) => {
    const cast = castingRecords.find(c => c.id === castingId);
    if (!cast || cast.isPending || !cast.sabba) {
      alert("العملية لم تكتمل بعد أو غير موجودة لترحيلها!");
      return;
    }
    const accumulatedImages = [cast.beforeImage, cast.afterImage].filter(Boolean) as string[];
    // Create new TreeCastingRecord as a pending first step
    const newTree: Omit<TreeCastingRecord, "id" | "loss"> & { isPending?: boolean } = {
      date: new Date().toISOString().substring(0, 10),
      time: new Date().toTimeString().substring(0, 5),
      inputWeight: cast.sabba,
      notes: `ترحيل تلقائي من سبيكة صب رقم (${cast.id}) - ملاحظة سابقة: ${cast.notes || "بلا"}`,
      isPending: true,
      beforeImage: cast.afterImage, // Pass the cast's after-image as the tree's before-image
      previousImages: accumulatedImages,
    };

    // Mark parent cast as promoted
    const updatedCasting = castingRecords.map(c => c.id === castingId ? { ...c, isPromoted: true } : c);
    setCastingRecords(updatedCasting);
    saveToStorage("gold_loss_casting", updatedCasting);

    handleAddTreeCasting(newTree);
    alert(`🚀 تم ترحيل السبيكة (وزن: ${cast.sabba.toFixed(3)}غ) كأرضية لـ "صب الشجرة" وتنزيلها بالكامل من جدول السبك!`);
  };

  const handlePromoteCastingToRolling = (castingId: string) => {
    const cast = castingRecords.find(c => c.id === castingId);
    if (!cast || cast.isPending || !cast.sabba) {
      alert("العملية لم تكتمل بعد أو غير موجودة لترحيلها!");
      return;
    }
    const accumulatedImages = [cast.beforeImage, cast.afterImage].filter(Boolean) as string[];
    // Create new RollingRecord as a pending first step
    const newRolling: Omit<RollingRecord, "id" | "loss"> & { isPending?: boolean } = {
      stageType: "bombing",
      date: new Date().toISOString().substring(0, 10),
      time: new Date().toTimeString().substring(0, 5),
      weightBefore: cast.sabba,
      details: `سَحْب ودرفلة سبيكة صخرية رقم (${cast.id})`,
      notes: `ترحيل تلقائي من سبيكة صب رقم (${cast.id})`,
      isPending: true,
      beforeImage: cast.afterImage,
      previousImages: accumulatedImages,
    };

    // Mark parent cast as promoted
    const updatedCasting = castingRecords.map(c => c.id === castingId ? { ...c, isPromoted: true } : c);
    setCastingRecords(updatedCasting);
    saveToStorage("gold_loss_casting", updatedCasting);

    handleAddRolling(newRolling);
    alert(`🚀 تم ترحيل السبيكة (وزن: ${cast.sabba.toFixed(3)}غ) كبداية تشغيل فرز تفجير وحوامض، وترحيلها من جدول السبك!`);
  };

  const handlePromoteTreeToRolling = (treeId: string) => {
    const tree = treeCastingRecords.find(t => t.id === treeId);
    if (!tree || tree.isPending || !tree.productionWeight) {
      alert("العملية غير صالحة للترحيل!");
      return;
    }
    const accumulatedImages = [
      ...(tree.previousImages || []),
      tree.beforeImage,
      tree.afterImage,
      tree.productionImage,
      tree.damagedImage,
    ].filter(Boolean) as string[];

    const newRolling: Omit<RollingRecord, "id" | "loss"> & { isPending?: boolean } = {
      stageType: "bombing",
      date: new Date().toISOString().substring(0, 10),
      time: new Date().toTimeString().substring(0, 5),
      weightBefore: tree.productionWeight,
      piecesCount: tree.productionCount,
      details: tree.productionDetails || "مشغولات شجرة مصبوبة",
      notes: `ترحيل تلقائي من إنتاج صب الشجرة رقم (${tree.id})`,
      isPending: true,
      beforeImage: tree.productionImage || tree.afterImage,
      previousImages: accumulatedImages,
    };

    // Mark parent tree as promoted
    const updatedTree = treeCastingRecords.map(t => t.id === treeId ? { ...t, isPromoted: true } : t);
    setTreeCastingRecords(updatedTree);
    saveToStorage("gold_loss_tree_casting", updatedTree);

    handleAddRolling(newRolling);
    alert(`🚀 تم ترحيل مشغولات الشجرة (وزن: ${tree.productionWeight.toFixed(3)}غ) لقسم التفجير، وترحيل الشجرة من جدول التشغيل!`);
  };

  const handlePromoteTreeToProduction = (treeId: string) => {
    const tree = treeCastingRecords.find(t => t.id === treeId);
    if (!tree || tree.isPending || !tree.productionWeight) {
      alert("العملية غير صالحة للترحيل!");
      return;
    }
    const accumulatedImages = [
      ...(tree.previousImages || []),
      tree.beforeImage,
      tree.afterImage,
      tree.productionImage,
      tree.damagedImage,
    ].filter(Boolean) as string[];

    const newProd: Omit<ProductionRecord, "id"> = {
      date: new Date().toISOString().substring(0, 10),
      time: new Date().toTimeString().substring(0, 5),
      finalWeight: tree.productionWeight,
      piecesCount: tree.productionCount || 1,
      details: tree.productionDetails || "مشغولات تصفية شجرة شمعية",
      receiverName: "أمين الصالة الرئيسي",
      notes: `ترحيل تلقائي ومباشر من صب الشجرة رقم (${tree.id})`,
      beforeImage: tree.beforeImage,
      afterImage: tree.productionImage || tree.afterImage,
      previousImages: accumulatedImages,
    };

    // Mark parent tree as promoted
    const updatedTree = treeCastingRecords.map(t => t.id === treeId ? { ...t, isPromoted: true } : t);
    setTreeCastingRecords(updatedTree);
    saveToStorage("gold_loss_tree_casting", updatedTree);

    handleAddProduction(newProd);
    alert(`🚀 تم تسليم الوجبة بنجاح للمعرض النهائي وحفظ كامل سجل الصور السابقة، وترحيلها من الشجرة!`);
  };

  const handlePromoteTreeScrapToCasting = (treeId: string) => {
    const tree = treeCastingRecords.find(t => t.id === treeId);
    if (!tree || tree.isPending || !tree.damagedWeight) {
      alert("لا يتوفر وزن تالف/رايش في هذه الشجرة لترحيله!");
      return;
    }
    // Promote the scrap back to casting so we can melt it again
    const newCast: Omit<CastingRecord, "id" | "loss"> & { isPending?: boolean } = {
      date: new Date().toISOString().substring(0, 10),
      time: new Date().toTimeString().substring(0, 5),
      kar: tree.damagedWeight,
      notes: `إرجاع رايش وتالف صب شمع الشجرة (${tree.id}) لإعادة الصهر والسبك المباشر`,
      isPending: true,
      beforeImage: tree.damagedImage,
    };
    handleAddCasting(newCast);
    alert(`♻️ تم ترحيل خردة وتالف الشجرة (وزن: ${tree.damagedWeight.toFixed(3)}غ) تلقائياً إلى "السبك والصهر" لإعادة تذويبه!`);
  };

  const handlePromoteRollingToProduction = (rollId: string) => {
    const roll = rollingRecords.find(r => r.id === rollId);
    if (!roll || roll.isPending || !roll.weightAfter) {
      alert("العملية غير صالحة للترحيل!");
      return;
    }
    const accumulatedImages = [
      ...(roll.previousImages || []),
      roll.beforeImage,
      roll.afterImage,
      roll.image,
      roll.damagedImage,
    ].filter(Boolean) as string[];

    const newProd: Omit<ProductionRecord, "id"> = {
      date: new Date().toISOString().substring(0, 10),
      time: new Date().toTimeString().substring(0, 5),
      finalWeight: roll.weightAfter,
      piecesCount: roll.piecesCount || 1,
      details: roll.details || "مشغولات مصفاة من الأحماض والسحب الفاخر",
      receiverName: "أمين الصالة الفني",
      notes: `ترحيل تلقائي من تفجير الأحماض رقم (${roll.id})`,
      beforeImage: roll.beforeImage,
      afterImage: roll.afterImage || roll.image,
      previousImages: accumulatedImages,
    };
    
    // Add production record
    handleAddProduction(newProd);

    // Update parent roll to isPromoted: true
    const updated = rollingRecords.map(r => r.id === rollId ? { ...r, isPromoted: true } : r);
    setRollingRecords(updated);
    saveToStorage("gold_loss_rolling", updated);

    alert(`🚀 تم تسليم الوجبة بنجاح للمعرض النهائي وحفظ كامل سجل الصور السابقة، وترحيلها من الحوامض والدرفلة!`);
  };

  const handlePromoteRollingScrapToCasting = (rollId: string) => {
    const roll = rollingRecords.find(r => r.id === rollId);
    if (!roll || roll.isPending || !roll.damagedWeight) {
      alert("لا يوجد تالف/رايش في هذه الوجبة لترحيله!");
      return;
    }
    const newCast: Omit<CastingRecord, "id" | "loss"> & { isPending?: boolean } = {
      date: new Date().toISOString().substring(0, 10),
      time: new Date().toTimeString().substring(0, 5),
      kar: roll.damagedWeight,
      notes: `إرجاع رايش وتالف وعجز السحب والتفجير (${roll.id}) لإعادة الصهر والسبك`,
      isPending: true,
      beforeImage: roll.damagedImage,
    };
    handleAddCasting(newCast);
    alert(`♻️ تم ترحيل رايش وتالف السحب والدرفلة (وزن: ${roll.damagedWeight.toFixed(3)}غ) تلقائياً لإعادة صهره وسبكه كسر من جديد!`);
  };

  const handlePromoteRollingToNextStage = (rollId: string) => {
    const roll = rollingRecords.find(r => r.id === rollId);
    if (!roll || roll.isPending || !roll.weightAfter) {
      alert("العملية غير صالحة للتحويل الفوري!");
      return;
    }

    let nextStage: "bombing" | "repair" | "vacuum" = "repair";
    let stageName = "";
    if (roll.stageType === "bombing") {
      nextStage = "repair";
      stageName = "🛠️ التصليح اليدوي";
    } else if (roll.stageType === "repair") {
      nextStage = "vacuum";
      stageName = "🌀 غلق الفاكيوم والبونزة";
    } else {
      alert("الوجبة في مرحلة غلق الفاكيوم والبونزة بالفعل! يمكنك ترحيلها لمعرض المشغولات النهائي.");
      return;
    }

    const accumulatedImages = [
      ...(roll.previousImages || []),
      roll.beforeImage,
      roll.afterImage,
      roll.image,
      roll.damagedImage,
    ].filter(Boolean) as string[];

    const newRolling: Omit<RollingRecord, "id" | "loss"> & { isPending?: boolean } = {
      stageType: nextStage,
      date: new Date().toISOString().substring(0, 10),
      time: new Date().toTimeString().substring(0, 5),
      weightBefore: roll.weightAfter, // Same batch flow
      piecesCount: roll.piecesCount,
      details: roll.details ? `تابع للمسار رقم (${roll.id}) - ${roll.details}` : `تابع للمسار رقم (${roll.id})`,
      notes: `ترحيل وتسلسل تلقائي لنفس الوجبة من مرحلة ${roll.stageType === "bombing" ? "التفجير والأحماض" : "التصليح اليدوي"}`,
      isPending: true,
      beforeImage: roll.afterImage || roll.image,
      previousImages: accumulatedImages,
    };

    // Mark parent as isPromoted: true and add the new stage row in one atomic update
    const updatedWithPromote = rollingRecords.map(r => r.id === rollId ? { ...r, isPromoted: true } : r);
    const computedLoss = newRolling.isPending ? undefined : newRolling.weightBefore - ((newRolling.weightAfter ?? 0) + (newRolling.damagedWeight || 0));
    const newRecord: RollingRecord = {
      ...newRolling,
      id: `roll-${Date.now()}`,
      loss: computedLoss,
    };
    const updated = [newRecord, ...updatedWithPromote];
    setRollingRecords(updated);
    saveToStorage("gold_loss_rolling", updated);

    alert(`🚀 تم تحويل الوجبة بنجاح وبشكل متسلسل لمرحلة (${stageName}) بقيمة وزن مدخل (${roll.weightAfter.toFixed(3)}غ)!`);
  };

  const handlePromoteRollingSplitStage = (
    rollId: string,
    repairWeight: number,
    repairPieces: number,
    vacuumWeight: number,
    vacuumPieces: number,
    repairImage?: string,
    vacuumImage?: string,
    splitMainImage?: string
  ) => {
    const roll = rollingRecords.find(r => r.id === rollId);
    if (!roll || roll.isPending || !roll.weightAfter) {
      alert("العملية غير صالحة للتجزئة!");
      return;
    }

    const accumulatedImages = [
      ...(roll.previousImages || []),
      roll.beforeImage,
      roll.afterImage,
      roll.image,
      roll.damagedImage,
      splitMainImage,
    ].filter(Boolean) as string[];

    const itemsAddedMsg: string[] = [];
    const newRecordsToAdd: RollingRecord[] = [];

    // Add Repair segment if there's any weight
    if (repairWeight > 0) {
      const newRepair: RollingRecord = {
        id: `roll-rep-${Date.now()}`,
        stageType: "repair",
        date: new Date().toISOString().substring(0, 10),
        time: new Date().toTimeString().substring(0, 5),
        weightBefore: repairWeight,
        piecesCount: repairPieces,
        details: roll.details ? `جزء للتصليح - مفرع من وجبة (${roll.id}) - ${roll.details}` : `جزء للتصليح - مفرع من وجبة (${roll.id})`,
        notes: `تجزئة تلقائية لقطع تحتاج تصليح من وجبة التفجير (${roll.id})`,
        isPending: true,
        beforeImage: repairImage || splitMainImage || roll.afterImage || roll.image,
        previousImages: accumulatedImages,
        loss: undefined,
      };
      newRecordsToAdd.push(newRepair);
      itemsAddedMsg.push(`(${repairWeight.toFixed(3)}غ) بعدد (${repairPieces} قطع) لمرحلة التصليح اليدوي 🛠️`);
    }

    // Add Vacuum segment if there's any weight
    if (vacuumWeight > 0) {
      const newVacuum: RollingRecord = {
        id: `roll-vac-${Date.now() + 1}`,
        stageType: "vacuum",
        date: new Date().toISOString().substring(0, 10),
        time: new Date().toTimeString().substring(0, 5),
        weightBefore: vacuumWeight,
        piecesCount: vacuumPieces,
        details: roll.details ? `جزء للفاكيوم - مفرع من وجبة (${roll.id}) - ${roll.details}` : `جزء للفاكيوم - مفرع من وجبة (${roll.id})`,
        notes: `تجزئة تلقائية لقطع جاهزة مباشرة من وجبة التفجير (${roll.id})`,
        isPending: true,
        beforeImage: vacuumImage || splitMainImage || roll.afterImage || roll.image,
        previousImages: accumulatedImages,
        loss: undefined,
      };
      newRecordsToAdd.push(newVacuum);
      itemsAddedMsg.push(`(${vacuumWeight.toFixed(3)}غ) بعدد (${vacuumPieces} قطع) لمرحلة الفاكيوم وبونزة 🌀`);
    }

    // Mark parent as isPromoted: true, and assign the splitMainImage to its afterImage
    const updatedWithPromote = rollingRecords.map(r => {
      if (r.id === rollId) {
        return { 
          ...r, 
          isPromoted: true,
          afterImage: splitMainImage || r.afterImage || r.image
        };
      }
      return r;
    });
    const updated = [...newRecordsToAdd, ...updatedWithPromote];
    setRollingRecords(updated);
    saveToStorage("gold_loss_rolling", updated);

    alert(`🚀 تم تفرعة وتقسيم الوجبة بنجاح:
` + itemsAddedMsg.map(m => ` • ${m}`).join("\n"));
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

  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme === "light" ? "bg-[#f5f5f7] text-[#1d1d1f]" : "bg-[#0a0a0a] text-[#e0e0e0]"} flex flex-col items-center justify-center font-sans`} dir="rtl">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-amber-500/20 border-t-[#C5A028] rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-[#C5A028] animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#C5A028]">جاري تحميل السجلات من السحابة...</h2>
            <p className="text-xs text-gray-500 mt-2 font-mono">Netlify Blobs Storage</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === "light" ? "bg-[#f5f5f7] text-[#1d1d1f]" : "bg-[#0a0a0a] text-[#e0e0e0]"} flex flex-col font-sans transition-colors duration-200`} dir="rtl">
      {/* Premium Branded Header */}
      <Header
        onImportDemo={seedDemoLedger}
        onClearData={handleClearData}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        theme={theme}
        onToggleTheme={toggleTheme}
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

          {/* Bombing (Acids) Tab */}
          <button
            onClick={() => setActiveTab("bombing")}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 md:py-3.5 rounded-xl font-bold text-[11px] md:text-xs lg:text-sm whitespace-nowrap cursor-pointer transition-all duration-300 ${
              activeTab === "bombing"
                ? "bg-gradient-to-r from-amber-500/20 to-yellow-600/10 text-[#C5A028] border border-amber-500/35 shadow-[0_0_15px_rgba(197,160,40,0.15)] font-extrabold"
                : "border border-transparent text-[#888] hover:text-[#fff] hover:bg-[#1a1a1a]/50"
            }`}
          >
            <Flame className="w-4 h-4 text-[#C5A028]" />
            <span className="opacity-60 text-[10px] font-mono select-none">٠٣.</span>
            <span>التفجير والأحماض 💥</span>
          </button>

          {/* Repair (Manual Repair) Tab */}
          <button
            onClick={() => setActiveTab("repair")}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 md:py-3.5 rounded-xl font-bold text-[11px] md:text-xs lg:text-sm whitespace-nowrap cursor-pointer transition-all duration-300 ${
              activeTab === "repair"
                ? "bg-gradient-to-r from-amber-500/20 to-yellow-600/10 text-[#C5A028] border border-amber-500/35 shadow-[0_0_15px_rgba(197,160,40,0.15)] font-extrabold"
                : "border border-transparent text-[#888] hover:text-[#fff] hover:bg-[#1a1a1a]/50"
            }`}
          >
            <Wrench className="w-4 h-4 text-[#C5A028]" />
            <span className="opacity-60 text-[10px] font-mono select-none">٠٤.</span>
            <span>التصليح اليدوي 🛠️</span>
          </button>

          {/* Vacuum Tab */}
          <button
            onClick={() => setActiveTab("vacuum")}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 md:py-3.5 rounded-xl font-bold text-[11px] md:text-xs lg:text-sm whitespace-nowrap cursor-pointer transition-all duration-300 ${
              activeTab === "vacuum"
                ? "bg-gradient-to-r from-amber-500/20 to-yellow-600/10 text-[#C5A028] border border-amber-500/35 shadow-[0_0_15px_rgba(197,160,40,0.15)] font-extrabold"
                : "border border-transparent text-[#888] hover:text-[#fff] hover:bg-[#1a1a1a]/50"
            }`}
          >
            <Wind className="w-4 h-4 text-[#C5A028]" />
            <span className="opacity-60 text-[10px] font-mono select-none">٠٥.</span>
            <span>الفاكيوم والبونزة 🌀</span>
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
            <span className="opacity-60 text-[10px] font-mono select-none">٠٦.</span>
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
            <span className="opacity-60 text-[10px] font-mono select-none">٠٧.</span>
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
              onUpdateRecord={handleUpdateCasting}
            />
          )}

          {activeTab === "tree_casting" && (
            <TreeCastingTab
              records={treeCastingRecords}
              onAddRecord={handleAddTreeCasting}
              onDeleteRecord={handleDeleteTreeCasting}
              onUpdateRecord={handleUpdateTreeCasting}
            />
          )}

          {activeTab === "bombing" && (
            <RollingTab
              mode="bombing"
              records={rollingRecords}
              onAddRecord={handleAddRolling}
              onDeleteRecord={handleDeleteRolling}
              onUpdateRecord={handleUpdateRolling}
              onPromoteToNextStage={handlePromoteRollingToNextStage}
              onPromoteToProduction={handlePromoteRollingToProduction}
              onPromoteScrapToCasting={handlePromoteRollingScrapToCasting}
              onPromoteSplitStage={handlePromoteRollingSplitStage}
            />
          )}

          {activeTab === "repair" && (
            <RollingTab
              mode="repair"
              records={rollingRecords}
              onAddRecord={handleAddRolling}
              onDeleteRecord={handleDeleteRolling}
              onUpdateRecord={handleUpdateRolling}
              onPromoteToNextStage={handlePromoteRollingToNextStage}
              onPromoteToProduction={handlePromoteRollingToProduction}
              onPromoteScrapToCasting={handlePromoteRollingScrapToCasting}
              onPromoteSplitStage={handlePromoteRollingSplitStage}
            />
          )}

          {activeTab === "vacuum" && (
            <RollingTab
              mode="vacuum"
              records={rollingRecords}
              onAddRecord={handleAddRolling}
              onDeleteRecord={handleDeleteRolling}
              onUpdateRecord={handleUpdateRolling}
              onPromoteToNextStage={handlePromoteRollingToNextStage}
              onPromoteToProduction={handlePromoteRollingToProduction}
              onPromoteScrapToCasting={handlePromoteRollingScrapToCasting}
              onPromoteSplitStage={handlePromoteRollingSplitStage}
            />
          )}

          {activeTab === "production" && (
            <ProductionTab
              records={productionRecords}
              onAddRecord={handleAddProduction}
              onDeleteRecord={handleDeleteProduction}
              onUpdateRecord={handleUpdateProduction}
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
