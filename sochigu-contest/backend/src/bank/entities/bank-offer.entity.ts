import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Application } from "../../applications/entities/application.entity";
import { OfferStatus } from "../../common/enums/bank.enum";

@Entity("bank_offers")
export class BankOffer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Application, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "application_id" })
  application: Application;

  @Index()
  @Column({ name: "application_id" })
  applicationId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "employer_id" })
  employer: User;

  @Index()
  @Column({ name: "employer_id" })
  employerId: string;

  @Column({ length: 3000 })
  message: string;

  @Column({ nullable: true })
  contactEmail: string;

  @Column({ nullable: true })
  contactPhone: string;

  @Index()
  @Column({ type: "enum", enum: OfferStatus, default: OfferStatus.NEW })
  status: OfferStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
