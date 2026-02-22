import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_client.dart';
import '../models/assigned_class_model.dart';
import '../models/class_absence_model.dart';

/// Remote data source for absence & class assignment API calls.
class AbsenceRemoteDataSource {
  final ApiClient apiClient;

  AbsenceRemoteDataSource(this.apiClient);

  /// GET /api/member/classes  — member's assigned class slots
  Future<List<AssignedClassModel>> getMyClasses() async {
    final response = await apiClient.get(ApiConstants.memberClasses);
    final data = response.data['classes'] as List<dynamic>;
    return data
        .map((c) => AssignedClassModel.fromJson(c as Map<String, dynamic>))
        .toList();
  }

  /// GET /api/member/absences  — absence history
  Future<List<ClassAbsenceModel>> getMyAbsences() async {
    final response = await apiClient.get(ApiConstants.memberAbsences);
    final data = response.data['absences'] as List<dynamic>;
    return data
        .map((a) => ClassAbsenceModel.fromJson(a as Map<String, dynamic>))
        .toList();
  }

  /// POST /api/member/absences  — report absence
  Future<ClassAbsenceModel> reportAbsence({
    required String programClassId,
    required String absentDate,
    String? reason,
  }) async {
    final response = await apiClient.post(
      ApiConstants.memberAbsences,
      data: {
        'program_class_id': programClassId,
        'absent_date': absentDate,
        if (reason != null && reason.isNotEmpty) 'reason': reason,
      },
    );
    return ClassAbsenceModel.fromJson(
      response.data['absence'] as Map<String, dynamic>,
    );
  }

  /// GET /api/member/absences/{id}/makeup-slots  — available makeup slots
  Future<List<AssignedClassModel>> getMakeupSlots(String absenceId) async {
    final response = await apiClient.get(
      ApiConstants.memberMakeupSlots(absenceId),
    );
    final data = response.data['slots'] as List<dynamic>;
    return data
        .map((s) => AssignedClassModel.fromJson(s as Map<String, dynamic>))
        .toList();
  }

  /// POST /api/member/absences/{id}/select-makeup
  Future<void> selectMakeup({
    required String absenceId,
    required String makeupClassId,
    required String makeupDate,
  }) async {
    await apiClient.post(
      ApiConstants.memberSelectMakeup(absenceId),
      data: {
        'makeup_class_id': makeupClassId,
        'makeup_date':     makeupDate,
      },
    );
  }
}
