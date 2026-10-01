<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <meta charset="UTF-8">
    <title>{{ __('messages.pdf.top_customers_pdf') }}</title>
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
            vertical-align: middle;
        }

        .table th {
            background: #f3f4f6;
        }

        .text-center {
            text-align: center;
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
                <h2 style="color: dodgerblue; margin:0; padding:0; font-size: 20px;">
                    {{ __('messages.pdf.top_customers_list') }}
                </h2>
            </td>

            <!-- Date -->
            <td width="30%" style="text-align:right;">
                <b>{{ __('messages.pdf.date') }}</b> :
                {{ getFormattedDate(now()) }}
            </td>
        </tr>
    </table>

    <!-- Customers Table -->
    <table class="table" style="margin-top:40px;">
        <thead>
            <tr>
                <th>{{ __('messages.pdf.customer_name') }}</th>
                <th class="text-center">{{ __('messages.pdf.phone') }}</th>
                <th class="text-center">{{ __('messages.pdf.email') }}</th>
                <th class="text-center">{{ __('messages.pdf.total_sales') }}</th>
                <th class="text-center">{{ __('messages.pdf.total_amount') }}</th>
            </tr>
        </thead>
        <tbody>
            @if (isset($topCustomers))
                @foreach ($topCustomers as $customer)
                    <tr>
                        <td>{{ $customer->name }}</td>
                        <td class="text-center">{{ $customer->phone }}</td>
                        <td class="text-center">{{ $customer->email }}</td>
                        <td class="text-center">{{ $customer->sales_count }}</td>
                        <td class="text-center icon-style">
                            {{ currencyAlignment((float) $customer->grand_total) }}
                        </td>
                    </tr>
                @endforeach
            @endif
        </tbody>
    </table>
</body>

</html>
