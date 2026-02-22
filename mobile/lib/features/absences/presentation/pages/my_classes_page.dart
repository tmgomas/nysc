import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../../../../config/themes/color_palette.dart';
import '../../domain/entities/assigned_class.dart';
import '../cubit/absence_cubit.dart';
import 'my_absences_page.dart';

/// My Classes — shows assigned class slots, upcoming dates, and absence history.
class MyClassesPage extends StatefulWidget {
  const MyClassesPage({super.key});

  @override
  State<MyClassesPage> createState() => _MyClassesPageState();
}

class _MyClassesPageState extends State<MyClassesPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  static const _dayOrder = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    context.read<AbsenceCubit>().loadMyClasses();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Classes'),
        backgroundColor: const Color(0xFF1565C0), // Match Home nav Appbar color override or keep primary
        foregroundColor: Colors.white,
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          indicatorColor: Colors.white,
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontWeight: FontWeight.w600),
          tabs: const [
            Tab(text: 'My Slots'),
            Tab(text: 'Upcoming'),
            Tab(text: 'Absences'),
          ],
        ),
      ),
      body: BlocConsumer<AbsenceCubit, AbsenceState>(
        listener: (context, state) {
          if (state is AbsenceReported) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('✅ Absence reported! Awaiting admin approval.'),
                backgroundColor: ColorPalette.success,
              ),
            );
            // Reload classes (and Absences will be loaded dynamically by embedded page on mount or manually triggered)
            context.read<AbsenceCubit>().loadMyClasses();
            _tabController.animateTo(2); // Jump to Absences tab
          }
          if (state is AbsenceError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: ColorPalette.error,
              ),
            );
          }
        },
        builder: (context, state) {
          return TabBarView(
            controller: _tabController,
            children: [
              // Tab 1: My Slots
              _buildMySlotsTab(state),
              
              // Tab 2: Upcoming
              _buildUpcomingTab(state),
              
              // Tab 3: Absences History
              const MyAbsencesPage(isEmbedded: true),
            ],
          );
        },
      ),
    );
  }

  // ── Tab 1: My Slots ─────────────────────────────────────────────────────────

  Widget _buildMySlotsTab(AbsenceState state) {
    if (state is AbsenceLoading) return const Center(child: CircularProgressIndicator());
    if (state is AbsenceError) return _ErrorView(message: state.message, onRetry: () => context.read<AbsenceCubit>().loadMyClasses());
    
    if (state is MyClassesLoaded) {
      if (state.classes.isEmpty) return _EmptyView(text: 'No classes assigned');

      final sorted = [...state.classes]..sort((a, b) =>
          _dayOrder.indexOf(a.dayOfWeek.toLowerCase()) -
          _dayOrder.indexOf(b.dayOfWeek.toLowerCase()));

      return RefreshIndicator(
        onRefresh: () async => context.read<AbsenceCubit>().loadMyClasses(),
        child: ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: sorted.length,
          itemBuilder: (context, i) => _ClassCard(
            cls: sorted[i],
            onReportAbsence: () => _showReportAbsenceDialog(context, sorted[i]),
          ),
        ),
      );
    }
    
    return const SizedBox.shrink();
  }

  // ── Tab 2: Upcoming ─────────────────────────────────────────────────────────

  Widget _buildUpcomingTab(AbsenceState state) {
    if (state is AbsenceLoading) return const Center(child: CircularProgressIndicator());
    if (state is AbsenceError) return _ErrorView(message: state.message, onRetry: () => context.read<AbsenceCubit>().loadMyClasses());

    if (state is MyClassesLoaded) {
      // Flatten all upcoming dates
      final upcomingList = <_UpcomingData>[];
      for (final cls in state.classes) {
        for (final date in cls.upcomingDates) {
          upcomingList.add(_UpcomingData(cls: cls, dateStr: date.date, dateInfo: date));
        }
      }

      if (upcomingList.isEmpty) return _EmptyView(text: 'No upcoming classes found');

      // Sort chronologically
      upcomingList.sort((a, b) => a.dateStr.compareTo(b.dateStr));

      return RefreshIndicator(
        onRefresh: () async => context.read<AbsenceCubit>().loadMyClasses(),
        child: ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          itemCount: upcomingList.length,
          itemBuilder: (context, i) {
            final item = upcomingList[i];
            
            // Avoid duplicate headers
            bool showHeader = i == 0 || upcomingList[i - 1].dateStr != item.dateStr;

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (showHeader) ...[
                  if (i > 0) const SizedBox(height: 12),
                  Padding(
                    padding: const EdgeInsets.only(left: 4, bottom: 8, top: 8),
                    child: Text(
                      item.dateInfo.label,
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: item.dateInfo.isToday ? ColorPalette.primary : ColorPalette.textPrimary,
                      ),
                    ),
                  ),
                ],
                _UpcomingCard(data: item),
              ],
            );
          },
        ),
      );
    }
    return const SizedBox.shrink();
  }

