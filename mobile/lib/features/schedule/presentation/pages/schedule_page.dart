import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../config/themes/color_palette.dart';
import '../cubit/schedule_cubit.dart';
import '../../domain/entities/member_program.dart';
import '../../data/models/schedule_models.dart';

/// Schedule Page — shows Programs tab and Upcoming Calendar tab.
class SchedulePage extends StatefulWidget {
  const SchedulePage({super.key});

  @override
  State<SchedulePage> createState() => _SchedulePageState();
}

class _SchedulePageState extends State<SchedulePage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    context.read<ProgramsCubit>().loadPrograms();
    context.read<ScheduleCubit>().loadSchedule();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Tab bar
        Container(
          color: ColorPalette.primary,
          child: TabBar(
            controller: _tabController,
            indicatorColor: Colors.white,
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white60,
            tabs: const [
              Tab(icon: Icon(Icons.sports), text: 'My Programs'),
              Tab(icon: Icon(Icons.calendar_month), text: 'Schedule'),
            ],
          ),
        ),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: const [
              _ProgramsTab(),
              _ScheduleTab(),
            ],
          ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────
// Programs Tab
// ─────────────────────────────────────────────────────────
class _ProgramsTab extends StatelessWidget {
  const _ProgramsTab();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProgramsCubit, ProgramsState>(
      builder: (context, state) {
        if (state is ProgramsLoading) {
          return const Center(child: CircularProgressIndicator());
        }
        if (state is ProgramsError) {
          return _ErrorView(
            message: state.message,
            onRetry: () => context.read<ProgramsCubit>().loadPrograms(),
          );
        }
        if (state is ProgramsLoaded) {
          if (state.programs.isEmpty) {
            return const _EmptyView(
              icon: Icons.sports_outlined,
              message: 'No programs enrolled yet',
            );
          }
          return RefreshIndicator(
            onRefresh: () => context.read<ProgramsCubit>().loadPrograms(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: state.programs.length,
              itemBuilder: (ctx, i) => _ProgramCard(program: state.programs[i]),
            ),
          );
        }
        return const SizedBox.shrink();
      },
    );
  }
}

