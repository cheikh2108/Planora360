import { UnprocessableEntityException } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';
import { extname } from 'path';

const ALLOWED: Record<string, string[]> = {
  'application/pdf':                                          ['pdf'],
  'application/msword':                                      ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  'application/vnd.ms-excel':                                ['xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
  'application/vnd.ms-powerpoint':                          ['ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx'],
  'image/jpeg':                                              ['jpg', 'jpeg'],
  'image/png':                                               ['png'],
};

const MAX_SIZE = 20 * 1024 * 1024; // 20 Mo

export async function validateFile(file: Express.Multer.File): Promise<void> {
  // 1. Taille
  if (file.size > MAX_SIZE) {
    throw new UnprocessableEntityException('Fichier trop volumineux (max 20 Mo)');
  }

  // 2. Extension déclarée
  const ext = extname(file.originalname).toLowerCase().replace('.', '');
  const allowedExts = Object.values(ALLOWED).flat();
  if (!ext || !allowedExts.includes(ext)) {
    throw new UnprocessableEntityException(
      `Extension non autorisée : .${ext || '(aucune)'}. Formats acceptés : ${allowedExts.join(', ')}`,
    );
  }

  // 3. Magic bytes — détection du vrai type
  const detected = await fileTypeFromBuffer(file.buffer);

  if (!detected) {
    // Fichiers texte/XML (DOCX, XLSX, etc. sont des ZIP — fileTypeFromBuffer les détecte)
    // Si non détecté ET extension est dans la whitelist texte c'est suspect
    throw new UnprocessableEntityException(
      'Impossible de vérifier le type réel du fichier. Téléversement refusé.',
    );
  }

  const allowedMimes = Object.keys(ALLOWED);
  if (!allowedMimes.includes(detected.mime)) {
    throw new UnprocessableEntityException(
      `Type de fichier réel non autorisé : ${detected.mime}. Le fichier ne correspond pas à son extension.`,
    );
  }

  // 4. Cohérence extension ↔ magic bytes
  const expectedExts = ALLOWED[detected.mime];
  if (!expectedExts.includes(ext)) {
    throw new UnprocessableEntityException(
      `Incohérence : l'extension .${ext} ne correspond pas au contenu réel du fichier (${detected.mime}).`,
    );
  }
}
