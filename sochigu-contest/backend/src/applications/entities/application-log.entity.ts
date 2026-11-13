import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Application } from './application.entity';
import { User } from '../../users/entities/user.entity';
import { ApplicationStatus } from '../../common/enums/application-status.enum';

@Entity('application_logs')
export class ApplicationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Application, (app) => app.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @Column({ name: 'application_id', nullable: true })
  applicationId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'changed_by_id' })
  changedBy: User;

  @Column({ name: 'changed_by_id', nullable: true })
  changedById: string;

  @Column({ type: 'enum', enum: ApplicationStatus, nullable: true })
  fromStatus: ApplicationStatus;

  @Column({ type: 'enum', enum: ApplicationStatus })
  toStatus: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}
