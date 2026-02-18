import '../../../../core/usecases/usecase.dart';
import '../../../../core/error/failures.dart';
import 'package:dartz/dartz.dart';
import '../repositories/auth_repository.dart';

/// Logout use case.
class LogoutUseCase extends UseCase<void, NoParams> {
  final AuthRepository repository;

  LogoutUseCase(this.repository);

  @override
  Future<Either<Failure, void>> call(NoParams params) {
    return repository.logout();
  }
}
