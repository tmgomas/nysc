import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../cubit/attendance_cubit.dart';
import '../../domain/entities/attendance_record.dart';
import '../../../../config/themes/color_palette.dart';

class AttendancePage extends StatefulWidget {
  const AttendancePage({super.key});

  @override
  State<AttendancePage> createState() => _AttendancePageState();
}

class _AttendancePageState extends State<AttendancePage> {
  DateTime _currentMonth = DateTime.now();
  String? _selectedProgram;

  @override
  void initState() {
    super.initState();
    context.read<AttendanceCubit>().loadAttendance();
  }

  void _previousMonth() {
    setState(() {
      _currentMonth = DateTime(_currentMonth.year, _currentMonth.month - 1, 1);
    });
  }

  void _nextMonth() {
    setState(() {
      _currentMonth = DateTime(_currentMonth.year, _currentMonth.month + 1, 1);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Attendance'),
        actions: [
          IconButton(
            icon: const Icon(Icons.download_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: BlocBuilder<AttendanceCubit, AttendanceState>(
        builder: (context, state) {
          if (state is AttendanceLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is AttendanceError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline,
                      color: ColorPalette.error, size: 48),
                  const SizedBox(height: 16),
                  Text(
                    state.message,
                    style: const TextStyle(color: ColorPalette.error),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => context.read<AttendanceCubit>().loadAttendance(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          } else if (state is AttendanceLoaded) {
            return _buildContent(context, state.records);
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildContent(BuildContext context, List<AttendanceRecord> allRecords) {
    // Collect unique programs for the filter chips
    final programs = allRecords
        .map((r) => r.programName)
        .where((name) => name != null)
        .cast<String>()
        .toSet()
        .toList();

    if (_selectedProgram == null && programs.isNotEmpty) {
      _selectedProgram = programs.first;
    }

    final filteredRecords = allRecords.where((r) {
      if (_selectedProgram == null) return true;
      return r.programName == _selectedProgram;
    }).toList();

    // Stats calculation for the chosen month
    int presentCnt = 0;
    // Assuming we do not have full schedule data to calculate strict absent count,
    // we will mock an absent logic or just show present count for now.
    for (var r in filteredRecords) {
      if (r.checkInTime != null) {
        final dt = DateTime.parse(r.checkInTime!).toLocal();
        if (dt.year == _currentMonth.year && dt.month == _currentMonth.month) {
          presentCnt++;
        }
      }
    }
    
    // Fallback simple stats for demo
    int absentCnt = presentCnt > 0 ? presentCnt ~/ 4 : 0; 
    int totalExpected = presentCnt + absentCnt;
    int rate = totalExpected > 0 ? ((presentCnt / totalExpected) * 100).round() : 0;

    return RefreshIndicator(
      onRefresh: () => context.read<AttendanceCubit>().loadAttendance(),
      child: ListView(
        padding: const EdgeInsets.only(top: 8, bottom: 24),
        children: [
          // Sub-header mimicking design
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Text(
              '${DateFormat('MMMM yyyy').format(_currentMonth)} · ${_selectedProgram ?? 'All Programs'}',
              style: const TextStyle(color: ColorPalette.textSecondary, fontSize: 13),
            ),
          ),
          const SizedBox(height: 16),

          // Summary Stats
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                _buildStatCard(
                  title: 'Present',
                  value: presentCnt.toString(),
                  color: ColorPalette.success,
                  bgColor: ColorPalette.success.withOpacity(0.1),
                ),
                const SizedBox(width: 10),
                _buildStatCard(
                  title: 'Absent',
                  value: absentCnt.toString(),
                  color: ColorPalette.error,
                  bgColor: ColorPalette.error.withOpacity(0.1),
                ),
                const SizedBox(width: 10),
                _buildStatCard(
                  title: 'Rate',
                  value: '$rate%',
                  color: ColorPalette.info,
                  bgColor: ColorPalette.info.withOpacity(0.1),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Month selector
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  DateFormat('MMMM yyyy').format(_currentMonth),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: ColorPalette.textPrimary,
                  ),
                ),
                Row(
                  children: [
                    _buildNavBtn(Icons.chevron_left, _previousMonth),
                    const SizedBox(width: 8),
                    _buildNavBtn(Icons.chevron_right, _nextMonth),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Calendar Grid
          _buildCalendarGrid(filteredRecords),

          const SizedBox(height: 16),

          // Legend
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildLegendItem('Present', ColorPalette.success.withOpacity(0.5)),
                _buildLegendItem('Absent', ColorPalette.error.withOpacity(0.4)),
                _buildLegendItem('Holiday', ColorPalette.info.withOpacity(0.3)),
                _buildLegendItem('Today', Colors.transparent, borderColor: ColorPalette.primary),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Sport filter pills
          if (programs.isNotEmpty)
            SizedBox(
              height: 38,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: programs.length,
                separatorBuilder: (context, index) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final prog = programs[index];
                  final isSelected = _selectedProgram == prog;
                  return ActionChip(
                    label: Text(
                      prog,
                      style: TextStyle(
                        color: isSelected ? Colors.white : ColorPalette.textSecondary,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        fontSize: 13,
                      ),
                    ),
                    backgroundColor: isSelected ? ColorPalette.primary : Colors.white.withOpacity(0.05),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                      side: BorderSide(
                        color: isSelected ? Colors.transparent : Colors.white12,
                      ),
                    ),
                    onPressed: () {
                      setState(() {
                        _selectedProgram = prog;
                      });
                    },
                  );
                },
              ),
            ),
            
          const SizedBox(height: 24),

          // Recent Records
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Text(
              'Recent Records',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: ColorPalette.textPrimary,
              ),
            ),
          ),
          const SizedBox(height: 12),
          ..._buildRecentRecords(filteredRecords),
        ],
      ),
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required Color color,
    required Color bgColor,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: ColorPalette.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w900,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title.toUpperCase(),
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: ColorPalette.textSecondary,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavBtn(IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.06),
          border: Border.all(color: Colors.white12),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, size: 20, color: ColorPalette.textSecondary),
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color, {Color? borderColor}) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(3),
            border: borderColor != null ? Border.all(color: borderColor, width: 2) : null,
          ),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: ColorPalette.textSecondary),
        ),
      ],
    );
  }

  Widget _buildCalendarGrid(List<AttendanceRecord> records) {
    final daysInMonth = DateUtils.getDaysInMonth(_currentMonth.year, _currentMonth.month);
    final firstDay = DateTime(_currentMonth.year, _currentMonth.month, 1);
    final emptyPrefixDays = firstDay.weekday % 7; // Sunday = 0, Monday = 1 ...

    // Pre-calculate presence for the month
    final presentDays = <int>{};
    for (var r in records) {
      if (r.checkInTime != null) {
        final dt = DateTime.parse(r.checkInTime!).toLocal();
        if (dt.year == _currentMonth.year && dt.month == _currentMonth.month) {
          presentDays.add(dt.day);
        }
      }
    }

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: weekDays.map((wd) => Expanded(
              child: Text(
                wd,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: ColorPalette.textMuted,
                  letterSpacing: 0.5,
                ),
              ),
            )).toList(),
          ),
          const SizedBox(height: 8),

          // Grid
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
              mainAxisSpacing: 6,
              crossAxisSpacing: 6,
            ),
            itemCount: emptyPrefixDays + daysInMonth,
            itemBuilder: (context, index) {
              if (index < emptyPrefixDays) {
                return const SizedBox.shrink();
              }
              final day = index - emptyPrefixDays + 1;
              final isPresent = presentDays.contains(day);
              final isToday = DateTime.now().year == _currentMonth.year && 
                              DateTime.now().month == _currentMonth.month && 
                              DateTime.now().day == day;

              Color bgColor = Colors.transparent;
              Color textColor = ColorPalette.textMuted;
              Border? border;

              if (isPresent) {
                bgColor = ColorPalette.success.withOpacity(0.2);
                textColor = const Color(0xFF81C784);
              } else if (isToday) {
                border = Border.all(color: ColorPalette.primary, width: 2);
                textColor = ColorPalette.textPrimary;
              }

              return Container(
                decoration: BoxDecoration(
                  color: bgColor,
                  borderRadius: BorderRadius.circular(8),
                  border: border,
                ),
                alignment: Alignment.center,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Center(
                      child: Text(
                        day.toString(),
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: textColor,
                        ),
                      ),
                    ),
                    if (isPresent)
                      const Positioned(
                        right: 3,
                        bottom: 2,
                        child: Icon(Icons.check, size: 8, color: Color(0xFF81C784)),
                      ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  List<Widget> _buildRecentRecords(List<AttendanceRecord> records) {
    if (records.isEmpty) {
      return [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 20),
          child: Text(
            'No attendance records found.',
            style: TextStyle(color: ColorPalette.textMuted, fontSize: 13),
          ),
        )
      ];
    }
    
    // Sort descending by check-in time
    final sorted = List<AttendanceRecord>.from(records)..sort((a,b) {
      if (a.checkInTime == null && b.checkInTime == null) return 0;
      if (a.checkInTime == null) return 1;
      if (b.checkInTime == null) return -1;
      return b.checkInTime!.compareTo(a.checkInTime!);
    });

    final topRecords = sorted.take(5).toList();

    return topRecords.map((r) {
      final dt = r.checkInTime != null 
          ? DateTime.parse(r.checkInTime!).toLocal() 
          : null;
      var dateStr = '';
      if (dt != null) {
        final now = DateTime.now();
        if (dt.year == now.year && dt.month == now.month && dt.day == now.day) {
          dateStr = 'Today · ${DateFormat('hh:mm a').format(dt)}';
        } else {
          dateStr = '${DateFormat('MMM dd').format(dt)} · ${DateFormat('hh:mm a').format(dt)}';
        }
      }

      return Padding(
        padding: const EdgeInsets.only(left: 20, right: 20, bottom: 8),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: ColorPalette.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white12),
          ),
          child: Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: ColorPalette.success.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.check_circle, color: ColorPalette.success, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      r.programName ?? 'Unknown Program',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: ColorPalette.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      dateStr,
                      style: const TextStyle(
                        fontSize: 12,
                        color: ColorPalette.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: ColorPalette.success.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: ColorPalette.success.withOpacity(0.3)),
                ),
                child: const Text(
                  'PRESENT',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF81C784),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }).toList();
  }
}
