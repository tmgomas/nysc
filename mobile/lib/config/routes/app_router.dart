import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/bloc/auth_bloc.dart';
import '../../features/auth/presentation/bloc/auth_state.dart';
import '../../features/auth/presentation/pages/splash_page.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/home/presentation/pages/home_page.dart';
import '../../features/coach/presentation/pages/coach_home_page.dart';

/// GoRouter configuration with auth + role-based redirect.
class AppRouter {
  final AuthBloc authBloc;

  AppRouter(this.authBloc);

  late final GoRouter router = GoRouter(
    initialLocation: '/splash',
    refreshListenable: GoRouterRefreshStream(authBloc.stream),
    redirect: (context, state) {
      final authState = authBloc.state;
      final location = state.matchedLocation;
      final isOnSplash = location == '/splash';
      final isOnLogin = location == '/login';
      final isAuthPage = isOnSplash || isOnLogin;

      // Still loading auth — stay on splash
      if (authState is AuthInitial || authState is AuthLoading) {
        return isOnSplash ? null : '/splash';
      }

      // Not authenticated — go to login
      if (authState is AuthUnauthenticated || authState is AuthFailure) {
        return isOnLogin ? null : '/login';
      }

      // Authenticated — route by role
      if (authState is AuthAuthenticated) {
        if (!isAuthPage) return null; // already on a valid page

        // Route coaches to /coach, everyone else to /home
        return authState.user.isCoach ? '/coach' : '/home';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashPage(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => const HomePage(),
      ),
      GoRoute(
        path: '/coach',
        builder: (context, state) => const CoachHomePage(),
      ),
    ],
  );
}

/// Converts a BLoC stream into a Listenable for GoRouter's refreshListenable.
class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    stream.listen((_) => notifyListeners());
  }
}

