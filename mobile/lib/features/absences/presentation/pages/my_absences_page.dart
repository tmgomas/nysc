import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../../../../config/themes/color_palette.dart';
import '../../domain/entities/class_absence.dart';
import '../cubit/absence_cubit.dart';
import 'select_makeup_page.dart';

/// My Absences — absence history with status, makeup info, and inline actions.
class MyAbsencesPage extends StatefulWidget {
  final bool isEmbedded;

  const MyAbsencesPage({super.key, this.isEmbedded = false});

  @override
  State<MyAbsencesPage> createState() => _MyAbsencesPageState();
}

class _MyAbsencesPageState extends State<MyAbsencesPage> {
  @override
  void initState() {
    super.initState();
    context.read<AbsenceCubit>().loadMyAbsences();
  }

  @override
  Widget build(BuildContext context) {
    final body = BlocBuilder<AbsenceCubit, AbsenceState>(
        builder: (context, state) {
          if (state is AbsenceLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is AbsenceError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: ColorPalette.error),
                  const SizedBox(height: 12),
                  Text(state.message, textAlign: TextAlign.center),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () => context.read<AbsenceCubit>().loadMyAbsences(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          if (state is MyAbsencesLoaded) {
            if (state.absences.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.check_circle_outline, size: 72, color: Colors.grey.shade300),
                    const SizedBox(height: 16),
                    const Text('No absences recorded', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    const Text('Great attendance!', style: TextStyle(color: ColorPalette.textSecondary)),
                  ],
                ),
              );
            }

            return RefreshIndicator(
              onRefresh: () async => context.read<AbsenceCubit>().loadMyAbsences(),
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: state.absences.length,
                itemBuilder: (context, i) => _AbsenceCard(
                  absence: state.absences[i],
                  onSelectMakeup: (absence) => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => BlocProvider.value(
                        value: context.read<AbsenceCubit>(),
                        child: SelectMakeupPage(absence: absence),
                      ),
                    ),
                  ).then((_) => context.read<AbsenceCubit>().loadMyAbsences()),
                ),
              ),
            );
          }

          return const SizedBox.shrink();
        },
      );

    if (widget.isEmbedded) return body;

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Absences'),
        backgroundColor: ColorPalette.primary,
        foregroundColor: Colors.white,
      ),
      body: body,
    );
  }
}

// ── Absence Card ──────────────────────────────────────────────────────────────

class _AbsenceCard extends StatelessWidget {
  final ClassAbsence absence;
  final void Function(ClassAbsence) onSelectMakeup;

  const _AbsenceCard({required this.absence, required this.onSelectMakeup});

  static const _statusConfig = {
    AbsenceStatus.pending:        _StatusConfig('Pending',      Color(0xFFFFF3E0), Color(0xFFF57C00), Icons.hourglass_empty),
    AbsenceStatus.approved:       _StatusConfig('Approved',     Color(0xFFE3F2FD), Color(0xFF1565C0), Icons.check_circle_outline),
    AbsenceStatus.rejected:       _StatusConfig('Rejected',     Color(0xFFFFEBEE), Color(0xFFC62828), Icons.cancel_outlined),
    AbsenceStatus.makeupSelected: _StatusConfig('Makeup Booked',Color(0xFFF3E5F5), Color(0xFF6A1B9A), Icons.calendar_month),
    AbsenceStatus.completed:      _StatusConfig('Completed',    Color(0xFFE8F5E9), Color(0xFF2E7D32), Icons.task_alt),
    AbsenceStatus.expired:        _StatusConfig('Expired',      Color(0xFFF5F5F5), Color(0xFF757575), Icons.history_toggle_off),
    AbsenceStatus.noMakeup:       _StatusConfig('No Makeup',    Color(0xFFF5F5F5), Color(0xFF757575), Icons.event_busy),
    AbsenceStatus.unknown:        _StatusConfig('Unknown',      Color(0xFFF5F5F5), Color(0xFF757575), Icons.help_outline),
  };

