-- Sample courses (the former fake data). Dates are relative to the day this runs,
-- so the "upcoming courses" section has content. Safe to re-run.
insert into public.courses
  (code, title, category, instructor, duration_hours, level, mode, start_date, published_at, enrolled, capacity, graduates, rating)
values
  ('c-101', 'ความปลอดภัยในการปฏิบัติงานระบบไฟฟ้าแรงสูง', 'ความปลอดภัย', 'วศ. สมชาย ใจดี', 24, 'กลาง', 'ในห้องเรียน', current_date + 20, current_date - 7, 42, 50, 380, 4.8),
  ('c-102', 'ระบบโครงข่ายไฟฟ้าอัจฉริยะ (Smart Grid) เบื้องต้น', 'เทคโนโลยีระบบไฟฟ้า', 'ดร. วิภาวดี ศรีสุข', 12, 'พื้นฐาน', 'ออนไลน์', current_date + 13, current_date - 26, 318, 400, 1450, 4.7),
  ('c-103', 'การบำรุงรักษาหม้อแปลงไฟฟ้าระบบจำหน่าย', 'งานบำรุงรักษา', 'นาย ประเสริฐ มั่นคง', 18, 'กลาง', 'ผสมผสาน', current_date + 6, current_date - 42, 64, 80, 520, 4.6),
  ('c-104', 'การติดตั้งและตรวจสอบระบบ Solar Rooftop', 'พลังงานทดแทน', 'วศ. ธนพล รุ่งเรือง', 16, 'กลาง', 'ผสมผสาน', current_date + 27, current_date - 5, 55, 60, 210, 4.9),
  ('c-105', 'Digital Transformation สำหรับบุคลากร กฟภ.', 'ดิจิทัล', 'ดร. กมลชนก วงศ์ไทย', 8, 'พื้นฐาน', 'ออนไลน์', current_date + 1, current_date - 56, 1240, 1500, 3890, 4.5),
  ('c-106', 'การบริการลูกค้าอย่างมืออาชีพ (Service Excellence)', 'การบริการ', 'คุณ อรอุมา แสงทอง', 6, 'พื้นฐาน', 'ออนไลน์', current_date - 8, current_date - 68, 876, 1000, 2760, 4.6),
  ('c-107', 'การวิเคราะห์ข้อมูลมิเตอร์อัจฉริยะ (AMI Data Analytics)', 'ดิจิทัล', 'นาย ณัฐวุฒิ ปัญญาดี', 20, 'ขั้นสูง', 'ออนไลน์', current_date + 35, current_date - 3, 97, 150, 95, 4.8),
  ('c-108', 'ระบบป้องกันและรีเลย์ในสถานีไฟฟ้า', 'เทคโนโลยีระบบไฟฟ้า', 'วศ. ชัยวัฒน์ พลังดี', 30, 'ขั้นสูง', 'ในห้องเรียน', current_date - 15, current_date - 87, 28, 30, 168, 4.9),
  ('c-109', 'ภาวะผู้นำสำหรับหัวหน้างานยุคใหม่', 'การบริหาร', 'ผศ. ดร. สุนิสา ตั้งใจ', 12, 'กลาง', 'ผสมผสาน', current_date - 22, current_date - 104, 120, 120, 400, 4.7)
on conflict (code) do nothing;
