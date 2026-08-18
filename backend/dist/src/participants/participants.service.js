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
exports.ParticipantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const Excel = __importStar(require("exceljs"));
const stream_1 = require("stream");
let ParticipantsService = class ParticipantsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, organizationId, userId) {
        const activity = await this.prisma.activity.findFirst({
            where: { id: dto.activityId, organizationId },
        });
        if (!activity) {
            throw new common_1.NotFoundException('Activité non trouvée');
        }
        return this.prisma.participant.create({
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                paymentMode: dto.paymentMode,
                amount: dto.amount,
                activityId: dto.activityId,
                organizationId,
                createdBy: userId,
            },
        });
    }
    async importFromExcel(file, activityId, organizationId, userId) {
        if (!file) {
            throw new common_1.BadRequestException('Aucun fichier fourni');
        }
        const workbook = new Excel.Workbook();
        const stream = stream_1.Readable.from(file.buffer);
        await workbook.xlsx.read(stream);
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
            throw new common_1.BadRequestException('Le fichier Excel est vide');
        }
        const data = [];
        const headers = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) {
                row.eachCell((cell) => {
                    headers.push(String(cell.value));
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
            throw new common_1.BadRequestException('Le fichier Excel est vide');
        }
        const errors = [];
        const participants = [];
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const lineNumber = i + 2;
            try {
                if (!row['Prénom'] || !row['Nom'] || !row['Téléphone'] || !row['Mode de paiement'] || !row['Montant']) {
                    errors.push({
                        line: lineNumber,
                        error: 'Colonnes manquantes (Prénom, Nom, Téléphone, Mode de paiement, Montant)',
                    });
                    continue;
                }
                const paymentMode = row['Mode de paiement'].toUpperCase();
                if (!['WAVE', 'ORANGE_MONEY', 'ORANGE MONEY'].includes(paymentMode)) {
                    errors.push({
                        line: lineNumber,
                        error: `Mode de paiement invalide: ${row['Mode de paiement']} (attendu: WAVE ou ORANGE_MONEY)`,
                    });
                    continue;
                }
                const phone = String(row['Téléphone']).trim();
                const amount = parseFloat(row['Montant']);
                if (isNaN(amount) || amount <= 0) {
                    errors.push({
                        line: lineNumber,
                        error: `Montant invalide: ${row['Montant']}`,
                    });
                    continue;
                }
                participants.push({
                    firstName: String(row['Prénom']).trim(),
                    lastName: String(row['Nom']).trim(),
                    phone,
                    paymentMode: paymentMode === 'ORANGE MONEY' ? 'ORANGE_MONEY' : paymentMode,
                    amount,
                    activityId,
                    organizationId,
                    createdBy: userId,
                });
            }
            catch (error) {
                errors.push({
                    line: lineNumber,
                    error: error.message || 'Erreur de parsing',
                });
            }
        }
        if (errors.length > 0) {
            return {
                success: false,
                errors,
                imported: 0,
                total: data.length,
            };
        }
        const created = await this.prisma.participant.createMany({
            data: participants,
            skipDuplicates: true,
        });
        return {
            success: true,
            imported: created.count,
            total: data.length,
            errors: [],
        };
    }
    async findByActivity(activityId, organizationId) {
        return this.prisma.participant.findMany({
            where: {
                activityId,
                organizationId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async remove(id, organizationId) {
        const participant = await this.prisma.participant.findFirst({
            where: { id, organizationId },
        });
        if (!participant) {
            throw new common_1.NotFoundException('Participant non trouvé');
        }
        return this.prisma.participant.delete({
            where: { id },
        });
    }
};
exports.ParticipantsService = ParticipantsService;
exports.ParticipantsService = ParticipantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ParticipantsService);
//# sourceMappingURL=participants.service.js.map