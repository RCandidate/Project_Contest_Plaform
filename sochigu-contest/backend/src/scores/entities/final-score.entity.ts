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
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Application } from "../../applications/entities/application.entity";

@Entity("final_scores")
@Unique(["applicationId", "expertId"])
export class FinalScore {
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

  @Column({ type: "jsonb", default: () => "'{}'" })
  items: Record<string, number>;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "edited_by_user_id" })
  editedBy: User | null;

  @Column({ name: "edited_by_user_id", type: "uuid", nullable: true })
  editedByUserId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
