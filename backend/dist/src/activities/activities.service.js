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
exports.ActivitiesService = void 0;
const common_1 = require("@nestjs/common");
const stream_1 = require("stream");
const Excel = __importStar(require("exceljs"));
const prisma_service_1 = require("../common/prisma/prisma.service");
const posthog_service_1 = require("../analytics/posthog.service");
const cache_invalidation_service_1 = require("../common/cache/cache-invalidation.service");
const ACTIVITY_INCLUDE = {
    responsible: { select: { id: true, firstName: true, lastName: true, email: true } },
    collaborators: {
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    },
    axis: { select: { id: true, title: true, actionPlanId: true } },
    subActivities: {
        include: {
            responsible: { select: { id: true, firstName: true, lastName: true } },
            _count: { select: { checklistItems: true } },
        },
    },
    zones: {
        include: {
            zone: { select: { id: true, name: true, code: true, level: true } },
        },
    },
    _count: { select: { checklistItems: true, documents: true, validations: true } },
};
const ALLOWED_STATUS_TRANSITIONS = {
    NON_DEMARREE: ['EN_PREPARATION', 'ANNULEE'],
    EN_PREPARATION: ['EN_COURS', 'ANNULEE'],
    EN_COURS: ['EN_ATTENTE', 'SUSPENDUE', 'TERMINEE'],
    EN_ATTENTE: ['EN_COURS', 'SUSPENDUE', 'ANNULEE'],
    SUSPENDUE: ['EN_COURS', 'ANNULEE'],
    TERMINEE: [],
    VALIDEE: [],
    EN_RETARD: ['EN_COURS', 'SUSPENDUE', 'ANNULEE'],
    ANNULEE: [],
};
let ActivitiesService = class ActivitiesService {
    prisma;
    posthog;
    cacheInvalidation;
    constructor(prisma, posthog, cacheInvalidation) {
        this.prisma = prisma;
        this.posthog = posthog;
        this.cacheInvalidation = cacheInvalidation;
    }
    async create(dto, organizationId, currentUserId) {
        await this.validateAxis(dto.axisId, organizationId);
        await this.validateParentActivity(dto.parentActivityId, organizationId);
        await this.validateResponsible(dto.responsibleId, organizationId);
        await this.validateZones(dto.zoneIds, organizationId);
        const activity = await this.createActivity(dto, organizationId, currentUserId);
        const axis = await this.prisma.axis.findUnique({ where: { id: dto.axisId }, select: { actionPlanId: true } });
        if (axis) {
            this.posthog.trackActivityCreated(currentUserId, activity.id, axis.actionPlanId, organizationId);
        }
        if (dto.collaboratorIds?.length) {
            await this.addCollaborators(activity.id, dto.collaboratorIds);
        }
        if (dto.zoneIds?.length) {
            await this.assignZones(activity.id, dto.zoneIds);
        }
        await this.cacheInvalidation.invalidateDashboard(organizationId);
        await this.cacheInvalidation.invalidateActivities(organizationId);
        return dto.collaboratorIds?.length || dto.zoneIds?.length ? this.findActivityById(activity.id) : activity;
    }
    async validateAxis(axisId, organizationId) {
        const axis = await this.prisma.axis.findFirst({
            where: { id: axisId, actionPlan: { organizationId } },
        });
        if (!axis)
            throw new common_1.NotFoundException('Axe introuvable');
    }
    async validateParentActivity(parentActivityId, organizationId) {
        if (!parentActivityId)
            return;
        const parent = await this.prisma.activity.findFirst({
            where: { id: parentActivityId, organizationId },
        });
        if (!parent)
            throw new common_1.NotFoundException('Activité parente introuvable');
    }
    async validateResponsible(responsibleId, organizationId) {
        if (!responsibleId)
            return;
        const responsible = await this.prisma.user.findFirst({
            where: { id: responsibleId, organizationId },
        });
        if (!responsible)
            throw new common_1.NotFoundException('Responsable introuvable');
    }
    async validateZones(zoneIds, organizationId) {
        if (!zoneIds?.length)
            return;
        const zones = await this.prisma.geographicZone.findMany({
            where: { id: { in: zoneIds }, organizationId },
        });
        if (zones.length !== zoneIds.length) {
            throw new common_1.BadRequestException('Une ou plusieurs zones géographiques sont invalides');
        }
    }
    async createActivity(dto, organizationId, currentUserId) {
        const { collaboratorIds, zoneIds, responsibleId, startDate, dueDate, ...rest } = dto;
        return this.prisma.activity.create({
            data: {
                ...rest,
                organizationId,
                responsibleId: responsibleId ?? currentUserId,
                startDate: startDate && startDate.trim() ? new Date(startDate) : new Date(),
                dueDate: dueDate && dueDate.trim() ? new Date(dueDate) : new Date(),
            },
            include: ACTIVITY_INCLUDE,
        });
    }
    async addCollaborators(activityId, collaboratorIds) {
        await this.prisma.activityCollaborator.createMany({
            data: collaboratorIds.map((userId) => ({ activityId, userId })),
            skipDuplicates: true,
        });
    }
    async assignZones(activityId, zoneIds) {
        await this.prisma.activityZone.createMany({
            data: zoneIds.map((zoneId, index) => ({
                activityId,
                zoneId,
                isPrimary: index === 0,
            })),
            skipDuplicates: true,
        });
    }
    async findActivityById(activityId) {
        return this.prisma.activity.findFirst({
            where: { id: activityId },
            include: ACTIVITY_INCLUDE,
        });
    }
    async findAll(organizationId, planId, zoneId, page = 1, limit = 20) {
        const where = {
            organizationId,
            parentActivityId: null,
            ...(planId ? { axis: { actionPlanId: planId } } : {}),
            ...(zoneId ? { zones: { some: { zoneId } } } : {}),
        };
        const [data, total] = await Promise.all([
            this.prisma.activity.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: ACTIVITY_INCLUDE,
            }),
            this.prisma.activity.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async findOne(id, organizationId) {
        const activity = await this.prisma.activity.findFirst({
            where: { id, organizationId },
            include: {
                ...ACTIVITY_INCLUDE,
                checklistItems: {
                    include: {
                        responsible: { select: { id: true, firstName: true, lastName: true } },
                    },
                    orderBy: { order: 'asc' },
                },
                validations: { orderBy: { createdAt: 'asc' } },
            },
        });
        if (!activity)
            throw new common_1.NotFoundException('Activité introuvable');
        return activity;
    }
    async update(id, dto, organizationId) {
        await this.findOne(id, organizationId);
        const { collaboratorIds, zoneIds, status, ...data } = dto;
        const updateData = { ...data };
        if (dto.startDate)
            updateData.startDate = new Date(dto.startDate);
        if (dto.dueDate)
            updateData.dueDate = new Date(dto.dueDate);
        const activity = await this.prisma.activity.update({
            where: { id },
            data: updateData,
            include: ACTIVITY_INCLUDE,
        });
        let needsReload = false;
        if (Array.isArray(collaboratorIds)) {
            await this.prisma.activityCollaborator.deleteMany({ where: { activityId: id } });
            if (collaboratorIds.length) {
                await this.prisma.activityCollaborator.createMany({
                    data: collaboratorIds.map((userId) => ({ activityId: id, userId })),
                    skipDuplicates: true,
                });
            }
            needsReload = true;
        }
        if (Array.isArray(zoneIds)) {
            if (zoneIds.length) {
                await this.validateZones(zoneIds, organizationId);
            }
            await this.prisma.activityZone.deleteMany({ where: { activityId: id } });
            if (zoneIds.length) {
                await this.assignZones(id, zoneIds);
            }
            needsReload = true;
        }
        await this.cacheInvalidation.invalidateDashboard(organizationId);
        await this.cacheInvalidation.invalidateActivities(organizationId);
        return needsReload
            ? this.prisma.activity.findFirst({ where: { id }, include: ACTIVITY_INCLUDE })
            : activity;
    }
    async updateStatus(id, newStatus, organizationId) {
        const activity = await this.findOne(id, organizationId);
        const allowed = ALLOWED_STATUS_TRANSITIONS[activity.status] ?? [];
        if (!allowed.includes(newStatus)) {
            throw new common_1.BadRequestException(`Transition de statut invalide : ${activity.status} → ${newStatus}`);
        }
        const updated = await this.prisma.activity.update({
            where: { id },
            data: { status: newStatus },
            include: ACTIVITY_INCLUDE,
        });
        await this.cacheInvalidation.invalidateDashboard(organizationId);
        await this.cacheInvalidation.invalidateActivities(organizationId);
        return updated;
    }
    async remove(id, organizationId) {
        const activity = await this.findOne(id, organizationId);
        if (activity.status === 'VALIDEE') {
            throw new common_1.ForbiddenException('Une activité validée ne peut pas être supprimée');
        }
        const deleted = await this.prisma.activity.delete({ where: { id } });
        await this.cacheInvalidation.invalidateDashboard(organizationId);
        await this.cacheInvalidation.invalidateActivities(organizationId);
        return deleted;
    }
    async importFromExcel(file, planId, organizationId, userId) {
        if (!file) {
            throw new common_1.BadRequestException('Aucun fichier fourni');
        }
        const plan = await this.prisma.actionPlan.findFirst({
            where: { id: planId, organizationId },
            include: { axes: true },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Plan d\'action introuvable');
        }
        let workbook;
        try {
            workbook = new Excel.Workbook();
            const stream = stream_1.Readable.from(file.buffer);
            await workbook.xlsx.read(stream);
        }
        catch (error) {
            throw new common_1.BadRequestException('Impossible de lire le fichier. Assurez-vous qu\'il s\'agit d\'un fichier Excel valide (.xlsx, .xls) ou CSV.');
        }
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
            throw new common_1.BadRequestException('Le fichier Excel est vide');
        }
        const MAX_ROWS = 1000;
        if (worksheet.rowCount > MAX_ROWS + 1) {
            throw new common_1.BadRequestException(`Le fichier contient trop de lignes (max ${MAX_ROWS}). Importez en plusieurs fois.`);
        }
        const data = [];
        const headers = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) {
                row.eachCell((cell) => {
                    headers.push(String(cell.value).trim());
                });
            }
            else {
                const rowData = {};
                row.eachCell((cell, colNumber) => {
                    rowData[headers[colNumber - 1]] = cell.value;
                });
                data.push(rowData);
            }
        });
        if (!data || data.length === 0) {
            throw new common_1.BadRequestException('Le fichier Excel ne contient aucune donnée');
        }
        const users = await this.prisma.user.findMany({
            where: { organizationId },
            select: { id: true, email: true, firstName: true, lastName: true },
        });
        const zones = await this.prisma.geographicZone.findMany({
            where: { organizationId },
            select: { id: true, code: true, name: true },
        });
        const errors = [];
        const created = [];
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const lineNumber = i + 2;
            try {
                if (!row['Titre'] || !row['Axe'] || !row['Responsable'] || !row['Date début'] || !row['Date fin']) {
                    errors.push({
                        line: lineNumber,
                        error: 'Colonnes manquantes (Titre, Axe, Responsable, Date début, Date fin sont obligatoires)',
                    });
                    continue;
                }
                const axis = plan.axes.find(a => a.title.toLowerCase() === String(row['Axe']).toLowerCase().trim());
                if (!axis) {
                    errors.push({
                        line: lineNumber,
                        error: `Axe "${row['Axe']}" introuvable dans le plan d'action`,
                    });
                    continue;
                }
                const responsible = users.find(u => u.email.toLowerCase() === String(row['Responsable']).toLowerCase().trim());
                if (!responsible) {
                    errors.push({
                        line: lineNumber,
                        error: `Responsable "${row['Responsable']}" introuvable (vérifiez l'email)`,
                    });
                    continue;
                }
                let startDate;
                let dueDate;
                try {
                    startDate = this.parseExcelDate(row['Date début']);
                    dueDate = this.parseExcelDate(row['Date fin']);
                    if (dueDate < startDate) {
                        errors.push({
                            line: lineNumber,
                            error: 'La date de fin doit être après la date de début',
                        });
                        continue;
                    }
                }
                catch (e) {
                    errors.push({
                        line: lineNumber,
                        error: `Dates invalides (format attendu: YYYY-MM-DD ou DD/MM/YYYY)`,
                    });
                    continue;
                }
                const priority = row['Priorité'] ? String(row['Priorité']).toUpperCase().trim() : 'MOYENNE';
                if (!['FAIBLE', 'MOYENNE', 'ELEVEE', 'CRITIQUE'].includes(priority)) {
                    errors.push({
                        line: lineNumber,
                        error: `Priorité invalide "${row['Priorité']}" (valeurs acceptées: FAIBLE, MOYENNE, ELEVEE, CRITIQUE)`,
                    });
                    continue;
                }
                let budgetPlanned = null;
                if (row['Budget planifié']) {
                    const parsed = parseFloat(String(row['Budget planifié']).replace(/\s/g, '').replace(',', '.'));
                    if (isNaN(parsed) || parsed < 0) {
                        errors.push({
                            line: lineNumber,
                            error: `Budget invalide "${row['Budget planifié']}"`,
                        });
                        continue;
                    }
                    budgetPlanned = parsed;
                }
                const zoneCodes = row['Zones'] ? String(row['Zones']).split(',').map(c => c.trim()) : [];
                const zoneIds = [];
                if (zoneCodes.length > 0) {
                    for (const code of zoneCodes) {
                        const zone = zones.find(z => z.code?.toLowerCase() === code.toLowerCase() || z.name.toLowerCase() === code.toLowerCase());
                        if (!zone) {
                            errors.push({
                                line: lineNumber,
                                error: `Zone "${code}" introuvable (utilisez le code ou le nom exact)`,
                            });
                            continue;
                        }
                        zoneIds.push(zone.id);
                    }
                }
                const activity = await this.prisma.activity.create({
                    data: {
                        organizationId,
                        axisId: axis.id,
                        responsibleId: responsible.id,
                        title: this.sanitizeString(String(row['Titre']).trim(), 200),
                        description: row['Description'] ? this.sanitizeString(String(row['Description']).trim(), 5000) : null,
                        expectedResults: row['Résultats attendus'] ? this.sanitizeString(String(row['Résultats attendus']).trim(), 2000) : null,
                        startDate,
                        dueDate,
                        priority,
                        budgetPlanned,
                        status: 'NON_DEMARREE',
                        zones: zoneIds.length > 0 ? {
                            create: zoneIds.map((zoneId, idx) => ({
                                zoneId,
                                isPrimary: idx === 0,
                            })),
                        } : undefined,
                    },
                    include: ACTIVITY_INCLUDE,
                });
                created.push(activity);
                this.posthog.capture(userId, 'activity_imported', {
                    activityId: activity.id,
                    planId,
                    source: 'excel',
                });
            }
            catch (error) {
                errors.push({
                    line: lineNumber,
                    error: error.message || 'Erreur lors de la création',
                });
            }
        }
        await this.cacheInvalidation.invalidateDashboard(organizationId);
        await this.cacheInvalidation.invalidateActivities(organizationId);
        return {
            success: created.length,
            errors: errors.length,
            total: data.length,
            created,
            errorDetails: errors,
        };
    }
    sanitizeString(value, maxLength) {
        if (!value)
            return '';
        let sanitized = value
            .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]+>/g, '');
        if (sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }
        return sanitized.trim();
    }
    parseExcelDate(value) {
        if (!value)
            throw new Error('Date vide');
        if (value instanceof Date) {
            return value;
        }
        if (typeof value === 'number') {
            const excelEpoch = new Date(1900, 0, 1);
            const date = new Date(excelEpoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000);
            return date;
        }
        const str = String(value).trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
            const date = new Date(str);
            if (!isNaN(date.getTime()))
                return date;
        }
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
            const [day, month, year] = str.split('/');
            const date = new Date(`${year}-${month}-${day}`);
            if (!isNaN(date.getTime()))
                return date;
        }
        throw new Error(`Format de date invalide: ${value}`);
    }
};
exports.ActivitiesService = ActivitiesService;
exports.ActivitiesService = ActivitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        posthog_service_1.PostHogService,
        cache_invalidation_service_1.CacheInvalidationService])
], ActivitiesService);
//# sourceMappingURL=activities.service.js.map