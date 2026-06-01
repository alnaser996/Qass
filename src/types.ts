export interface CastingRecord {
  id: string;
  date: string;
  time?: string; // Time of the operation (e.g., "14:30")
  kar: number; // Raw material gold (الكر / الكسر عيار 21)
  sabba: number; // Cast gold ingot (الصبة السبيكة)
  loss: number; // Melt loss (عجز/نقص أو زيادة = كر - صبة)
  notes?: string;
}

export interface TreeCastingRecord {
  id: string;
  date: string;
  time?: string; // Time of the operation (e.g., "14:30")
  inputWeight: number; // الذهب المدخل للشجرة (غرام)
  productionWeight: number; // وزن الإنتاج الصافي (غرام)
  damagedWeight: number; // وزن التالف / الخردة (غرام)
  loss: number; // النقص أو الزيادة = الذهب المدخل - (الإنتاج + التالف)
  productionCount: number; // عدد قطع الإنتاج
  productionDetails: string; // تفاصيل قطع الإنتاج
  productionImage?: string; // صورة قطع الإنتاج (base64)
  damagedCount: number; // عدد قطع التالف
  damagedDetails: string; // تفاصيل قطع التالف
  damagedImage?: string; // صورة قطع التالف (base64)
  notes?: string;
}

export interface RollingRecord {
  id: string;
  stageType: "bombing" | "repair" | "vacuum";
  date: string; // تاريخ العملية
  time?: string; // وقت العملية
  weightBefore: number; // الوزن قبل العملية
  weightAfter: number; // الوزن بعد العملية
  loss: number; // العجز = قبل - (بعد + التالف)
  damagedWeight?: number; // وزن التالف إن وجد
  damagedImage?: string; // صورة التالف
  piecesCount: number; // عدد القطع
  details: string; // تفاصيل أو موصفات
  image?: string; // صورة العملية/القطع المصاحبة
  notes?: string; // ملاحظات عامة
}

export interface ProductionRecord {
  id: string;
  date: string; // تاريخ عملية التسغيل وتسليم الإنتاج
  time?: string; // وقت تسليم الإنتاج
  finalWeight: number; // الوزن النهائي المنتج الكامل
  piecesCount: number; // عدد القطع المنتجة
  details: string; // تفاصيل المشغولات والإنتاج
  receiverName: string; // اسم الموظف المستلم للإنتاج الجاهز أو الكامل
  image?: string; // صورة الإنتاج الكامل (base64)
  notes?: string; // ملاحظات عامة أو توثيقية
}

export interface FilterParams {
  startDate: string;
  endDate: string;
  searchQuery: string;
}
