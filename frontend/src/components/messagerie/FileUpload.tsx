'use client';

/**
 * FileUpload Component
 * Upload fichiers/photos avec drag & drop, preview, validation
 * Max 3 fichiers, 10MB par fichier
 * Types autorisés: images, PDF, docs Office
 */

import { useState, useRef, DragEvent } from 'react';
import { X, Upload, File, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileWithPreview extends File {
  preview?: string;
}

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

const DEFAULT_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx';

export function FileUpload({
  onFilesSelected,
  maxFiles = 3,
  maxSizeMB = 10,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Vérifier le type
    if (!acceptedTypes.includes(file.type)) {
      return `${file.name}: Type de fichier non autorisé`;
    }

    // Vérifier la taille (en MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `${file.name}: Fichier trop volumineux (max ${maxSizeMB}MB)`;
    }

    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    setError(null);
    const filesArray = Array.from(files);

    // Vérifier nombre max
    if (selectedFiles.length + filesArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} fichiers autorisés`);
      return;
    }

    // Valider chaque fichier
    const validFiles: FileWithPreview[] = [];
    for (const file of filesArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Créer preview pour images
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        (file as FileWithPreview).preview = preview;
      }

      validFiles.push(file as FileWithPreview);
    }

    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const removeFile = (index: number) => {
    // Protection: s'assurer que selectedFiles est un tableau
    const safeFiles = Array.isArray(selectedFiles) ? selectedFiles : [];
    const newFiles = safeFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
    setError(null);
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="w-full space-y-3">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-6 transition-all duration-200',
          isDragging
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-slate-100',
          selectedFiles.length >= maxFiles && 'pointer-events-none opacity-50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={selectedFiles.length >= maxFiles}
        />

        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200',
              isDragging
                ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
                : 'bg-slate-200 group-hover:bg-emerald-100'
            )}
          >
            <Upload
              className={cn(
                'h-7 w-7 transition-colors duration-200',
                isDragging ? 'text-white' : 'text-slate-600 group-hover:text-emerald-600'
              )}
            />
          </div>

          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-900">
              {isDragging ? 'Déposez vos fichiers ici' : 'Cliquez ou glissez-déposez'}
            </p>
            <p className="mt-1 text-[12px] text-slate-500">
              Max {maxFiles} fichiers • {maxSizeMB}MB par fichier
            </p>
            <p className="mt-0.5 text-[11px] text-slate-600">
              Images, PDF, Word, Excel
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="animate-in fade-in-0 slide-in-from-top-2 rounded-xl bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-all duration-200 hover:border-emerald-200 hover:shadow-sm"
            >
              {/* Preview/Icon */}
              <div className="flex-shrink-0">
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                    {file.type === 'application/pdf' ? (
                      <File className="h-6 w-6 text-red-500" />
                    ) : (
                      <File className="h-6 w-6 text-blue-500" />
                    )}
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="truncate text-[13px] font-semibold text-slate-900">
                  {file.name}
                </p>
                <p className="text-[11px] text-slate-500">{formatFileSize(file.size)}</p>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFile(index)}
                className="flex-shrink-0 rounded-lg p-1.5 text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600 active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
