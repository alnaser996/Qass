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
    time?: string
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
    time?: string
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
    time?: string
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
    // Create new TreeCastingRecord as a pending first step
    const newTree: Omit<TreeCastingRecord, "id" | "loss"> & { isPending?: boolean } = {
      date: new Date().toISOString().substring(0, 10),
      time: new Date().toTimeString().substring(0, 5),
      inputWeight: cast.sabba,
      notes: `ترحيل تلقائي من سبيكة صب رقم (${cast.id}) - ملاحظة سابقة: ${cast.notes || "بلا"}`,
      isPending: true,
      beforeImage: cast.afterImage, // Pass the cast's after-image as the tree's before-image
    };
    handleAddTreeCasting(newTree);
    setActiveTab("tree_casting");
    alert(`🚀 تم ترحيل السبيكة (وزن: ${cast.sabba.toFixed(3)}غ) كأرضية لـ "صب الشجرة" تلقائياً بنجاح!`);
  };

  const handlePromoteCastingToRolling = (castingId: string) => {
    const cast = castingRecords.find(c => c.id === castingId);
    if (!cast || cast.isPending || !cast.sabba) {
      alert("العملية لم تكتمل بعد أو غير موجودة لترحيلها!");
      return;
    }
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
    };
    handleAddRolling(newRolling);
    setActiveTab("rolling");
    alert(`🚀 تم ترحيل السبيكة (وزن: ${cast.sabba.toFixed(3)}غ) إلى قسم "التفجير والفاكيوم" تلقائياً بنجاح!`);
  };

  const handlePromoteTreeToRolling = (treeId: string) => {
    const tree = treeCastingRecords.find(t => t.id === treeId);
    if (!tree || tree.isPending || !tree.productionWeight) {
      alert("العملية غير صالحة للترحيل!");
      return;
    }
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
    };
    handleAddRolling(newRolling);
    setActiveTab("rolling");
    alert(`🚀 تم ترحيل المشغولات الصالحة (وزن: ${tree.productionWeight.toFixed(3)}غ) تلقائياً إلى معالجة "التحميض والفاكيوم" بنجاح!`);
  };

  const handlePromoteTreeToProduction = (treeId: string) => {
    const tree = treeCastingRecords.find(t => t.id === treeId);
    if (!tree || tree.isPending || !tree.productionWeight) {
      alert("العملية غير صالحة للترحيل!");
      return;
    }
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
    };
    handleAddProduction(newProd);
    setActiveTab("production");
    alert(`🚀 تم ترحيل وتأكيد تسليم المشغولات (وزن: ${tree.productionWeight.toFixed(3)}غ) كمنتج فاخر جاهز للعرض!`);
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
    setActiveTab("casting");
    alert(`♻️ تم ترحيل خردة وتالف الشجرة (وزن: ${tree.damagedWeight.toFixed(3)}غ) تلقائياً إلى "السبك والصهر" لإعادة تذويبه!`);
  };

  const handlePromoteRollingToProduction = (rollId: string) => {
    const roll = rollingRecords.find(r => r.id === rollId);
    if (!roll || roll.isPending || !roll.weightAfter) {
      alert("العملية غير صالحة للترحيل!");
      return;
    }
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
    };
    
    // Add production record
    handleAddProduction(newProd);

    // Update parent roll to isPromoted: true
    const updated = rollingRecords.map(r => r.id === rollId ? { ...r, isPromoted: true } : r);
    setRollingRecords(updated);
    saveToStorage("gold_loss_rolling", updated);

    setActiveTab("production");
    alert(`🚀 تم ترحيل وتجهيز تسليم الوجبة المصفاة (وزن: ${roll.weightAfter.toFixed(3)}غ) إلى المعرض النهائي وحساب المخرجات!`);
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
    setActiveTab("casting");
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
    vacuumImage?: string
  ) => {
    const roll = rollingRecords.find(r => r.id === rollId);
    if (!roll || roll.isPending || !roll.weightAfter) {
      alert("العملية غير صالحة للتجزئة!");
      return;
    }

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
        beforeImage: repairImage || roll.afterImage || roll.image,
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
        beforeImage: vacuumImage || roll.afterImage || roll.image,
        loss: undefined,
      };
      newRecordsToAdd.push(newVacuum);
      itemsAddedMsg.push(`(${vacuumWeight.toFixed(3)}غ) بعدد (${vacuumPieces} قطع) لمرحلة الفاكيوم وبونزة 🌀`);
    }

    // Mark parent as isPromoted: true and add the new split records
    const updatedWithPromote = rollingRecords.map(r => r.id === rollId ? { ...r, isPromoted: true } : r);
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
              onUpdateRecord={handleUpdateCasting}
              onPromoteToTree={handlePromoteCastingToTree}
              onPromoteToRolling={handlePromoteCastingToRolling}
            />
          )}

          {activeTab === "tree_casting" && (
            <TreeCastingTab
              records={treeCastingRecords}
              onAddRecord={handleAddTreeCasting}
              onDeleteRecord={handleDeleteTreeCasting}
              onUpdateRecord={handleUpdateTreeCasting}
              onPromoteToRolling={handlePromoteTreeToRolling}
              onPromoteToProduction={handlePromoteTreeToProduction}
              onPromoteScrapToCasting={handlePromoteTreeScrapToCasting}
            />
          )}

          {activeTab === "rolling" && (
            <RollingTab
              records={rollingRecords}
              onAddRecord={handleAddRolling}
              onDeleteRecord={handleDeleteRolling}
              onUpdateRecord={handleUpdateRolling}
              onPromoteToProduction={handlePromoteRollingToProduction}
              onPromoteScrapToCasting={handlePromoteRollingScrapToCasting}
              onPromoteToNextStage={handlePromoteRollingToNextStage}
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
