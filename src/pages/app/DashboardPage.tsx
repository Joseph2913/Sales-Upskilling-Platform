import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowRight, Flame, Trophy, MessageSquare, Wrench, FileCheck, Target, Mic, ClipboardList, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useOrg } from '../../context/OrgContext';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts, cardStyle } from '../../constants/designTokens';
import { OBJECTIVE_META, LEARNING_OBJECTIVES } from '../../constants/learningObjectives';

// ─── Types ───

interface ObjectiveFormatProgress {
  a: 'locked' | 'in_progress' | 'completed';
  b: 'locked' | 'in_progress' | 'completed';
  c: 'locked' | 'in_progress' | 'completed';
}

interface LeaderboardEntry {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  level: number;
  points: number;
}

// ─── Mock data (replace with Supabase queries) ───

const MOCK_PROGRESS: Record<number, ObjectiveFormatProgress> = {
  1: { a: 'completed', b: 'completed', c: 'in_progress' },
  2: { a: 'locked', b: 'locked', c: 'locked' },
  3: { a: 'locked', b: 'locked', c: 'locked' },
  4: { a: 'locked', b: 'locked', c: 'locked' },
  5: { a: 'locked', b: 'locked', c: 'locked' },
  6: { a: 'locked', b: 'locked', c: 'locked' },
};

const MOCK_ARTEFACTS: Record<number, { coach: number; toolkit: number; projects: number }> = {
  1: { coach: 0, toolkit: 1, projects: 0 },
  2: { coach: 0, toolkit: 0, projects: 0 },
  3: { coach: 0, toolkit: 0, projects: 0 },
  4: { coach: 0, toolkit: 0, projects: 0 },
  5: { coach: 0, toolkit: 0, projects: 0 },
  6: { coach: 0, toolkit: 0, projects: 0 },
};

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { userId: '1', fullName: 'Matteo Sulis', avatarUrl: null, level: 5, points: 204 },
  { userId: '2', fullName: 'Marisha Boyd', avatarUrl: null, level: 1, points: 200 },
  { userId: '3', fullName: 'Phoebe Dowson', avatarUrl: null, level: 1, points: 48 },
  { userId: 'dummy-user-001', fullName: 'Demo User', avatarUrl: null, level: 1, points: 39 },
  { userId: '5', fullName: 'Francesco Carlomagno', avatarUrl: null, level: 1, points: 38 },
  { userId: '6', fullName: 'Elena Dudauri', avatarUrl: null, level: 1, points: 10 },
  { userId: '7', fullName: 'Felipe Horcajo Rubi', avatarUrl: null, level: 1, points: 4 },
  { userId: '8', fullName: 'Stefano Torchia', avatarUrl: null, level: 1, points: 0 },
  { userId: '9', fullName: 'Miriam Lyons', avatarUrl: null, level: 1, points: 0 },
  { userId: '10', fullName: 'Cristoforo Podda', avatarUrl: null, level: 1, points: 0 },
];

// ─── Helpers ───

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getObjectiveCompletedFormats(progress: ObjectiveFormatProgress): number {
  let count = 0;
  if (progress.a === 'completed') count++;
  if (progress.b === 'completed') count++;
  if (progress.c === 'completed') count++;
  return count;
}

function getObjectiveProgressPercent(progress: ObjectiveFormatProgress): number {
  return Math.round((getObjectiveCompletedFormats(progress) / 3) * 100);
}

function getOverallProgress(): { completed: number; total: number; percent: number } {
  let completed = 0;
  const total = 18; // 6 objectives * 3 formats
  for (const p of Object.values(MOCK_PROGRESS)) {
    completed += getObjectiveCompletedFormats(p);
  }
  return { completed, total, percent: Math.round((completed / total) * 100) };
}

function getCurrentObjective(): number {
  for (let i = 1; i <= 6; i++) {
    const p = MOCK_PROGRESS[i];
    if (p.a !== 'completed' || p.b !== 'completed' || p.c !== 'completed') return i;
  }
  return 6;
}

// ─── Rank badge colors: gold, silver, bronze for top 3 ───
const RANK_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: '#C5A24D', text: '#FFFFFF' },  // gold
  2: { bg: '#A0AEC0', text: '#FFFFFF' },  // silver
  3: { bg: '#C7875A', text: '#FFFFFF' },  // bronze
};

