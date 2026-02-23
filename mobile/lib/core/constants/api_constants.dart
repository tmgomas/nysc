/// API endpoint and base URL constants.
class ApiConstants {
  ApiConstants._();

  // Base URL — change this to your production URL
  static const String baseUrl = 'http://nycsc.test/api'; // Local dev (Herd/Laragon)
  // static const String baseUrl = 'http://10.0.2.2:8000/api'; // Android emulator
  // static const String baseUrl = 'http://localhost:8000/api'; // iOS simulator
  // static const String baseUrl = 'https://your-domain.com/api'; // Production

  // Auth
  static const String login = '/login';
  static const String logout = '/logout';
  static const String user = '/user';

  // Member
  static const String memberProfile = '/member/profile';
  static const String memberPrograms = '/member/programs';
  static const String memberSchedule = '/member/schedule';
  static const String memberPayments = '/member/payments';
  static const String memberAttendance = '/member/attendance';

  // Coach
  static const String coachDashboard = '/coach/dashboard';
  static const String coachScheduleToday = '/coach/schedule/today';
  static const String coachAttendance = '/coach/attendance';
  static const String coachAttendanceMark = '/coach/attendance/mark';
}
