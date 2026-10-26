import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../applications/entities/application.entity';
import { User } from '../users/entities/user.entity';
import { ApplicationLog } from '../applications/entities/application-log.entity';
import { Role } from '../common/enums/role.enum';
import { canonicalUniversity } from "../common/utils/universities";


@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Application) private appRepo: Repository<Application>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(ApplicationLog) private logRepo: Repository<ApplicationLog>,
  ) {}

  async getSummary(contestId?: string) {
    const weekAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);

    const baseQb = () => {
      const qb = this.appRepo.createQueryBuilder('a');
      if (contestId) qb.where('a.contestId = :cid', { cid: contestId });
      return qb;
    };

    const [totalApplications, newThisWeek, underReview] = await Promise.all([
      baseQb().getCount(),
      baseQb().andWhere('a.submittedAt >= :since', { since: weekAgo }).getCount(),
      baseQb().andWhere('a.status = :status', { status: 'submitted' }).getCount(),
    ]);

    const totalUsers = await this.userRepo.count({ where: { role: Role.PARTICIPANT } });

    const uniRows = await this.userRepo
      .createQueryBuilder("u")
      .select("u.university", "university")
      .where(
        "u.university IS NOT NULL AND u.university != '' AND u.role = :role",
        {
          role: Role.PARTICIPANT,
        },
      )
      .getRawMany();

    const uniqueUniversities = new Set(
      uniRows.map((r) => canonicalUniversity(r.university)).filter(Boolean),
    );

    const teamStats = await this.appRepo.manager.query(`
      SELECT
        COUNT(DISTINCT user_id)::int AS team_applications,
        COALESCE(ROUND(AVG(jsonb_array_length("teamMembers")) FILTER (WHERE jsonb_array_length(COALESCE("teamMembers", '[]'::jsonb)) >= 1)::numeric, 1), 0)::float AS avg_team_size
      FROM applications
      WHERE "teamMembers" IS NOT NULL AND jsonb_array_length("teamMembers") >= 1
      ${contestId ? 'AND contest_id = $1' : ''}
    `, contestId ? [contestId] : []);

    return {
      totalApplications,
      totalUsers,
      totalUniversities: uniqueUniversities.size,
      newThisWeek,
      underReview,
      teamApplications: Number(teamStats[0]?.team_applications ?? 0),
      avgTeamSize: Number(teamStats[0]?.avg_team_size ?? 0),
    };
  }

  async getByStatus(contestId?: string) {
    const qb = this.appRepo
      .createQueryBuilder('a')
      .select('a.status', 'status')
      .addSelect('COUNT(a.id)', 'count')
      .groupBy('a.status');
    if (contestId) qb.where('a.contestId = :cid', { cid: contestId });
    const rows = await qb.getRawMany();
    return rows.map(r => ({ status: r.status, count: Number(r.count) }));
  }

  async getActivity(contestId?: string) {
    const qb = this.logRepo
      .createQueryBuilder('al')
      .leftJoin('al.application', 'a')
      .leftJoin('al.changedBy', 'u')
      .leftJoin('a.nomination', 'n')
      .select('al.id', 'id')
      .addSelect('al.toStatus', 'toStatus')
      .addSelect('al.fromStatus', 'fromStatus')
      .addSelect('al.createdAt', 'createdAt')
      .addSelect('a.projectTitle', 'projectTitle')
      .addSelect('u.firstName', 'firstName')
      .addSelect('u.lastName', 'lastName')
      .addSelect('n.name', 'nominationName')
      .orderBy('al.createdAt', 'DESC')
      .limit(20);
    if (contestId) qb.where('a.contestId = :cid', { cid: contestId });
    const rows = await qb.getRawMany();

    return rows.map(r => ({
      id: r.id,
      toStatus: r.toStatus,
      fromStatus: r.fromStatus,
      createdAt: r.createdAt,
      projectTitle: r.projectTitle || '—',
      userName: r.firstName && r.lastName ? `${r.firstName} ${r.lastName}` : '—',
      nominationName: r.nominationName || '—',
    }));
  }

  async getByNomination(contestId?: string) {
    const qb = this.appRepo
      .createQueryBuilder('a')
      .leftJoin('a.nomination', 'n')
      .select('n.name', 'nomination')
      .addSelect('COUNT(a.id)', 'count')
      .where('a.nominationId IS NOT NULL')
      .groupBy('n.name')
      .orderBy('count', 'DESC');
    if (contestId) qb.andWhere('a.contestId = :cid', { cid: contestId });
    const rows = await qb.getRawMany();
    return rows.map(r => ({ ...r, count: Number(r.count) }));
  }

  async getTimeline(contestId?: string) {
    const qb = this.appRepo
      .createQueryBuilder('a')
      .select("DATE_TRUNC('day', a.submittedAt)", 'date')
      .addSelect('COUNT(a.id)', 'count')
      .where('a.submittedAt IS NOT NULL')
      .groupBy("DATE_TRUNC('day', a.submittedAt)")
      .orderBy('date', 'ASC');
    if (contestId) qb.andWhere('a.contestId = :cid', { cid: contestId });
    const rows = await qb.getRawMany();
    return rows.map(r => ({ ...r, count: Number(r.count) }));
  }

  async getGeography(contestId?: string) {
    const qb = this.userRepo
      .createQueryBuilder('u')
      .select('u.city', 'city')
      .addSelect('COUNT(u.id)', 'count')
      .where('u.city IS NOT NULL AND u.role = :role', { role: Role.PARTICIPANT })
      .groupBy('u.city')
      .orderBy('count', 'DESC');
    if (contestId) {
      qb.andWhere(
        `u.id IN (SELECT a.user_id FROM applications a WHERE a.contest_id = :cid)`,
        { cid: contestId },
      );
    }
    const rows = await qb.getRawMany();
    return rows.map(r => ({ ...r, count: Number(r.count) }));
  }

  async getKeywords(contestId?: string) {
    const rows = await this.appRepo.manager.query(`
      SELECT TRIM(keyword) AS keyword, COUNT(*) AS count
      FROM applications a,
      UNNEST(STRING_TO_ARRAY(a.keywords, ',')) AS keyword
      WHERE a.keywords IS NOT NULL AND a.keywords != '' AND TRIM(keyword) != ''
      ${contestId ? 'AND a.contest_id = $1' : ''}
      GROUP BY TRIM(keyword)
      ORDER BY count DESC
      LIMIT 50
    `, contestId ? [contestId] : []);
    return rows.map((r: any) => ({ ...r, count: Number(r.count) }));
  }
}
