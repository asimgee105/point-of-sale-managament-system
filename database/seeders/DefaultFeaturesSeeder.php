<?php

namespace Database\Seeders;

use App\Models\Feature;
use App\Models\SadminSetting;
use App\Models\Step;
use Illuminate\Database\Seeder;

class DefaultFeaturesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $features = [
            [
                'image' => 'images/default/feature-1.png',
                'title' => 'Streamline Your Operations',
                'description' => 'Efficiently optimize your retail operations with our streamlined cloud-based solutions.',
                'points' => [
                    'Cloud-based POS solution',
                    'Eliminate manual processes',
                    'Reduce errors',
                    'Focus on serving customers and growing business',
                ],
            ],
            [
                'image' => 'images/default/feature-2.png',
                'title' => 'Efficient Inventory Management',
                'description' => 'Keep track of your stock levels and ensure smooth inventory operations across multiple locations.',
                'points' => [
                    'Real-time stock tracking',
                    'Low-stock alerts and notifications',
                    'Easy product categorization',
                    'Manual stock adjustments',
                ],
            ],
            [
                'image' => 'images/default/feature-3.png',
                'title' => '24/7 Support & Assistance',
                'description' => 'Get round-the-clock support to ensure your business never faces downtime.',
                'points' => [
                    'Dedicated customer success team',
                    'Email and phone support',
                    'Comprehensive knowledge base and FAQs',
                    'Regular system updates and security patches',
                ],
            ],
            [
                'image' => 'images/default/feature-4.png',
                'title' => 'Multi-Warehouse Management',
                'description' => 'Efficiently manage inventory across multiple warehouses with advanced tracking and automation.',
                'points' => [
                    'Centralized inventory visibility',
                    'Stock allocation and transfers',
                    'Warehouse-specific reporting and analytics',
                    'Multi-location order fulfillment',
                ],
            ],
        ];

        foreach ($features as $featureData) {
            $feature = Feature::create([
                'title' => $featureData['title'],
                'description' => $featureData['description'],
                'points' => json_encode($featureData['points']),
            ]);
            if (!empty($featureData['image']) && file_exists(public_path($featureData['image']))) {
                $feature->addMedia(public_path($featureData['image']))
                    ->preservingOriginal()
                    ->toMediaCollection(Feature::IMAGE, config('app.media_disc'));
            }
        }

        $steps = [
            [
                'image' => 'images/default/step-1.png',
                'sub_title' => 'Step 1',
                'title' => 'Register Your Business',
                'description' => 'Sign up on POS by providing your business details. Set up your account with company information, preferred currency, and tax settings.',
            ],
            [
                'image' => 'images/default/step-2.png',
                'sub_title' => 'Step 2',
                'title' => 'Configure your store',
                'description' => 'Add multiple warehouses in POS. Add stocks and limits to each warehouse for efficient inventory tracking.',
            ],
            [
                'image' => 'images/default/step-3.png',
                'sub_title' => 'Step 3',
                'title' => 'Import Data',
                'description' => 'Easily import supplier and customer data into POS. Sync existing records or add new ones to streamline procurement and order management.',
            ],
            [
                'image' => 'images/default/step-4.png',
                'sub_title' => 'Step 4',
                'title' => 'Automate Inventory',
                'description' => 'Enable automatic stock updates, warehouse-based stocks, and smart inventory management features.',
            ],
        ];

        foreach ($steps as $stepData) {
            $step = Step::create([
                'sub_title' => $stepData['sub_title'],
                'title' => $stepData['title'],
                'description' => $stepData['description'],
            ]);
            if (!empty($stepData['image']) && file_exists(public_path($stepData['image']))) {
                $step->addMedia(public_path($stepData['image']))
                    ->preservingOriginal()
                    ->toMediaCollection(Step::IMAGE, config('app.media_disc'));
            }
        }
    }
}
