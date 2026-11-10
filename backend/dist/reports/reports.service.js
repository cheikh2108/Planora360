"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const generate_report_dto_1 = require("./dto/generate-report.dto");
const ExcelJS = __importStar(require("exceljs"));
const PDFDocument = require("pdfkit");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generate(dto, organizationId) {
        const data = await this.fetchData(dto, organizationId);
        if (dto.format === generate_report_dto_1.ReportFormat.EXCEL) {
            return this.generateExcel(dto.type, data);
        }
        return this.generatePdf(dto.type, data, organizationId);
    }
    async fetchData(dto, organizationId) {
        if (dto.type === generate_report_dto_1.ReportType.INDICATEURS) {
            return this.prisma.indicator.findMany({
                where: {
                    organizationId,
                    ...(dto.planId ? { activity: { axis: { actionPlanId: dto.planId } } } : {}),
                },
                orderBy: { createdAt: 'desc' },
                include: { activity: { select: { title: true } } },
            });
        }
        const where = { organizationId, parentActivityId: null };
        if (dto.planId)
            where.axis = { actionPlanId: dto.planId };
        if (dto.dateFrom || dto.dateTo) {
            where.createdAt = {};
            if (dto.dateFrom)
                where.createdAt.gte = new Date(dto.dateFrom);
            if (dto.dateTo)
                where.createdAt.lte = new Date(dto.dateTo);
        }
        if (dto.type === generate_report_dto_1.ReportType.RETARDS)
            where.status = 'EN_RETARD';
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
    async generateExcel(type, data) {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'PLANORA 360';
        workbook.created = new Date();
        if (type === generate_report_dto_1.ReportType.INDICATEURS) {
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
        sheet.getRow(1).fill = {
            type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' },
        };
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        for (const act of activities) {
            const budgetPlanned = act.budgets.reduce((s, b) => s + Number(b.planned), 0);
            const budgetExecuted = act.budgets.reduce((s, b) => s + Number(b.executed), 0);
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
        if (type === generate_report_dto_1.ReportType.BUDGET) {
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
    async generatePdf(type, activities, organizationId) {
        const org = await this.prisma.organization.findUnique({
            where: { id: organizationId },
            select: { name: true },
        });
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 40, size: 'A4' });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            doc.fontSize(18).fillColor('#1E3A5F').text(`Rapport — ${org?.name ?? ''}`, { align: 'left' });
            doc.fontSize(10).fillColor('#666666').text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`);
            doc.moveDown();
            const colWidths = [120, 150, 100, 80, 60, 70];
            const headers = ['Plan', 'Activité', 'Responsable', 'Statut', 'Avancement', 'Échéance'];
            const startX = 40;
            let y = doc.y;
            doc.rect(startX, y, 512, 18).fill('#1E3A5F');
            doc.fillColor('#FFFFFF').fontSize(9);
            let x = startX + 4;
            for (let i = 0; i < headers.length; i++) {
                doc.text(headers[i], x, y + 4, { width: colWidths[i], lineBreak: false });
                x += colWidths[i];
            }
            y += 18;
            doc.fillColor('#1a1a2e').fontSize(9);
            for (let idx = 0; idx < activities.length; idx++) {
                const a = activities[idx];
                if (idx % 2 === 0) {
                    doc.rect(startX, y, 512, 16).fill('#f8fafc');
                }
                doc.fillColor('#1a1a2e');
                x = startX + 4;
                const cols = [
                    a.axis?.actionPlan?.title ?? '',
                    a.title,
                    `${a.responsible.firstName} ${a.responsible.lastName}`,
                    a.status,
                    `${a.completionRate}%`,
                    a.dueDate ? new Date(a.dueDate).toLocaleDateString('fr-FR') : '',
                ];
                for (let i = 0; i < cols.length; i++) {
                    doc.text(String(cols[i]).substring(0, 30), x, y + 3, { width: colWidths[i] - 4, lineBreak: false });
                    x += colWidths[i];
                }
                y += 16;
                if (y > 760) {
                    doc.addPage();
                    y = 40;
                }
            }
            doc.end();
        });
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map