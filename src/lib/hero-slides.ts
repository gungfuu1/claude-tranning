export type HeroSlide = {
  id: string;
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  cta: { label: string; href: string };
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=2000&q=80`;

// Fake data — swap for CMS/DB content later.
export const heroSlides: HeroSlide[] = [
  {
    id: "grid",
    image: unsplash("1473341304170-971dccb5ac1e"),
    alt: "เสาส่งไฟฟ้าแรงสูงยามพระอาทิตย์ตก",
    eyebrow: "เปิดรับสมัครรอบใหม่ ปีงบประมาณ 2570",
    title: "พัฒนาทักษะคนไฟฟ้า",
    highlight: "สู่อนาคตพลังงาน",
    description:
      "หลักสูตรอบรมจากการไฟฟ้าส่วนภูมิภาค ครอบคลุมงานระบบไฟฟ้า ความปลอดภัย พลังงานทดแทน และเทคโนโลยีดิจิทัล",
    cta: { label: "ดูหลักสูตรล่าสุด", href: "#courses" },
  },
  {
    id: "safety",
    image: unsplash("1621905251189-08b45d6a269e"),
    alt: "ช่างไฟฟ้าสวมหมวกนิรภัยกำลังตรวจสอบตู้ไฟ",
    eyebrow: "หลักสูตรความปลอดภัย",
    title: "ปฏิบัติงานอย่างมั่นใจ",
    highlight: "ปลอดภัยทุกขั้นตอน",
    description:
      "เรียนรู้มาตรฐานความปลอดภัยงานไฟฟ้าแรงสูงและแรงต่ำ จากวิทยากรผู้มีประสบการณ์ภาคสนาม",
    cta: { label: "ดูหลักสูตรความปลอดภัย", href: "#categories" },
  },
  {
    id: "solar",
    image: unsplash("1509391366360-2e959784a276"),
    alt: "แผงโซลาร์เซลล์กลางทุ่งหญ้า",
    eyebrow: "พลังงานทดแทน",
    title: "ก้าวทันพลังงานสะอาด",
    highlight: "Solar & Smart Energy",
    description:
      "ออกแบบ ติดตั้ง และตรวจสอบระบบ Solar Rooftop พร้อมความรู้ด้านการเชื่อมต่อโครงข่ายไฟฟ้า",
    cta: { label: "ดูหลักสูตรพลังงานทดแทน", href: "#categories" },
  },
  {
    id: "classroom",
    image: unsplash("1524178232363-1fb2b075b655"),
    alt: "ผู้เข้าอบรมในห้องเรียน",
    eyebrow: "เรียนได้ทุกรูปแบบ",
    title: "ออนไลน์ ในห้องเรียน",
    highlight: "หรือผสมผสาน",
    description:
      "เลือกรูปแบบการเรียนที่เหมาะกับคุณ ติดตามความก้าวหน้า และรับใบประกาศนียบัตรเมื่อจบหลักสูตร",
    cta: { label: "ลงทะเบียนผู้เรียน", href: "#about" },
  },
  {
    id: "digital",
    image: unsplash("1558494949-ef010cbdcc31"),
    alt: "ตู้เซิร์ฟเวอร์และสายเครือข่าย",
    eyebrow: "Digital Transformation",
    title: "ยกระดับองค์กร",
    highlight: "ด้วยข้อมูลและดิจิทัล",
    description:
      "วิเคราะห์ข้อมูลมิเตอร์อัจฉริยะ ระบบ Smart Grid และเครื่องมือดิจิทัลสำหรับงานบริการยุคใหม่",
    cta: { label: "ดูหลักสูตรดิจิทัล", href: "#categories" },
  },
];
