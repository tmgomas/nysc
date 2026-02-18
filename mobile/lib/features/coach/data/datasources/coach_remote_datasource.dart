import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_client.dart';
import '../models/coach_models.dart';

/// Remote data source for all coach-related API calls.
class CoachRemoteDataSource {
  final ApiClient apiClient;

  CoachRemoteDataSource(this.apiClient);

  Future<CoachDashboardModel> getDashboard() async {
    final response = await apiClient.get(ApiConstants.coachDashboard);
    return CoachDashboardModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  Future<List<CoachClassModel>> getTodaySchedule() async {
    final response = await apiClient.get(ApiConstants.coachScheduleToday);
    final data = response.data['classes'] as List<dynamic>;
    return data
        .map((c) => CoachClassModel.fromJson(c as Map<String, dynamic>))
        .toList();
  }

  Future<List<CoachAttendanceRecordModel>> getAttendance({
    String? date,
  }) async {
    final response = await apiClient.get(
      ApiConstants.coachAttendance,
      queryParameters: date != null ? {'date': date} : null,
    );
    final data = response.data['data'] as List<dynamic>;
    return data
        .map((a) => CoachAttendanceRecordModel.fromJson(a as Map<String, dynamic>))
        .toList();
  }

  Future<CoachAttendanceRecordModel> markAttendance({
    required String memberId,
    required String programId,
    String method = 'manual',
  }) async {
    final response = await apiClient.post(
      ApiConstants.coachAttendanceMark,
      data: {
        'member_id': memberId,
        'program_id': programId,
        'method': method,
      },
    );
    return CoachAttendanceRecordModel.fromJson(
      response.data['attendance'] as Map<String, dynamic>,
    );
  }
}
