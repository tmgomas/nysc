import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../../profile/data/repositories/member_repository.dart';
import '../../domain/entities/payment.dart';

// ── States ─────────────────────────────────────────────
abstract class PaymentsState extends Equatable {
  const PaymentsState();
  @override
  List<Object?> get props => [];
}

class PaymentsInitial extends PaymentsState {
  const PaymentsInitial();
}

class PaymentsLoading extends PaymentsState {
  const PaymentsLoading();
}

class PaymentsLoaded extends PaymentsState {
  final List<Payment> payments;
  const PaymentsLoaded(this.payments);
  @override
  List<Object?> get props => [payments];
}

class PaymentsError extends PaymentsState {
  final String message;
  const PaymentsError(this.message);
  @override
  List<Object?> get props => [message];
}

// ── Cubit ──────────────────────────────────────────────
class PaymentsCubit extends Cubit<PaymentsState> {
  final MemberRepository repository;

  PaymentsCubit(this.repository) : super(const PaymentsInitial());

  Future<void> loadPayments() async {
    emit(const PaymentsLoading());
    final result = await repository.getPayments();
    result.fold(
      (failure) => emit(PaymentsError(failure.message)),
      (payments) => emit(PaymentsLoaded(payments)),
    );
  }
}
