import { Types } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function httpError(message: string, status: number) {
  return Object.assign(new Error(message), { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requiredText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) throw httpError('Activity details are required', 400);

  const userId = requiredText(input.userId);
  const teamId = requiredText(input.teamId);
  const type = requiredText(input.type);
  const minutes = input.minutes;
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(teamId)) {
    throw httpError('A valid userId and teamId are required', 400);
  }
  if (!type || typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 1) {
    throw httpError('A type and positive minutes value are required', 400);
  }

  const [user, team] = await Promise.all([
    User.exists({ _id: userId }),
    Team.exists({ _id: teamId }),
  ]);
  if (!user || !team) throw httpError('The specified user or team does not exist', 404);

  return Activity.create({
    user: userId,
    team: teamId,
    type,
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input)) throw httpError('Team details are required', 400);

  const name = requiredText(input.name);
  const mascot = requiredText(input.mascot);
  const members = input.members ?? [];
  if (!name || !mascot) throw httpError('A team name and mascot are required', 400);
  if (!Array.isArray(members)) throw httpError('Team members must be a list of user IDs', 400);

  const memberIds = members.map((member): string => {
    if (typeof member !== 'string' || !Types.ObjectId.isValid(member.trim())) {
      throw httpError('Team members must be valid user IDs', 400);
    }
    return member.trim();
  });
  const uniqueMemberIds = [...new Set(memberIds)];
  if (uniqueMemberIds.length > 0) {
    const existingMembers = await User.countDocuments({ _id: { $in: uniqueMemberIds } });
    if (existingMembers !== uniqueMemberIds.length) throw httpError('One or more team members do not exist', 404);
  }

  return Team.create({ name, mascot, members: uniqueMemberIds });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().lean(),
    Activity.aggregate<{ _id: Types.ObjectId; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map(({ _id, totalPoints }) => [_id.toString(), totalPoints]));
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: pointsByTeam.get(team._id.toString()) ?? 0 }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

function activityFocus(type: string | undefined) {
  const normalized = type?.trim().toLowerCase();
  if (normalized === 'strength') return 'strength';
  if (normalized === 'yoga' || normalized === 'mobility') return 'mobility';
  if (normalized) return 'endurance';
  return undefined;
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) throw httpError('User not found', 404);

  const [recentActivity, workouts] = await Promise.all([
    Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean(),
    Workout.find().lean(),
  ]);
  const goal = user.fitnessGoal.trim().toLowerCase();
  const recentFocus = activityFocus(recentActivity?.type);
  const recommendedFocus = [goal, recentFocus].find((focus) => workouts.some((workout) => workout.focus.toLowerCase() === focus))
    ?? workouts[0]?.focus.toLowerCase();
  if (!recommendedFocus) return [];

  const reason = goal === recommendedFocus
    ? `Recommended for your ${user.fitnessGoal} goal.`
    : recentFocus === recommendedFocus
      ? `Recommended based on your recent ${recentActivity?.type} activity.`
      : `Recommended as a workout option for your ${user.fitnessGoal} goal.`;
  return workouts
    .filter((workout) => workout.focus.toLowerCase() === recommendedFocus)
    .map((workout) => ({ ...workout, reason }));
}

export { User };
