import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../config/themes/color_palette.dart';
import '../../domain/entities/payment.dart';
import '../cubit/payments_cubit.dart';

/// Payments page — matches nycsc-mobile-app-ui.html design
class PaymentsPage extends StatefulWidget {
  const PaymentsPage({super.key});

  @override
  State<PaymentsPage> createState() => _PaymentsPageState();
}

class _PaymentsPageState extends State<PaymentsPage> {
  int _selectedTabIndex = 0; // 0: Pending, 1: History, 2: Invoice

  @override
  void initState() {
    super.initState();
    context.read<PaymentsCubit>().loadPayments();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ColorPalette.background,
      body: RefreshIndicator(
        onRefresh: () async {
          await context.read<PaymentsCubit>().loadPayments();
        },
        child: BlocBuilder<PaymentsCubit, PaymentsState>(
          builder: (context, state) {
            if (state is PaymentsLoading) {
              return const Center(child: CircularProgressIndicator());
            }

            if (state is PaymentsError) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, size: 48, color: ColorPalette.error),
                    const SizedBox(height: 16),
                    Text(state.message, style: const TextStyle(color: ColorPalette.error)),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => context.read<PaymentsCubit>().loadPayments(),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              );
            }

            if (state is PaymentsLoaded) {
              final payments = state.payments;
              
              // Filter logic based on status
              final pendingPayments = payments.where((p) => p.status == 'pending' || p.status == 'overdue').toList();
              final historyPayments = payments.where((p) => p.status == 'paid' || p.status == 'verified').toList();
              final displayList = _selectedTabIndex == 0 ? pendingPayments : historyPayments;

              // Calculate total outstanding amount
              double totalOutstanding = 0;
              for (var p in pendingPayments) {
                totalOutstanding += double.tryParse(p.amount) ?? 0.0;
              }

              return CustomScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                slivers: [
                  // Custom Header
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.only(left: 20, right: 20, top: 16, bottom: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Payments',
                                style: TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.w800,
                                  color: ColorPalette.textPrimary,
                                  letterSpacing: -0.02,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                '${pendingPayments.length} pending · ${historyPayments.length} completed',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: ColorPalette.textSecondary,
                                ),
                              ),
                            ],
                          ),
                          Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.06),
                              border: Border.all(color: ColorPalette.glassBorder),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Center(
                              child: Text(
                                '🔔',
                                style: TextStyle(fontSize: 16),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Summary Card
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [ColorPalette.primary, ColorPalette.primaryLight],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: ColorPalette.primary.withValues(alpha: 0.3),
                              blurRadius: 20,
                              offset: const Offset(0, 8),
                            )
                          ],
                        ),
                        child: Stack(
                          children: [
                            // "Shine" effect simulation using an positioned element
                            Positioned(
                              top: -40,
                              right: -20,
                              child: Container(
                                width: 100,
                                height: 100,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Colors.white.withValues(alpha: 0.1),
                                ),
                              ),
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Total Outstanding',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.white.withValues(alpha: 0.8),
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'LKR ',
                                          style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.w700,
                                            color: Colors.white.withValues(alpha: 0.7),
                                            height: 1.5,
                                          ),
                                        ),
                                        Text(
                                          totalOutstanding.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},'),
                                          style: const TextStyle(
                                            fontSize: 28,
                                            fontWeight: FontWeight.w800,
                                            color: Colors.white,
                                            height: 1,
                                            letterSpacing: -0.5,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      pendingPayments.isNotEmpty && pendingPayments.first.dueDate != null
                                          ? 'Due by ${pendingPayments.first.dueDate}'
                                          : 'All clear right now!',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: Colors.white.withValues(alpha: 0.7),
                                      ),
                                    ),
                                  ],
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(12),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withValues(alpha: 0.1),
                                        blurRadius: 10,
                                        offset: const Offset(0, 4),
                                      )
                                    ],
                                  ),
                                  child: const Text(
                                    '💳 Pay Now',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w700,
                                      color: ColorPalette.primary,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  // Tabs
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: ColorPalette.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: ColorPalette.glassBorder),
                        ),
                        child: Row(
                          children: [
                            _buildTabItem(0, 'Upcoming (${pendingPayments.length})'),
                            _buildTabItem(1, 'History'),
                            _buildTabItem(2, 'Invoice'),
                          ],
                        ),
                      ),
                    ),
                  ),

                  // Divider for history
                  if (_selectedTabIndex == 1 && historyPayments.isNotEmpty)
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.only(left: 20, right: 20, top: 12, bottom: 8),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Divider(color: ColorPalette.glassBorder, height: 1),
                            const SizedBox(height: 16),
                            Text(
                              'RECENT PAYMENTS',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: ColorPalette.textSecondary,
                                letterSpacing: 1.2,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                  // List of Payments
                  displayList.isEmpty
                      ? SliverFillRemaining(
                          hasScrollBody: false,
                          child: Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  _selectedTabIndex == 0 ? Icons.check_circle_outline : Icons.history,
                                  size: 48,
                                  color: ColorPalette.textMuted,
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  _selectedTabIndex == 0 ? 'No upcoming payments!' : 'No payment history',
                                  style: const TextStyle(
                                    fontSize: 14,
                                    color: ColorPalette.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                      : SliverPadding(
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                          sliver: SliverList(
                            delegate: SliverChildBuilderDelegate(
                              (context, index) {
                                return _buildPaymentCard(displayList[index], isPending: _selectedTabIndex == 0);
                              },
                              childCount: displayList.length,
                            ),
                          ),
                        ),

                  const SliverToBoxAdapter(child: SizedBox(height: 32)),
                ],
              );
            }

            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }

  Widget _buildTabItem(int index, String title) {
    final isSelected = _selectedTabIndex == index;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            _selectedTabIndex = index;
          });
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? Colors.white.withValues(alpha: 0.1) : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          alignment: Alignment.center,
          child: Text(
            title,
            style: TextStyle(
              fontSize: 13,
              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
              color: isSelected ? Colors.white : ColorPalette.textSecondary,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPaymentCard(Payment payment, {required bool isPending}) {
    // Determine status styling
    Color bgHighlightStyle = ColorPalette.surface;
    Color iconBgColor = Colors.transparent;
    String statusDotText = '';
    Color statusColor = Colors.white;
    String iconEmoji = '📋';
    
    final status = payment.status?.toLowerCase() ?? '';

    if (isPending) {
      if (status == 'overdue') {
        bgHighlightStyle = ColorPalette.error.withValues(alpha: 0.05);
        iconBgColor = ColorPalette.error.withValues(alpha: 0.15);
        iconEmoji = '⚠️';
        statusDotText = '● Overdue';
        statusColor = ColorPalette.error;
      } else {
        bgHighlightStyle = ColorPalette.warning.withValues(alpha: 0.05);
        iconBgColor = ColorPalette.warning.withValues(alpha: 0.15);
        iconEmoji = '📋';
        statusDotText = '● Pending';
        statusColor = ColorPalette.warning;
      }
    } else {
      iconEmoji = '✅';
      bgHighlightStyle = ColorPalette.success.withValues(alpha: 0.05);
      iconBgColor = ColorPalette.success.withValues(alpha: 0.15);
      statusDotText = '● Paid';
      statusColor = ColorPalette.success;
    }

    // specific icons based on type/name heuristics
    final String paymentTitle = payment.title ?? payment.type ?? payment.programName ?? 'Membership Fee';
    if (!isPending && paymentTitle.toLowerCase().contains('membership')) {
      iconEmoji = '✅';
    } else if (paymentTitle.toLowerCase().contains('registration')) {
      iconEmoji = '🏅';
    } else if (paymentTitle.toLowerCase().contains('admission')) {
      iconEmoji = '🎓';
    } else if (isPending && iconEmoji == '✅') {
      iconEmoji = '📋';
    }

    final String amountStr = double.tryParse(payment.amount)?.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},') ?? payment.amount;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: bgHighlightStyle,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isPending && status == 'overdue' ? ColorPalette.error.withValues(alpha: 0.3) : ColorPalette.glassBorder),
      ),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          tilePadding: const EdgeInsets.all(16),
          childrenPadding: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
          title: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: iconBgColor,
                  borderRadius: BorderRadius.circular(12),
                ),
                alignment: Alignment.center,
                child: Text(iconEmoji, style: const TextStyle(fontSize: 18)),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      paymentTitle.capitalize(),
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: ColorPalette.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      isPending ? 'Due: ${payment.dueDate ?? 'N/A'}' : 'Paid: ${payment.paidDate ?? ''}${payment.referenceNumber != null ? ' · REF #${payment.referenceNumber}' : ''}',
                      style: const TextStyle(
                        fontSize: 11,
                        color: ColorPalette.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'LKR $amountStr',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: isPending ? ColorPalette.textPrimary : ColorPalette.success,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    statusDotText,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: statusColor,
                    ),
                  ),
                ],
              ),
            ],
          ),
          children: [
            // Details Expanded Section
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.03),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: ColorPalette.glassBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (payment.items.isNotEmpty) ...[
                    ...payment.items.map((item) => _buildDetailRow(
                      item.description ?? item.programName ?? 'Item',
                      'LKR ${double.tryParse(item.amount ?? '0')?.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},') ?? '0'}'
                    )),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8),
                      child: Divider(color: ColorPalette.glassBorder, height: 1),
                    ),
                  ],
                  if (payment.items.isEmpty) ...[
                    _buildDetailRow('Program', payment.programName ?? 'N/A'),
                    _buildDetailRow('Month', payment.monthYear ?? 'N/A'),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8),
                      child: Divider(color: ColorPalette.glassBorder, height: 1),
                    ),
                  ],
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Total',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: ColorPalette.textPrimary,
                        ),
                      ),
                      Text(
                        'LKR $amountStr',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: ColorPalette.primaryLight,
                        ),
                      ),
                    ],
                  ),
                  if (isPending) ...[
                    const SizedBox(height: 16),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ColorPalette.primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      onPressed: () {},
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Pay LKR $amountStr',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Icon(Icons.arrow_forward, size: 16),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              label,
              style: const TextStyle(fontSize: 13, color: ColorPalette.textSecondary),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 8),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: ColorPalette.textPrimary)),
        ],
      ),
    );
  }
}

extension StringExtension on String {
  String capitalize() {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1).toLowerCase()}';
  }
}
