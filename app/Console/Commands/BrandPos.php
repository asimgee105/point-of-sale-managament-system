<?php
namespace App\Console\Commands;

use App\Models\SadminSetting;
use Illuminate\Console\Command;

class BrandPos extends Command
{
    protected $signature = 'pos:brand {name=CloudPOS : Display name}';
    protected $description = 'Set the display name and supplied CloudPOS logo (preserves copyright notices)';

    public function handle(): int
    {
        $name = trim($this->argument('name'));
        if ($name === '' || mb_strlen($name) > 80) {
            $this->error('Use a display name between 1 and 80 characters.');
            return self::FAILURE;
        }
        SadminSetting::updateOrCreate(['key' => 'app_name'], ['value' => $name]);
        SadminSetting::updateOrCreate(['key' => 'app_logo'], ['value' => asset('images/cloudpos-logo.png')]);
        SadminSetting::updateOrCreate(['key' => 'app_favicon'], ['value' => asset('images/cloudpos-icon.svg')]);
        $this->info('Display branding updated. Copyright and license notices are preserved.');
        return self::SUCCESS;
    }
}
