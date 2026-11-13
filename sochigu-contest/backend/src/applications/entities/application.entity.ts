import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Nomination } from '../../nominations/entities/nomination.entity';
import { Contest } from '../../contests/entities/contest.entity';
import { ApplicationStatus } from '../../common/enums/application-status.enum';
import { ApplicationLog } from './application-log.entity';
import { AppFile } from '../../files/entities/file.entity';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => Nomination, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'nomination_id' })
  nomination: Nomination;

  @Index()
  @Column({ name: 'nomination_id', nullable: true })
  nominationId: string;

  @Column()
  projectTitle: string;

  @Column({ type: 'text' })
  projectDescription: string;

  @Column({ type: 'simple-array', nullable: true })
  keywords: string[];

  @Column({ type: 'jsonb', nullable: true })
  teamMembers: {
    name: string;
    role: string;
    email?: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  supervisor: {
    name: string;
    title: string;
    email?: string;
  };

  @Index()
  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.DRAFT,
  })
  status: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  adminComment: string;

  @Column({ nullable: true })
  submittedAt: Date | null;

  @ManyToOne(() => Contest, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'contest_id' })
  contest: Contest;

  @Column({ name: 'contest_id', nullable: true })
  contestId: string;

  @OneToMany(() => ApplicationLog, (log) => log.application)
  logs: ApplicationLog[];

  @OneToMany(() => AppFile, (file) => file.application)
  files: AppFile[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