// ─── Avatar colors: rotating palette from OXYGY brand ───
const AVATAR_COLORS = [
  '#E8998D', // warm rose
  '#9F7AEA', // purple
  '#4299E1', // blue
  '#ED8936', // orange
  '#38B2AC', // teal
  '#48BB78', // green
  '#FC8181', // coral
  '#667EEA', // indigo
  '#D69E2E', // amber
  '#B794F4', // lavender
];

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

// ─── Sub-components ───

function ProgressRing({ percent, size = 80, strokeWidth = 6, color = colors.teal }: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={colors.border} strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}

function StagePill({ number, isActive, isCompleted, accent }: {
  number: number;
  isActive: boolean;
  isCompleted: boolean;
  accent: string;
}) {
  const bg = isActive ? accent : isCompleted ? accent : colors.border;
  const textColor = isActive || isCompleted ? '#FFFFFF' : colors.light;

  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: bg, color: textColor,
      fontFamily: fonts.heading, fontWeight: 700, fontSize: 13,
      opacity: !isActive && !isCompleted ? 0.5 : 1,
      transition: 'all 0.2s ease',
    }}>
      {isCompleted && !isActive ? '✓' : number}
    </div>
  );
}

function StageConnector({ isCompleted }: { isCompleted: boolean }) {
  return (
    <div style={{
      width: 24, height: 2,
      background: isCompleted ? colors.teal : colors.border,
      transition: 'background 0.2s ease',
    }} />
  );
}

function FormatBadge({ label, icon, status }: {
  label: string;
  icon: React.ReactNode;
  status: 'locked' | 'in_progress' | 'completed';
}) {
  const isComplete = status === 'completed';
  const isLocked = status === 'locked';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 14px', borderRadius: 20,
      background: isComplete ? colors.teal : isLocked ? colors.bg : colors.white,
      color: isComplete ? '#FFFFFF' : isLocked ? colors.muted : colors.navy,
      border: `1px solid ${isComplete ? colors.teal : colors.border}`,
      fontFamily: fonts.body, fontSize: 12, fontWeight: 600,
      opacity: isLocked ? 0.6 : 1,
    }}>
      {isComplete && <span style={{ fontSize: 11 }}>✓</span>}
      {icon}
      <span>{label}</span>
    </div>
  );
}

function ArtefactColumn({ title, icon, count, subtitle, items }: {
  title: string;
  icon: React.ReactNode;
  count: number;
  subtitle: string;
  items: { label: string; objectiveId: number; count: number }[];
}) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        {icon}
        <span style={{ fontFamily: fonts.heading, fontSize: 11, fontWeight: 700, color: colors.light, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>
          {title}
        </span>
      </div>
      <div style={{ fontFamily: fonts.heading, fontSize: 28, fontWeight: 800, color: colors.navy, marginBottom: 2 }}>
        {count} <span style={{ fontSize: 14, fontWeight: 400, color: colors.light }}>saved</span>
      </div>
      <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginBottom: 16 }}>
        {subtitle}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
        {items.map((item) => {
          const meta = OBJECTIVE_META.find((m) => m.id === item.objectiveId);
          return (
            <div key={item.objectiveId} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', borderRadius: 8,
              background: item.count > 0 ? colors.white : 'transparent',
              border: item.count > 0 ? `1px solid ${colors.border}` : 'none',
              opacity: item.count > 0 ? 1 : 0.5,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontFamily: fonts.heading, fontSize: 10, fontWeight: 700,
                  color: meta?.accentColor ?? colors.teal,
                  background: meta?.accentLight ?? colors.tealLight,
                  padding: '2px 6px', borderRadius: 4,
                }}>
                  O{item.objectiveId}
                </span>
                <span style={{ fontFamily: fonts.body, fontSize: 13, color: item.count > 0 ? colors.navy : colors.muted }}>
                  {item.label}
                </span>
              </div>
              <span style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 600, color: item.count > 0 ? colors.navy : colors.muted }}>
                {item.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Format status indicator — shows icon + completed/total like "1/1" with a chevron separator */
function FormatStatusChip({ icon, completed, total, color }: {
  icon: React.ReactNode;
  completed: number;
  total: number;
  color: string;
}) {
  const isAllDone = completed === total && total > 0;
  const isStarted = completed > 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '3px 8px', borderRadius: 6,
        background: isAllDone ? colors.tealLight : isStarted ? '#F7FAFC' : 'transparent',
      }}>
        {icon}
        <span style={{
          fontFamily: fonts.heading, fontSize: 12, fontWeight: 600,
          color: isAllDone ? colors.teal : isStarted ? color : colors.muted,
        }}>
          {completed}/{total}
        </span>
      </div>
      <ChevronDown size={11} color={colors.muted} style={{ transform: 'rotate(-90deg)' }} />
    </div>
  );
}

