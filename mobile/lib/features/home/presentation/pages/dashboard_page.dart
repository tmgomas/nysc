import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../config/themes/color_palette.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../../profile/presentation/cubit/profile_cubit.dart';
import '../../../attendance/presentation/cubit/attendance_cubit.dart';
import '../../../schedule/presentation/cubit/schedule_cubit.dart';
import 'package:intl/intl.dart';

/// Dashboard tab — shows welcome, quick stats, recent activity.
class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  @override
  void initState() {
    super.initState();
    context.read<ProfileCubit>().loadProfile();
    context.read<AttendanceCubit>().loadAttendance();
    context.read<ScheduleCubit>().loadSchedule();
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async {
        context.read<ProfileCubit>().loadProfile();
        context.read<AttendanceCubit>().loadAttendance();
        context.read<ScheduleCubit>().loadSchedule();
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeroSection(),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildAlertBanner(),
                  const SizedBox(height: 24),
                  _buildQuickActions(),
                  const SizedBox(height: 24),
                  _buildUpcomingClassesSection(),
                  const SizedBox(height: 24),
                  _buildRecentActivity(),
                  const SizedBox(height: 48),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroSection() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            ColorPalette.primary.withValues(alpha: 0.3),
            Colors.transparent,
          ],
          stops: const [0.0, 0.6],
        ),
      ),
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 16,
        left: 20,
        right: 20,
        bottom: 24,
      ),
      child: Column(
        children: [
          _buildTopRow(),
          const SizedBox(height: 20),
          _buildMemberCard(),
        ],
      ),
    );
  }

  Widget _buildTopRow() {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        final name = state is AuthAuthenticated ? state.user.name.split(' ').first : 'Member';
        final todayStr = DateFormat('EEEE, d MMM').format(DateTime.now());

        return Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  todayStr.toUpperCase(),
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: ColorPalette.textSecondary,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Hi, $name \u{1F44B}',
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: ColorPalette.textPrimary,
                    letterSpacing: -0.5,
                  ),
                ),
              ],
            ),
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.07),
                border: Border.all(color: ColorPalette.glassBorder),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  const Icon(Icons.notifications_none, color: ColorPalette.textPrimary, size: 20),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: ColorPalette.error,
                        shape: BoxShape.circle,
                        border: Border.all(color: ColorPalette.background, width: 1.5),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildMemberCard() {
    return BlocBuilder<ProfileCubit, ProfileState>(
      builder: (context, state) {
        if (state is! ProfileLoaded) {
          if (state is ProfileLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          return const SizedBox.shrink();
        }

        final profile = state.profile;

        return Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                ColorPalette.primary.withValues(alpha: 0.5),
                ColorPalette.accent.withValues(alpha: 0.3),
              ],
            ),
            border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          profile.fullName,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'ID \u00B7 ${profile.memberNumber}',
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.white.withValues(alpha: 0.6),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      (profile.status ?? 'Unknown').toUpperCase(),
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        letterSpacing: 0.6,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: profile.programs.map((p) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: ColorPalette.accent.withValues(alpha: 0.15),
                      border: Border.all(color: ColorPalette.accent.withValues(alpha: 0.3)),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      p.name,
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: ColorPalette.accentLight,
                        letterSpacing: 0.5,
                        fontFeatures: [FontFeature.enable('smcp')],
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 14),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    _buildMemberStat('ATTEND.', '90%'),
                    Container(width: 1, height: 32, color: Colors.white.withValues(alpha: 0.1)),
                    _buildMemberStat('CLASSES', '${profile.programs.length}'),
                    Container(width: 1, height: 32, color: Colors.white.withValues(alpha: 0.1)),
                    _buildMemberStat('PENDING', 'LKR 0'),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMemberStat(String label, String value) {
    return Expanded(
      child: Container(
        color: Colors.black.withValues(alpha: 0.2),
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        child: Column(
          children: [
            Text(
              value,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.w600,
                color: Colors.white.withValues(alpha: 0.6),
                letterSpacing: 1.0,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAlertBanner() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: ColorPalette.warning.withValues(alpha: 0.1),
        border: Border.all(color: ColorPalette.warning.withValues(alpha: 0.25)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const Icon(Icons.warning_amber_rounded, color: ColorPalette.warning, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Profile Information Required',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: ColorPalette.warning,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Please update your profile details',
                  style: TextStyle(
                    fontSize: 11,
                    color: ColorPalette.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: ColorPalette.warning.withValues(alpha: 0.15),
              border: Border.all(color: ColorPalette.warning.withValues(alpha: 0.25)),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text(
              'Update \u2192',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: ColorPalette.warning,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Quick Actions',
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: ColorPalette.textPrimary,
            letterSpacing: -0.2,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            _buildQuickActionItem(Icons.calendar_month, 'Schedule'),
            const SizedBox(width: 10),
            _buildQuickActionItem(Icons.payment, 'Payments'),
            const SizedBox(width: 10),
            _buildQuickActionItem(Icons.how_to_reg, 'Attendance'),
            const SizedBox(width: 10),
            _buildQuickActionItem(Icons.person, 'Profile'),
          ],
        ),
      ],
    );
  }

  Widget _buildQuickActionItem(IconData icon, String label) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.only(top: 14, bottom: 10, left: 6, right: 6),
        decoration: BoxDecoration(
          color: ColorPalette.surface,
          border: Border.all(color: ColorPalette.glassBorder),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          children: [
            Icon(icon, color: ColorPalette.primaryLight, size: 22),
            const SizedBox(height: 6),
            Text(
              label,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: ColorPalette.textSecondary,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUpcomingClassesSection() {
    return BlocBuilder<ScheduleCubit, ScheduleState>(
      builder: (context, state) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Upcoming Classes',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: ColorPalette.textPrimary,
                    letterSpacing: -0.2,
                  ),
                ),
                Text(
                  'View Schedule \u2192',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: ColorPalette.primaryLight,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (state is ScheduleLoading)
              const Center(child: CircularProgressIndicator())
            else if (state is ScheduleLoaded)
              state.schedule.upcomingClasses.isEmpty
                  ? _buildEmptyState('No upcoming classes')
                  : Column(
                      children: state.schedule.upcomingClasses
                          .expand((day) => day.classes)
                          .take(3)
                          .map((cls) => _buildUpcomingClassCard(cls))
                          .toList(),
                    )
            else if (state is ScheduleError)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: ColorPalette.error.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: ColorPalette.error.withValues(alpha: 0.2)),
                ),
                child: Text(state.message, style: const TextStyle(color: ColorPalette.error)),
              )
            else
              _buildEmptyState('Pull to refresh'),
          ],
        );
      },
    );
  }

  Widget _buildUpcomingClassCard(dynamic slot) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ColorPalette.surface,
        border: Border.all(color: ColorPalette.glassBorder),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 46,
            child: Column(
              children: [
                Text(
                  (slot.startTime as String?)?.split(' ').first ?? '--:--',
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: ColorPalette.textPrimary,
                  ),
                ),
                Text(
                  (slot.startTime as String?)?.split(' ').last ?? '',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: ColorPalette.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 14),
          Container(
            width: 1,
            height: 44,
            color: ColorPalette.glassBorder,
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  slot.programName ?? 'Unknown',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: ColorPalette.textPrimary,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  slot.coach ?? 'Coach TBA',
                  style: const TextStyle(
                    fontSize: 11,
                    color: ColorPalette.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: ColorPalette.primary.withValues(alpha: 0.15),
              border: Border.all(color: ColorPalette.primary.withValues(alpha: 0.3)),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.arrow_forward, color: ColorPalette.primaryLight, size: 16),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentActivity() {
    return BlocBuilder<AttendanceCubit, AttendanceState>(
      builder: (context, state) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Recent Activity',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: ColorPalette.textPrimary,
                    letterSpacing: -0.2,
                  ),
                ),
                Text(
                  'View All \u2192',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: ColorPalette.primaryLight,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (state is AttendanceLoading)
              const Center(child: CircularProgressIndicator())
            else if (state is AttendanceLoaded)
              state.records.isEmpty
                  ? _buildEmptyState('No recent activity')
                  : Column(
                      children: state.records.take(3).map((record) {
                        return _buildActivityCard(record);
                      }).toList(),
                    )
            else if (state is AttendanceError)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: ColorPalette.error.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: ColorPalette.error.withValues(alpha: 0.2)),
                ),
                child: Text(state.message, style: const TextStyle(color: ColorPalette.error)),
              )
            else
              _buildEmptyState('Pull to refresh'),
          ],
        );
      },
    );
  }

  Widget _buildActivityCard(dynamic record) {
    final title = record.programName ?? 'Unknown Program';
    final timeStr = record.checkInTime ?? '';
    final hasTime = timeStr.length > 5;
    final displayTime = hasTime ? timeStr.substring(11, 16) : '--:--'; 
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ColorPalette.surface,
        border: Border.all(color: ColorPalette.primary.withValues(alpha: 0.3)),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: ColorPalette.primary.withValues(alpha: 0.1),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Column(
            children: [
              Text(
                displayTime,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: ColorPalette.textPrimary,
                ),
              ),
              const Text(
                'CHK',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: ColorPalette.textSecondary),
              ),
            ],
          ),
          const SizedBox(width: 14),
          Container(
            width: 1,
            height: 40,
            color: ColorPalette.glassBorder,
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: ColorPalette.textPrimary,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  '$timeStr \u00B7 Attended',
                  style: const TextStyle(fontSize: 11, color: ColorPalette.textSecondary),
                ),
              ],
            ),
          ),
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: ColorPalette.primary.withValues(alpha: 0.15),
              border: Border.all(color: ColorPalette.primary.withValues(alpha: 0.3)),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.arrow_forward, color: ColorPalette.primaryLight, size: 16),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(String message) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: ColorPalette.surface,
        border: Border.all(color: ColorPalette.glassBorder),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          const Icon(Icons.info_outline, size: 32, color: ColorPalette.textMuted),
          const SizedBox(height: 8),
          Text(message, style: const TextStyle(color: ColorPalette.textMuted, fontSize: 13)),
        ],
      ),
    );
  }
}
