import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../../../../config/themes/color_palette.dart';
import '../../domain/entities/class_absence.dart';
import '../../domain/entities/assigned_class.dart';
import '../cubit/absence_cubit.dart';

/// Select Makeup Class — member picks a slot and date for makeup.
class SelectMakeupPage extends StatefulWidget {
  final ClassAbsence absence;

  const SelectMakeupPage({super.key, required this.absence});

  @override
  State<SelectMakeupPage> createState() => _SelectMakeupPageState();
}

class _SelectMakeupPageState extends State<SelectMakeupPage> {
  AssignedClass? _selectedSlot;
  DateTime? _selectedDate;

  static const _dayOrder = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  @override
  void initState() {
    super.initState();
    context.read<AbsenceCubit>().loadMakeupSlots(widget.absence.id);
  }

  @override
  Widget build(BuildContext context) {
    final absentDate = DateTime.tryParse(widget.absence.absentDate);
    final deadline   = widget.absence.makeupDeadline != null
        ? DateTime.tryParse(widget.absence.makeupDeadline!)
        : null;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Makeup Class'),
        backgroundColor: ColorPalette.primary,
        foregroundColor: Colors.white,
      ),
      body: BlocConsumer<AbsenceCubit, AbsenceState>(
        listener: (context, state) {
          if (state is MakeupBooked) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('✅ Makeup class booked successfully!'),
                backgroundColor: ColorPalette.success,
              ),
            );
            Navigator.pop(context);
          }
          if (state is AbsenceError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.message), backgroundColor: ColorPalette.error),
            );
          }
        },
        builder: (context, state) {
          if (state is AbsenceActionLoading && state.action == 'loading_slots') {
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
                    onPressed: () => context.read<AbsenceCubit>().loadMakeupSlots(widget.absence.id),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          if (state is MakeupSlotsLoaded) {
            final sorted = [...state.slots]..sort((a, b) =>
                _dayOrder.indexOf(a.dayOfWeek.toLowerCase()) -
                _dayOrder.indexOf(b.dayOfWeek.toLowerCase()));

            return Column(
              children: [
                // Info banner
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  color: ColorPalette.primary.withValues(alpha: 0.05),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Original absence
                      Row(children: [
                        const Icon(Icons.event_busy, size: 16, color: ColorPalette.textSecondary),
                        const SizedBox(width: 8),
                        Text(
                          'Absent: ${absentDate != null ? DateFormat("EEE, MMM d").format(absentDate) : widget.absence.absentDate}',
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                        ),
                      ]),
                      const SizedBox(height: 6),
                      // Deadline
                      if (deadline != null)
                        Row(children: [
                          Icon(
                            widget.absence.isDeadlineUrgent ? Icons.warning_amber : Icons.schedule,
                            size: 16,
                            color: widget.absence.isDeadlineUrgent ? ColorPalette.warning : ColorPalette.textSecondary,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Select by ${DateFormat("MMM d, yyyy").format(deadline)}'
                            '${widget.absence.daysLeft != null ? " · ${widget.absence.daysLeft} day(s) left" : ""}',
                            style: TextStyle(
                              fontSize: 13,
                              color: widget.absence.isDeadlineUrgent ? ColorPalette.warning : ColorPalette.textSecondary,
                              fontWeight: widget.absence.isDeadlineUrgent ? FontWeight.w700 : FontWeight.normal,
                            ),
                          ),
                        ]),
                    ],
                  ),
                ),

                // Slots list
                Expanded(
                  child: sorted.isEmpty
                      ? const Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.event_busy, size: 64, color: Colors.grey),
                              SizedBox(height: 16),
                              Text('No makeup slots available', style: TextStyle(fontSize: 16)),
                              SizedBox(height: 8),
                              Text('All classes are full or none are available\nin the same month.', textAlign: TextAlign.center, style: TextStyle(color: ColorPalette.textSecondary, fontSize: 13)),
                            ],
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: sorted.length,
                          itemBuilder: (context, i) => _SlotCard(
                            slot: sorted[i],
                            isSelected: _selectedSlot?.programClassId == sorted[i].programClassId,
                            selectedDate: _selectedSlot?.programClassId == sorted[i].programClassId ? _selectedDate : null,
                            absentDate: absentDate,
                            deadline: deadline,
                            onTap: () => setState(() {
                              _selectedSlot = sorted[i];
                              _selectedDate = null;
                            }),
                            onDateSelect: (date) => setState(() => _selectedDate = date),
                          ),
                        ),
                ),

                // Book button
                if (_selectedSlot != null && _selectedDate != null)
                  _BookButton(
                    onBook: () {
                      context.read<AbsenceCubit>().selectMakeup(
                        absenceId:     widget.absence.id,
                        makeupClassId: _selectedSlot!.programClassId,
                        makeupDate:    DateFormat('yyyy-MM-dd').format(_selectedDate!),
                      );
                    },
                    slot: _selectedSlot!,
                    date: _selectedDate!,
                    state: state,
                  ),
              ],
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }
}

