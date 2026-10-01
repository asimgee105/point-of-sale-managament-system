<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <meta charset="UTF-8">
    <title>{{ __('messages.sale_return_pdf') }}</title>
    <style>
        body {
            font-family: 'XBRiyaz', sans-serif;
            font-size: 14px;
            color: #333;
            margin: 0px;
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
            border-bottom: 1px solid #ccc;
            border-top: 1px solid #ccc;
            padding: 8px;
            vertical-align: top;
        }

        .table th {
            background: #f3f4f6;
        }

        .number-align {
            text-align: left;
            /* keep numbers on left in RTL */
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .text-success {
            color: green;
        }

        .text-danger {
            color: red;
        }

        .text-warning {
            color: purple;
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
            <!-- Logo (right in RTL) -->
            <td width="30%" style="text-align: right;">
                <img src="{{ $companyLogo }}" alt="Company Logo" width="100px">
            </td>

            <!-- Reference Code Center -->
            <td width="40%" style="text-align: center; vertical-align: middle;">
                <h2 style="color: dodgerblue; margin:0; padding:0; font-size: 20px;">
                    {{ $saleReturn->reference_code }}
                </h2>
            </td>

            <!-- Sale Return Info (left in RTL) -->
            <td width="30%" style="text-align: right;">
                <table style="width:100%; border-collapse: collapse;">
                    <tr>
                        <td><b>{{ __('messages.pdf.date') }}</b> :
                            {{ getFormattedDate($saleReturn->created_at) }}
                        </td>
                    </tr>
                    <tr>
                        <td><b>{{ __('messages.pdf.number') }}</b> : {{ $saleReturn->reference_code }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Company & Customer Info -->
    <table style="width:100%; margin-top:20px; border-collapse: collapse;">
        <tr>
            <!-- Company Info -->
            <td style="width:48%; vertical-align: top;">
                <table class="table">
                    <thead>
                        <tr>
                            <th style="text-align:right;">{{ __('messages.pdf.company_info') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <b>{{ getActiveStoreName() }}</b><br>
                                @if ($taxes->count() > 0)
                                    @foreach ($taxes as $tax)
                                        <p style="margin: 0; padding: 0;">
                                            <span style="color: grey;">{{ $tax->number }}</span>
                                            : <b>{{ $tax->name }}</b>
                                        </p>
                                    @endforeach
                                @endif
                                <b>{{ __('messages.pdf.address') }}</b> :
                                {{ getSettingValue('store_address') ?? 'N/A' }} <br>
                                <b>{{ __('messages.pdf.phone') }}</b> : {{ getSettingValue('store_phone') ?? 'N/A' }}
                                <br>
                                <b>{{ __('messages.pdf.email') }}</b> : {{ getSettingValue('store_email') ?? 'N/A' }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>

            <td style="width:4%"></td>

            <!-- Customer Info -->
            <td style="width:48%; vertical-align: top;">
                <table class="table">
                    <thead>
                        <tr>
                            <th style="text-align:right;">{{ __('messages.pdf.customer_info') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <b>{{ __('messages.pdf.name') }}</b> : {{ $saleReturn->customer->name ?? 'N/A' }} <br>
                                <b>{{ __('messages.pdf.phone') }}</b> : {{ $saleReturn->customer->phone ?? 'N/A' }}
                                <br>
                                <b>{{ __('messages.pdf.address') }}</b> :
                                {{ $saleReturn->customer->address ?? 'N/A' }}
                                {{ $saleReturn->customer->city ?? '' }}
                                {{ $saleReturn->customer->country ?? '' }} <br>
                                <b>{{ __('messages.pdf.email') }}</b> : {{ $saleReturn->customer->email ?? 'N/A' }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </table>

    <!-- Returned Products -->
    <table class="table" style="margin-top: 40px;">
        <thead>
            <tr>
                <th style="text-align: right;">{{ __('messages.pdf.product') }}</th>
                <th class="text-center">{{ __('messages.pdf.unit_price') }}</th>
                <th class="text-center">{{ __('messages.pdf.quantity') }}</th>
                <th class="text-center">{{ __('messages.heading_discount') }}</th>
                <th class="text-center">{{ __('messages.pdf.tax') }}</th>
                <th class="number-align">{{ __('messages.heading_total') }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($saleReturn->saleReturnItems as $returnItem)
                <tr>
                    <td style="text-align: right;">{{ $returnItem->product->name }}</td>
                    <td class="text-center icon-style">
                        {{ currencyAlignment((float) $returnItem->net_unit_price) }}</td>
                    <td class="text-center">{{ $returnItem->quantity }}</td>
                    <td class="text-center icon-style">
                        {{ currencyAlignment((float) $returnItem->discount_amount) }}</td>
                    <td class="text-center icon-style">
                        {{ currencyAlignment((float) $returnItem->tax_amount) }}</td>
                    <td class="number-align icon-style">
                        {{ currencyAlignment((float) $returnItem->sub_total) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Summary -->
    <table class="table" style="width:40%; margin-top: 20px; float: left;">
        <tbody>
            <tr>
                <td><strong>{{ __('messages.pdf.order_tax') }}</strong> :</td>
                <td class="number-align icon-style">
                    {{ currencyAlignment((float) $saleReturn->tax_amount) }}</td>
            </tr>
            <tr>
                <td><strong>{{ __('messages.pdf.discount') }}</strong> :</td>
                <td class="number-align icon-style">
                    {{ currencyAlignment((float) $saleReturn->discount) }}</td>
            </tr>
            <tr>
                <td><strong>{{ __('messages.pdf.shipping') }}</strong> :</td>
                <td class="number-align icon-style">
                    {{ currencyAlignment((float) $saleReturn->shipping) }}</td>
            </tr>
            <tr>
                <td><strong>{{ __('messages.pdf.total') }}</strong> :</td>
                <td class="number-align icon-style">
                    <b>{{ currencyAlignment((float) $saleReturn->grand_total) }}</b>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Notes -->
    @if ($saleReturn->note)
        <div
            style="text-align: right; clear: both; margin-top: 30px; padding: 10px 20px;
                   border-right: 3px solid dodgerblue; background: #f8f8f8;">
            <b>{{ __('messages.pdf.notes') }}:</b><br>
            {{ $saleReturn->note }}
        </div>
    @endif
</body>

</html>
