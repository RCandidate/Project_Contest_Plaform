import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
  Check,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Application } from "../../applications/entities/application.entity";

@Entity("scores")
@Unique(["applicationId", "expertId"])
@Check('"points" >= 0 AND "points" <= 100')
export class Score {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Application, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "application_id" })
  application: Application;

  @Column({ name: "application_id" })
  applicationId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "expert_id" })
  expert: User;

  @Index()
  @Column({ name: "expert_id" })
  expertId: string;

  @Column({ type: "int" })
  points: number;

  // коды из scores/score-qualities.ts
  @Column({ type: "simple-array", nullable: true })
  qualities: string[];

  @Column({ length: 50, nullable: true })
  specialOpinion: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
