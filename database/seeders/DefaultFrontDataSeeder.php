<?php

namespace Database\Seeders;

use App\Models\Faq;
use App\Models\Partner;
use App\Models\SadminSetting;
use App\Models\Service;
use App\Models\Testimonial;
use App\Models\WhyChooseUs;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class DefaultFrontDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Hero Section
        $keyName = [
            'hero_image' => ('images/default/hero-img.png'),
            'hero_title' => 'Seamless Cloud-Based Warehouse & Inventory Management',
            'hero_description' => 'Effortlessly manage multiple warehouses with a powerful, cloud-based POS system. Track inventory, streamline operations, and optimize sales across all locations in real time.',
            'partner_main_title' => 'Trusted by Top Businesses',
            'partner_description' => 'POS simplifies multi-warehouse management with advanced tracking, real-time inventory updates, and seamless operations. Join businesses that rely on our technology for smarter and more efficient stock control.',
            'contact_us_main_title' => 'Get in Touch with Us',
            'contact_us_description' => 'Interested in learning more about POS, requesting a quote, or speaking with an expert? Let us know your needs, and we’ll get back to you soon.',
            'facebook' => "https://facebook.com/",
            'twitter' => "https://x.com/",
            'linkedin' => "https://linkedin.com/",
        ];
        foreach ($keyName as $key => $value) {
            SadminSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        // Services
        $services = [
            [
                'image' => 'images/default/services-1.png',
                'title' => 'Real-Time Inventory',
                'description' => 'Effortlessly track stock levels across multiple warehouses in real time with our cloud-based system. Get automated inventory updates to prevent overstocking or stockouts and ensure smooth operations at every location.',
            ],
            [
                'image' => 'images/default/services-2.png',
                'title' => 'Easy Transfers',
                'description' => 'Easily transfer stock between warehouses with just a few clicks. Update inventory adjustments instantly to maintain accuracy and prevent discrepancies across different locations.',
            ],
            [
                'image' => 'images/default/services-3.png',
                'title' => 'Sales & Purchases',
                'description' => 'Stay on top of your purchases and sales across multiple warehouses. Monitor transactions, analyze sales data, and optimize inventory levels to meet customer demand efficiently.',
            ],
            [
                'image' => 'images/default/services-4.png',
                'title' => 'User Access Control',
                'description' => 'Enhance security and efficiency by assigning custom roles and permissions to your team. Ensure only authorized staff can make inventory adjustments, process transactions, or access critical data.',
            ],
            [
                'image' => 'images/default/services-5.png',
                'title' => 'Flexible Payments',
                'description' => 'Offer seamless transactions with support for Stripe, Razorpay, PayPal, and manual payments. Provide flexible and secure payment solutions for customers, vendors, and suppliers.',
            ]
        ];

        foreach ($services as $data) {
            $service =  Service::create([
                'title' => $data['title'],
                'description' => $data['description'],
            ]);
            if (!empty($data['image']) && file_exists(public_path($data['image']))) {
                $service->addMedia(public_path($data['image']))
                    ->preservingOriginal()
                    ->toMediaCollection(Service::ICON, config('app.media_disc'));
            }
        }


        // WhyChooseUs
        $whyChooseUsData = [
            [
                'image' => 'images/default/choose-1.png',
                'title' => 'Centralized Warehouse Management',
                'description' => '<p>Boost your sales with our easy-to-use Cloud based POS Solution. Effortlessly check out customers with our state-of-the-art cloud based point of sale Software. Get paid faster, secure more credit card sales, and achieve a competitive edge. Boost sales and revenue with our powerful SaaS POS software.</p>',
            ],
            [
                'image' => 'images/default/choose-2.png',
                'title' => 'Real-Time Stock Updates',
                'description' => '<p>Ignite explosive growth with POS\'s fully integrated customer loyalty program. Track, reward, and excite your customers with personalized promotions. Scale your business effortlessly by adding new locations and registers. Don\'t just dream big, make it happen. Unleash your potential and conquer the market with our innovative POS SaaS solutions.</p>',
            ],
            [
                'image' => 'images/default/choose-3.png',
                'title' => 'Secure & Scalable',
                'description' => '<p>Effortlessly Manage Your Inventory with Cloud-Based Precision. Our Industry-Leading Module Simplifies Cloud Inventory management Allowing You to Stay in Control and Optimize Stock Levels with Ease. Set Up Automatic Alerts, Print Labels, and barcodes seamlessly with our cutting-edge&nbsp;Cloud Based Point of Sale technology Maximize Your Profits, Minimize Your Worries.</p>',
            ],
            [
                'image' => 'images/default/choose-4.png',
                'title' => 'Flexible Payment Options',
                'description' => '<p>With POS, get instant issue resolution and expert guidance, 24/7. We’re always here to keep your business running smoothly.</p><ul><li>24/7 Availability</li><li>Dedicated Support Team</li><li>Quick Issue Resolution</li></ul>',
            ],
        ];

        foreach ($whyChooseUsData as $value) {
            $whyChooseUs = WhyChooseUs::create([
                'title' => $value['title'],
                'description' => $value['description'],
            ]);
            if (!empty($value['image']) && file_exists(public_path($value['image']))) {
                $whyChooseUs->addMedia(public_path($value['image']))
                    ->preservingOriginal()
                    ->toMediaCollection(WhyChooseUs::IMAGE, config('app.media_disc'));
            }
        }

        // Partners
        $partners = [
            [
                'image' => 'images/default/partner-1.png',
                'name' => 'VONDE',
            ],
            [
                'image' => 'images/default/partner-2.png',
                'name' => 'HIPSTER',
            ],
            [
                'image' => 'images/default/partner-3.png',
                'name' => 'AVANTER',
            ],
            [
                'image' => 'images/default/partner-4.png',
                'name' => 'NORWAY',
            ],
        ];

        foreach ($partners as $value) {
            $partner = Partner::create([
                'name' => $value['name'],
            ]);
            if (!empty($value['image']) && file_exists(public_path($value['image']))) {
                $partner->addMedia(public_path($value['image']))
                    ->preservingOriginal()
                    ->toMediaCollection(Partner::IMAGE, config('app.media_disc'));
            }
        }


        // Testimonials
        $testimonials = [
            [
                'image' => 'images/default/testimonial-1.png',
                'name' => 'David R.',
                'description' => 'POS has completely transformed how we manage our warehouses! The real-time inventory updates help us avoid stock shortages, and the centralized dashboard makes everything so easy to track.',
            ],
            [
                'image' => 'images/default/testimonial-2.png',
                'name' => 'Sarah M.',
                'description' => 'We used to struggle with stock discrepancies across multiple locations. Thanks to POS, we now have seamless warehouse transfers and accurate stock reports.',
            ],
            [
                'image' => 'images/default/testimonial-3.png',
                'name' => 'Michael T.',
                'description' => 'The best part about POS is the flexible payment options. Our customers can now pay via Stripe, Razorpay, or PayPal, making transactions smoother and faster!',
            ],
            [
                'image' => 'images/default/testimonial-4.png',
                'name' => 'Emily J.',
                'description' => 'Security and role-based access are game-changers! We can assign specific permissions to staff, ensuring only authorized personnel handle stock adjustments and transactions.',
            ],
            [
                'image' => 'images/default/testimonial-5.png',
                'name' => 'James L.',
                'description' => 'Since switching to POS, we’ve seen a 30% improvement in order fulfillment speed. The automation features save us time and reduce errors.',
            ],
        ];

        foreach ($testimonials as $value) {
            $testimonial = Testimonial::create([
                'name' => $value['name'],
                'description' => $value['description'],
            ]);
            if (!empty($value['image']) && file_exists(public_path($value['image']))) {
                $testimonial->addMedia(public_path($value['image']))
                    ->preservingOriginal()
                    ->toMediaCollection(Testimonial::IMAGE, config('app.media_disc'));
            }
        }

        // FAQs
        $faqs = [
            [
                'title' => 'How do I get started?',
                'description' => 'Simply contact us via our website, and our team will guide you through the onboarding process.',
            ],
            [
                'title' => 'Do you provide custom packaging and labeling?',
                'description' => 'Yes, we offer custom packaging, labeling, and branding services for your products.',
            ],
            [
                'title' => 'Are there any hidden fees?',
                'description' => 'No, we believe in transparent pricing. All costs are discussed upfront before you commit.',
            ],
            [
                'title' => 'What payment methods do you accept?',
                'description' => 'We accept major credit cards, bank transfers, and online payment gateways.',
            ],
            [
                'title' => 'Do you have minimum storage requirements?',
                'description' => 'We offer flexible storage solutions with no long-term commitments. Contact us for specific details.',
            ],
            [
                'title' => 'How much does warehousing cost?',
                'description' => 'Pricing depends on the storage space required, duration, and additional services. Contact us for a customized quote.',
            ],
            [
                'title' => 'Do you handle order fulfillment?',
                'description' => 'Yes, we offer pick, pack, and shipping services to ensure your orders are delivered efficiently.',
            ],
            [
                'title' => 'Do you offer climate-controlled storage?',
                'description' => 'Yes, we provide temperature-controlled storage solutions for perishable and sensitive goods.',
            ],
            [
                'title' => 'Is my inventory secure in your warehouse?',
                'description' => 'Yes! Our warehouse is equipped with 24/7 surveillance, restricted access, and advanced security systems to ensure the safety of your goods.',
            ],
            [
                'title' => 'What types of products can I store in your warehouse?',
                'description' => 'We accommodate a wide range of products, including retail goods, electronics, perishable items, and more. Please contact us for specific storage requirements.',
            ],
            [
                'title' => 'How do I contact customer support?',
                'description' => 'You can reach us via email at [labs@infyom.in], or through our online contact form.',
            ],
            [
                'title' => 'What are your operating hours?',
                'description' => 'However, we offer 24/7 support for urgent logistics needs.',
            ],
            [
                'title' => 'What services do you offer?',
                'description' => 'We provide warehousing, inventory management, order fulfillment, and logistics solutions tailored to your business needs.',
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::create($faq);
        }
    }
}
