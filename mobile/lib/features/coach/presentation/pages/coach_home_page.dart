import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_event.dart';
import '../cubit/coach_dashboard_cubit.dart';
import '../cubit/coach_attendance_cubit.dart';
import 'coach_dashboard_page.dart';
import 'coach_attendance_page.dart';
import '../../../../injection_container.dart';

/// Coach home page with bottom navigation — Dashboard and Attendance.
class CoachHomePage extends StatefulWidget {
  const CoachHomePage({super.key});

  @override
  State<CoachHomePage> createState() => _CoachHomePageState();
}

class _CoachHomePageState extends State<CoachHomePage> {
  int _currentIndex = 0;

  static const _titles = ['Dashboard', 'Attendance'];

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => getIt<CoachDashboardCubit>()),
        BlocProvider(create: (_) => getIt<CoachAttendanceCubit>()),
      ],
      child: Builder(
        builder: (context) {
          final isDashboard = _currentIndex == 0;
          return Scaffold(
            appBar: isDashboard ? null : AppBar(
              title: Text(_titles[_currentIndex]),
              actions: [
                IconButton(
                  icon: const Icon(Icons.logout),
                  onPressed: () {
                    context.read<AuthBloc>().add(const LogoutRequested());
                  },
                ),
              ],
            ),
            body: IndexedStack(
              index: _currentIndex,
              children: const [
                CoachDashboardPage(),
                CoachAttendancePage(),
              ],
            ),
            bottomNavigationBar: Container(
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: Colors.white12, width: 1)),
              ),
              child: NavigationBar(
                selectedIndex: _currentIndex,
                onDestinationSelected: (index) =>
                    setState(() => _currentIndex = index),
                destinations: const [
                  NavigationDestination(
                    icon: Icon(Icons.dashboard_outlined),
                    selectedIcon: Icon(Icons.dashboard),
                    label: 'Dashboard',
                  ),
                  NavigationDestination(
                    icon: Icon(Icons.fact_check_outlined),
                    selectedIcon: Icon(Icons.fact_check),
                    label: 'Attendance',
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
