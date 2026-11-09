export declare function nextReferenceFrom(existing: string[], prefix: string, pad: number): string;
export declare function isUniqueViolation(error: unknown): boolean;
export declare function createWithReference<T>(computeReference: () => Promise<string>, create: (reference: string) => Promise<T>, attempts?: number): Promise<T>;
