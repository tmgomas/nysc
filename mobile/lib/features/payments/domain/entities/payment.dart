import 'package:equatable/equatable.dart';

/// Payment domain entity.
class Payment extends Equatable {
  final String id;
  final String? type;
  final String? title;
  final String amount;
  final String? monthYear;
  final String? monthName;
  final String? status;
  final String? dueDate;
  final String? paidDate;
  final String? paymentMethod;
  final String? referenceNumber;
  final String? receiptNumber;
  final bool isOverdue;
  final String? programName;
  final List<PaymentItem> items;

  const Payment({
    required this.id,
    required this.amount,
    this.type,
    this.title,
    this.monthYear,
    this.monthName,
    this.status,
    this.dueDate,
    this.paidDate,
    this.paymentMethod,
    this.referenceNumber,
    this.receiptNumber,
    this.isOverdue = false,
    this.programName,
    this.items = const [],
  });

  @override
  List<Object?> get props => [id, amount, status];
}

/// Payment item entity.
class PaymentItem extends Equatable {
  final String id;
  final String? description;
  final String? amount;
  final String? programName;

  const PaymentItem({
    required this.id,
    this.description,
    this.amount,
    this.programName,
  });

  @override
  List<Object?> get props => [id];
}
