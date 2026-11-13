import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Nomination } from '../../nominations/entities/nomination.entity';
import { Contest } from '../../contests/entities/contest.entity';

@Entity('winners')
export class Winner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectTitle: string;

  @Column()
  teamName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  year: number;

  @Column()
  place: number;

  @ManyToOne(() => Contest, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'contest_id' })
  contest: Contest;

  @Column({ name: 'contest_id', nullable: true })
  contestId: string;

  @ManyToOne(() => Nomination)
  @JoinColumn({ name: 'nomination_id' })
  nomination: Nomination;

  @Column({ name: 'nomination_id', nullable: true })
  nominationId: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ nullable: true })
  university: string;

  @CreateDateColumn()
  createdAt: Date;
}
