import '../../../../core/storage/secure_storage.dart';

/// Local data source for auth — manages token persistence.
abstract class AuthLocalDataSource {
  Future<void> saveToken(String token);
  Future<String?> getToken();
  Future<void> deleteToken();
  Future<bool> hasToken();
}

class AuthLocalDataSourceImpl implements AuthLocalDataSource {
  final SecureStorageService storage;

  AuthLocalDataSourceImpl(this.storage);

  @override
  Future<void> saveToken(String token) => storage.saveToken(token);

  @override
  Future<String?> getToken() => storage.getToken();

  @override
  Future<void> deleteToken() => storage.deleteToken();

  @override
  Future<bool> hasToken() => storage.hasToken();
}
