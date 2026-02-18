import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../config/themes/color_palette.dart';
import '../cubit/coach_attendance_cubit.dart';

/// Coach attendance management page — view and mark attendance.
class CoachAttendancePage extends StatefulWidget {
  const CoachAttendancePage({super.key});

  @override
  State<CoachAttendancePage> createState() => _CoachAttendancePageState();
}

class _CoachAttendancePageState extends State<CoachAttendancePage> {
  @override
  void initState() {
    super.initState();
    context.read<CoachAttendanceCubit>().loadAttendance();
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async {
        context.read<CoachAttendanceCubit>().loadAttendance();
      },
      child: BlocConsumer<CoachAttendanceCubit, CoachAttendanceState>(
        listener: (context, state) {
          if (state is CoachAttendanceMarked) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: ColorPalette.success,
              ),
            );
          }
          if (state is CoachAttendanceError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: ColorPalette.error,
              ),
            );
          }
        },
        builder: (context, state) {
          if (state is CoachAttendanceLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final records = _getRecords(state);

          if (records == null) {
            return const Center(
              child: Text('Pull down to load attendance'),
            );
          }

          if (records.isEmpty) {
            return SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: SizedBox(
                height: MediaQuery.of(context).size.height * 0.7,
                child: const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.fact_check_outlined, size: 64, color: Colors.grey),
                      SizedBox(height: 16),
                      Text(
                        'No attendance records today',
                        style: TextStyle(fontSize: 18, color: Colors.grey),
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Mark attendance to get started',
                        style: TextStyle(color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }

          return Column(
            children: [
              // Summary bar
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                color: ColorPalette.surface,
                child: Row(
                  children: [
                    Icon(Icons.people, color: ColorPalette.primary, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      '${records.length} records today',
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        color: ColorPalette.textPrimary,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      '${records.where((r) => !r.isCheckedOut).length} active',
                      style: const TextStyle(
                        color: ColorPalette.success,
                        fontWeight: FontWeight.w500,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              // Records list
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: records.length,
                  itemBuilder: (context, index) {
                    final record = records[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: record.isCheckedOut
                              ? ColorPalette.textSecondary.withValues(alpha: 0.1)
                              : ColorPalette.success.withValues(alpha: 0.1),
                          child: Icon(
                            record.isCheckedOut
                                ? Icons.logout
                                : Icons.login,
                            color: record.isCheckedOut
                                ? ColorPalette.textSecondary
                                : ColorPalette.success,
                            size: 20,
                          ),
                        ),
                        title: Text(
                          record.memberName ?? 'Unknown',
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (record.programName != null)
                              Text(
                                record.programName!,
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: ColorPalette.textSecondary,
                                ),
                              ),
                            Row(
                              children: [
                                const Icon(Icons.access_time, size: 12,
                                    color: ColorPalette.textSecondary),
                                const SizedBox(width: 4),
                                Text(
                                  record.checkInTime ?? '',
                                  style: const TextStyle(fontSize: 11),
                                ),
                                if (record.checkOutTime != null) ...[
                                  const Text(' → ', style: TextStyle(fontSize: 11)),
                                  Text(
                                    record.checkOutTime!,
                                    style: const TextStyle(fontSize: 11),
                                  ),
                                ],
                              ],
                            ),
                          ],
                        ),
                        trailing: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: _getMethodColor(record.method).withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            (record.method ?? 'manual').toUpperCase(),
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: _getMethodColor(record.method),
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  List? _getRecords(CoachAttendanceState state) {
    if (state is CoachAttendanceLoaded) return state.records;
    if (state is CoachAttendanceMarking) return state.records;
    if (state is CoachAttendanceMarked) return state.records;
    return null;
  }

  Color _getMethodColor(String? method) {
    switch (method) {
      case 'qr_code':
        return ColorPalette.info;
      case 'nfc':
      case 'rfid':
        return ColorPalette.accent;
      default:
        return ColorPalette.textSecondary;
    }
  }
}
