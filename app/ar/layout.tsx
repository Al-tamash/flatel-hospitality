import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ضيافة فلاتيل — الشقق الفندقية المفروشة في حيدر أباد",
  description:
    "ضيافة فلاتيل الخاصة المحدودة — راحة الشقة الخاصة مع خدمة وفخامة الفندق. شقق فاخرة مفروشة بالكامل في باركاس سلالة ومغل بورا، حيدر أباد.",
};

export default function ArabicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="rtl" lang="ar" className="font-arabic min-h-screen text-right">
      {children}
    </div>
  );
}
