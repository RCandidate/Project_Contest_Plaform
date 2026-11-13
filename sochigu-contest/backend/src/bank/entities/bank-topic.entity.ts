import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { BankTopicStatus } from "../../common/enums/bank.enum";

@Entity("bank_topics")
export class BankTopic {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column()
  organization: string;

  @Column({ nullable: true })
  contactEmail: string;

  @Column({ nullable: true })
  contactPhone: string;

  @Index()
  @Column({
    type: "enum",
    enum: BankTopicStatus,
    default: BankTopicStatus.PENDING,
  })
  status: BankTopicStatus;

  @Column({ type: "text", nullable: true })
  moderationComment: string;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "author_id" })
  author: User;

  @Index()
  @Column({ name: "author_id", nullable: true })
  authorId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
