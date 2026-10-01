<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <meta charset="UTF-8">
    <title>{{ __('messages.pdf.customer_pdf') }}</title>
    <style>
        body {
            font-family: 'XBRiyaz', sans-serif;
            font-size: 14px;
            color: #333;
            margin: 0;
            direction: rtl;
            text-align: right;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            text-align: right;
        }

        .table th,
        .table td {
            border: 1px solid #ccc;
            padding: 8px;
            vertical-align: top;
        }

        .table th {
            background: #f3f4f6;
        }

        .text-center {
            text-align: center;
        }

        .number-align {
            text-align: right;
        }

        .logo img {
            max-width: 120px;
            max-height: 70px;
        }

        .icon-style {
            font-family: DejaVu Sans, sans-serif !important;
        }
    </style>
</head>

<body>
    <!-- Header -->
    <table width="100%">
        <tr>
            <!-- Logo -->
            <td width="30%" style="text-align:right;">
                <img src="{{ $companyLogo }}" alt="Company Logo" width="100px">
            </td>

            <!-- Title -->
            <td width="40%" style="text-align:center; vertical-align:middle;">
                <h2 style="color: dodgerblue; margin:0; padding:0; font-size:20px;">
                    {{ $customer->name }} : {{ __('messages.pdf.client') }}
                </h2>
            </td>

            <!-- Date -->
            <td width="30%" style="text-align:right;">
                <b>{{ __('messages.pdf.date') }}</b> :
                {{ getFormattedDate(now()) }}
            </td>
        </tr>
    </table>

    <!-- Customer & Company Info -->
    <table style="width:100%; margin-top:20px; border-collapse: collapse;">
        <tr>
            <!-- Customer Info -->
            <td style="width:48%; vertical-align: top;">
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{ __('messages.pdf.customer_info') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <b>{{ __('messages.pdf.name') }} :</b> {{ $customer->name ?? 'N/A' }}<br>
                                <b>{{ __('messages.pdf.phone') }} :</b> {{ $customer->phone ?? 'N/A' }}<br>
                                <b>{{ __('messages.pdf.address') }} :</b>
                                {{ $customer->address ?? 'N/A' }} {{ $customer->city ?? '' }}
                                {{ $customer->country ?? '' }}<br>
                                <b>{{ __('messages.pdf.email') }} :</b> {{ $customer->email ?? 'N/A' }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>

            <td style="width:4%"></td> <!-- Gap -->

            <!-- Company Info -->
            <td style="width:48%; vertical-align: top;">
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{ __('messages.pdf.company_info') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <b>{{ getActiveStoreName() }}</b><br>
                                <b>{{ __('messages.pdf.address') }} :</b>
                                {{ getSettingValue('store_address') ?? 'N/A' }}<br>
                                <b>{{ __('messages.pdf.phone') }} :</b>
                                {{ getSettingValue('store_phone') ?? 'N/A' }}<br>
                                <b>{{ __('messages.pdf.email') }} :</b> {{ getSettingValue('store_email') ?? 'N/A' }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </table>

    <!-- Sales Table -->
    <table class="table" style="margin-top: 40px;">
        <thead>
            <tr>
                <th class="text-center">{{ __('messages.pdf.date') }}</th>
                <th class="text-center">{{ __('messages.pdf.reference') }}</th>
                <th class="text-center">{{ __('messages.pdf.paid_amount') }}</th>
                <th class="text-center">{{ __('messages.pdf.due_amount') }}</th>
                <th class="text-center">{{ __('messages.pdf.payment_status') }}</th>
            </tr>
        </thead>
        <tbody>
            @if (count($customer->sales) > 0)
                @foreach ($customer->sales as $sale)
                    <tr>
                        <td class="text-center">{{ getFormattedDate($sale->date) }}</td>
                        <td class="text-center">{{ $sale->reference_code }}</td>
                        <td class="text-center icon-style">
                            {{ currencyAlignment((float) $sale->payments->sum('amount')) }}
                        </td>
                        <td class="text-center icon-style">
                            {{ currencyAlignment((float) $sale->grand_total - $sale->payments->sum('amount')) }}
                        </td>
                        <td class="text-center">
                            @if ($sale->payment_status == \App\Models\Sale::PAID)
                                {{ __('messages.pdf.paid') }}
                            @elseif($sale->payment_status == \App\Models\Sale::UNPAID)
                                {{ __('messages.pdf.unpaid') }}
                            @elseif($sale->payment_status == \App\Models\Sale::PARTIAL_PAID)
                                {{ __('messages.pdf.partial') }}
                            @endif
                        </td>
                    </tr>
                @endforeach
            @endif
        </tbody>
    </table>

    <!-- Summary -->
    <table class="table" style="width: 50%; float:right; margin-top:20px;">
        <tbody>
            <tr>
                <td><strong>{{ __('messages.pdf.total_sales') }} :</strong></td>
                <td class="number-align">
                    {{ $salesData['totalSale'] ?? 0 }}
                </td>
            </tr>
            <tr>
                <td><strong>{{ __('messages.pdf.total_amount') }} :</strong></td>
                <td class="number-align icon-style">
                    {{ currencyAlignment((float) $salesData['totalAmount']) }}
                </td>
            </tr>
            <tr>
                <td><strong>{{ __('messages.pdf.total_paid') }} :</strong></td>
                <td class="number-align icon-style">
                    {{ currencyAlignment((float) $salesData['totalPaid']) }}
                </td>
            </tr>
            <tr>
                <td><strong>{{ __('messages.pdf.total_sale_due') }} :</strong></td>
                <td class="number-align icon-style">
                    {{ currencyAlignment((float) $salesData['totalSalesDue']) }}
                </td>
            </tr>
        </tbody>
    </table>

    <div style="clear: both;"></div>
</body>

</html>
