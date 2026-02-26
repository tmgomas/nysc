import '../../domain/entities/payment.dart';

/// Payment data model with JSON deserialization.
class PaymentModel extends Payment {
  const PaymentModel({
    required super.id,
    required super.amount,
    super.type,
    super.title,
    super.monthYear,
    super.monthName,
    super.status,
    super.dueDate,
    super.paidDate,
    super.paymentMethod,
    super.referenceNumber,
    super.receiptNumber,
    super.isOverdue,
    super.programName,
    super.items,
  });

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    final itemsList = (json['items'] as List<dynamic>?)
            ?.map((i) => PaymentItemModel.fromJson(i as Map<String, dynamic>))
            .toList() ??
        [];

    return PaymentModel(
      id: json['id'] as String,
      amount: json['amount']?.toString() ?? '0.00',
      type: json['type'] as String?,
      title: json['title'] as String?,
      monthYear: json['month_year'] as String?,
      monthName: json['month_name'] as String?,
      status: json['status'] as String?,
      dueDate: json['due_date'] as String?,
      paidDate: json['paid_date'] as String?,
      paymentMethod: json['payment_method'] as String?,
      referenceNumber: json['reference_number'] as String?,
      receiptNumber: json['receipt_number'] as String?,
      isOverdue: json['is_overdue'] as bool? ?? false,
      programName: (json['program'] as Map<String, dynamic>?)?['name'] as String?,
      items: itemsList,
    );
  }
}

class PaymentItemModel extends PaymentItem {
  const PaymentItemModel({
    required super.id,
    super.description,
    super.amount,
    super.programName,
  });

  factory PaymentItemModel.fromJson(Map<String, dynamic> json) {
    return PaymentItemModel(
      id: json['id'] as String,
      description: json['description'] as String?,
      amount: json['amount']?.toString(),
      programName: (json['program'] as Map<String, dynamic>?)?['name'] as String?,
    );
  }
}
