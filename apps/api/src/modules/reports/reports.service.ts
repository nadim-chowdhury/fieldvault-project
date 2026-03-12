import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Asset } from '../assets/entities/asset.entity';
import { MaintenanceLog, MaintenanceStatus } from '../maintenance/entities/maintenance-log.entity';
import { Assignment } from '../assignments/entities/assignment.entity';

export interface AuditReportData {
  company: { name: string; generatedAt: string };
  period: { from: string; to: string };
  assets: {
    id: string;
    name: string;
    serialNumber: string;
    category: string;
    status: string;
    lastInspectedAt: string | null;
  }[];
  maintenanceLogs: {
    assetName: string;
    type: string;
    status: string;
    scheduledDate: string;
    completedAt: string | null;
    performedBy: string | null;
  }[];
  summary: {
    totalAssets: number;
    totalMaintenanceLogs: number;
    completedMaintenance: number;
    overdueMaintenance: number;
    complianceRate: string;
  };
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Asset)
    private readonly assetsRepo: Repository<Asset>,
    @InjectRepository(MaintenanceLog)
    private readonly maintenanceRepo: Repository<MaintenanceLog>,
    @InjectRepository(Assignment)
    private readonly assignmentsRepo: Repository<Assignment>,
  ) {}

  async generateAuditReport(companyId: string, months: number = 12): Promise<AuditReportData> {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - months);

    const [assets, maintenanceLogs] = await Promise.all([
      this.assetsRepo.find({
        where: { companyId, isArchived: false },
        order: { name: 'ASC' },
      }),
      this.maintenanceRepo.find({
        where: {
          companyId,
          scheduledDate: Between(fromDate, toDate) as any,
        },
        relations: ['asset'],
        order: { scheduledDate: 'DESC' },
      }),
    ]);

    const completedCount = maintenanceLogs.filter(
      (l) => l.status === MaintenanceStatus.COMPLETED,
    ).length;
    const overdueCount = maintenanceLogs.filter(
      (l) => l.status === MaintenanceStatus.SCHEDULED && new Date(l.scheduledDate) < new Date(),
    ).length;
    const complianceRate = maintenanceLogs.length > 0
      ? ((completedCount / maintenanceLogs.length) * 100).toFixed(1)
      : '100.0';

    this.logger.log(`Audit report generated for company ${companyId} (${months} months)`);

    return {
      company: {
        name: '', // Filled by controller
        generatedAt: new Date().toISOString(),
      },
      period: {
        from: fromDate.toISOString().split('T')[0],
        to: toDate.toISOString().split('T')[0],
      },
      assets: assets.map((a) => ({
        id: a.id,
        name: a.name,
        serialNumber: a.serialNumber,
        category: a.category,
        status: a.status,
        lastInspectedAt: a.lastInspectedAt?.toISOString() ?? null,
      })),
      maintenanceLogs: maintenanceLogs.map((l) => ({
        assetName: l.asset?.name || 'Unknown',
        type: l.type,
        status: l.status,
        scheduledDate: l.scheduledDate.toString(),
        completedAt: l.completedAt?.toISOString() ?? null,
        performedBy: l.performedBy ?? null,
      })),
      summary: {
        totalAssets: assets.length,
        totalMaintenanceLogs: maintenanceLogs.length,
        completedMaintenance: completedCount,
        overdueMaintenance: overdueCount,
        complianceRate: `${complianceRate}%`,
      },
    };
  }

  // ─── PDF Report ──────────────────────────────────────────────────
  async generateAuditReportHtml(data: AuditReportData): Promise<string> {
    const statusColor: Record<string, string> = {
      available: '#22c55e',
      in_use: '#3b82f6',
      maintenance: '#f59e0b',
      lost: '#ef4444',
    };

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>FieldVault Audit Report — ${data.company.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; padding: 40px; font-size: 12px; }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 22px; color: #0f172a; }
    .header p { color: #64748b; margin-top: 4px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; color: #fff; }
    .summary { display: flex; gap: 16px; margin-bottom: 24px; }
    .stat { flex: 1; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
    .stat .value { font-size: 28px; font-weight: 700; color: #0f172a; }
    .stat .label { font-size: 11px; color: #64748b; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #f1f5f9; text-align: left; padding: 8px 12px; font-weight: 600; font-size: 11px; color: #475569; border-bottom: 2px solid #e2e8f0; }
    td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
    tr:nth-child(even) { background: #fafafa; }
    h2 { font-size: 16px; color: #0f172a; margin: 24px 0 12px; }
    .compliance { font-size: 36px; font-weight: 800; }
    .compliance.good { color: #22c55e; }
    .compliance.warn { color: #f59e0b; }
    .compliance.bad { color: #ef4444; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 10px; text-align: center; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔒 FieldVault Audit Report</h1>
    <p><strong>${data.company.name}</strong> — Period: ${data.period.from} to ${data.period.to}</p>
    <p>Generated: ${new Date(data.company.generatedAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
  </div>

  <div class="summary">
    <div class="stat">
      <div class="value">${data.summary.totalAssets}</div>
      <div class="label">Total Assets</div>
    </div>
    <div class="stat">
      <div class="value">${data.summary.totalMaintenanceLogs}</div>
      <div class="label">Maintenance Tasks</div>
    </div>
    <div class="stat">
      <div class="value">${data.summary.completedMaintenance}</div>
      <div class="label">Completed</div>
    </div>
    <div class="stat">
      <div class="value compliance ${parseFloat(data.summary.complianceRate) >= 90 ? 'good' : parseFloat(data.summary.complianceRate) >= 70 ? 'warn' : 'bad'}">${data.summary.complianceRate}</div>
      <div class="label">Compliance Rate</div>
    </div>
  </div>

  <h2>Asset Inventory (${data.assets.length})</h2>
  <table>
    <thead><tr><th>#</th><th>Name</th><th>Serial Number</th><th>Category</th><th>Status</th><th>Last Inspected</th></tr></thead>
    <tbody>
      ${data.assets.map((a, i) => `<tr>
        <td>${i + 1}</td>
        <td><strong>${a.name}</strong></td>
        <td>${a.serialNumber}</td>
        <td>${a.category.replace(/_/g, ' ')}</td>
        <td><span class="badge" style="background:${statusColor[a.status] || '#6b7280'}">${a.status.replace(/_/g, ' ')}</span></td>
        <td>${a.lastInspectedAt ? new Date(a.lastInspectedAt).toLocaleDateString() : '—'}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <h2>Maintenance Log (${data.maintenanceLogs.length})</h2>
  <table>
    <thead><tr><th>Asset</th><th>Type</th><th>Status</th><th>Scheduled</th><th>Completed</th><th>Performed By</th></tr></thead>
    <tbody>
      ${data.maintenanceLogs.map((l) => `<tr>
        <td>${l.assetName}</td>
        <td>${l.type.replace(/_/g, ' ')}</td>
        <td><span class="badge" style="background:${l.status === 'completed' ? '#22c55e' : l.status === 'overdue' ? '#ef4444' : '#3b82f6'}">${l.status.replace(/_/g, ' ')}</span></td>
        <td>${new Date(l.scheduledDate).toLocaleDateString()}</td>
        <td>${l.completedAt ? new Date(l.completedAt).toLocaleDateString() : '—'}</td>
        <td>${l.performedBy || '—'}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <div class="footer">
    FieldVault — Audit-Ready Asset Intelligence for Construction Teams | Report ID: ${Date.now().toString(36).toUpperCase()}
  </div>
</body>
</html>`;
  }

  async generateAuditPdf(companyId: string, companyName: string, months: number = 12): Promise<Buffer> {
    const reportData = await this.generateAuditReport(companyId, months);
    reportData.company.name = companyName;
    const html = await this.generateAuditReportHtml(reportData);

    try {
      // Try Puppeteer for proper PDF generation
      const puppeteer = await import('puppeteer');
      const browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
        printBackground: true,
      });
      await browser.close();
      this.logger.log(`PDF audit report generated for company ${companyId}`);
      return Buffer.from(pdf);
    } catch {
      // Fallback: return the HTML as a buffer (can be rendered by browser)
      this.logger.warn('Puppeteer not available — returning HTML report');
      return Buffer.from(html, 'utf-8');
    }
  }

  async generateAssetInventory(companyId: string) {
    const assets = await this.assetsRepo.find({
      where: { companyId, isArchived: false },
      order: { category: 'ASC', name: 'ASC' },
    });

    const byCategory: Record<string, typeof assets> = {};
    for (const asset of assets) {
      if (!byCategory[asset.category]) byCategory[asset.category] = [];
      byCategory[asset.category].push(asset);
    }

    return {
      generatedAt: new Date().toISOString(),
      totalAssets: assets.length,
      byCategory,
    };
  }
}

