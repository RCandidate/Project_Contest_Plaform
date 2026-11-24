import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Application } from "../../applications/entities/application.entity";
import { User } from "../../users/entities/user.entity";

// Когда пользователь последний раз открывал ветку переписки по заявке.
// Нужна для подсчёта непрочитанных и троттлинга писем.
@Entity("application_thread_reads")
export class ApplicationThreadRead {
  @PrimaryColumn({ name: "application_id", type: "uuid" })
  applicationId: string;

  @PrimaryColumn({ name: "user_id", type: "uuid" })
  userId: string;

  @ManyToOne(() => Application, { onDelete: "CASCADE" })
  @JoinColumn({ name: "application_id" })
  application: Application;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "timestamp", default: () => "now()" })
  lastReadAt: Date;

  // Когда этому пользователю последний раз отправляли письмо о новом сообщении
  @Column({ type: "timestamp", nullable: true })
  lastEmailAt: Date | null;
}
