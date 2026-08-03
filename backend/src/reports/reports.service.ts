import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { GenerateReportDto, ReportType, ReportFormat } from './dto/generate-report.dto';
import * as ExcelJS from 'exceljs';
import * as puppeteer from 'puppeteer';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generate(dto: GenerateReportDto, organizationId: string): Promise<Buffer> {
    const data = await this.fetchData(dto, organizationId);

    if (dto.format === ReportFormat.EXCEL) {
      return this.generateExcel(dto.type, data as any[]);
    }
    return this.generatePdf(dto.type, data as any[], organizationId);
  }

  private async fetchData(dto: GenerateReportDto, organizationId: string) {
    if (dto.type === ReportType.INDICATEURS) {
      return this.prisma.indicator.findMany({
        where: {
          organizationId,
          ...(dto.planId ? { activity: { axis: { actionPlanId: dto.planId } } } : {}),
        },
        orderBy: { createdAt: 'desc' },
        include: { activity: { select: { title: true } } },
      });
    }

    const where: any = { organizationId, parentActivityId: null };
    if (dto.planId) where.axis = { actionPlanId: dto.planId };
    if (dto.dateFrom || dto.dateTo) {
      where.createdAt = {};
      if (dto.dateFrom) where.createdAt.gte = new Date(dto.dateFrom);
      if (dto.dateTo) where.createdAt.lte = new Date(dto.dateTo);
    }
    if (dto.type === ReportType.RETARDS) where.status = 'EN_RETARD';

    const activities = await this.prisma.activity.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: {
        responsible: { select: { firstName: true, lastName: true } },
        axis: { select: { title: true, actionPlan: { select: { title: true } } } },
        budgets: true,
        _count: { select: { checklistItems: true } },
      },
    });

    return activities;
  }

  private async generateExcel(type: ReportType, data: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ATAABA Pilot';
    workbook.created = new Date();

    if (type === ReportType.INDICATEURS) {
      const sheet = workbook.addWorksheet('Indicateurs');
      sheet.columns = [
        { header: 'Indicateur', key: 'title', width: 35 },
        { header: 'Activité liée', key: 'activity', width: 30 },
        { header: 'Unité', key: 'unit', width: 12 },
        { header: 'Valeur de base', key: 'baseline', width: 15 },
        { header: 'Cible', key: 'target', width: 12 },
        { header: 'Réalisé', key: 'achieved', width: 12 },
        { header: 'Taux (%)', key: 'rate', width: 12 },
        { header: 'Échéance', key: 'dueDate', width: 14 },
      ];
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
      for (const ind of data) {
        const rate = ind.target > 0 ? Math.round((ind.achieved / ind.target) * 10000) / 100 : 0;
        sheet.addRow({
          title: ind.title,
          activity: ind.activity?.title ?? 'Global',
          unit: ind.unit ?? '',
          baseline: ind.baseline,
          target: ind.target,
          achieved: ind.achieved,
          rate,
          dueDate: ind.dueDate ? new Date(ind.dueDate) : '',
        });
      }
      const buf = await workbook.xlsx.writeBuffer();
      return Buffer.from(buf);
    }

    const activities = data;
    const sheet = workbook.addWorksheet('Activités');

    sheet.columns = [
      { header: 'Plan', key: 'plan', width: 25 },
      { header: 'Axe', key: 'axis', width: 20 },
      { header: 'Activité', key: 'title', width: 35 },
      { header: 'Responsable', key: 'responsible', width: 20 },
      { header: 'Statut', key: 'status', width: 15 },
      { header: 'Priorité', key: 'priority', width: 12 },
      { header: 'Début', key: 'startDate', width: 14 },
      { header: 'Échéance', key: 'dueDate', width: 14 },
      { header: 'Taux (%)', key: 'completionRate', width: 12 },
      { header: 'Budget prévu', key: 'budgetPlanned', width: 16 },
      { header: 'Budget exécuté', key: 'budgetExecuted', width: 16 },
    ];

    // En-tête en gras
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' },
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    for (const act of activities) {
      const budgetPlanned = act.budgets.reduce((s: number, b: any) => s + Number(b.planned), 0);
      const budgetExecuted = act.budgets.reduce((s: number, b: any) => s + Number(b.executed), 0);

      sheet.addRow({
        plan: act.axis?.actionPlan?.title ?? '',
        axis: act.axis?.title ?? '',
        title: act.title,
        responsible: `${act.responsible.firstName} ${act.responsible.lastName}`,
        status: act.status,
        priority: act.priority,
        startDate: act.startDate,
        dueDate: act.dueDate,
        completionRate: act.completionRate,
        budgetPlanned,
        budgetExecuted,
      });
    }

    // Feuille budget si applicable
    if (type === ReportType.BUDGET) {
      const budgetSheet = workbook.addWorksheet('Budget');
      budgetSheet.columns = [
        { header: 'Activité', key: 'title', width: 35 },
        { header: 'Source financement', key: 'source', width: 20 },
        { header: 'Prévu', key: 'planned', width: 16 },
        { header: 'Engagé', key: 'committed', width: 16 },
        { header: 'Décaissé', key: 'disbursed', width: 16 },
        { header: 'Exécuté', key: 'executed', width: 16 },
        { header: 'Taux exec. (%)', key: 'rate', width: 16 },
      ];
      budgetSheet.getRow(1).font = { bold: true };

      for (const act of activities) {
        for (const b of act.budgets) {
          const planned = Number(b.planned);
          const executed = Number(b.executed);
          budgetSheet.addRow({
            title: act.title,
            source: b.fundingSource ?? 'Non spécifié',
            planned,
            committed: Number(b.committed),
            disbursed: Number(b.disbursed),
            executed,
            rate: planned > 0 ? Math.round((executed / planned) * 10000) / 100 : 0,
          });
        }
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private async generatePdf(type: ReportType, activities: any[], organizationId: string): Promise<Buffer> {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    });

    const rows = activities.map((a) => `
      <tr>
        <td>${a.axis?.actionPlan?.title ?? ''}</td>
        <td>${a.title}</td>
        <td>${a.responsible.firstName} ${a.responsible.lastName}</td>
        <td><span class="status status-${a.status.toLowerCase()}">${a.status}</span></td>
        <td>${a.completionRate}%</td>
        <td>${a.dueDate ? new Date(a.dueDate).toLocaleDateString('fr-FR') : ''}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #1a1a2e; font-size: 12px; }
          h1 { color: #1E3A5F; border-bottom: 2px solid #1E3A5F; padding-bottom: 8px; }
          .meta { color: #666; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th { background: #1E3A5F; color: white; padding: 8px; text-align: left; font-size: 11px; }
          td { padding: 7px 8px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
          tr:nth-child(even) { background: #f8fafc; }
          .status { padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; }
          .status-en_retard { background: #fee2e2; color: #dc2626; }
          .status-validee { background: #dcfce7; color: #16a34a; }
          .status-en_cours { background: #dbeafe; color: #2563eb; }
          .status-terminee { background: #e0f2fe; color: #0369a1; }
        </style>
      </head>
      <body>
        <h1>Rapport des activités — ${org?.name ?? ''}</h1>
        <p class="meta">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        <table>
          <thead>
            <tr><th>Plan</th><th>Activité</th><th>Responsable</th><th>Statut</th><th>Avancement</th><th>Échéance</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const pdf = await page.pdf({ format: 'A4', margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }, printBackground: true });
    await browser.close();

    return Buffer.from(pdf);
  }
}