function JourneyRow({ objectiveId, progress, isExpanded, onToggle }: {
  objectiveId: number;
  progress: ObjectiveFormatProgress;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const meta = OBJECTIVE_META.find((m) => m.id === objectiveId)!;
  const objective = LEARNING_OBJECTIVES.find((o) => o.id === objectiveId)!;
  const percent = getObjectiveProgressPercent(progress);
  const isLocked = objectiveId > getCurrentObjective();
  const isCurrent = objectiveId === getCurrentObjective();

  // Count completed per format type (each is 0 or 1 out of 1)
  const aCompleted = progress.a === 'completed' ? 1 : 0;
  const aTotal = progress.a === 'locked' ? 0 : 1;
  const bCompleted = progress.b === 'completed' ? 1 : 0;
  const bTotal = progress.b === 'locked' ? 0 : 1;
  const cCompleted = progress.c === 'completed' ? 1 : 0;
  const cTotal = progress.c === 'locked' ? 0 : 1;

  return (
    <div style={{
      borderBottom: `1px solid ${colors.border}`,
      opacity: isLocked ? 0.5 : 1,
    }}>
      <button
        onClick={onToggle}
        disabled={isLocked}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 16,
          padding: '16px 0', background: 'none', border: 'none', cursor: isLocked ? 'default' : 'pointer',
          textAlign: 'left' as const,
        }}
      >
        {/* Objective number circle */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isCurrent ? meta.accentLight : 'transparent',
          border: `2px solid ${isCurrent ? meta.accentColor : colors.border}`,
          fontFamily: fonts.heading, fontWeight: 700, fontSize: 14,
          color: isCurrent ? meta.accentColor : colors.muted,
        }}>
          {objectiveId}
        </div>

        {/* Title & subtitle */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 15, color: colors.navy }}>
              {meta.title}
            </span>
            {isLocked && (
              <span style={{ fontFamily: fonts.body, fontSize: 11, color: colors.muted }}>
                Complete Objective {objectiveId - 1} to unlock
              </span>
            )}
          </div>
          <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.light }}>
            {meta.shortTitle}
          </span>
        </div>

        {/* Format status chips — fraction-based like the AI Upskilling reference */}
        {!isLocked ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <FormatStatusChip icon={<Target size={13} color={aCompleted ? colors.teal : colors.light} />} completed={aCompleted} total={aTotal || 1} color={meta.accentColor} />
            <FormatStatusChip icon={<Mic size={13} color={bCompleted ? colors.teal : colors.light} />} completed={bCompleted} total={bTotal || 1} color={meta.accentColor} />
            <FormatStatusChip icon={<ClipboardList size={13} color={cCompleted ? colors.teal : colors.light} />} completed={cCompleted} total={cTotal || 1} color={meta.accentColor} />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <FormatStatusChip icon={<Target size={13} color={colors.muted} />} completed={0} total={0} color={colors.muted} />
            <FormatStatusChip icon={<Mic size={13} color={colors.muted} />} completed={0} total={0} color={colors.muted} />
            <FormatStatusChip icon={<ClipboardList size={13} color={colors.muted} />} completed={0} total={0} color={colors.muted} />
          </div>
        )}

        {/* Progress percent */}
        <div style={{
          fontFamily: fonts.heading, fontWeight: 700, fontSize: 14,
          color: percent === 100 ? colors.success : percent > 0 ? meta.accentColor : colors.muted,
          width: 48, textAlign: 'right' as const, flexShrink: 0,
        }}>
          {isLocked ? '—' : `${percent}%`}
        </div>

        {/* Chevron */}
        <div style={{ flexShrink: 0, color: colors.muted, transition: 'transform 0.2s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <ChevronDown size={18} />
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && !isLocked && (
        <div style={{
          padding: '0 0 20px 52px',
          animation: 'fadeSlideUp 0.2s ease-out',
        }}>
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.body, lineHeight: 1.6, marginBottom: 16, maxWidth: 600 }}>
            {objective.description}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
            {objective.formats.map((f) => {
              const status = f.format === 'A' ? progress.a : f.format === 'B' ? progress.b : progress.c;
              return (
                <div key={f.format} style={{
                  padding: '10px 16px', borderRadius: 8,
                  border: `1px solid ${status === 'completed' ? colors.teal : colors.border}`,
                  background: status === 'completed' ? colors.tealLight : colors.white,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 14 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.navy }}>{f.label}</div>
                    <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.light }}>{f.title}</div>
                  </div>
                  {status === 'completed' && (
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', background: colors.teal, marginLeft: 4,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Check size={11} color="#FFFFFF" strokeWidth={3} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function LeaderboardRow({ entry, rank, isCurrentUser, index }: {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
  index: number;
}) {
  const bgColor = isCurrentUser ? colors.tealLight : 'transparent';
  const borderColor = isCurrentUser ? colors.teal : 'transparent';
  const rankStyle = RANK_COLORS[rank];
  const avatarBg = isCurrentUser ? colors.teal : getAvatarColor(index);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px', borderRadius: 10,
      background: bgColor,
      border: `1.5px solid ${borderColor}`,
    }}>
      {/* Rank badge */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: rankStyle ? `${rankStyle.bg}18` : 'transparent', // 18 = ~10% opacity hex suffix
        color: rankStyle?.bg ?? colors.light,
        fontFamily: fonts.heading, fontWeight: 700, fontSize: 13,
        border: rankStyle ? `1.5px solid ${rankStyle.bg}40` : `1.5px solid ${colors.border}`,
      }}>
        {rank}
      </div>

      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: avatarBg,
        color: '#FFFFFF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: fonts.heading, fontSize: 12, fontWeight: 700,
      }}>
        {getInitials(entry.fullName)}
      </div>

      {/* Name + level */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: fonts.body, fontSize: 13, fontWeight: 600,
          color: colors.navy,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
        }}>
          {entry.fullName}{isCurrentUser ? <span style={{ color: colors.teal, fontWeight: 500 }}> (You)</span> : ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span style={{
            background: colors.tealLight, color: colors.tealDark,
            padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700,
            fontFamily: fonts.heading,
          }}>
            O{entry.level}
          </span>
        </div>
      </div>

      {/* Points */}
      <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
        <span style={{
          fontFamily: fonts.heading, fontWeight: 700, fontSize: 16,
          color: colors.navy,
        }}>
          {entry.points}
        </span>
        <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.muted }}>pts</div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───