  @override
  Widget build(BuildContext context) {
    final cfg = _statusConfig[absence.status] ?? _statusConfig[AbsenceStatus.unknown]!;
    final absentDate = DateTime.tryParse(absence.absentDate);
    final makeupDeadline = absence.makeupDeadline != null
        ? DateTime.tryParse(absence.makeupDeadline!)
        : null;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: absence.isDeadlineUrgent
            ? const BorderSide(color: Color(0xFFF57C00), width: 2)
            : BorderSide.none,
      ),
      elevation: absence.isDeadlineUrgent ? 3 : 1,
      child: Column(
        children: [
          // Header (status)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: cfg.bgColor,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Row(children: [
              Icon(cfg.icon, color: cfg.color, size: 18),
              const SizedBox(width: 8),
              Text(cfg.label, style: TextStyle(fontWeight: FontWeight.w700, color: cfg.color, fontSize: 13)),
              const Spacer(),
              if (absentDate != null)
                Text(
                  DateFormat('MMM d, yyyy').format(absentDate),
                  style: TextStyle(color: cfg.color, fontSize: 12),
                ),
            ]),
          ),

          // Body
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Class info
                Row(children: [
                  const Icon(Icons.pool, size: 16, color: ColorPalette.textSecondary),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      '${absence.programName ?? 'Class'} — ${absence.className ?? absence.classDay ?? ''}',
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                    ),
                  ),
                ]),

                if (absence.classTime != null) ...[
                  const SizedBox(height: 4),
                  Row(children: [
                    const Icon(Icons.access_time, size: 14, color: ColorPalette.textSecondary),
                    const SizedBox(width: 6),
                    Text(absence.classTime!, style: const TextStyle(color: ColorPalette.textSecondary, fontSize: 13)),
                  ]),
                ],

                // Makeup info
                if (absence.status == AbsenceStatus.makeupSelected || absence.status == AbsenceStatus.completed) ...[
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF3E5F5),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(children: [
                      const Icon(Icons.calendar_month, size: 16, color: Color(0xFF6A1B9A)),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Makeup Class', style: TextStyle(fontSize: 11, color: Color(0xFF6A1B9A), fontWeight: FontWeight.w600)),
                            Text(
                              '${absence.makeupClassName ?? absence.makeupClassDay ?? 'TBD'}'
                              '${absence.makeupDate != null ? " · ${DateFormat('MMM d').format(DateTime.tryParse(absence.makeupDate!)!)}" : ""}',
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                            ),
                          ],
                        ),
                      ),
                    ]),
                  ),
                ],

                // Deadline warning (approved, waiting for makeup selection)
                if (absence.status == AbsenceStatus.approved && makeupDeadline != null) ...[
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: absence.isDeadlineUrgent
                          ? const Color(0xFFFFF3E0)
                          : const Color(0xFFE3F2FD),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(children: [
                      Icon(
                        absence.isDeadlineUrgent ? Icons.warning_amber : Icons.info_outline,
                        size: 16,
                        color: absence.isDeadlineUrgent ? ColorPalette.warning : ColorPalette.info,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          absence.isDeadlineUrgent
                              ? '⚠️ Only ${absence.daysLeft} day(s) left to select makeup!'
                              : 'Select makeup class by ${DateFormat("MMM d, yyyy").format(makeupDeadline)}${absence.daysLeft != null ? " (${absence.daysLeft} days left)" : ""}',
                          style: TextStyle(
                            fontSize: 12,
                            color: absence.isDeadlineUrgent ? ColorPalette.warning : ColorPalette.info,
                            fontWeight: absence.isDeadlineUrgent ? FontWeight.w700 : FontWeight.normal,
                          ),
                        ),
                      ),
                    ]),
                  ),

                  const SizedBox(height: 12),

                  // Select Makeup button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () => onSelectMakeup(absence),
                      icon: const Icon(Icons.calendar_month, size: 18),
                      label: const Text('Select Makeup Class'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ColorPalette.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusConfig {
  final String label;
  final Color bgColor;
  final Color color;
  final IconData icon;
  const _StatusConfig(this.label, this.bgColor, this.color, this.icon);
}
