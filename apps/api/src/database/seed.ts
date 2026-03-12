import { DataSource } from 'typeorm';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require('dotenv');
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

dotenv.config({ path: '../../.env' });

// ─── Seed data ─────────────────────────────────────────────────────
const COMPANY_ID = uuid();
const ADMIN_ID = uuid();
const SUPERVISOR_ID = uuid();
const WORKER_ID = uuid();

const ASSET_IDS = Array.from({ length: 10 }, () => uuid());

async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: true,
  });

  await ds.initialize();
  console.log('📦 Connected to database');

  const qr = ds.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    // ─── Company ────────────────────────────────────
    await qr.query(
      `INSERT INTO companies (id, name, plan, "maxAssets", "maxUsers", phone, address, country, timezone, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [COMPANY_ID, 'Acme Construction Ltd', 'professional', 500, 25,
        '+1-555-0100', '123 Builder Ave, Suite 200', 'US', 'America/New_York'],
    );
    console.log('✅ Company created');

    // ─── Users ──────────────────────────────────────
    const password = await bcrypt.hash('Admin123!', 12);

    const users = [
      [ADMIN_ID, 'John Admin', 'admin@acme-construction.com', 'admin'],
      [SUPERVISOR_ID, 'Sarah Supervisor', 'sarah@acme-construction.com', 'supervisor'],
      [WORKER_ID, 'Mike Worker', 'mike@acme-construction.com', 'worker'],
    ];

    for (const [id, name, email, role] of users) {
      await qr.query(
        `INSERT INTO users (id, name, email, "passwordHash", role, "companyId", "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [id, name, email, password, role, COMPANY_ID],
      );
    }
    console.log('✅ Users created (password: Admin123!)');

    // ─── Assets ─────────────────────────────────────
    const assets = [
      ['DeWalt 20V Impact Driver', 'DW-IMP-2024-001', 'power_tool', 'DeWalt', 'DCF887', 299.99],
      ['CAT 320 Excavator', 'CAT-EXC-2023-042', 'heavy_equipment', 'Caterpillar', '320 GC', 185000],
      ['Milwaukee Sawzall', 'MIL-SAW-2024-015', 'power_tool', 'Milwaukee', '2821-20', 199.99],
      ['Hilti Laser Level', 'HLT-LAS-2024-008', 'measuring', 'Hilti', 'PM 30-MG', 549.99],
      ['Hard Hat Set (10x)', 'SAF-HAT-2024-BATCH', 'safety_gear', '3M', 'H-700', 89.99],
      ['Fluke 117 Multimeter', 'FLK-117-2024-003', 'measuring', 'Fluke', '117', 239.99],
      ['Honda EU2200i Generator', 'HON-GEN-2024-001', 'power_tool', 'Honda', 'EU2200i', 1149.99],
      ['Ford F-250 Super Duty', 'FRD-F250-2022-019', 'vehicle', 'Ford', 'F-250 XLT', 42500],
      ['Bosch Hammer Drill', 'BSH-HAM-2024-007', 'power_tool', 'Bosch', 'GBH 2-28L', 319.99],
      ['Topcon GT Series', 'TOP-TST-2023-002', 'measuring', 'Topcon', 'GT-1003', 15999],
    ];

    const statuses = ['available', 'available', 'in_use', 'available', 'available',
      'maintenance', 'available', 'in_use', 'available', 'available'];

    for (let i = 0; i < assets.length; i++) {
      const [name, serial, category, manufacturer, model, value] = assets[i];
      await qr.query(
        `INSERT INTO assets (id, name, "serialNumber", category, manufacturer, model, status,
          "purchaseValue", "purchaseDate", "maintenanceIntervalDays", "companyId",
          "isArchived", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() - interval '180 days', $9, $10, false, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [ASSET_IDS[i], name, serial, category, manufacturer, model, statuses[i],
          value, category === 'heavy_equipment' ? 90 : 30, COMPANY_ID],
      );
    }
    console.log('✅ 10 assets created');

    // ─── Maintenance Logs ───────────────────────────
    const maintenanceTypes = ['routine_service', 'safety_inspection', 'calibration', 'repair'];
    for (let i = 0; i < 5; i++) {
      const daysOffset = (i - 2) * 15; // Some past, some future
      await qr.query(
        `INSERT INTO maintenance_logs (id, "assetId", "companyId", type, status,
          "scheduledDate", description, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW() + interval '${daysOffset} days', $6, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [uuid(), ASSET_IDS[i % assets.length], COMPANY_ID,
          maintenanceTypes[i % maintenanceTypes.length],
          daysOffset < 0 ? 'completed' : 'scheduled',
          `Scheduled ${maintenanceTypes[i % maintenanceTypes.length]} for asset`],
      );
    }
    console.log('✅ 5 maintenance logs created');

    // ─── Assignments ────────────────────────────────
    await qr.query(
      `INSERT INTO assignments (id, "assetId", "userId", "companyId", "siteLocation",
        "checkedOutAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW() - interval '2 days', NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [uuid(), ASSET_IDS[2], WORKER_ID, COMPANY_ID, 'Downtown Tower - Floor 14'],
    );
    await qr.query(
      `INSERT INTO assignments (id, "assetId", "userId", "companyId", "siteLocation",
        "checkedOutAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW() - interval '5 days', NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [uuid(), ASSET_IDS[7], SUPERVISOR_ID, COMPANY_ID, 'Highway 101 Bridge - Section B'],
    );
    console.log('✅ 2 active assignments created');

    // ─── Notifications ──────────────────────────────
    await qr.query(
      `INSERT INTO notifications (id, "userId", "companyId", type, title, message,
        "isRead", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, false, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [uuid(), ADMIN_ID, COMPANY_ID, 'maintenance_due',
        'Maintenance due: CAT 320 Excavator',
        'Routine service is scheduled for CAT 320 Excavator. Please complete before the due date.'],
    );
    console.log('✅ 1 notification created');

    await qr.commitTransaction();
    console.log('\n🎉 Seed completed successfully!');
    console.log('────────────────────────────────');
    console.log('Admin login:  admin@acme-construction.com / Admin123!');
    console.log('Supervisor:   sarah@acme-construction.com / Admin123!');
    console.log('Worker:       mike@acme-construction.com / Admin123!');
    console.log('────────────────────────────────\n');
  } catch (error) {
    await qr.rollbackTransaction();
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await qr.release();
    await ds.destroy();
  }
}

seed().catch(() => process.exit(1));
