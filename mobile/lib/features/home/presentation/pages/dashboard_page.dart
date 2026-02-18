import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../config/themes/color_palette.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../../profile/presentation/cubit/profile_cubit.dart';
import '../../../attendance/presentation/cubit/attendance_cubit.dart';

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
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async {
        context.read<ProfileCubit>().loadProfile();
        context.read<AttendanceCubit>().loadAttendance();
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildGreeting(),
            const SizedBox(height: 24),
            _buildQuickStats(),
            const SizedBox(height: 24),
            _buildRecentAttendance(),
          ],
        ),
      ),
    );
  }

  Widget _buildGreeting() {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        final name = state is AuthAuthenticated ? state.user.name : 'Member';
        return Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [ColorPalette.primary, ColorPalette.primaryLight],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: ColorPalette.primary.withValues(alpha: 0.3),
                blurRadius: 12,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Welcome back,',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.white.withValues(alpha: 0.8),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      name,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(
                  Icons.sports_soccer,
                  color: Colors.white,
                  size: 32,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildQuickStats() {
    return BlocBuilder<ProfileCubit, ProfileState>(
      builder: (context, state) {
        if (state is ProfileLoaded) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Quick Stats',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: ColorPalette.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _buildStatCard(
                    icon: Icons.sports,
                    label: 'Programs',
                    value: '${state.profile.programs.length}',
                    color: ColorPalette.primary,
                  ),
                  const SizedBox(width: 12),
                  _buildStatCard(
                    icon: Icons.credit_card,
                    label: 'Member #',
                    value: state.profile.memberNumber,
                    color: ColorPalette.accent,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _buildStatCard(
                    icon: Icons.verified_user,
                    label: 'Status',
                    value: (state.profile.status ?? 'N/A').toUpperCase(),
                    color: state.profile.status == 'active'
                        ? ColorPalette.success
                        : ColorPalette.warning,
                  ),
                  const SizedBox(width: 12),
                  _buildStatCard(
                    icon: Icons.category,
                    label: 'Type',
                    value: state.profile.membershipType ?? 'N/A',
                    color: ColorPalette.info,
                  ),
                ],
              ),
            ],
          );
        }
        if (state is ProfileLoading) {
          return const Center(child: CircularProgressIndicator());
        }
        if (state is ProfileError) {
          return _buildErrorCard(state.message, () {
            context.read<ProfileCubit>().loadProfile();
          });
        }
        return const SizedBox.shrink();
      },
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: color,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                color: ColorPalette.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentAttendance() {
    return BlocBuilder<AttendanceCubit, AttendanceState>(
      builder: (context, state) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Recent Attendance',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: ColorPalette.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            if (state is AttendanceLoading)
              const Center(child: CircularProgressIndicator())
            else if (state is AttendanceLoaded)
              state.records.isEmpty
                  ? _buildEmptyState('No attendance records yet')
                  : Column(
                      children: state.records.take(5).map((record) {
                        return Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: ColorPalette.accent.withValues(alpha: 0.1),
                              child: const Icon(
                                Icons.check_circle_outline,
                                color: ColorPalette.accent,
                              ),
                            ),
                            title: Text(
                              record.programName ?? 'Unknown Program',
                              style: const TextStyle(fontWeight: FontWeight.w500),
                            ),
                            subtitle: Text(
                              record.checkInTime ?? '',
                              style: const TextStyle(fontSize: 12),
                            ),
                            trailing: record.durationMinutes != null
                                ? Text(
                                    '${record.durationMinutes} min',
                                    style: const TextStyle(
                                      color: ColorPalette.textSecondary,
                                      fontSize: 12,
                                    ),
                                  )
                                : null,
                          ),
                        );
                      }).toList(),
                    )
            else if (state is AttendanceError)
              _buildErrorCard(state.message, () {
                context.read<AttendanceCubit>().loadAttendance();
              })
            else
              _buildEmptyState('Pull to refresh'),
          ],
        );
      },
    );
  }

  Widget _buildEmptyState(String message) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          const Icon(Icons.info_outline, size: 40, color: Colors.grey),
          const SizedBox(height: 8),
          Text(message, style: const TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildErrorCard(String message, VoidCallback onRetry) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ColorPalette.error.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: ColorPalette.error.withValues(alpha: 0.2)),
      ),
      child: Column(
        children: [
          Text(message, style: const TextStyle(color: ColorPalette.error)),
          const SizedBox(height: 8),
          TextButton.icon(
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
            onPressed: onRetry,
          ),
        ],
      ),
    );
  }
}
