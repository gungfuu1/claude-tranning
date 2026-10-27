import type { AboutContent } from "@/lib/about";

// Content for /about (spec: docs/002-about-page.spec.md). Sample text until the training center confirms it.
// Rules are enforced by aboutContentSchema in src/lib/about.ts; `npm test` fails on a malformed edit.
// AB-04: when you change any number in `stats`, update `stats.asOf` to the date the numbers were taken.
export const aboutContent: AboutContent = {
  name: "ศูนย์อบรมออนไลน์ การไฟฟ้าส่วนภูมิภาค",
  description: "พัฒนาทักษะบุคลากรด้านระบบไฟฟ้าและพลังงาน ด้วยหลักสูตรออนไลน์ที่เรียนได้ทุกที่ทุกเวลา พร้อมใบประกาศที่ตรวจสอบได้",
  vision: "เป็นศูนย์กลางการเรียนรู้ด้านพลังงานไฟฟ้าที่ทุกคนเข้าถึงได้ และสร้างบุคลากรที่พร้อมรับการเปลี่ยนแปลงของอุตสาหกรรม",
  missions: [
    "พัฒนาหลักสูตรที่ตรงกับงานจริงของการไฟฟ้าและภาคอุตสาหกรรม",
    "ส่งเสริมความปลอดภัยในการปฏิบัติงานด้านระบบไฟฟ้า",
    "เปิดโอกาสให้บุคคลภายนอกเรียนรู้ด้านพลังงานอย่างเท่าเทียม",
    "รับรองผลการเรียนด้วยใบประกาศที่ตรวจสอบได้",
  ],
  benefits: [
    {
      title: "เรียนได้ทุกที่ทุกเวลา",
      description: "วิดีโอบทเรียนเปิดดูได้ตลอด 24 ชั่วโมงทั้งบนคอมพิวเตอร์และมือถือ เรียนต่อจากจุดเดิมได้ทันที",
    },
    {
      title: "เนื้อหาจากผู้เชี่ยวชาญ",
      description: "หลักสูตรออกแบบโดยวิศวกรและผู้ปฏิบัติงานจริงของการไฟฟ้าส่วนภูมิภาค อ้างอิงมาตรฐานความปลอดภัยล่าสุด",
    },
    {
      title: "ใบประกาศที่ตรวจสอบได้",
      description: "ผ่านแบบทดสอบหลังเรียนแล้วรับใบประกาศนียบัตรพร้อมลิงก์ตรวจสอบ ใช้ยื่นหน่วยงานต้นสังกัดได้",
    },
  ],
  foundedYearBE: 2560,
  stats: {
    courses: 48,
    learners: 12500,
    certificates: 9830,
    asOf: "2026-09-30",
  },
  contact: {
    address: "200 ถนนงามวงศ์วาน แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900",
    phone: "021234567",
    email: "training@example.com",
    hours: "จันทร์–ศุกร์ 08:30–16:30 น. (เว้นวันหยุดราชการ)",
  },
};
