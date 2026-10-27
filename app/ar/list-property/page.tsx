"use client";

import * as React from "react";
import {
  TrendingUp,
  ShieldCheck,
  Send,
  Key,
  BadgeCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WHATSAPP_CONFIG } from "@/lib/constants";

export default function ArabicListPropertyPage() {
  const [formData, setFormData] = React.useState({
    fullName: "",
    phone: "",
    email: "",
    location: "",
    flatType: "2bhk",
    furnishingStatus: "fully-furnished",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const inquiryText = `مرحباً فريق تطوير واستحواذ العقارات في فلاتيل، أود عرض عقاري للانضمام إلى شبكة شقق فلاتيل الفندقية:
- الاسم: ${formData.fullName}
- الجوال: ${formData.phone}
- البريد: ${formData.email || "غير متوفر"}
- موقع العقار: ${formData.location}
- نوع وحجم الشقة: ${formData.flatType.toUpperCase()}
- حالة التأثيث: ${formData.furnishingStatus}
- ملاحظات إضافية: ${formData.message || "العقار جاهز للمعاينة"}`;

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      const url = WHATSAPP_CONFIG.getUrl(inquiryText);
      window.open(url, "_blank", "noopener,noreferrer");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0E0A07] text-[#FAF4EB] flex flex-col selection:bg-[#E5C178]/20 selection:text-[#E5C178] font-arabic">
      <SiteHeader />

      <main className="flex-1 w-full py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="text-xs sm:text-sm font-sans font-semibold tracking-[0.16em] text-[#E5C178] uppercase">
              شراكة استثمارية موثوقة
            </span>
            <h1 className="font-heading text-3xl sm:text-5xl text-[#FAF4EB] font-medium leading-tight">
              سجّل عقارك مع ضيافة فلاتيل
            </h1>
            <p className="text-sm sm:text-base text-[#D4C4B3] max-w-xl mx-auto leading-relaxed">
              حوّل شقتك أو عقارك في حيدr أباد إلى استثمار فندقي مربح ومستمر مع أعلى معايير الصيانة والتشغيل الاحترافي.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#16100B] border border-[rgba(212,163,89,0.25)] space-y-3">
              <TrendingUp className="w-8 h-8 text-[#E5C178]" />
              <h3 className="font-heading text-lg font-bold text-[#FAF4EB]">عوائد إيجارية مرتفعة</h3>
              <p className="text-xs sm:text-sm text-[#D4C4B3] leading-relaxed">
                استفد من الطلب العالي من الزوار، العائلات، والضيوف القادمين للعلاج الطبي بعوائد تفوق الإيجار السكني العادي.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#16100B] border border-[rgba(212,163,89,0.25)] space-y-3">
              <ShieldCheck className="w-8 h-8 text-[#E5C178]" />
              <h3 className="font-heading text-lg font-bold text-[#FAF4EB]">حماية وصيانة مستمرة</h3>
              <p className="text-xs sm:text-sm text-[#D4C4B3] leading-relaxed">
                نحافظ على أصول عقارك عبر التنظيف الدوري الاحترافي والصيانة الفورية لأي أعطال مع فحص دوري شامل.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#16100B] border border-[rgba(212,163,89,0.25)] space-y-3">
              <Key className="w-8 h-8 text-[#E5C178]" />
              <h3 className="font-heading text-lg font-bold text-[#FAF4EB]">إدارة تشغيلية متكاملة</h3>
              <p className="text-xs sm:text-sm text-[#D4C4B3] leading-relaxed">
                نتولى كافة تفاصيل التسويق، الاستقبال، تسجيل الدخول، وتحصيل المدفوعات دون أي عناء من طرفكم.
              </p>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="rounded-2xl border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.85)] backdrop-blur-md p-6 sm:p-10 shadow-2xl">
            <h2 className="font-heading text-2xl font-bold text-[#FAF4EB] mb-2 text-center">
              نموذج تسجيل بيانات العقار
            </h2>
            <p className="text-xs sm:text-sm text-[#B8A692] text-center mb-8">
              املأ البيانات التالية وسيقوم فريق الاستحواذ والتطوير بالتواصل معكم لتحديد موعد المعاينة.
            </p>

            {isSubmitted ? (
              <div className="p-8 text-center space-y-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <BadgeCheck className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="font-heading text-2xl text-[#FAF4EB] font-bold">شكراً لاهتمامكم</h3>
                <p className="text-sm text-[#D4C4B3] max-w-md mx-auto">
                  تم إرسال بيانات عقاركم بنجاح إلى فريق الاستحواذ والتطوير وسنتواصل معكم خلال ٢٤ ساعة.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#E5C178] block">الاسم الكامل *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="أدخل اسمكم الكريم"
                      className="w-full px-4 py-3 rounded-xl bg-[#16100B] border border-[rgba(212,163,89,0.28)] text-sm text-[#FAF4EB] placeholder-[#B8A692]/40 focus:outline-none focus:border-[#E5C178]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#E5C178] block">رقم الجوال للتواصل *</label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 / +966..."
                      className="w-full px-4 py-3 rounded-xl bg-[#16100B] border border-[rgba(212,163,89,0.28)] text-sm text-[#FAF4EB] placeholder-[#B8A692]/40 focus:outline-none focus:border-[#E5C178] text-right"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#E5C178] block">موقع وعنوان العقار في حيدر أباد *</label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="مثال: باركاس، مغل بورا، تشاندريانغوتا..."
                      className="w-full px-4 py-3 rounded-xl bg-[#16100B] border border-[rgba(212,163,89,0.28)] text-sm text-[#FAF4EB] placeholder-[#B8A692]/40 focus:outline-none focus:border-[#E5C178]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#E5C178] block">حجم وتكوين الشقة *</label>
                    <select
                      value={formData.flatType}
                      onChange={(e) => setFormData({ ...formData, flatType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#16100B] border border-[rgba(212,163,89,0.28)] text-sm text-[#FAF4EB] focus:outline-none focus:border-[#E5C178]"
                    >
                      <option value="1bhk">غرفة وصالة (1 BHK)</option>
                      <option value="2bhk">غرفتان وصالة (2 BHK)</option>
                      <option value="3bhk">٣ غرف وصالة (3 BHK)</option>
                      <option value="4bhk">٤ غرف وصالة (4 BHK)</option>
                      <option value="building">مبنى شقق مفروشة كامل</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#E5C178] block">ملاحظات أو مواصفات إضافية</label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="أي تفاصيل خاصة ترغبون في إضافتها (التكييف، المصعد، مواقف السيارات...)"
                    className="w-full px-4 py-3 rounded-xl bg-[#16100B] border border-[rgba(212,163,89,0.28)] text-sm text-[#FAF4EB] placeholder-[#B8A692]/40 focus:outline-none focus:border-[#E5C178]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold text-sm shadow-md hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "جاري الإرسال..." : "إرسال طلب تسجيل العقار"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
