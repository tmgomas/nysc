import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import '../error/failures.dart';

/// Type aliases for cleaner code.
typedef ResultFuture<T> = Future<Either<Failure, T>>;
typedef ResultVoid = Future<Either<Failure, void>>;

/// Base use case class.
abstract class UseCase<T, Params> {
  ResultFuture<T> call(Params params);
}

/// For use cases that don't take parameters.
class NoParams extends Equatable {
  const NoParams();

  @override
  List<Object> get props => [];
}
