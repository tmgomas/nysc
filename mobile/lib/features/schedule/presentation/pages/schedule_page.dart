import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../../../../config/themes/color_palette.dart';
import '../cubit/schedule_cubit.dart';
import '../../data/models/schedule_models.dart';

class SchedulePage extends StatefulWidget {
  const SchedulePage({super.key});

  @override
  State<SchedulePage> createState() => _SchedulePageState();
}

class _SchedulePageState extends State<SchedulePage> {
  int _selectedDayIndex = 0;

  @override
  void initState() {
    super.initState();
    context.read<ScheduleCubit>().loadSchedule();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ScheduleCubit, ScheduleState>(
      builder: (context, state) {
        if (state is ScheduleLoading) {
          return const Center(child: CircularProgressIndicator());
        }
        if (state is ScheduleError) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48, color: ColorPalette.error),
                const SizedBox(height: 12),
                Text(state.message, style: const TextStyle(color: ColorPalette.error)),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => context.read<ScheduleCubit>().loadSchedule(),
                  child: const Text('Retry'),
                ),
              ],
            ),
          );
        }
        if (state is ScheduleLoaded) {
          final days = state.schedule.upcomingClasses;
          final safeIndex = _selectedDayIndex < days.length ? _selectedDayIndex : 0;
          final currentDay = days.isNotEmpty ? days[safeIndex] : null;

          return RefreshIndicator(
            onRefresh: () => context.read<ScheduleCubit>().loadSchedule(),
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.only(left: 20, right: 20, top: 16, bottom: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Schedule',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.w800,
                                color: ColorPalette.textPrimary,
                                letterSpacing: -0.02,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              '${DateFormat('MMMM yyyy').format(DateTime.now())} \u00B7 ${state.schedule.totalScheduled} classes this month',
                              style: const TextStyle(
                                fontSize: 12,
                                color: ColorPalette.textSecondary,
                              ),
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            _buildIconButton(Icons.menu, () {}),
                            const SizedBox(width: 8),
                            _buildIconButton(Icons.calendar_month, () {}, isPrimary: true),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                if (days.isNotEmpty)
                  SliverToBoxAdapter(
                    child: _buildWeekStrip(days, safeIndex),
                  ),
                if (days.isEmpty)
                  const SliverFillRemaining(
                    child: Center(
                      child: Text('No upcoming classes', style: TextStyle(color: ColorPalette.textSecondary)),
                    ),
                  )
                else if (currentDay != null && currentDay.classes.isEmpty)
                   const SliverToBoxAdapter(
                     child: Padding(
                       padding: EdgeInsets.all(32),
                       child: Center(
                         child: Text('No classes scheduled for this day', style: TextStyle(color: ColorPalette.textSecondary)),
                       ),
                     ),
                   )
                else if (currentDay != null)
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 0),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          return _buildTimelineItem(currentDay.classes[index]);
                        },
                        childCount: currentDay.classes.length,
                      ),
                    ),
                  ),
                const SliverToBoxAdapter(child: SizedBox(height: 32)),
              ],
            ),
          );
        }
        return const SizedBox.shrink();
      },
    );
  }

  Widget _buildIconButton(IconData icon, VoidCallback onTap, {bool isPrimary = false}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: isPrimary ? ColorPalette.primary.withValues(alpha: 0.15) : Colors.white.withValues(alpha: 0.06),
          border: Border.all(
            color: isPrimary ? ColorPalette.primary.withValues(alpha: 0.3) : ColorPalette.glassBorder,
          ),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(
          icon,
          size: 16,
          color: isPrimary ? ColorPalette.primaryLight : ColorPalette.textPrimary,
        ),
      ),
    );
  }

  Widget _buildWeekStrip(List<ScheduleDayModel> days, int selectedIndex) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: List.generate(days.length, (index) {
          final isSelected = index == selectedIndex;
          final dayStr = days[index].date; 
          DateTime? date;
          try {
            date = DateTime.parse(dayStr);
          } catch (_) {}

          final String wdName = date != null ? DateFormat('EEE').format(date).toUpperCase() : 'DAY';
          final String numStr = date != null ? DateFormat('d').format(date) : '${index + 1}';
          final bool hasClasses = days[index].classes.isNotEmpty;

          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedDayIndex = index;
              });
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.only(right: 8),
              constraints: const BoxConstraints(minWidth: 44),
              padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
              decoration: BoxDecoration(
                gradient: isSelected
                    ? const LinearGradient(
                        colors: [ColorPalette.primary, ColorPalette.primaryLight],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      )
                    : null,
                color: isSelected ? null : Colors.transparent,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    wdName,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.06,
                      color: isSelected ? Colors.white.withValues(alpha: 0.75) : ColorPalette.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    numStr,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: isSelected ? Colors.white : ColorPalette.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Container(
                    width: 5,
                    height: 5,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: hasClasses
                          ? (isSelected ? Colors.white.withValues(alpha: 0.6) : ColorPalette.accent)
                          : Colors.transparent,
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildTimelineItem(ProgramClassSlotModel slot) {
    final isCancelled = slot.isCancelled;
    final isWarning = slot.status.toLowerCase() == 'rescheduled'; 
    final isHoliday = slot.isHoliday;
    
    // Determine colors
    Color mainColor = ColorPalette.primaryLight;
    if (isCancelled) {
      mainColor = ColorPalette.error;
    } else if (isWarning || isHoliday) {
      mainColor = ColorPalette.warning;
    } else if (slot.programName?.toLowerCase().contains('swim') ?? false) {
      mainColor = ColorPalette.accent;
    }

    final String timeStr = slot.startTime?.split(' ').first ?? '--:--';
    final String amPmStr = slot.startTime?.split(' ').last ?? '';

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Left Time Column
          SizedBox(
            width: 48,
            child: Column(
              children: [
                const SizedBox(height: 12),
                Text(
                  timeStr,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: ColorPalette.textSecondary,
                  ),
                ),
                Text(
                  amPmStr,
                  style: const TextStyle(
                    fontSize: 10,
                    color: ColorPalette.textMuted,
                  ),
                ),
              ],
            ),
          ),
          // Vertical Line & Pip
          Column(
            children: [
              Container(
                width: 10,
                height: 10,
                margin: const EdgeInsets.only(top: 15),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: mainColor,
                  boxShadow: [
                    BoxShadow(
                      color: mainColor.withValues(alpha: 0.2),
                      spreadRadius: 3,
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Container(
                  width: 2,
                  margin: const EdgeInsets.only(top: 4, bottom: 4),
                  color: ColorPalette.glassBorder,
                ),
              ),
            ],
          ),
          const SizedBox(width: 12),
          // Event Card
          Expanded(
            child: Container(
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: ColorPalette.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: ColorPalette.glassBorder),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(13),
                child: Container(
                  decoration: BoxDecoration(
                    border: Border(left: BorderSide(color: mainColor, width: 3)),
                  ),
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Card Header
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(
                              slot.programName ?? 'Unknown Event',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: ColorPalette.textPrimary,
                                decoration: isCancelled ? TextDecoration.lineThrough : null,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Flexible(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: mainColor.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                isCancelled ? 'Cancelled' : slot.status.capitalize(),
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  color: mainColor,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      // Meta Info
                      Wrap(
                        spacing: 8,
                        runSpacing: 4,
                        children: [
                          if (slot.formattedTime != null)
                            _buildMetaItem(Icons.timer_outlined, slot.formattedTime!),
                          if (slot.location != null)
                            _buildMetaItem(Icons.location_on_outlined, slot.location!),
                          if (slot.cancellationReason != null)
                            _buildMetaItem(Icons.info_outline, slot.cancellationReason!, color: mainColor),
                        ],
                      ),
                      // Coach Row
                      if (slot.coach != null) ...[
                        const SizedBox(height: 10),
                        Container(
                          padding: const EdgeInsets.only(top: 10),
                          decoration: const BoxDecoration(
                            border: Border(top: BorderSide(color: ColorPalette.glassBorder)),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 24,
                                height: 24,
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [mainColor, mainColor.withValues(alpha: 0.7)],
                                  ),
                                  shape: BoxShape.circle,
                                ),
                                alignment: Alignment.center,
                                child: Text(
                                  slot.coach!.substring(0, 1).toUpperCase(),
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: RichText(
                                  text: TextSpan(
                                    text: 'Coach ',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: ColorPalette.textSecondary,
                                    ),
                                    children: [
                                      TextSpan(
                                        text: slot.coach,
                                        style: const TextStyle(
                                          color: ColorPalette.textPrimary,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetaItem(IconData icon, String text, {Color? color}) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 11, color: color ?? ColorPalette.textSecondary),
        const SizedBox(width: 4),
        Text(
          text,
          style: TextStyle(
            fontSize: 11,
            color: color ?? ColorPalette.textSecondary,
          ),
        ),
      ],
    );
  }
}

extension StringExtension on String {
  String capitalize() {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1).toLowerCase()}';
  }
}