export default function DashboardPage() {
  const { userProfile } = useApp();
  useOrg();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [artefactsExpanded, setArtefactsExpanded] = useState(false);
  const [expandedObjective, setExpandedObjective] = useState<number | null>(null);

  const currentObjective = getCurrentObjective();
  const currentMeta = OBJECTIVE_META.find((m) => m.id === currentObjective)!;
  const currentLearningObj = LEARNING_OBJECTIVES.find((o) => o.id === currentObjective)!;
  const currentProgress = MOCK_PROGRESS[currentObjective];
  const currentPercent = getObjectiveProgressPercent(currentProgress);
  const currentCompleted = getObjectiveCompletedFormats(currentProgress);
  const overall = getOverallProgress();

  const firstName = useMemo(() => {
    const name = userProfile?.fullName ?? user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'User';
    return name.split(' ')[0];
  }, [userProfile, user]);

  const userPoints = MOCK_LEADERBOARD.find((e) => e.userId === user?.id)?.points ?? 0;
  const userRank = MOCK_LEADERBOARD.findIndex((e) => e.userId === user?.id) + 1 || MOCK_LEADERBOARD.length;

  const totalArtefacts = Object.values(MOCK_ARTEFACTS).reduce(
    (acc, v) => ({ coach: acc.coach + v.coach, toolkit: acc.toolkit + v.toolkit, projects: acc.projects + v.projects }),
    { coach: 0, toolkit: 0, projects: 0 },
  );

  return (
    <div style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>

      {/* ─── Greeting Card ─── */}
      <div style={{
        ...cardStyle,
        marginBottom: 24,
        position: 'relative' as const,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '28px 32px',
      }}>
        {/* Decorative background — warm gradient blobs */}
        {/* Large warm peach/gold blob */}
        <div style={{
          position: 'absolute' as const, top: -60, right: 80,
          width: 260, height: 260, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(237,137,54,0.12) 0%, rgba(214,158,46,0.08) 40%, transparent 70%)',
          pointerEvents: 'none' as const,
        }} />
        {/* Teal accent blob */}
        <div style={{
          position: 'absolute' as const, top: -30, right: -30,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,178,172,0.15) 0%, rgba(56,178,172,0.05) 50%, transparent 70%)',
          pointerEvents: 'none' as const,
        }} />
        {/* Soft mint ring */}
        <div style={{
          position: 'absolute' as const, top: -10, right: 0,
          width: 160, height: 160, borderRadius: '50%',
          border: '2px solid rgba(168,240,224,0.25)',
          pointerEvents: 'none' as const,
        }} />
        {/* Inner ring */}
        <div style={{
          position: 'absolute' as const, top: 20, right: 30,
          width: 100, height: 100, borderRadius: '50%',
          border: '1.5px solid rgba(56,178,172,0.10)',
          pointerEvents: 'none' as const,
        }} />

        {/* Left: greeting + stage pills */}
        <div style={{ position: 'relative' as const, zIndex: 1 }}>
          <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.light, margin: 0, marginBottom: 2 }}>
            {getGreeting()}
          </p>
          <h1 style={{ fontFamily: fonts.heading, fontWeight: 800, fontSize: 30, color: colors.navy, margin: 0, marginBottom: 16 }}>
            {firstName}.
          </h1>

          {/* Stage pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
            {OBJECTIVE_META.map((meta, idx) => {
              const isCompleted = getObjectiveProgressPercent(MOCK_PROGRESS[meta.id]) === 100;
              const isActive = meta.id === currentObjective;
              return (
                <div key={meta.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <StagePill number={meta.id} isActive={isActive} isCompleted={isCompleted} accent={meta.accentColor} />
                  {idx < OBJECTIVE_META.length - 1 && <StageConnector isCompleted={isCompleted} />}
                </div>
              );
            })}
          </div>
          <p style={{ fontFamily: fonts.body, fontSize: 12, color: colors.light, margin: 0 }}>
            Objective {currentObjective} · {currentMeta.shortTitle}
          </p>
        </div>

        {/* Right: streak + score + progress ring */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative' as const, zIndex: 1 }}>
          {/* Streak badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 24,
            background: colors.tealLight, border: `1px solid ${colors.mint}`,
          }}>
            <Flame size={16} color={colors.teal} />
            <span style={{ fontFamily: fonts.heading, fontWeight: 800, fontSize: 16, color: colors.navy }}>
              {userProfile?.streakDays ?? 0}
            </span>
            <span style={{ fontFamily: fonts.body, fontSize: 11, color: colors.light, textTransform: 'uppercase' as const, fontWeight: 600, letterSpacing: 0.3 }}>
              day streak
            </span>
          </div>

          {/* Score block */}
          <div style={{ textAlign: 'right' as const }}>
            <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.light, textTransform: 'uppercase' as const, letterSpacing: 0.5, fontWeight: 600 }}>Your Score</div>
            <div style={{ fontFamily: fonts.heading, fontWeight: 800, fontSize: 32, color: colors.navy, lineHeight: 1.1 }}>
              {userPoints}
            </div>
            <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.light }}>
              Rank #{userRank} of {MOCK_LEADERBOARD.length}
            </div>
          </div>

          {/* Overall progress ring */}
          <div style={{ position: 'relative' as const, width: 64, height: 64 }}>
            <ProgressRing percent={overall.percent} size={64} strokeWidth={5} color={colors.teal} />
            <div style={{
              position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: fonts.heading, fontWeight: 800, fontSize: 15, color: colors.navy }}>{overall.percent}%</span>
              <span style={{ fontFamily: fonts.body, fontSize: 9, color: colors.light }}>{overall.completed} / {overall.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main layout: content + leaderboard sidebar ─── */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'stretch' }}>
        {/* Left: main content */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' as const }}>

          {/* ─── Current Objective Card ─── */}
          <div style={{
            ...cardStyle,
            marginBottom: 24,
            borderLeft: `3px solid ${currentMeta.accentColor}`,
            position: 'relative' as const,
            overflow: 'hidden',
          }}>
            {/* Objective label */}
            <div style={{
              display: 'inline-block', padding: '3px 10px', borderRadius: 4,
              background: currentMeta.accentLight, color: currentMeta.accentColor,
              fontFamily: fonts.heading, fontWeight: 700, fontSize: 11,
              textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 12,
            }}>
              Objective {currentObjective}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 20, color: colors.navy, margin: 0, marginBottom: 6 }}>
                  {currentMeta.title}
                </h2>
                <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.body, lineHeight: 1.6, margin: 0, marginBottom: 20, maxWidth: 600 }}>
                  {currentLearningObj.subtitle}
                </p>

                {/* Format stages */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FormatBadge label="Decision Sim" icon={<Target size={13} />} status={currentProgress.a} />
                  <div style={{ width: 16, height: 1, background: colors.border }} />
                  <FormatBadge label="Voice Sim" icon={<Mic size={13} />} status={currentProgress.b} />
                  <div style={{ width: 16, height: 1, background: colors.border }} />
                  <FormatBadge label="Build & Apply" icon={<ClipboardList size={13} />} status={currentProgress.c} />
                </div>
              </div>

              {/* Progress ring + CTA */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0, marginLeft: 24 }}>
                <div style={{ position: 'relative' as const, width: 80, height: 80 }}>
                  <ProgressRing percent={currentPercent} size={80} strokeWidth={6} color={currentMeta.accentColor} />
                  <div style={{
                    position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0,
                    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontFamily: fonts.heading, fontWeight: 800, fontSize: 18, color: colors.navy }}>{currentPercent}%</span>
                    <span style={{ fontFamily: fonts.body, fontSize: 10, color: colors.light }}>{currentCompleted} / 3</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/app/objective/${currentObjective}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: colors.navy, color: '#FFFFFF', border: 'none',
                    borderRadius: 8, padding: '12px 20px',
                    fontFamily: fonts.body, fontWeight: 600, fontSize: 14,
                    cursor: 'pointer', whiteSpace: 'nowrap' as const,
                  }}
                >
                  {currentProgress.c === 'in_progress' ? 'Continue Project' : currentProgress.b === 'in_progress' ? 'Continue Sim' : 'Start Next'} <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* ─── Artefact Collection (collapsible) ─── */}
            <div style={{ borderTop: `1px solid ${colors.border}`, marginTop: 20, paddingTop: 16 }}>
              <button
                onClick={() => setArtefactsExpanded(!artefactsExpanded)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}
              >
                <span style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 14, color: colors.navy }}>
                  Your Artefact Collection
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.light, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MessageSquare size={13} /> {totalArtefacts.coach} coach
                  </span>
                  <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.light, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Wrench size={13} /> {totalArtefacts.toolkit} toolkit
                  </span>
                  <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.light, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FileCheck size={13} /> {totalArtefacts.projects} projects
                  </span>
                  <ChevronDown
                    size={16}
                    color={colors.muted}
                    style={{ transition: 'transform 0.2s ease', transform: artefactsExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </div>
              </button>

              {artefactsExpanded && (
                <div style={{
                  display: 'flex', gap: 32, marginTop: 20,
                  animation: 'fadeSlideUp 0.2s ease-out',
                }}>
                  <ArtefactColumn
                    title="Sales Coach"
                    icon={<MessageSquare size={15} color={colors.teal} />}
                    count={totalArtefacts.coach}
                    subtitle={`Across ${Object.values(MOCK_ARTEFACTS).filter((a) => a.coach > 0).length} objectives`}
                    items={OBJECTIVE_META.map((m) => ({
                      label: m.shortTitle,
                      objectiveId: m.id,
                      count: MOCK_ARTEFACTS[m.id]?.coach ?? 0,
                    }))}
                  />
                  <div style={{ width: 1, background: colors.border }} />
                  <ArtefactColumn
                    title="Toolkit"
                    icon={<Wrench size={15} color={colors.teal} />}
                    count={totalArtefacts.toolkit}
                    subtitle={`Across ${Object.values(MOCK_ARTEFACTS).filter((a) => a.toolkit > 0).length} objective${Object.values(MOCK_ARTEFACTS).filter((a) => a.toolkit > 0).length !== 1 ? 's' : ''}`}
                    items={OBJECTIVE_META.map((m) => ({
                      label: m.shortTitle,
                      objectiveId: m.id,
                      count: MOCK_ARTEFACTS[m.id]?.toolkit ?? 0,
                    }))}
                  />
                  <div style={{ width: 1, background: colors.border }} />
                  <ArtefactColumn
                    title="Project Proofs"
                    icon={<FileCheck size={15} color={colors.teal} />}
                    count={totalArtefacts.projects}
                    subtitle={`Across ${Object.values(MOCK_ARTEFACTS).filter((a) => a.projects > 0).length} objectives`}
                    items={OBJECTIVE_META.map((m) => ({
                      label: m.shortTitle,
                      objectiveId: m.id,
                      count: MOCK_ARTEFACTS[m.id]?.projects ?? 0,
                    }))}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ─── Your Journey ─── */}
          <div style={{ ...cardStyle, marginBottom: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>🗺️</span>
                <h2 style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 18, color: colors.navy, margin: 0 }}>
                  Your Journey
                </h2>
              </div>
              <button
                onClick={() => navigate('/app/journey')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: fonts.body, fontWeight: 600, fontSize: 13, color: colors.teal,
                }}
              >
                View all <ArrowRight size={14} />
              </button>
            </div>

            <div>
              {OBJECTIVE_META.map((meta) => (
                <JourneyRow
                  key={meta.id}
                  objectiveId={meta.id}
                  progress={MOCK_PROGRESS[meta.id]}
                  isExpanded={expandedObjective === meta.id}
                  onToggle={() => setExpandedObjective(expandedObjective === meta.id ? null : meta.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ─── Right sidebar: Cohort Leaderboard ─── */}
        <div style={{
          width: 340, flexShrink: 0,
          ...cardStyle,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Trophy size={18} color="#C5A24D" /> {/* gold */}
              <span style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 16, color: colors.navy }}>
                Cohort Leaderboard
              </span>
            </div>
            <button
              onClick={() => navigate('/app/cohort')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: fonts.body, fontWeight: 600, fontSize: 12, color: colors.teal,
              }}
            >
              View all →
            </button>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex', justifyContent: 'space-around',
            padding: '14px 0', marginBottom: 14,
            borderTop: `1px solid ${colors.border}`,
            borderBottom: `1px solid ${colors.border}`,
          }}>
            <div style={{ textAlign: 'center' as const }}>
              <div style={{ fontFamily: fonts.heading, fontWeight: 800, fontSize: 20, color: colors.navy }}>
                {MOCK_LEADERBOARD.length}
              </div>
              <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.light }}>Active</div>
            </div>
            <div style={{ textAlign: 'center' as const }}>
              <div style={{ fontFamily: fonts.heading, fontWeight: 800, fontSize: 20, color: colors.navy }}>
                {currentObjective}
              </div>
              <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.light }}>Your Level</div>
            </div>
            <div style={{ textAlign: 'center' as const }}>
              <div style={{
                fontFamily: fonts.heading, fontWeight: 800, fontSize: 20,
                color: userRank <= 3 ? colors.teal : colors.navy,
              }}>
                #{userRank}
              </div>
              <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.light }}>Your Rank</div>
            </div>
          </div>

          {/* Leaderboard entries */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
            {MOCK_LEADERBOARD.map((entry, idx) => (
              <LeaderboardRow
                key={entry.userId}
                entry={entry}
                rank={idx + 1}
                isCurrentUser={entry.userId === user?.id}
                index={idx}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
