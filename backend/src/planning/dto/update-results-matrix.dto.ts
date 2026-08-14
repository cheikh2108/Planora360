import { IsObject, IsNotEmpty } from 'class-validator';

export class UpdateResultsMatrixDto {
  @IsObject()
  @IsNotEmpty()
  data: any;
}