class _ProgramCard extends StatelessWidget {
  final MemberProgram program;
  const _ProgramCard({required this.program});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Column(
        children: [
          // Program header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [ColorPalette.primary, ColorPalette.primaryLight],
              ),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    program.shortCode ?? '?',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      fontSize: 14,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        program.name ?? 'Unknown Program',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                        ),
                      ),
                      if (program.location != null)
                        Row(
                          children: [
                            const Icon(Icons.location_on,
                                color: Colors.white70, size: 12),
                            const SizedBox(width: 4),
                            Text(
                              program.location!,
                              style: const TextStyle(
                                  color: Colors.white70, fontSize: 12),
                            ),
                          ],
                        ),
                    ],
                  ),
                ),
                // Status badge
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    (program.status ?? 'active').toUpperCase(),
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
          // Fee info
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: [
                const Icon(Icons.payment, size: 16, color: ColorPalette.textSecondary),
                const SizedBox(width: 6),
                Text(
                  'Monthly Fee: LKR ${program.monthlyFee ?? "N/A"}',
                  style: const TextStyle(
                      fontSize: 13, color: ColorPalette.textSecondary),
                ),
              ],
            ),
          ),
          // Schedule section — adapts to program type
          if (program.isPracticeDays) ...[
            // ── Practice Days section ──────────────────────────
            const Divider(height: 1),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 4),
              child: Row(
                children: const [
                  Icon(Icons.fitness_center, size: 14, color: ColorPalette.primary),
                  SizedBox(width: 6),
                  Text(
                    'Practice Days',
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: ColorPalette.primary),
                  ),
                ],
              ),
            ),
            if (program.practiceDays.isEmpty)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: Text('No practice days configured',
                    style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
              )
            else
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: program.practiceDays.map((pd) {
                    final dayAbbr = pd.day.length >= 3
                        ? pd.day.substring(0, 3).toUpperCase()
                        : pd.day.toUpperCase();
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: ColorPalette.primary.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: ColorPalette.primary.withValues(alpha: 0.25),
                        ),
                      ),
                      child: Column(
                        children: [
                          Text(
                            dayAbbr,
                            style: const TextStyle(
                                color: ColorPalette.primary,
                                fontWeight: FontWeight.w800,
                                fontSize: 13),
                          ),
                          if (pd.formattedTime != null)
                            Text(
                              pd.formattedTime!,
                              style: const TextStyle(
                                  color: ColorPalette.textSecondary,
                                  fontSize: 10),
                            ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
          ] else ...[
            // ── Assigned Class Slots section ───────────────────
            const Divider(height: 1),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 4),
              child: Row(
                children: const [
                  Icon(Icons.schedule, size: 14, color: ColorPalette.accent),
                  SizedBox(width: 6),
                  Text(
                    'Assigned Class Slots',
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: ColorPalette.accent),
                  ),
                ],
              ),
            ),
            if (program.assignedClasses.isEmpty)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: Text('No class slots assigned yet',
                    style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
              )
            else
              ...program.assignedClasses.map(
                (cls) => ListTile(
                  dense: true,
                  leading: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: ColorPalette.accent.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      cls.dayOfWeek != null && cls.dayOfWeek!.length >= 2
                          ? cls.dayOfWeek!.substring(0, 2).toUpperCase()
                          : '?',
                      style: const TextStyle(
                          color: ColorPalette.accent,
                          fontWeight: FontWeight.w700,
                          fontSize: 11),
                    ),
                  ),
                  title: Text(
                    cls.label ?? cls.dayOfWeek ?? '',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                  ),
                  subtitle: cls.formattedTime != null
                      ? Text(cls.formattedTime!,
                          style: const TextStyle(fontSize: 12))
                      : null,
                  trailing: cls.coach != null
                      ? Text(cls.coach!,
                          style: const TextStyle(
                              fontSize: 11, color: ColorPalette.textSecondary))
                      : null,
                ),
              ),
            const SizedBox(height: 8),
          ],
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────
// Schedule / Calendar Tab
// ─────────────────────────────────────────────────────────
class _ScheduleTab extends StatelessWidget {
  const _ScheduleTab();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ScheduleCubit, ScheduleState>(
      builder: (context, state) {
        if (state is ScheduleLoading) {
          return const Center(child: CircularProgressIndicator());
        }
        if (state is ScheduleError) {
          return _ErrorView(
            message: state.message,
            onRetry: () => context.read<ScheduleCubit>().loadSchedule(),
          );
        }
        if (state is ScheduleLoaded) {
          return RefreshIndicator(
            onRefresh: () => context.read<ScheduleCubit>().loadSchedule(),
            child: CustomScrollView(
              slivers: [
                // Summary card
                SliverToBoxAdapter(
                  child: _SummaryCard(schedule: state.schedule),
                ),
                // Date-grouped class list
                if (state.schedule.upcomingClasses.isEmpty)
                  const SliverFillRemaining(
                    child: _EmptyView(
                      icon: Icons.calendar_today_outlined,
                      message: 'No upcoming classes scheduled',
                    ),
                  )
                else
                  SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (ctx, i) {
                        final day = state.schedule.upcomingClasses[i];
                        return _DayGroup(day: day);
                      },
                      childCount: state.schedule.upcomingClasses.length,
                    ),
                  ),
              ],
            ),
          );
        }
        return const SizedBox.shrink();
      },
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final ScheduleResponseModel schedule;
  const _SummaryCard({required this.schedule});

  @override
  Widget build(BuildContext context) {
    final next = schedule.nextClass;
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [ColorPalette.accent, ColorPalette.accentDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: ColorPalette.accent.withValues(alpha: 0.3),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.upcoming, color: Colors.white, size: 20),
              const SizedBox(width: 8),
              Text(
                '${schedule.totalScheduled} Upcoming Classes',
                style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 16),
              ),
            ],
          ),
          if (next != null) ...[
            const SizedBox(height: 12),
            const Text(
              'Next Class',
              style: TextStyle(color: Colors.white70, fontSize: 12),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.play_circle_outline,
                    color: Colors.white, size: 16),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    '${next['program_name'] ?? ''} · ${next['date'] ?? ''} · ${next['formatted_time'] ?? ''}',
                    style: const TextStyle(
                        color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500),
                    maxLines: 2,
                  ),
                ),
              ],
            ),
            if (next['coach'] != null)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Row(
                  children: [
                    const Icon(Icons.person_outline,
                        color: Colors.white70, size: 14),
                    const SizedBox(width: 4),
                    Text(next['coach'] as String,
                        style: const TextStyle(
                            color: Colors.white70, fontSize: 12)),
                  ],
                ),
              ),
          ],
        ],
      ),
    );
  }
}

class _DayGroup extends StatelessWidget {
  final ScheduleDayModel day;
  const _DayGroup({required this.day});

