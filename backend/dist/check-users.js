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
async function checkUsers() {
    try {
        const users = await prisma.user.findMany({
            include: {
                organization: true,
                role: true,
            },
            take: 10,
        });
        console.log('\n=== UTILISATEURS DANS LA BASE ===\n');
        for (const user of users) {
            console.log(`Email: ${user.email}`);
            console.log(`Nom: ${user.firstName} ${user.lastName}`);
            console.log(`Actif: ${user.isActive}`);
            console.log(`Organisation: ${user.organization?.name} (Status: ${user.organization?.status})`);
            console.log(`Rôle: ${user.role?.name}`);
            console.log(`Doit changer mdp: ${user.mustChangePassword}`);
            console.log('---\n');
        }
        const admin = users.find(u => u.email === 'admin@ataaba.com');
        if (admin) {
            console.log('=== TEST MOT DE PASSE ADMIN ===');
            const testPasswords = ['Admin@2108!', 'admin123', 'Admin123!', 'password'];
            for (const pwd of testPasswords) {
                const match = await bcrypt.compare(pwd, admin.passwordHash);
                console.log(`"${pwd}": ${match ? '✅ VALIDE' : '❌ Invalide'}`);
            }
        }
        const testUser = users.find(u => u.email === 'test@ataaba.com');
        if (testUser) {
            console.log('\n=== TEST MOT DE PASSE TEST USER ===');
            const testPasswords = ['Test@2108!', 'test123', 'Test123!'];
            for (const pwd of testPasswords) {
                const match = await bcrypt.compare(pwd, testUser.passwordHash);
                console.log(`"${pwd}": ${match ? '✅ VALIDE' : '❌ Invalide'}`);
            }
        }
    }
    catch (error) {
        console.error('Erreur:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
checkUsers();
//# sourceMappingURL=check-users.js.map