// ── Slot Card ─────────────────────────────────────────────────────────────────

class _SlotCard extends StatelessWidget {
  final AssignedClass slot;
  final bool isSelected;
  final DateTime? selectedDate;
  final DateTime? absentDate;
  final DateTime? deadline;
  final VoidCallback onTap;
  final void Function(DateTime) onDateSelect;

  const _SlotCard({
    required this.slot,
    required this.isSelected,
    required this.selectedDate,
    required this.absentDate,
    required this.deadline,
    required this.onTap,
    required this.onDateSelect,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: isSelected
            ? const BorderSide(color: ColorPalette.primary, width: 2)
            : BorderSide.none,
      ),
      elevation: isSelected ? 3 : 1,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                // Day badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? ColorPalette.primary.withValues(alpha: 0.1)
                        : Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    slot.dayOfWeek.substring(0, 3).toUpperCase(),
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
                      color: isSelected ? ColorPalette.primary : ColorPalette.textSecondary,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        slot.label ?? slot.dayOfWeek,
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                      ),
                      Text(
                        slot.timeDisplay,
                        style: const TextStyle(color: ColorPalette.textSecondary, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                // Available spots
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '${slot.availableSpots ?? "?"} spots',
                    style: const TextStyle(color: Colors.green, fontSize: 11, fontWeight: FontWeight.w600),
                  ),
                ),
                const SizedBox(width: 8),
                Icon(
                  isSelected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                  color: isSelected ? ColorPalette.primary : Colors.grey,
                ),
              ]),

              // Date picker (shown when selected)
              if (isSelected) ...[
                const SizedBox(height: 12),
                const Divider(height: 1),
                const SizedBox(height: 12),

                const Text('Select a date for this makeup:', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                const SizedBox(height: 8),

                InkWell(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: absentDate != null
                          ? absentDate!.add(const Duration(days: 1))
                          : DateTime.now(),
                      firstDate: absentDate != null
                          ? absentDate!.add(const Duration(days: 1))
                          : DateTime.now(),
                      lastDate: deadline ?? DateTime.now().add(const Duration(days: 30)),
                      selectableDayPredicate: (day) {
                        // Only allow days matching this slot's day_of_week
                        const map = {
                          'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4,
                          'friday': 5, 'saturday': 6, 'sunday': 7,
                        };
                        return day.weekday == (map[slot.dayOfWeek.toLowerCase()] ?? -1);
                      },
                    );
                    if (picked != null) onDateSelect(picked);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: selectedDate != null ? ColorPalette.primary : ColorPalette.divider,
                      ),
                      borderRadius: BorderRadius.circular(10),
                      color: selectedDate != null
                          ? ColorPalette.primary.withValues(alpha: 0.04)
                          : ColorPalette.background,
                    ),
                    child: Row(children: [
                      Icon(
                        Icons.calendar_today,
                        size: 16,
                        color: selectedDate != null ? ColorPalette.primary : ColorPalette.textSecondary,
                      ),
                      const SizedBox(width: 10),
                      Text(
                        selectedDate != null
                            ? DateFormat('EEEE, MMM d, yyyy').format(selectedDate!)
                            : 'Tap to pick date',
                        style: TextStyle(
                          fontWeight: selectedDate != null ? FontWeight.w600 : FontWeight.normal,
                          color: selectedDate != null ? ColorPalette.primary : ColorPalette.textSecondary,
                          fontSize: 13,
                        ),
                      ),
                    ]),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

// ── Book Button ───────────────────────────────────────────────────────────────

class _BookButton extends StatelessWidget {
  final VoidCallback onBook;
  final AssignedClass slot;
  final DateTime date;
  final AbsenceState state;

  const _BookButton({
    required this.onBook,
    required this.slot,
    required this.date,
    required this.state,
  });

  @override
  Widget build(BuildContext context) {
    final isLoading = state is AbsenceActionLoading &&
        (state as AbsenceActionLoading).action == 'booking';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8, offset: Offset(0, -2))],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: ColorPalette.primary.withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(children: [
              const Icon(Icons.calendar_month, color: ColorPalette.primary, size: 18),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      slot.label ?? slot.dayOfWeek,
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                    ),
                    Text(
                      DateFormat('EEEE, MMM d, yyyy').format(date),
                      style: const TextStyle(color: ColorPalette.textSecondary, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ]),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: isLoading ? null : onBook,
              style: ElevatedButton.styleFrom(
                backgroundColor: ColorPalette.success,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: isLoading
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Confirm Makeup Booking', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
            ),
          ),
        ],
      ),
    );
  }
}
