import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_client.dart';
import '../models/member_program_model.dart';
import '../models/schedule_models.dart';

class ScheduleRemoteDataSource {
  final ApiClient apiClient;

  ScheduleRemoteDataSource(this.apiClient);

  /// GET /api/member/programs
  Future<List<MemberProgramModel>> getPrograms() async {
    final response = await apiClient.get(ApiConstants.memberPrograms);
    final data = response.data['programs'] as List<dynamic>? ?? [];
    return data
        .map((p) => MemberProgramModel.fromJson(p as Map<String, dynamic>))
        .toList();
  }

  /// GET /api/member/schedule?days=[days]
  Future<ScheduleResponseModel> getSchedule({int days = 30}) async {
    final response = await apiClient.get(
      ApiConstants.memberSchedule,
      queryParameters: {'days': days},
    );
    return ScheduleResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }
}