  @override
  Widget build(BuildContext context) {
    // Parse the date for display
    final parts = day.date.split('-');
    final dateLabel = parts.length == 3
        ? '${_monthName(int.parse(parts[1]))} ${parts[2]}, ${parts[0]}'
        : day.date;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Date header
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: ColorPalette.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                      color: ColorPalette.primary.withValues(alpha: 0.3)),
                ),
                child: Text(
                  dateLabel,
                  style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: ColorPalette.primary),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Class cards for this day
          ...day.classes.map((cls) => _ClassCard(slot: cls)),
        ],
      ),
    );
  }

  String _monthName(int m) => const [
        '',
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ][m];
}

class _ClassCard extends StatelessWidget {
  final ProgramClassSlotModel slot;
  const _ClassCard({required this.slot});

  @override
  Widget build(BuildContext context) {
    final isCancelled = slot.isCancelled;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isCancelled
            ? ColorPalette.error.withValues(alpha: 0.04)
            : ColorPalette.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isCancelled
              ? ColorPalette.error.withValues(alpha: 0.3)
              : ColorPalette.divider,
        ),
        boxShadow: isCancelled
            ? []
            : [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
      ),
      child: Row(
        children: [
          // Time column
          Container(
            width: 60,
            padding: const EdgeInsets.symmetric(vertical: 8),
            decoration: BoxDecoration(
              color: isCancelled
                  ? ColorPalette.error.withValues(alpha: 0.1)
                  : ColorPalette.primary.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(10),
            ),
            alignment: Alignment.center,
            child: Text(
              slot.startTime ?? '--:--',
              style: TextStyle(
                color: isCancelled ? ColorPalette.error : ColorPalette.primary,
                fontWeight: FontWeight.w700,
                fontSize: 13,
              ),
            ),
          ),
          const SizedBox(width: 12),
          // Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        slot.programName ?? 'Unknown',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          color: isCancelled
                              ? ColorPalette.textSecondary
                              : ColorPalette.textPrimary,
                          decoration: isCancelled
                              ? TextDecoration.lineThrough
                              : null,
                        ),
                      ),
                    ),
                    // Status badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: isCancelled
                            ? ColorPalette.error.withValues(alpha: 0.1)
                            : ColorPalette.success.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        isCancelled ? 'Cancelled' : 'Scheduled',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: isCancelled
                              ? ColorPalette.error
                              : ColorPalette.success,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    if (slot.formattedTime != null) ...[
                      const Icon(Icons.access_time,
                          size: 12, color: ColorPalette.textSecondary),
                      const SizedBox(width: 3),
                      Text(
                        slot.formattedTime!,
                        style: const TextStyle(
                            fontSize: 11, color: ColorPalette.textSecondary),
                      ),
                      const SizedBox(width: 10),
                    ],
                    if (slot.coach != null) ...[
                      const Icon(Icons.person_outline,
                          size: 12, color: ColorPalette.textSecondary),
                      const SizedBox(width: 3),
                      Flexible(
                        child: Text(
                          slot.coach!,
                          style: const TextStyle(
                              fontSize: 11, color: ColorPalette.textSecondary),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ],
                ),
                // Cancellation reason
                if (isCancelled && slot.cancellationReason != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Row(
                      children: [
                        const Icon(Icons.info_outline,
                            size: 12, color: ColorPalette.error),
                        const SizedBox(width: 4),
                        Flexible(
                          child: Text(
                            slot.cancellationReason!,
                            style: const TextStyle(
                                fontSize: 11, color: ColorPalette.error),
                          ),
                        ),
                      ],
                    ),
                  ),
                // Holiday notice
                if (slot.isHoliday && slot.holidayName != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Row(
                      children: [
                        const Icon(Icons.celebration_outlined,
                            size: 12, color: ColorPalette.warning),
                        const SizedBox(width: 4),
                        Text(
                          slot.holidayName!,
                          style: const TextStyle(
                              fontSize: 11, color: ColorPalette.warning),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────
// Shared helper widgets
// ─────────────────────────────────────────────────────────
class _EmptyView extends StatelessWidget {
  final IconData icon;
  final String message;
  const _EmptyView({required this.icon, required this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 64, color: Colors.grey.shade300),
          const SizedBox(height: 12),
          Text(message,
              style: const TextStyle(
                  color: ColorPalette.textSecondary, fontSize: 14)),
        ],
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline,
                size: 48, color: ColorPalette.error),
            const SizedBox(height: 12),
            Text(message,
                textAlign: TextAlign.center,
                style: const TextStyle(color: ColorPalette.textSecondary)),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
              style: ElevatedButton.styleFrom(
                backgroundColor: ColorPalette.primary,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