// ── Shared Report Absence Logic ───────────────────────────────────────────────

  Future<void> _showReportAbsenceDialog(BuildContext ctx, AssignedClass cls) async {
    DateTime selectedDate = DateTime.now();
    final reasonController = TextEditingController();

    await showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => BlocProvider.value(
        value: ctx.read<AbsenceCubit>(),
        child: StatefulBuilder(
          builder: (context, setModalState) => Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            padding: EdgeInsets.only(
              left: 24, right: 24, top: 24,
              bottom: MediaQuery.of(context).viewInsets.bottom + 24,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40, height: 4,
                    decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
                  ),
                ),
                const SizedBox(height: 20),
                Row(children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: ColorPalette.warning.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.event_busy, color: ColorPalette.warning),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Report Absence', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        Text('${cls.programName} — ${cls.displayName}', style: const TextStyle(color: ColorPalette.textSecondary, fontSize: 13)),
                      ],
                    ),
                  ),
                ]),
                const SizedBox(height: 20),
                const Text('Which date?', style: TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                InkWell(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: selectedDate,
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 30)),
                    );
                    if (picked != null) {
                      setModalState(() => selectedDate = picked);
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(border: Border.all(color: ColorPalette.divider), borderRadius: BorderRadius.circular(12), color: ColorPalette.background),
                    child: Row(children: [
                      const Icon(Icons.calendar_today, color: ColorPalette.primary, size: 18),
                      const SizedBox(width: 10),
                      Text(DateFormat('EEEE, MMM d, yyyy').format(selectedDate), style: const TextStyle(fontWeight: FontWeight.w500)),
                    ]),
                  ),
                ),
                const SizedBox(height: 16),
                const Text('Reason (optional)', style: TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                TextField(
                  controller: reasonController,
                  maxLines: 2,
                  decoration: InputDecoration(
                    hintText: 'e.g. School exam, medical appointment...',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: ColorPalette.info.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                  child: const Row(children: [
                    Icon(Icons.info_outline, color: ColorPalette.info, size: 16),
                    SizedBox(width: 8),
                    Expanded(child: Text('Admin will review your request. Once approved, you\'ll have to select a makeup class within the same month.', style: TextStyle(fontSize: 12, color: ColorPalette.textSecondary))),
                  ]),
                ),
                const SizedBox(height: 20),
                BlocBuilder<AbsenceCubit, AbsenceState>(
                  builder: (context, state) {
                    final isLoading = state is AbsenceActionLoading && state.action == 'reporting';
                    return SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: isLoading ? null : () {
                          Navigator.pop(context);
                          ctx.read<AbsenceCubit>().reportAbsence(
                            programClassId: cls.programClassId,
                            absentDate: DateFormat('yyyy-MM-dd').format(selectedDate),
                            reason: reasonController.text.trim().isEmpty ? null : reasonController.text.trim(),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: ColorPalette.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: isLoading
                            ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : const Text('Submit Absence Request', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── Data Classes ──────────────────────────────────────────────────────────────

class _UpcomingData {
  final AssignedClass cls;
  final String dateStr;
  final UpcomingDate dateInfo;

  _UpcomingData({required this.cls, required this.dateStr, required this.dateInfo});
}

// ── Shared Widgets ────────────────────────────────────────────────────────────

class _EmptyView extends StatelessWidget {
  final String text;
  const _EmptyView({required this.text});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.event_note, size: 72, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          Text(text, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: ColorPalette.textPrimary)),
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
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 48, color: ColorPalette.error),
          const SizedBox(height: 16),
          Text(message, textAlign: TextAlign.center),
          const SizedBox(height: 12),
          ElevatedButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}

// ── Slot Widgets ──────────────────────────────────────────────────────────────

class _ClassCard extends StatelessWidget {
  final AssignedClass cls;
  final VoidCallback onReportAbsence;

  const _ClassCard({required this.cls, required this.onReportAbsence});

  static const _dayColors = {
    'monday':    Color(0xFF1565C0),
    'tuesday':   Color(0xFF6A1B9A),
    'wednesday': Color(0xFF00695C),
    'thursday':  Color(0xFF558B2F),
    'friday':    Color(0xFFE65100),
    'saturday':  Color(0xFF4527A0),
    'sunday':    Color(0xFFC62828),
  };

  bool get _isToday {
    const map = {
      'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4,
      'friday': 5, 'saturday': 6, 'sunday': 7,
    };
    return map[cls.dayOfWeek.toLowerCase()] == DateTime.now().weekday;
  }

  @override
  Widget build(BuildContext context) {
    final color = _dayColors[cls.dayOfWeek.toLowerCase()] ?? ColorPalette.primary;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: _isToday ? 3 : 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: _isToday ? BorderSide(color: color, width: 2) : BorderSide.none,
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(children: [
          Container(
            width: 52, height: 52,
            decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(14)),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(cls.dayOfWeek.substring(0, 3).toUpperCase(), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: color)),
                if (_isToday) Container(width: 6, height: 6, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
              ],
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  Text(cls.programName, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                  if (_isToday) ...[ 
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(6)),
                      child: const Text('TODAY', style: TextStyle(fontSize: 9, color: Colors.white, fontWeight: FontWeight.w700)),
                    ),
                  ],
                ]),
                if (cls.label != null) Text(cls.label!, style: const TextStyle(color: ColorPalette.textSecondary, fontSize: 13)),
                const SizedBox(height: 4),
                Row(children: [
                  const Icon(Icons.access_time, size: 14, color: ColorPalette.textSecondary),
                  const SizedBox(width: 4),
                  Text(cls.timeDisplay, style: const TextStyle(color: ColorPalette.textSecondary, fontSize: 13)),
                ]),
              ],
            ),
          ),
          TextButton.icon(
            onPressed: onReportAbsence,
            icon: const Icon(Icons.event_busy, size: 16),
            label: const Text('Absent', style: TextStyle(fontSize: 12)),
            style: TextButton.styleFrom(foregroundColor: ColorPalette.warning, padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8)),
          ),
        ]),
      ),
    );
  }
}

class _UpcomingCard extends StatelessWidget {
  final _UpcomingData data;

  const _UpcomingCard({required this.data});

  @override
  Widget build(BuildContext context) {
    if (data.dateInfo.isCancelled) {
      return Card(
        margin: const EdgeInsets.only(bottom: 8),
        color: const Color(0xFFFFEBEE),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.red.shade200)),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(children: [
            const Icon(Icons.cancel, color: ColorPalette.error, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${data.cls.programName} Cancelled',
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, decoration: TextDecoration.lineThrough, color: ColorPalette.error),
                  ),
                  if (data.dateInfo.cancelReason != null)
                    Text(data.dateInfo.cancelReason!, style: const TextStyle(color: ColorPalette.error, fontSize: 12)),
                ],
              ),
            ),
          ]),
        ),
      );
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(children: [
          const Icon(Icons.pool, size: 18, color: ColorPalette.textSecondary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${data.cls.programName} ${data.cls.label != null ? "- ${data.cls.label!}" : ""}',
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                ),
                Text(data.cls.timeDisplay, style: const TextStyle(color: ColorPalette.textSecondary, fontSize: 12)),
              ],
            ),
          ),
        ],),
      ),
    );
  }
}
