import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Application } from "../../applications/entities/application.entity";
import { User } from "../../users/entities/user.entity";
import { Role } from "../../common/enums/role.enum";
import { MessageKind } from "../../common/enums/message-kind.enum";

@Entity("application_messages")
@Index(["applicationId", "createdAt"])
export class ApplicationMessage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Application, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "application_id" })
  application: Application;

  @Column({ name: "application_id", type: "uuid" })
  applicationId: string;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "author_id" })
  author: User;

  @Column({ name: "author_id", type: "uuid", nullable: true })
  authorId: string | null;

  // Снимок роли автора на момент отправки (роль пользователя может измениться позже)
  @Column({ type: "enum", enum: Role })
  authorRole: Role;

  @Column({ type: "enum", enum: MessageKind, default: MessageKind.MESSAGE })
  kind: MessageKind;

  @Column({ type: "varchar", length: 2000 })
  text: string;

  // Внутренняя заметка: видна только эксперту, модератору и админу
  @Column({ default: false })
  isInternal: boolean;

  // Мягкое удаление
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
