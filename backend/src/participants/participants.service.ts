import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class ParticipantsService {
  constructor(private readonly prisma: PrismaService) {}

  async importFromExcel(
    file: Express.Multer.File,
    activityId: string,
    organizationId: string,
    userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      throw new BadRequestException('Le fichier Excel est vide');
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
