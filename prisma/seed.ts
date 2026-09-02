import { PrismaClient, UserRole, ComputerStatus, RepairStatus, ProblemType, Priority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type RepairStatusValue = "WAITING" | "ASSIGNED" | "DIAGNOSING" | "REPAIRING" | "WAITING_PART" | "COMPLETED" | "RETURNED" | "CANCELLED";

function includesStatus(arr: RepairStatus[], status: RepairStatusValue): boolean {
  return arr.includes(status as RepairStatus);
}

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.repairAttachment.deleteMany();
  await prisma.repairPart.deleteMany();
  await prisma.repairStatusHistory.deleteMany();
  await prisma.repair.deleteMany();
  await prisma.computer.deleteMany();
  await prisma.part.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 12);

  // ─── Departments ───────────────────────────────────────
  const departments = await Promise.all([
    prisma.department.create({ data: { code: "IT", name: "แผนก IT", description: "ฝ่ายเทคโนโลยีสารสนเทศ" } }),
    prisma.department.create({ data: { code: "HR", name: "แผนก HR", description: "ฝ่ายทรัพยากรบุคคล" } }),
    prisma.department.create({ data: { code: "FIN", name: "แผนก Finance", description: "ฝ่ายการเงิน" } }),
    prisma.department.create({ data: { code: "SALES", name: "แผนก Sales", description: "ฝ่ายขาย" } }),
    prisma.department.create({ data: { code: "MKT", name: "แผนก Marketing", description: "ฝ่ายการตลาด" } }),
    prisma.department.create({ data: { code: "ADM", name: "ฝ่ายบริหาร", description: "ฝ่ายบริหารจัดการ" } }),
  ]);

  console.log(`✅ Created ${departments.length} departments`);

  // ─── Users ─────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@company.com",
      password: hashedPassword,
      name: "Admin User",
      role: UserRole.ADMIN,
      departmentId: departments[0].id,
    },
  });

  const technicians = await Promise.all([
    prisma.user.create({
      data: {
        username: "tech1",
        email: "tech1@company.com",
        password: hashedPassword,
        name: "สมชาย ใจดี",
        role: UserRole.TECHNICIAN,
        departmentId: departments[0].id,
      },
    }),
    prisma.user.create({
      data: {
        username: "tech2",
        email: "tech2@company.com",
        password: hashedPassword,
        name: "สมศักดิ์ แก้ปัญหา",
        role: UserRole.TECHNICIAN,
        departmentId: departments[0].id,
      },
    }),
    prisma.user.create({
      data: {
        username: "tech3",
        email: "tech3@company.com",
        password: hashedPassword,
        name: "วิชัย ซ่อมได้",
        role: UserRole.TECHNICIAN,
        departmentId: departments[0].id,
      },
    }),
  ]);

  console.log("✅ Created admin and 3 technicians");

  // ─── Computers ─────────────────────────────────────────
  const computerData = [
    { assetCode: "PC-2024-001", computerName: "PC-IT-001", brand: "Dell", model: "OptiPlex 7090", cpu: "Intel Core i5-11500", ram: "16GB DDR4", storage: "512GB SSD", operatingSystem: "Windows 11 Pro", ipAddress: "192.168.1.101", departmentId: departments[0].id, location: "ชั้น 3 ห้อง IT", assignedUser: "สมชาย ใจดี" },
    { assetCode: "PC-2024-002", computerName: "PC-IT-002", brand: "HP", model: "ProDesk 400 G7", cpu: "Intel Core i5-10500", ram: "8GB DDR4", storage: "256GB SSD", operatingSystem: "Windows 10 Pro", ipAddress: "192.168.1.102", departmentId: departments[0].id, location: "ชั้น 3 ห้อง IT", assignedUser: "วิชัย ซ่อมได้" },
    { assetCode: "PC-2024-003", computerName: "PC-HR-001", brand: "Lenovo", model: "ThinkCentre M70s", cpu: "Intel Core i3-10100", ram: "8GB DDR4", storage: "256GB SSD", operatingSystem: "Windows 11 Pro", ipAddress: "192.168.1.201", departmentId: departments[1].id, location: "ชั้น 2 ห้อง HR", assignedUser: "นภา สดใส" },
    { assetCode: "PC-2024-004", computerName: "PC-HR-002", brand: "Dell", model: "Vostro 3681", cpu: "Intel Core i5-10400", ram: "8GB DDR4", storage: "1TB HDD", operatingSystem: "Windows 10 Pro", ipAddress: "192.168.1.202", departmentId: departments[1].id, location: "ชั้น 2 ห้อง HR", assignedUser: "พิมพ์ใจ รักงาน" },
    { assetCode: "PC-2024-005", computerName: "PC-FIN-001", brand: "HP", model: "ProDesk 400 G8", cpu: "Intel Core i7-11700", ram: "16GB DDR4", storage: "512GB SSD", operatingSystem: "Windows 11 Pro", ipAddress: "192.168.1.301", departmentId: departments[2].id, location: "ชั้น 2 ห้อง Finance", assignedUser: "อรุณ เงินทอง" },
    { assetCode: "PC-2024-006", computerName: "PC-FIN-002", brand: "Dell", model: "OptiPlex 5000", cpu: "Intel Core i5-11500", ram: "16GB DDR4", storage: "512GB SSD", operatingSystem: "Windows 11 Pro", ipAddress: "192.168.1.302", departmentId: departments[2].id, location: "ชั้น 2 ห้อง Finance", assignedUser: "จิรา บัญชี" },
    { assetCode: "PC-2024-007", computerName: "PC-SALES-001", brand: "Lenovo", model: "ThinkCentre M70s", cpu: "Intel Core i5-10500", ram: "8GB DDR4", storage: "256GB SSD", operatingSystem: "Windows 10 Pro", ipAddress: "192.168.1.401", departmentId: departments[3].id, location: "ชั้น 1 ห้อง Sales", assignedUser: "กิตติ ขายดี" },
    { assetCode: "PC-2024-008", computerName: "PC-SALES-002", brand: "HP", model: "ProDesk 400 G7", cpu: "Intel Core i3-10100", ram: "8GB DDR4", storage: "256GB SSD", operatingSystem: "Windows 10 Pro", ipAddress: "192.168.1.402", departmentId: departments[3].id, location: "ชั้น 1 ห้อง Sales", assignedUser: "วันดี สร้างยอด" },
    { assetCode: "PC-2024-009", computerName: "PC-MKT-001", brand: "Dell", model: "Inspiron 3881", cpu: "Intel Core i7-10700", ram: "16GB DDR4", storage: "1TB HDD + 256GB SSD", operatingSystem: "Windows 11 Pro", ipAddress: "192.168.1.501", departmentId: departments[4].id, location: "ชั้น 1 ห้อง Marketing", assignedUser: "สุภาพร โฆษณา" },
    { assetCode: "PC-2024-010", computerName: "PC-MKT-002", brand: "Lenovo", model: "IdeaCentre 5", cpu: "AMD Ryzen 5 4600G", ram: "16GB DDR4", storage: "512GB SSD", operatingSystem: "Windows 11 Pro", ipAddress: "192.168.1.502", departmentId: departments[4].id, location: "ชั้น 1 ห้อง Marketing", assignedUser: "ชนิดา ออกแบบ" },
    { assetCode: "PC-2023-011", computerName: "PC-IT-003", brand: "Dell", model: "OptiPlex 3080", cpu: "Intel Core i3-10100", ram: "4GB DDR4", storage: "128GB SSD", operatingSystem: "Windows 10 Pro", ipAddress: "192.168.1.103", departmentId: departments[0].id, location: "ชั้น 3 ห้อง Server", assignedUser: "เจ้าหน้าที่ IT", status: ComputerStatus.REPAIR },
    { assetCode: "PC-2023-012", computerName: "PC-FIN-003", brand: "HP", model: "ProDesk 400 G6", cpu: "Intel Core i5-9500", ram: "8GB DDR4", storage: "500GB HDD", operatingSystem: "Windows 10 Pro", ipAddress: "192.168.1.303", departmentId: departments[2].id, location: "ชั้น 2 ห้อง Finance", assignedUser: "ธนา คิดเลข" },
    { assetCode: "PC-2023-013", computerName: "PC-HR-003", brand: "Lenovo", model: "ThinkCentre M90n", cpu: "Intel Core i5-8265U", ram: "8GB DDR4", storage: "256GB SSD", operatingSystem: "Windows 10 Pro", ipAddress: "192.168.1.203", departmentId: departments[1].id, location: "ชั้น 2 ห้อง HR", assignedUser: "รัตนา ทรัพยากร" },
    { assetCode: "PC-2023-014", computerName: "PC-SALES-003", brand: "Dell", model: "Vostro 3471", cpu: "Intel Core i5-9400", ram: "8GB DDR4", storage: "1TB HDD", operatingSystem: "Windows 10 Pro", ipAddress: "192.168.1.403", departmentId: departments[3].id, location: "ชั้น 1 ห้อง Sales", assignedUser: "พงศ์ ยอดขาย" },
    { assetCode: "PC-2023-015", computerName: "PC-MKT-003", brand: "HP", model: "Pavilion Desktop", cpu: "AMD Ryzen 5 3500", ram: "8GB DDR4", storage: "256GB SSD", operatingSystem: "Windows 10 Pro", ipAddress: "192.168.1.503", departmentId: departments[4].id, location: "ชั้น 1 ห้อง Marketing", assignedUser: "มณี ประชาสัมพันธ์" },
    { assetCode: "PC-2022-016", computerName: "PC-ADM-001", brand: "Dell", model: "OptiPlex 7070", cpu: "Intel Core i7-9700", ram: "32GB DDR4", storage: "512GB SSD", operatingSystem: "Windows 11 Pro", ipAddress: "192.168.1.601", departmentId: departments[5].id, location: "ชั้น 3 ห้องผู้บริหาร", assignedUser: "ผู้จัดการ" },
    { assetCode: "PC-2022-017", computerName: "PC-IT-004", brand: "Lenovo", model: "ThinkCentre M720q", cpu: "Intel Core i5-8400T", ram: "8GB DDR4", storage: "256GB SSD", operatingSystem: "Ubuntu 22.04", ipAddress: "192.168.1.104", departmentId: departments[0].id, location: "ชั้น 3 ห้อง Server", assignedUser: "วินัย เซิร์ฟเวอร์" },
    { assetCode: "PC-2022-018", computerName: "PC-FIN-004", brand: "HP", model: "ProDesk 400 G5", cpu: "Intel Core i5-8500", ram: "8GB DDR4", storage: "256GB SSD", operatingSystem: "Windows 10 Pro", ipAddress: "192.168.1.304", departmentId: departments[2].id, location: "ชั้น 2 ห้อง Finance", assignedUser: "แสงทอง ภาษี" },
    { assetCode: "PC-2021-019", computerName: "PC-SALES-004", brand: "Dell", model: "Inspiron 3670", cpu: "Intel Core i5-8400", ram: "8GB DDR4", storage: "1TB HDD", operatingSystem: "Windows 10 Pro", ipAddress: "192.168.1.404", departmentId: departments[3].id, location: "ชั้น 1 ห้อง Sales", assignedUser: "สุรชัย พฤหัส" },
    { assetCode: "PC-2021-020", computerName: "PC-MKT-004", brand: "HP", model: "Pavilion 590", cpu: "Intel Core i3-8100", ram: "4GB DDR4", storage: "1TB HDD", operatingSystem: "Windows 10 Pro", ipAddress: "192.168.1.504", departmentId: departments[4].id, location: "ชั้น 1 ห้อง Marketing", assignedUser: "จินดา กราฟิก", status: ComputerStatus.DAMAGED },
  ];

  const computers: { id: string; assetCode: string }[] = [];
  for (const data of computerData) {
    const computer = await prisma.computer.create({
      data: {
        ...data,
        status: data.status || ComputerStatus.NORMAL,
        purchaseDate: new Date(2021 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1),
      },
    });
    computers.push(computer);
  }

  console.log(`✅ Created ${computers.length} computers`);

  // ─── Spare Parts ───────────────────────────────────────
  const partsData = [
    { partCode: "PART-001", name: "Power Supply 500W", category: "Power", brand: "Corsair", model: "CX550", stock: 5, minimumStock: 2, unit: "ชิ้น", price: 1890, supplier: "IT Hardware Co." },
    { partCode: "PART-002", name: "RAM DDR4 8GB", category: "Memory", brand: "Kingston", model: "ValueRAM KVR26S19D8/8", stock: 10, minimumStock: 3, unit: "ชิ้น", price: 650, supplier: "Kingston Thailand" },
    { partCode: "PART-003", name: "RAM DDR4 16GB", category: "Memory", brand: "Kingston", model: "ValueRAM KVR26S19S8/16", stock: 6, minimumStock: 2, unit: "ชิ้น", price: 1200, supplier: "Kingston Thailand" },
    { partCode: "PART-004", name: "SSD 256GB", category: "Storage", brand: "Samsung", model: "870 EVO", stock: 8, minimumStock: 3, unit: "ชิ้น", price: 1290, supplier: "Samsung Thailand" },
    { partCode: "PART-005", name: "SSD 512GB", category: "Storage", brand: "Samsung", model: "870 EVO", stock: 4, minimumStock: 2, unit: "ชิ้น", price: 2190, supplier: "Samsung Thailand" },
    { partCode: "PART-006", name: "HDD 1TB", category: "Storage", brand: "Seagate", model: "Barracuda", stock: 3, minimumStock: 2, unit: "ชิ้น", price: 1090, supplier: "Seagate Thailand" },
    { partCode: "PART-007", name: "Keyboard USB", category: "Peripheral", brand: "Logitech", model: "K120", stock: 15, minimumStock: 5, unit: "ชิ้น", price: 290, supplier: "Logitech Thailand" },
    { partCode: "PART-008", name: "Mouse USB", category: "Peripheral", brand: "Logitech", model: "M100", stock: 12, minimumStock: 5, unit: "ชิ้น", price: 190, supplier: "Logitech Thailand" },
    { partCode: "PART-009", name: "Monitor 24 inch", category: "Display", brand: "Dell", model: "P2422H", stock: 2, minimumStock: 1, unit: "เครื่อง", price: 6900, supplier: "Dell Thailand" },
    { partCode: "PART-010", name: "Network Cable Cat6", category: "Network", brand: "UGREEN", model: "Cat6 3m", stock: 20, minimumStock: 10, unit: "เส้น", price: 65, supplier: "UGREEN" },
    { partCode: "PART-011", name: "Thermal Paste", category: "Maintenance", brand: "Arctic", model: "MX-4", stock: 8, minimumStock: 3, unit: "หลอด", price: 250, supplier: "Arctic Cooling" },
    { partCode: "PART-012", name: "CPU Fan", category: "Cooling", brand: "Cooler Master", model: "Hyper 212", stock: 3, minimumStock: 1, unit: "ชิ้น", price: 890, supplier: "Cooler Master" },
    { partCode: "PART-013", name: "PCIe WiFi Card", category: "Network", brand: "TP-Link", model: "Archer TX3000E", stock: 2, minimumStock: 1, unit: "ชิ้น", price: 1590, supplier: "TP-Link Thailand" },
    { partCode: "PART-014", name: "USB Hub 4-Port", category: "Peripheral", brand: "UGREEN", model: "USB 3.0 Hub", stock: 7, minimumStock: 3, unit: "ชิ้น", price: 250, supplier: "UGREEN" },
    { partCode: "PART-015", name: "HDMI Cable 2m", category: "Cable", brand: "UGREEN", model: "HDMI 2.0", stock: 10, minimumStock: 5, unit: "เส้น", price: 120, supplier: "UGREEN" },
    { partCode: "PART-016", name: "Printer Toner HP", category: "Printer", brand: "HP", model: "CF280A", stock: 1, minimumStock: 3, unit: "ชิ้น", price: 2800, supplier: "HP Thailand" },
    { partCode: "PART-017", name: "Laptop Charger 65W", category: "Power", brand: "Dell", model: "HA65NM190", stock: 2, minimumStock: 1, unit: "ชิ้น", price: 990, supplier: "Dell Thailand" },
    { partCode: "PART-018", name: "Clean Kit", category: "Maintenance", brand: "Generic", model: "Cleaning Kit", stock: 4, minimumStock: 2, unit: "ชุด", price: 350, supplier: "IT Hardware Co." },
    { partCode: "PART-019", name: "SATA Cable", category: "Cable", brand: "Generic", model: "SATA III 50cm", stock: 0, minimumStock: 5, unit: "เส้น", price: 45, supplier: "IT Hardware Co." },
    { partCode: "PART-020", name: "Desktop Case", category: "Case", brand: "Cooler Master", model: "N400", stock: 1, minimumStock: 1, unit: "เครื่อง", price: 1890, supplier: "Cooler Master" },
  ];

  const parts: { id: string }[] = [];
  for (const data of partsData) {
    const part = await prisma.part.create({ data });
    parts.push(part);
  }

  console.log(`✅ Created ${parts.length} parts`);

  // ─── Repairs ───────────────────────────────────────────
  const repairData: {
    computerIdx: number;
    requester: string;
    deptIdx: number;
    type: ProblemType;
    priority: Priority;
    desc: string;
    solution: string;
    cost: number;
    status: RepairStatusValue;
    techIdx: number | null;
  }[] = [
    { computerIdx: 0, requester: "สมชาย ใจดี", deptIdx: 0, type: ProblemType.HARDWARE, priority: Priority.HIGH, desc: "เครื่องเปิดไม่ติด ไม่มีไฟแสดงสถานะ", solution: "เปลี่ยน Power Supply ใหม่", cost: 1890, status: "RETURNED", techIdx: 1 },
    { computerIdx: 1, requester: "วิชัย ซ่อมได้", deptIdx: 0, type: ProblemType.SOFTWARE, priority: Priority.MEDIUM, desc: "เครื่องช้ามาก เปิดโปรแกรมไม่ได้", solution: "ล้างเครื่อง ติดตั้ง Windows ใหม่", cost: 0, status: "COMPLETED", techIdx: 2 },
    { computerIdx: 2, requester: "นภา สดใส", deptIdx: 1, type: ProblemType.WINDOWS, priority: Priority.MEDIUM, desc: "Windows update ไม่สำเร็จ error 0x80070002", solution: "แก้ไข Windows Update Service", cost: 0, status: "RETURNED", techIdx: 0 },
    { computerIdx: 3, requester: "พิมพ์ใจ รักงาน", deptIdx: 1, type: ProblemType.HARDWARE, priority: Priority.HIGH, desc: "หน้าจอกระพริบ มีเสียงดัง", solution: "เปลี่ยน RAM ใหม่ 8GB", cost: 650, status: "COMPLETED", techIdx: 1 },
    { computerIdx: 4, requester: "อรุณ เงินทอง", deptIdx: 2, type: ProblemType.NETWORK, priority: Priority.HIGH, desc: "เชื่อมต่อ Internet ไม่ได้", solution: "เปลี่ยน Network Cable ใหม่", cost: 65, status: "RETURNED", techIdx: 0 },
    { computerIdx: 5, requester: "จิรา บัญชี", deptIdx: 2, type: ProblemType.PRINTER, priority: Priority.LOW, desc: "เครื่องพิมพ์ไม่ทำงาน พิมพ์ไม่ออก", solution: "ติดตั้ง Driver ใหม่ ทำความสะอาดหัวพิมพ์", cost: 0, status: "RETURNED", techIdx: 2 },
    { computerIdx: 6, requester: "กิตติ ขายดี", deptIdx: 3, type: ProblemType.VIRUS_MALWARE, priority: Priority.URGENT, desc: "เครื่องติดไวรัส เปิด browser แล้ว redirect ไปเว็บอื่น", solution: "สแกนไวรัส ลบ malware ติดตั้ง antivirus ใหม่", cost: 0, status: "RETURNED", techIdx: 0 },
    { computerIdx: 7, requester: "วันดี สร้างยอด", deptIdx: 3, type: ProblemType.HARDWARE, priority: Priority.MEDIUM, desc: "คีย์บอร์ดพิมพ์ไม่ได้บางปุ่ม", solution: "เปลี่ยนคีย์บอร์ดใหม่", cost: 290, status: "COMPLETED", techIdx: 1 },
    { computerIdx: 8, requester: "สุภาพร โฆษณา", deptIdx: 4, type: ProblemType.SOFTWARE, priority: Priority.MEDIUM, desc: "Microsoft Office เปิดไม่ได้ ขึ้น error", solution: "Repair Office installation", cost: 0, status: "RETURNED", techIdx: 2 },
    { computerIdx: 9, requester: "ชนิดา ออกแบบ", deptIdx: 4, type: ProblemType.HARDWARE, priority: Priority.HIGH, desc: "SSD พัง เปิดเครื่องไม่ได้ ไม่เจอ Harddisk", solution: "เปลี่ยน SSD 512GB ใหม่", cost: 2190, status: "RETURNED", techIdx: 0 },
    { computerIdx: 10, requester: "เจ้าหน้าที่ IT", deptIdx: 0, type: ProblemType.HARDWARE, priority: Priority.URGENT, desc: "Power Supply ไหม้ มีกลิ่นควัน", solution: "", cost: 0, status: "REPAIRING", techIdx: 1 },
    { computerIdx: 11, requester: "ธนา คิดเลข", deptIdx: 2, type: ProblemType.WINDOWS, priority: Priority.LOW, desc: "Blue Screen บ่อยๆ", solution: "", cost: 0, status: "WAITING_PART", techIdx: 0 },
    { computerIdx: 12, requester: "รัตนา ทรัพยากร", deptIdx: 1, type: ProblemType.SOFTWARE, priority: Priority.MEDIUM, desc: "เครื่อง开机很慢 要5分钟以上", solution: "ล้าง Startup programs อัพเกรด RAM", cost: 650, status: "COMPLETED", techIdx: 2 },
    { computerIdx: 13, requester: "พงศ์ ยอดขาย", deptIdx: 3, type: ProblemType.NETWORK, priority: Priority.HIGH, desc: "WiFi เชื่อมต่อไม่ได้เลย ต่อสาย LAN ก็ไม่ได้", solution: "เปลี่ยน Network Card", cost: 1590, status: "RETURNED", techIdx: 0 },
    { computerIdx: 14, requester: "มณี ประชาสัมพันธ์", deptIdx: 4, type: ProblemType.OTHER, priority: Priority.LOW, desc: "หน้าจอ monitor สีเพี้ยน", solution: "เปลี่ยนสาย HDMI", cost: 120, status: "RETURNED", techIdx: 1 },
    { computerIdx: 15, requester: "ผู้จัดการ", deptIdx: 5, type: ProblemType.HARDWARE, priority: Priority.URGENT, desc: "เครื่องเสียงดังมาก fan ทำงานผิดปกติ", solution: "ทำความสะอาด fan เปลี่ยน thermal paste", cost: 250, status: "RETURNED", techIdx: 0 },
    { computerIdx: 16, requester: "วินัย เซิร์ฟเวอร์", deptIdx: 0, type: ProblemType.NETWORK, priority: Priority.HIGH, desc: "Server ตัวนี้ SSH เข้าไม่ได้ network interface ล่ม", solution: "", cost: 0, status: "DIAGNOSING", techIdx: 2 },
    { computerIdx: 17, requester: "แสงทอง ภาษี", deptIdx: 2, type: ProblemType.PRINTER, priority: Priority.MEDIUM, desc: "Printer ไม่ทำงาน เปิดแล้วไฟกะพริบ", solution: "เปลี่ยน Toner ใหม่", cost: 2800, status: "RETURNED", techIdx: 1 },
    { computerIdx: 18, requester: "สุรชัย พฤหัส", deptIdx: 3, type: ProblemType.HARDWARE, priority: Priority.MEDIUM, desc: "Mouse ไม่ทำงาน USB พอร์ตมีปัญหา", solution: "เปลี่ยน Mouse ใหม่ ใช้ USB Hub", cost: 440, status: "COMPLETED", techIdx: 2 },
    { computerIdx: 19, requester: "จินดา กราฟิก", deptIdx: 4, type: ProblemType.VIRUS_MALWARE, priority: Priority.HIGH, desc: "เครื่องติด ransomware ไฟล์ถูกล็อคทั้งหมด", solution: "", cost: 0, status: "WAITING", techIdx: null },
    { computerIdx: 0, requester: "สมชาย ใจดี", deptIdx: 0, type: ProblemType.SOFTWARE, priority: Priority.LOW, desc: "ต้องการอัพเกรด Windows เป็น Windows 11", solution: "อัพเกรด Windows 11 Pro", cost: 0, status: "WAITING", techIdx: null },
    { computerIdx: 4, requester: "อรุณ เงินทอง", deptIdx: 2, type: ProblemType.HARDWARE, priority: Priority.MEDIUM, desc: "SSD เต็ม ต้องการเปลี่ยนเป็น 512GB", solution: "Clone SSD ไป SSD 512GB", cost: 2190, status: "RETURNED", techIdx: 0 },
    { computerIdx: 6, requester: "กิตติ ขายดี", deptIdx: 3, type: ProblemType.WINDOWS, priority: Priority.MEDIUM, desc: "Windows ต้องการ reinstall", solution: "Format และติดตั้ง Windows 10 ใหม่", cost: 0, status: "COMPLETED", techIdx: 2 },
    { computerIdx: 1, requester: "วิชัย ซ่อมได้", deptIdx: 0, type: ProblemType.HARDWARE, priority: Priority.LOW, desc: "ต้องการอัพเกรด RAM เป็น 16GB", solution: "เพิ่ม RAM DDR4 8GB", cost: 650, status: "RETURNED", techIdx: 1 },
    { computerIdx: 8, requester: "สุภาพร โฆษณา", deptIdx: 4, type: ProblemType.PRINTER, priority: Priority.MEDIUM, desc: "Printer Brother ไม่ทำงาน", solution: "ติดตั้ง Driver ใหม่ ทำความสะอาด", cost: 0, status: "RETURNED", techIdx: 0 },
    { computerIdx: 2, requester: "นภา สดใส", deptIdx: 1, type: ProblemType.NETWORK, priority: Priority.HIGH, desc: "Network ช้ามาก Ping สูง", solution: "ย้าย Port Network เปลี่ยน Switch", cost: 0, status: "COMPLETED", techIdx: 2 },
    { computerIdx: 10, requester: "เจ้าหน้าที่ IT", deptIdx: 0, type: ProblemType.HARDWARE, priority: Priority.HIGH, desc: "CPU Overheat บ่อย", solution: "", cost: 0, status: "WAITING_PART", techIdx: 1 },
    { computerIdx: 11, requester: "ธนา คิดเลข", deptIdx: 2, type: ProblemType.SOFTWARE, priority: Priority.LOW, desc: "Program Excel ทำงานช้า ไฟล์ใหญ่", solution: "Optimize Excel settings", cost: 0, status: "RETURNED", techIdx: 0 },
    { computerIdx: 13, requester: "พงศ์ ยอดขาย", deptIdx: 3, type: ProblemType.WINDOWS, priority: Priority.MEDIUM, desc: "Windows 10 ใกล้ end of support ต้องการอัพเกรด", solution: "อัพเกรดเป็น Windows 11", cost: 0, status: "ASSIGNED", techIdx: 2 },
    { computerIdx: 16, requester: "วินัย เซิร์ฟเวอร์", deptIdx: 0, type: ProblemType.HARDWARE, priority: Priority.URGENT, desc: "Server ดับ ต้องเร่งซ่อม", solution: "", cost: 0, status: "REPAIRING", techIdx: 0 },
  ];

  const repairs: { id: string; repairNo: string }[] = [];
  for (let i = 0; i < repairData.length; i++) {
    const rd = repairData[i];
    const repairNo = `RPR26${String(i + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;

    const createdDaysAgo = 30 - i;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - createdDaysAgo);

    const repair = await prisma.repair.create({
      data: {
        repairNo,
        computerId: computers[rd.computerIdx].id,
        requesterName: rd.requester,
        departmentId: departments[rd.deptIdx].id,
        location: `Floor ${rd.deptIdx + 1}`,
        problemDescription: rd.desc,
        problemType: rd.type,
        priority: rd.priority,
        technicianId: rd.techIdx !== null ? technicians[rd.techIdx].id : null,
        cost: rd.cost || null,
        solution: rd.solution || null,
        status: rd.status as RepairStatus,
        receivedAt: createdAt,
        startedAt: includesStatus([RepairStatus.DIAGNOSING, RepairStatus.REPAIRING, RepairStatus.COMPLETED, RepairStatus.RETURNED], rd.status) ? createdAt : null,
        completedAt: includesStatus([RepairStatus.COMPLETED, RepairStatus.RETURNED], rd.status) ? new Date(createdAt.getTime() + 2 * 86400000) : null,
        returnedAt: rd.status === "RETURNED" ? new Date(createdAt.getTime() + 3 * 86400000) : null,
        createdAt,
      },
    });
    repairs.push(repair);

    // Create status history
    await prisma.repairStatusHistory.create({
      data: {
        repairId: repair.id,
        status: RepairStatus.WAITING,
        description: "สร้างรายการซ่อมใหม่",
        createdAt,
      },
    });

    if (rd.techIdx !== null) {
      await prisma.repairStatusHistory.create({
        data: {
          repairId: repair.id,
          status: RepairStatus.ASSIGNED,
          description: `มอบหมายให้ ${technicians[rd.techIdx].name}`,
          changedBy: admin.id,
          createdAt: new Date(createdAt.getTime() + 3600000),
        },
      });
    }

    if (includesStatus([RepairStatus.DIAGNOSING, RepairStatus.REPAIRING, RepairStatus.COMPLETED, RepairStatus.RETURNED], rd.status)) {
      await prisma.repairStatusHistory.create({
        data: {
          repairId: repair.id,
          status: RepairStatus.DIAGNOSING,
          description: "เริ่มตรวจสอบปัญหา",
          changedBy: technicians[rd.techIdx || 0].id,
          createdAt: new Date(createdAt.getTime() + 7200000),
        },
      });
    }

    if (includesStatus([RepairStatus.REPAIRING, RepairStatus.COMPLETED, RepairStatus.RETURNED], rd.status)) {
      await prisma.repairStatusHistory.create({
        data: {
          repairId: repair.id,
          status: RepairStatus.REPAIRING,
          description: "เริ่มซ่อม",
          changedBy: technicians[rd.techIdx || 0].id,
          createdAt: new Date(createdAt.getTime() + 14400000),
        },
      });
    }

    if (includesStatus([RepairStatus.COMPLETED, RepairStatus.RETURNED], rd.status)) {
      await prisma.repairStatusHistory.create({
        data: {
          repairId: repair.id,
          status: RepairStatus.COMPLETED,
          description: "ซ่อมเสร็จเรียบร้อย",
          changedBy: technicians[rd.techIdx || 0].id,
          createdAt: new Date(createdAt.getTime() + 2 * 86400000),
        },
      });
    }

    if (rd.status === "RETURNED") {
      await prisma.repairStatusHistory.create({
        data: {
          repairId: repair.id,
          status: RepairStatus.RETURNED,
          description: "ส่งคืนผู้ใช้งาน",
          changedBy: admin.id,
          createdAt: new Date(createdAt.getTime() + 3 * 86400000),
        },
      });
    }

    // Add some parts to returned/completed repairs
    if (rd.cost && rd.cost > 0 && includesStatus([RepairStatus.COMPLETED, RepairStatus.RETURNED], rd.status) && parts.length > 0) {
      const partIdx = i % parts.length;
      const part = parts[partIdx];
      const partPrice = partsData[partIdx].price;

      await prisma.repairPart.create({
        data: {
          repairId: repair.id,
          partId: part.id,
          quantity: 1,
          price: partPrice,
          total: partPrice,
        },
      });
    }
  }

  console.log(`✅ Created ${repairs.length} repairs with status history`);

  console.log("\n🎉 Seeding complete!");
  console.log("───────────────────────────────");
  console.log("Login credentials:");
  console.log("  Admin:      admin / password123");
  console.log("  Technician: tech1 / password123");
  console.log("  Technician: tech2 / password123");
  console.log("  Technician: tech3 / password123");
  console.log("───────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
