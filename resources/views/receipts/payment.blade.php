<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payment Receipt</title>
    <style>
        body {
            font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 0;
            font-size: 14px;
        }
        .container {
            padding: 30px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1e3a8a;
            margin-bottom: 5px;
        }
        .sub-header {
            font-size: 14px;
            color: #64748b;
        }
        .receipt-title {
            text-align: center;
            font-size: 20px;
            text-transform: uppercase;
            font-weight: bold;
            margin: 20px 0;
            color: #3b82f6;
        }
        .info-table {
            width: 100%;
            margin-bottom: 30px;
        }
        .info-table td {
            padding: 5px;
            vertical-align: top;
        }
        .info-label {
            font-weight: bold;
            color: #475569;
            width: 130px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th {
            background-color: #f1f5f9;
            color: #334155;
            padding: 10px;
            text-align: left;
            border-bottom: 2px solid #cbd5e1;
        }
        .items-table td {
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
        }
        .text-right {
            text-align: right !important;
        }
        .total-row td {
            font-weight: bold;
            font-size: 16px;
            background-color: #f8fafc;
            border-bottom: 2px solid #cbd5e1;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 10px;
            background-color: #22c55e;
            color: white;
            font-weight: bold;
            border-radius: 4px;
            font-size: 12px;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">{{ config('app.name', 'NYCSC') }}</div>
            <div class="sub-header">Official Payment Receipt</div>
        </div>

        <div class="receipt-title">RECEIPT</div>

        <table class="info-table">
            <tr>
                <td class="info-label">Receipt No:</td>
                <td>{{ $payment->receipt_number ?? 'N/A' }}</td>
                <td class="info-label">Date:</td>
                <td>{{ $payment->created_at->format('M d, Y') }}</td>
            </tr>
            <tr>
                <td class="info-label">Member Name:</td>
                <td>{{ $payment->member->full_name }}</td>
                <td class="info-label">Member ID:</td>
                <td>{{ $payment->member->member_number }}</td>
            </tr>
            <tr>
                <td class="info-label">Payment Type:</td>
                <td>{{ $payment->type->label() }}</td>
                <td class="info-label">Payment Method:</td>
                <td>{{ $payment->payment_method ? $payment->payment_method->label() : 'N/A' }}</td>
            </tr>
            <tr>
                <td class="info-label">Status:</td>
                <td colspan="3">
                    <span class="status-badge">{{ $payment->status->value }}</span>
                </td>
            </tr>
        </table>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="text-right">Amount (Rs)</th>
                </tr>
            </thead>
            <tbody>
                @if($payment->items && $payment->items->count() > 0)
                    @foreach($payment->items as $item)
                    <tr>
                        <td>{{ $item->description }}</td>
                        <td class="text-right">{{ number_format($item->amount, 2) }}</td>
                    </tr>
                    @endforeach
                @else
                    <tr>
                        <td>{{ $payment->type->label() }} Payment {{ $payment->month_year ? 'for ' . $payment->month_year : '' }}</td>
                        <td class="text-right">{{ number_format($payment->amount, 2) }}</td>
                    </tr>
                @endif
                <tr class="total-row">
                    <td class="text-right">Total Paid</td>
                    <td class="text-right">{{ number_format($payment->amount, 2) }}</td>
                </tr>
            </tbody>
        </table>

        <div class="footer">
            <p>This is a computer-generated document. No signature is required.</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name', 'NYCSC') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
