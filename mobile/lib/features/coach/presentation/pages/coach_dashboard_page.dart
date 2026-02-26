import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../config/themes/color_palette.dart';
import '../cubit/coach_dashboard_cubit.dart';
import 'package:intl/intl.dart';

/// Coach dashboard page — overview with stats and today's classes.
class CoachDashboardPage extends StatefulWidget {
  const CoachDashboardPage({super.key});

  @override
  State<CoachDashboardPage> createState() => _CoachDashboardPageState();
}

class _CoachDashboardPageState extends State<CoachDashboardPage> {
  @override
  void initState() {
    super.initState();
    context.read<CoachDashboardCubit>().loadDashboard();
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async {
        context.read<CoachDashboardCubit>().loadDashboard();
      },
      child: BlocBuilder<CoachDashboardCubit, CoachDashboardState>(
        builder: (context, state) {
          if (state is CoachDashboardLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is CoachDashboardError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: ColorPalette.error),
                  const SizedBox(height: 16),
                  Text(state.message, style: const TextStyle(color: ColorPalette.error)),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: () =>
                        context.read<CoachDashboardCubit>().loadDashboard(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          if (state is CoachDashboardLoaded) {
            return SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeroSection(state),
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildTodaySchedule(state),
                        const SizedBox(height: 24),
                        _buildPrograms(state),
                        const SizedBox(height: 48),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildHeroSection(CoachDashboardLoaded state) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            ColorPalette.accent.withValues(alpha: 0.3),
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
          _buildWelcomeCard(state),
        ],
      ),
    );
  }

  Widget _buildTopRow() {
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
            const Text(
              'Coach Dashboard \u{1F3C6}',
              style: TextStyle(
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
          child: const Icon(Icons.notifications_none, color: ColorPalette.textPrimary, size: 20),
        ),
      ],
    );
  }

  Widget _buildWelcomeCard(CoachDashboardLoaded state) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            ColorPalette.accent.withValues(alpha: 0.5),
            ColorPalette.accentDark.withValues(alpha: 0.3),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Great to see you!',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withValues(alpha: 0.8),
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Ready for training?',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                const Icon(Icons.people, color: Colors.white, size: 24),
                const SizedBox(height: 4),
                Text(
                  '${state.dashboard.todayAttendanceCount}',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                Text(
                  'Attended',
                  style: TextStyle(
                    fontSize: 10,
                    color: Colors.white.withValues(alpha: 0.8),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTodaySchedule(CoachDashboardLoaded state) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              "Today's Classes",
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
                color: ColorPalette.accent,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (state.todayClasses.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: ColorPalette.surface,
              border: Border.all(color: ColorPalette.glassBorder),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Column(
              children: [
                Icon(Icons.event_busy, size: 32, color: ColorPalette.textMuted),
                SizedBox(height: 8),
                Text(
                  'No classes today',
                  style: TextStyle(color: ColorPalette.textMuted, fontSize: 13),
                ),
              ],
            ),
          )
        else
          ...state.todayClasses.map((c) => Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: ColorPalette.surface,
                  border: Border.all(color: ColorPalette.glassBorder),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: ColorPalette.accent.withValues(alpha: 0.15),
                        border: Border.all(color: ColorPalette.accent.withValues(alpha: 0.3)),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.sports,
                        color: ColorPalette.accentLight,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            c.programName,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: ColorPalette.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${c.startTime} - ${c.endTime}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: ColorPalette.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.chevron_right, color: ColorPalette.textSecondary, size: 20),
                    ),
                  ],
                ),
              )),
      ],
    );
  }

  Widget _buildPrograms(CoachDashboardLoaded state) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'My Programs',
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: ColorPalette.textPrimary,
            letterSpacing: -0.2,
          ),
        ),
        const SizedBox(height: 12),
        ...state.dashboard.programs.map((p) => Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: ColorPalette.surface,
                border: Border.all(color: ColorPalette.glassBorder),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: ColorPalette.primary.withValues(alpha: 0.15),
                      border: Border.all(color: ColorPalette.primary.withValues(alpha: 0.3)),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(
                      child: Text(
                        p.shortCode ?? p.name[0],
                        style: const TextStyle(
                          fontWeight: FontWeight.w800,
                          color: ColorPalette.primaryLight,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          p.name,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: ColorPalette.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Active Program',
                          style: TextStyle(
                            fontSize: 11,
                            color: ColorPalette.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: ColorPalette.success.withValues(alpha: 0.15),
                      border: Border.all(color: ColorPalette.success.withValues(alpha: 0.3)),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      '${p.activeMembersCount} mbrs',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: ColorPalette.success,
                      ),
                    ),
                  ),
                ],
              ),
            )),
      ],
    );
  }
}
