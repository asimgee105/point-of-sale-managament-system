<?php

namespace App\Utils;

use App\Models\SmsSetting;
use Twilio\Rest\Client as TwilioClient;
use Vonage\Client as VonageClient;
use Vonage\Client\Credentials\Basic as VonageCredentials;
use Vonage\SMS\Message\SMS as VonageSMS;
use Exception;
use Illuminate\Support\Facades\Log;

class SmsSender
{
    /**
     * Send SMS based on configuration
     *
     * @param string $to
     * @param string $message
     * @return bool
     */
    public static function send(string $to, string $message): bool
    {
        try {
            // Get SMS settings
            $settings = SmsSetting::pluck('value', 'key')->toArray();
            
            // Check if Twilio is enabled
            if (isset($settings['is_twilio']) && $settings['is_twilio'] == '1') {
                return self::sendViaTwilio($to, $message, $settings);
            } 
            // Check if Vonage is enabled
            elseif (isset($settings['is_vonage']) && $settings['is_vonage'] == '1') {
                return self::sendViaVonage($to, $message, $settings);
            } 
            return true;
        } catch (Exception $e) {
            Log::error('SMS sending failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send SMS via Twilio
     *
     * @param string $to
     * @param string $message
     * @param array $settings
     * @return bool
     * @throws \Twilio\Exceptions\ConfigurationException
     */
    private static function sendViaTwilio(string $to, string $message, array $settings): bool
    {
        try {
            $sid = $settings['twilio_sid'] ?? '';
            $token = $settings['twilio_token'] ?? '';
            $from = $settings['twilio_from'] ?? '';

            if (empty($sid) || empty($token) || empty($from)) {
                Log::error('Twilio configuration is incomplete');
                return false;
            }

            $client = new TwilioClient($sid, $token);
            $client->messages->create($to, [
                'from' => $from,
                'body' => $message
            ]);

            return true;
        } catch (Exception $e) {
            Log::error('Twilio SMS sending failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send SMS via Vonage
     *
     * @param string $to
     * @param string $message
     * @param array $settings
     * @return bool
     */
    private static function sendViaVonage(string $to, string $message, array $settings): bool
    {
        try {
            $apiKey = $settings['vonage_api_key'] ?? '';
            $apiSecret = $settings['vonage_api_secret'] ?? '';

            if (empty($apiKey) || empty($apiSecret)) {
                Log::error('Vonage configuration is incomplete');
                return false;
            }

            // Create Vonage client with API key and secret
            $credentials = new VonageCredentials($apiKey, $apiSecret);
            $client = new VonageClient($credentials);

            // Send SMS using Vonage client
            $sms = new VonageSMS($to, config('app.name'), $message);
            $response = $client->sms()->send($sms);

            // Check if the message was sent successfully
            $current = $response->current();
            if ($current->getStatus() == 0) {
                return true;
            } else {
                // Log the error without trying to call undefined methods
                Log::error('Vonage SMS API returned error with status: ' . $current->getStatus());
                return false;
            }
        } catch (Exception $e) {
            Log::error('Vonage SMS sending failed: ' . $e->getMessage());
            return false;
        }
    }
}