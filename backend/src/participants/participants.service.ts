import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import * as Excel from 'exceljs';
import { Readable } from 'stream';

@Injectable()
export class ParticipantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateParticipantDto, organizationId: string, userId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id: dto.activityId, organizationId },
    });

    if (!activity) {
      throw new NotFoundException('Activité non trouvée');
    }

    return this.prisma.participant.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        paymentMode: dto.paymentMode,
        amount: dto.amount ?? 0,
        activityId: dto.activityId,
        organizationId,
        createdBy: userId,
      },
    });
  }

  async importFromExcel(
    file: Express.Multer.File,
    activityId: string,
    organizationId: string,
    userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // Utiliser exceljs (plus sûr que xlsx)
    const workbook = new Excel.Workbook();
    // Créer un stream à partir du buffer pour compatibilité exceljs
    const stream = Readable.from(file.buffer);
    await workbook.xlsx.read(stream);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new BadRequestException('Le fichier Excel est vide');
    }

    // Convertir en JSON (équivalent de sheet_to_json)
    const data: any[] = [];
    const headers: string[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        // Première ligne = headers
        row.eachCell((cell) => {
          headers.push(String(cell.value));
        });
      } else {
        // Lignes suivantes = data
        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
          rowData[headers[colNumber - 1]] = cell.value;
        });
        data.push(rowData);
      }
    });

    if (!data || data.length === 0) {
      throw new BadRequestException('Le fichier Excel est vide');
    }

    const errors: Array<{ line: number; error: string }> = [];
    const participants: Array<any> = [];

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
      } catch (error) {
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

  async findByActivity(activityId: string, organizationId: string) {
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

  async remove(id: string, organizationId: string) {
    const participant = await this.prisma.participant.findFirst({
      where: { id, organizationId },
    });

    if (!participant) {
      throw new NotFoundException('Participant non trouvé');
    }

    return this.prisma.participant.delete({
      where: { id },
    });
  }
}
