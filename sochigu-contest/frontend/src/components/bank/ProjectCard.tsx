import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import {
  BankProject,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from "@/types";
import { cardItem, hoverCardSm } from "@/utils/animations";

const MotionLink = motion(Link);
const MAX_KEYWORDS = 4;

export function ProjectCard({ project }: { project: BankProject }) {
  const shown = project.keywords.slice(0, MAX_KEYWORDS);
  const rest = project.keywords.length - shown.length;

  return (
    <MotionLink
      to={`/bank/projects/${project.id}`}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col hover:shadow-md transition-shadow relative"
      variants={cardItem}
      {...hoverCardSm}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${APPLICATION_STATUS_COLORS[project.status]}`}
        >
          {APPLICATION_STATUS_LABELS[project.status]}
        </span>
        {project.contest && (
          <span className="text-xs font-medium bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full truncate max-w-[50%]">
            {project.contest.name}
          </span>
        )}
      </div>

      <h2 className="font-bold text-gray-900 leading-snug mb-1 line-clamp-2">
        {project.title}
      </h2>
      {project.nomination && (
        <p className="text-xs text-accent-600 font-medium mb-2">
          {project.nomination.name}
        </p>
      )}
      <p className="text-sm text-gray-600 line-clamp-3 mb-3">
        {project.summary}
      </p>

      {shown.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {shown.map((k) => (
            <span
              key={k}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {k}
            </span>
          ))}
          {rest > 0 && (
            <span className="text-xs text-gray-400 px-1 py-0.5">+{rest}</span>
          )}
        </div>
      )}

      <p className="mt-auto pt-2 text-xs text-gray-400 flex items-center gap-1">
        <Users size={14} aria-hidden />
        Команда: {project.teamSize} чел.
      </p>
    </MotionLink>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-5 bg-gray-200 rounded-full w-24" />
        <div className="h-5 bg-gray-100 rounded-full w-16" />
      </div>
      <div className="h-5 bg-gray-200 rounded w-4/5" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="h-4 bg-gray-100 rounded w-full" />
      <div className="h-4 bg-gray-100 rounded w-2/3" />
    </div>
  );
}
