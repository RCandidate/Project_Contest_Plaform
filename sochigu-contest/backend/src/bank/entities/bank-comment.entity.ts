import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Application } from "../../applications/entities/application.entity";

@Entity("bank_comments")
export class BankComment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Application, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "application_id" })
  application: Application;

  @Index()
  @Column({ name: "application_id" })
  applicationId: string;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "author_id" })
  author: User;

  @Column({ name: "author_id", nullable: true })
  authorId: string;

  @Column({ length: 1000 })
  text: string;

  @CreateDateColumn()
  createdAt: Date;
}
