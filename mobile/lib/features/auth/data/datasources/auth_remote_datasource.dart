import '../../../../core/constants/api_constants.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/api_client.dart';
import '../models/user_model.dart';

/// Remote data source for authentication.
abstract class AuthRemoteDataSource {
  Future<(UserModel, String)> login(String email, String password);
  Future<UserModel> getCurrentUser();
  Future<void> logout();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final ApiClient apiClient;

  AuthRemoteDataSourceImpl(this.apiClient);

  @override
  Future<(UserModel, String)> login(String email, String password) async {
    final response = await apiClient.post(
      ApiConstants.login,
      data: {
        'email': email,
        'password': password,
        'device_name': AppConstants.deviceName,
      },
    );

    final userData = response.data['user'] as Map<String, dynamic>;
    final token = response.data['token'] as String;

    return (UserModel.fromJson(userData), token);
  }

  @override
  Future<UserModel> getCurrentUser() async {
    final response = await apiClient.get(ApiConstants.user);
    final userData = response.data['user'] as Map<String, dynamic>;
    return UserModel.fromJson(userData);
  }

  @override
  Future<void> logout() async {
    await apiClient.post(ApiConstants.logout);
  }
}
