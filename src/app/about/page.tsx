import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { aboutContent } from "@/content/about";
import { formatNumber, formatPhone, formatThaiDate, yearsInOperation } from "@/lib/about";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา | ศูนย์อบรมออนไลน์ กฟภ.",
  description: aboutContent.description,
};

// AB-03: computed when the page renders and refreshed daily (spec §6), so the page stays static.
async function getYearsInOperation() {
  "use cache";
  cacheLife("days");
  return yearsInOperation(aboutContent.foundedYearBE, new Date());
}

const h2 = "text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-white";

export default async function AboutPage() {
  const { name, description, vision, missions, benefits, stats, contact } = aboutContent;
  const years = await getYearsInOperation();

  const results = [
    { label: "ปีที่ดำเนินงาน", value: years, suffix: "ปี" },
    { label: "หลักสูตร", value: stats.courses, suffix: "หลักสูตร" },
    { label: "ผู้เรียน", value: stats.learners, suffix: "คน" },
    { label: "ใบประกาศที่ออก", value: stats.certificates, suffix: "ใบ" },
  ];

  return (
    <main className="flex-1">
      <section className="bg-gradient-to-br from-pea-primary to-pea-primary-dark text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">{name}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">{description}</p>
          <Link
            href="/courses"
            className="mt-8 inline-block rounded-lg bg-pea-accent px-6 py-3 font-semibold text-pea-primary-dark hover:brightness-95"
          >
            ดูหลักสูตรทั้งหมด
          </Link>
        </div>
      </section>

      <section aria-labelledby="mission" className="mx-auto max-w-6xl px-4 py-16">
        <h2 id="mission" className={h2}>พันธกิจและวิสัยทัศน์</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border-l-4 border-pea-accent bg-zinc-50 p-6 dark:bg-zinc-900">
            <h3 className="text-sm font-semibold text-pea-primary dark:text-pea-accent">วิสัยทัศน์</h3>
            <p className="mt-2 text-lg leading-8 text-zinc-800 dark:text-zinc-100">{vision}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-pea-primary dark:text-pea-accent">พันธกิจ</h3>
            <ol className="mt-2 list-decimal space-y-2 pl-5 leading-7 text-zinc-700 marker:text-pea-primary dark:text-zinc-300 dark:marker:text-pea-accent">
              {missions.map((mission) => (
                <li key={mission}>{mission}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section aria-labelledby="benefits" className="bg-zinc-50 py-16 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-4">
          <h2 id="benefits" className={h2}>สิ่งที่ผู้เรียนได้รับ</h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {benefits.map((benefit) => (
              <li
                key={benefit.title}
                data-testid="benefit-card"
                className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h3 className="font-semibold text-zinc-900 dark:text-white">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{benefit.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="results" className="mx-auto max-w-6xl px-4 py-16">
        <h2 id="results" className={h2}>ผลการดำเนินงาน</h2>
        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 lg:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-800">
          {results.map((item) => (
            <div key={item.label} className="bg-white p-6 dark:bg-zinc-900">
              <dt className="text-sm text-zinc-500 dark:text-zinc-400">{item.label}</dt>
              <dd className="mt-2 flex flex-wrap items-baseline gap-1.5">
                <span className="text-3xl font-bold tabular-nums text-pea-primary dark:text-white">
                  {formatNumber(item.value)}
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{item.suffix}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">ข้อมูล ณ {formatThaiDate(stats.asOf)}</p>
      </section>

      <section aria-labelledby="contact-us" className="bg-zinc-50 py-16 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-4">
          <h2 id="contact-us" className={h2}>ติดต่อเรา</h2>
          <address className="mt-8 grid gap-6 not-italic sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">ที่อยู่</p>
              <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{contact.address}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">โทรศัพท์</p>
              <a
                href={`tel:${contact.phone}`}
                className="mt-1 inline-block text-sm text-pea-primary underline-offset-4 hover:underline dark:text-pea-accent"
              >
                {formatPhone(contact.phone)}
              </a>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">อีเมล</p>
              <a
                href={`mailto:${contact.email}`}
                className="mt-1 inline-block break-all text-sm text-pea-primary underline-offset-4 hover:underline dark:text-pea-accent"
              >
                {contact.email}
              </a>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">เวลาทำการ</p>
              <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{contact.hours}</p>
            </div>
          </address>
        </div>
      </section>
    </main>
  );
}
