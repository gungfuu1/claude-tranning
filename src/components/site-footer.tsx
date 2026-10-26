import Link from "next/link";
import { Logo } from "./site-header";

const footerLinks = [
  {
    title: "หลักสูตร",
    links: ["หลักสูตรทั้งหมด", "หลักสูตรออนไลน์", "หลักสูตรในห้องเรียน", "ตารางอบรม"],
  },
  {
    title: "ช่วยเหลือ",
    links: ["คำถามที่พบบ่อย", "วิธีสมัครเรียน", "ขอใบประกาศนียบัตร", "แจ้งปัญหาการใช้งาน"],
  },
];

export function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            พัฒนาศักยภาพบุคลากรด้านระบบไฟฟ้า ความปลอดภัย และเทคโนโลยีดิจิทัล
            เพื่อการให้บริการพลังงานไฟฟ้าที่มั่นคงทั่วประเทศ
          </p>
          <address className="mt-4 text-sm not-italic leading-6 text-zinc-600 dark:text-zinc-400">
            200 ถนนงามวงศ์วาน แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900
            <br />
            โทร 0-0000-0000 · อีเมล training@example.com
          </address>
        </div>

        {footerLinks.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{group.title}</h3>
            <ul className="mt-4 space-y-2">
              {group.links.map((label) => (
                <li key={label}>
                  <Link
                    href="#"
                    className="text-sm text-zinc-600 hover:text-pea-primary dark:text-zinc-400 dark:hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-800">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-zinc-500">
          © 2569 การไฟฟ้าส่วนภูมิภาค (PEA) · สงวนลิขสิทธิ์ · ข้อมูลบนหน้านี้เป็นข้อมูลจำลอง
        </p>
      </div>
    </footer>
  );
}
