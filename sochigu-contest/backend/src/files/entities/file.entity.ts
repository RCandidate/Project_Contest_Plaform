import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Application } from '../../applications/entities/application.entity';
import { FileCategory } from '../../common/enums/file-type.enum';

@Entity('app_files')
export class AppFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Application, (app) => app.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @Column({ name: 'application_id', nullable: true })
  applicationId: string;

  @Column()
  originalName: string;

  @Column()
  storageName: string;

  @Column()
  mimeType: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column({ type: 'enum', enum: FileCategory })
  category: FileCategory;

  @Column()
  path: string;

  @CreateDateColumn()
  createdAt: Date;
}
