import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_event.dart';
import '../../../attendance/presentation/cubit/attendance_cubit.dart';
import 'dashboard_page.dart';
import '../../../payments/presentation/cubit/payments_cubit.dart';
import '../../../payments/presentation/pages/payments_page.dart';
import '../../../profile/presentation/cubit/profile_cubit.dart';
import '../../../profile/presentation/pages/profile_page.dart';
import '../../../schedule/presentation/cubit/schedule_cubit.dart';
import '../../../schedule/presentation/pages/schedule_page.dart';
import '../../../../injection_container.dart';

/// Home page with bottom navigation for members.
/// 4 tabs: Dashboard | Schedule | Payments | Profile
class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _currentIndex = 0;

  static const _titles = ['Dashboard', 'Schedule', 'Payments', 'Profile'];

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => getIt<ProfileCubit>()),
        BlocProvider(create: (_) => getIt<PaymentsCubit>()),
        BlocProvider(create: (_) => getIt<AttendanceCubit>()),
        BlocProvider(create: (_) => getIt<ProgramsCubit>()),
        BlocProvider(create: (_) => getIt<ScheduleCubit>()),
      ],
      child: Builder(
        builder: (context) {
          return Scaffold(
            appBar: AppBar(
              title: Text(_titles[_currentIndex]),
              backgroundColor: const Color(0xFF1565C0),
              foregroundColor: Colors.white,
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
                DashboardPage(),
                SchedulePage(),
                PaymentsPage(),
                ProfilePage(),
              ],
            ),
            bottomNavigationBar: NavigationBar(
              selectedIndex: _currentIndex,
              onDestinationSelected: (index) =>
                  setState(() => _currentIndex = index),
              destinations: const [
                NavigationDestination(
                  icon: Icon(Icons.home_outlined),
                  selectedIcon: Icon(Icons.home),
                  label: 'Home',
                ),
                NavigationDestination(
                  icon: Icon(Icons.calendar_month_outlined),
                  selectedIcon: Icon(Icons.calendar_month),
                  label: 'Schedule',
                ),
                NavigationDestination(
                  icon: Icon(Icons.payment_outlined),
                  selectedIcon: Icon(Icons.payment),
                  label: 'Payments',
                ),
                NavigationDestination(
                  icon: Icon(Icons.person_outline),
                  selectedIcon: Icon(Icons.person),
                  label: 'Profile',
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
