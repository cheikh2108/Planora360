import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateAnnualWorkPlanDto } from './dto/create-annual-work-plan.dto';
import { UpdateAnnualWorkPlanDto } from './dto/update-annual-work-plan.dto';
import { UpdateResultsMatrixDto } from './dto/update-results-matrix.dto';

@Injectable()
export class PlanningService {
  constructor(private readonly prisma: PrismaService) {}

  async createAnnualWorkPlan(
    dto: CreateAnnualWorkPlanDto,
    organizationId: string,
    userId: string,
  ) {
    return this.prisma.annualWorkPlan.create({
      data: {
        ...dto,
        organizationId,
        createdBy: userId,
        status: dto.status || 'BROUILLON',
      },
    });
  }

  async findAllAnnualWorkPlans(organizationId: string) {
    return this.prisma.annualWorkPlan.findMany({
      where: { organizationId },
      orderBy: { year: 'desc' },
    });
  }

  async findOneAnnualWorkPlan(id: string, organizationId: string) {
    const plan = await this.prisma.annualWorkPlan.findFirst({
      where: { id, organizationId },
    });

    if (!plan) {
      throw new NotFoundException('Plan de travail annuel non trouvé');
    }

    return plan;
  }

  async updateAnnualWorkPlan(
    id: string,
    dto: UpdateAnnualWorkPlanDto,
    organizationId: string,
  ) {
    await this.findOneAnnualWorkPlan(id, organizationId);

    return this.prisma.annualWorkPlan.update({
      where: { id },
      data: dto,
    });
  }

  async validateAnnualWorkPlan(
    id: string,
    organizationId: string,
    userId: string,
  ) {
    await this.findOneAnnualWorkPlan(id, organizationId);

    return this.prisma.annualWorkPlan.update({
      where: { id },
      data: {
        status: 'VALIDE',
        validatedBy: userId,
        validatedAt: new Date(),
      },
    });
  }

  async deleteAnnualWorkPlan(id: string, organizationId: string) {
    await this.findOneAnnualWorkPlan(id, organizationId);

    return this.prisma.annualWorkPlan.delete({
      where: { id },
    });
  }

  async getResultsMatrix(organizationId: string) {
    let matrix = await this.prisma.resultsMatrix.findUnique({
      where: { organizationId },
    });

    if (!matrix) {
      matrix = await this.prisma.resultsMatrix.create({
        data: {
          organizationId,
          data: {},
        },
      });
    }

    return matrix;
  }

  async updateResultsMatrix(
    dto: UpdateResultsMatrixDto,
    organizationId: string,
  ) {
    const existing = await this.prisma.resultsMatrix.findUnique({
      where: { organizationId },
    });

    if (existing) {
      return this.prisma.resultsMatrix.update({
        where: { organizationId },
        data: { data: dto.data },
      });
    }

    return this.prisma.resultsMatrix.create({
      data: {
        organizationId,
        data: dto.data,
      },
    });
  }
}
