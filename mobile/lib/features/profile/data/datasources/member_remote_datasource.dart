import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_client.dart';
import '../../../payments/data/models/payment_model.dart';

import '../../../attendance/data/models/attendance_record_model.dart';
import '../models/member_profile_model.dart';

/// Single remote data source for all member-related API calls.
class MemberRemoteDataSource {
  final ApiClient apiClient;

  MemberRemoteDataSource(this.apiClient);

  Future<MemberProfileModel> getProfile() async {
    final response = await apiClient.get(ApiConstants.memberProfile);
    return MemberProfileModel.fromJson(
      response.data['member'] as Map<String, dynamic>,
    );
  }

  Future<MemberProfileModel> updateProfile(Map<String, dynamic> data) async {
    final response = await apiClient.put(ApiConstants.memberProfile, data: data);
    return MemberProfileModel.fromJson(
      response.data['member'] as Map<String, dynamic>,
    );
  }

  Future<List<PaymentModel>> getPayments({int page = 1}) async {
    final response = await apiClient.get(
      ApiConstants.memberPayments,
      queryParameters: {'page': page},
    );
    final data = response.data['data'] as List<dynamic>;
    return data
        .map((p) => PaymentModel.fromJson(p as Map<String, dynamic>))
        .toList();
  }



  Future<List<AttendanceRecordModel>> getAttendance({int page = 1}) async {
    final response = await apiClient.get(
      ApiConstants.memberAttendance,
      queryParameters: {'page': page},
    );
    final data = response.data['data'] as List<dynamic>;
    return data
        .map((a) => AttendanceRecordModel.fromJson(a as Map<String, dynamic>))
        .toList();
  }
}
