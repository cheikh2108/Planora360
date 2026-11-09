import { StatusProcedure } from '@prisma/client';
import { CreateProcedureDto } from './create-procedure.dto';
declare const UpdateProcedureDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateProcedureDto>>;
export declare class UpdateProcedureDto extends UpdateProcedureDto_base {
    status?: StatusProcedure;
}
export {};
