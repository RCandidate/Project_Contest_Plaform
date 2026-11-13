import { IsIn } from 'class-validator';

export class UpdateContactStatusDto {
  @IsIn(['pending', 'done'])
  status: 'pending' | 'done';
}
