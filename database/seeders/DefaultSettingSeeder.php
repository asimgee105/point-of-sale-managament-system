<?php

namespace Database\Seeders;

use App\Models\BaseUnit;
use App\Models\Customer;
use App\Models\MailTemplate;
use App\Models\Role;
use App\Models\SadminSetting;
use App\Models\Setting;
use App\Models\SmsSetting;
use App\Models\SmsTemplate;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class DefaultSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenantId = User::whereHas('roles', function ($query) {
            $query->where('name', Role::ADMIN);
        })->first()->tenant_id;

        // Base Units
        $baseUnits = ['piece', 'meter', 'kilogram'];
        foreach ($baseUnits as $baseUnit) {
            BaseUnit::create([
                'tenant_id' => $tenantId,
                'name' => $baseUnit,
                'is_default' => true,
            ]);
        }


        // Mail Templates
        $mailTemplates = [
            [
                'tenant_id' => $tenantId,
                'template_name' => 'GREETING TO CUSTOMER ON SALES !',
                'content' => '<p>Hi, {customer_name}</p><p>Your sales Id is {sales_id}</p><p>Sales Date: {sales_date}</p><p>Total Amount: {sales_amount}</p><p>You have paid: {paid_amount}</p><p>Due amount: {due_amount}</p><p>Regards,  {app_name}</p>',
                'type' => MailTemplate::MAIL_TYPE_SALE
            ],
            [
                'tenant_id' => $tenantId,
                'template_name' => 'GREETING TO CUSTOMER ON SALES RETURN !',
                'content' => '<p>Hi, {customer_name}</p><p>Your sales return Id is {sales_return_id}</p><p>Sales return Date: {sales_return_date}</p><p>Total Amount: {sales_return_amount}</p><p>Regards,  {app_name}</p>',
                'type' => MailTemplate::MAIL_TYPE_SALE_RETURN,
            ]
        ];
        foreach ($mailTemplates as $mailTemplate) {
            MailTemplate::create($mailTemplate);
        }


        // SMS Settings
        $smsSettings = [
            'url' => 'http://test.com/api/test.php',
            'mobile_key' => '',
            'message_key' => '',
            'payload' => '',
        ];
        foreach ($smsSettings as $key => $value) {
            SmsSetting::create([
                'tenant_id' => $tenantId,
                'key' => $key,
                'value' => $value
            ]);
        }



        // SMS Templates
        $smsTemplates = [
            [
                'tenant_id' => $tenantId,
                'template_name' => 'GREETING TO CUSTOMER ON SALES !',
                'content' => 'Hi {customer_name}, Your sales Id is {sales_id}, Sales Date {sales_date}, Total Amount {sales_amount}, You have paid {paid_amount}, and customer total due amount is {due_amount} Thank you visit again',
                'type' => SmsTemplate::SMS_TYPE_SALE,
            ],
            [
                'tenant_id' => $tenantId,
                'template_name' => 'GREETING TO CUSTOMER ON SALES RETURN !',
                'content' => 'Hi {customer_name}, Your sales return Id is {sales_return_id}, Sales return Date {sales_return_date}, and Total Amount is {sales_return_amount} Thank you visit again',
                'type' => SmsTemplate::SMS_TYPE_SALE_RETURN,
            ]
        ];
        foreach ($smsTemplates as $smsTemplate) {
            SmsTemplate::create($smsTemplate);
        }


        // Customer
        Customer::create([
            'tenant_id' => $tenantId,
            'name' => 'walk-in-customer',
            'email' => 'customer@infypos.com',
            'phone' => '123456789',
            'country' => 'india',
            'city' => 'mumbai',
            'address' => 'Dr Deshmukh Marg , mumbai',
        ]);
        // Warehouse
        Warehouse::create([
            'tenant_id' => $tenantId,
            'name' => 'warehouse',
            'phone' => '123456789',
            'country' => 'india',
            'city' => 'mumbai',
            'email' => 'warehouse1@infypos.com',
            'zip_code' => '12345',
        ]);

        $settings = [
            'currency' => 1,
            'is_currency_right' => 0,
            'default_customer' => 1,
            'default_warehouse' => 1,
            'date_format' => 'y-m-d',
            'country' => 'India',
            'state' => 'Gujarat',
            'city' => 'Surat',
            // Prefixes
            'purchase_code' => 'PU',
            'purchase_return_code' => 'PR',
            'sale_code' => 'SA',
            'sale_return_code' => 'SR',
            'expense_code' => 'EX',
            // Receipt Settings
            'show_note' => '1',
            'show_phone' => '1',
            'show_customer' => '1',
            'show_address' => '1',
            'show_email' => '1',
            'show_tax_discount_shipping' => '1',
            'show_barcode_in_receipt' => '1',
            'show_logo_in_receipt' => '1',
            'show_product_code' => '1',
            'notes' => 'Thanks for order',
            // use ??
            'show_warehouse' => '1',
            'stripe_key' => 'pu_test_yBzA1qI1PcfRBAVn1vJG2VuS00HcyhQX9LASERTFDDS',
            'stripe_secret' => 'pu_test_yBzA1qI1PcfRBAVn1vJG2VuS00HcyhQX9LASERTFDDS',
            'sms_gateway' => '1',
            'twillo_sid' => 'asd',
            'twillo_token' => 'asd',
            'twillo_from' => 'asd',
            'smtp_host' => 'mailtrap.io',
            'smtp_port' => '2525',
            'smtp_username' => 'test',
            'smtp_password' => 'test',
            'smtp_Encryption' => 'tls',
        ];
        foreach ($settings as $key => $value) {
            Setting::create([
                'tenant_id' => $tenantId,
                'key' => $key,
                'value' => $value
            ]);
        }

        $sadminSetting = [
            'email' => 'contact@infyom.com',
            'logo' => 'images/logo.png',
            'company_name' => 'infy-pos',
            'app_name' => 'CloudPOS',
            'phone' => '+91 70963 36561',
            'footer' => 'All rights reserved by InfyOm Technologies',
            'country' => 'India',
            'state' => 'Gujarat',
            'city' => 'Surat',
            'postcode' => '395007',
            'address' => 'C-303, Atlanta Shopping Mall, Nr. Sudama Chowk, Mota Varachha, Surat, Gujarat, India.',
            'show_version_on_footer' => '1',
            'show_app_name_in_sidebar' => '1',
            // Default mail settings
            'mail_mailer' => 'smtp',
            'mail_host' => 'mailtrap.io',
            'mail_port' => '2525',
            'sender_name' => 'support@infypos.com',
            'mail_username' => 'test',
            'mail_password' => 'test',
            'mail_from_address' => 'support@infypos.com',
            'mail_encryption' => 'tls',
            'manual_payment_enabled' => '1',
            'manual_payment_guide' => 'We will approve your request within 24 hours.',
            'term_and_condition' => 'Terms and condition',
            'privacy_policy' => 'Privacy Policy',
            'refund_policy' => 'Refund Policy',
            'admin_default_currency_symbol' => '₹',
            'admin_default_currency' => 1,
            'testimonial_main_title' => 'Customers Who Choose POS-SaaS',
            'hero_button_title' => 'Launch Your Store Today',
        ];
        foreach ($sadminSetting as $key => $value) {
            SadminSetting::create([
                'key' => $key,
                'value' => $value
            ]);
        }
    }
}
