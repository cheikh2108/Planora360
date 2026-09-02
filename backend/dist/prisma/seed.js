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
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const bcrypt = __importStar(require("bcryptjs"));
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
const ROLES = [
    { name: 'Super administrateur', permissions: ['*'] },
    {
        name: 'Administrateur',
        permissions: [
            'user.create', 'user.update', 'user.delete', 'user.read',
            'plan.create', 'plan.update', 'plan.delete', 'plan.read',
            'activity.create', 'activity.update', 'activity.delete', 'activity.read',
            'checklist.create', 'checklist.update', 'checklist.delete',
            'validation.approve', 'validation.reject',
            'budget.read', 'budget.edit',
            'document.upload', 'document.download',
            'report.generate', 'dashboard.view',
        ],
    },
    {
        name: 'Coordinateur',
        permissions: [
            'plan.create', 'plan.update', 'plan.read',
            'activity.create', 'activity.update', 'activity.read',
            'checklist.create', 'checklist.update',
            'validation.approve', 'validation.reject',
            'document.upload', 'document.download',
            'report.generate', 'dashboard.view',
        ],
    },
    {
        name: 'Responsable de projet',
        permissions: [
            'plan.create', 'plan.update', 'plan.read',
            'activity.create', 'activity.update', 'activity.read',
            'checklist.create', 'checklist.update',
            'validation.approve', 'validation.reject',
            'budget.read', 'budget.edit',
            'document.upload', 'document.download',
            'report.generate', 'dashboard.view',
        ],
    },
    {
        name: 'Chef de service',
        permissions: [
            'activity.create', 'activity.update', 'activity.read',
            'checklist.create', 'checklist.update',
            'validation.approve', 'validation.reject',
            'document.upload', 'document.download',
            'report.generate', 'dashboard.view',
        ],
    },
    {
        name: "Responsable d'activité",
        permissions: [
            'activity.update', 'activity.read',
            'checklist.create', 'checklist.update',
            'validation.submit',
            'document.upload', 'document.download',
            'dashboard.view',
        ],
    },
    {
        name: 'Validateur',
        permissions: [
            'activity.read',
            'validation.approve', 'validation.reject',
            'document.download',
            'dashboard.view',
        ],
    },
    {
        name: 'Responsable financier',
        permissions: [
            'activity.read',
            'budget.read', 'budget.edit',
            'validation.approve', 'validation.reject',
            'document.download',
            'report.generate', 'dashboard.view',
        ],
    },
    {
        name: 'Observateur',
        permissions: ['activity.read', 'plan.read', 'document.download', 'dashboard.view'],
    },
    {
        name: 'Auditeur',
        permissions: ['activity.read', 'plan.read', 'document.download', 'report.generate', 'dashboard.view'],
    },
];
async function main() {
    console.log('Seeding roles...');
    for (const role of ROLES) {
        const existing = await prisma.role.findFirst({ where: { name: role.name, organizationId: null } });
        if (existing) {
            await prisma.role.update({ where: { id: existing.id }, data: { permissions: role.permissions } });
        }
        else {
            await prisma.role.create({ data: { ...role, organizationId: null } });
        }
    }
    console.log(`${ROLES.length} rôles créés/mis à jour.`);
    const superAdminRole = await prisma.role.findFirst({ where: { name: 'Super administrateur', organizationId: null } });
    const existingOrg = await prisma.organization.findFirst({ where: { name: 'ATAABA' } });
    const org = existingOrg ?? await prisma.organization.create({
        data: { name: 'ATAABA', subscriptionPlan: 'ENTERPRISE' },
    });
    const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@ataaba.com' } });
    if (!existingAdmin) {
        const passwordHash = await bcrypt.hash('Admin@2108!', 12);
        await prisma.user.create({
            data: {
                email: 'admin@ataaba.com',
                firstName: 'Super',
                lastName: 'Admin',
                passwordHash,
                organizationId: org.id,
                roleId: superAdminRole.id,
            },
        });
        console.log('Super admin créé : admin@ataaba.com / Admin@2108!');
    }
    else {
        console.log('Super admin existe déjà.');
    }
    const existingTestOrg = await prisma.organization.findFirst({ where: { name: 'Test Org' } });
    const testOrg = existingTestOrg ?? await prisma.organization.create({
        data: { name: 'Test Org', subscriptionPlan: 'ENTERPRISE' },
    });
    const coordRole = await prisma.role.findFirst({ where: { name: 'Coordinateur', organizationId: null } });
    const existingTest = await prisma.user.findUnique({ where: { email: 'test@ataaba.com' } });
    if (!existingTest) {
        const passwordHash = await bcrypt.hash('Test@2108!', 12);
        await prisma.user.create({
            data: {
                email: 'test@ataaba.com',
                firstName: 'Test',
                lastName: 'User',
                passwordHash,
                organizationId: testOrg.id,
                roleId: coordRole.id,
            },
        });
        console.log('Compte test créé : test@ataaba.com / Test@2108!');
    }
    else {
        console.log('Compte test existe déjà.');
    }
    console.log('Seeding zones géographiques...');
    const existingSenegal = await prisma.geographicZone.findFirst({
        where: { organizationId: org.id, code: 'SN' },
    });
    if (!existingSenegal) {
        const senegal = await prisma.geographicZone.create({
            data: {
                name: 'Sénégal',
                code: 'SN',
                level: 0,
                organizationId: org.id,
            },
        });
        const regions = [
            { name: 'Dakar', code: 'DK' },
            { name: 'Thiès', code: 'TH' },
            { name: 'Saint-Louis', code: 'SL' },
            { name: 'Diourbel', code: 'DB' },
            { name: 'Kaolack', code: 'KL' },
            { name: 'Fatick', code: 'FK' },
            { name: 'Louga', code: 'LG' },
            { name: 'Matam', code: 'MT' },
            { name: 'Tambacounda', code: 'TC' },
            { name: 'Kolda', code: 'KD' },
            { name: 'Ziguinchor', code: 'ZG' },
            { name: 'Sédhiou', code: 'SD' },
            { name: 'Kaffrine', code: 'KF' },
            { name: 'Kédougou', code: 'KE' },
        ];
        for (const region of regions) {
            await prisma.geographicZone.create({
                data: {
                    name: region.name,
                    code: region.code,
                    level: 1,
                    parentId: senegal.id,
                    organizationId: org.id,
                },
            });
        }
        console.log(`✅ ${regions.length + 1} zones géographiques créées (Sénégal + régions)`);
    }
    else {
        console.log('Zones géographiques existent déjà.');
    }
}
main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map