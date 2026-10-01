# Local setup — Asim ke liye

## Agar pehle se local project aur database chal raha hai

1. Project folder aur database ka backup lein.
2. Updated source files copy karein. Apni existing `.env` aur `APP_KEY` sambhal kar rakhein. Existing APP_KEY change karne se encrypted 2FA data read nahi ho sakega.
3. WAMP mein PHP 8.2+ select karein. Terminal mein `php -v` check karein. Extensions: bcmath, curl, exif, fileinfo, gd, mbstring, openssl, pdo_mysql, xml aur zip.
4. Project folder ke terminal mein:

```bat
composer install
php artisan optimize:clear
php artisan migrate
php artisan pos:brand CloudPOS
```

Existing database par `db:seed`, `migrate:fresh` ya SQL import dobara na karein. Yeh duplicate records ya data loss kar sakte hain.

### Invalid credentials ko fix karein

Correct account email ke saath password reset command chalayein:

```bat
php artisan pos:reset-password superadmin@infy-pos.com
```

Terminal new password aur confirmation poochega. Kam az kam 12 characters use karein. Password command line par dene ki zaroorat nahi.

Store admin ke liye, agar yeh email aapke database mein maujood hai:

```bat
php artisan pos:reset-password admin@infy-pos.com
```

Agar account email badal chuke hain to usi current email ko command mein dein. Command new account create nahi karta; status, email verification, role, plan aur 2FA ko preserve karta hai. Purane access tokens revoke ho jate hain. Command sirf `APP_ENV=local` mein kaam karta hai.

## Naya setup — empty database

1. Folder extract karein. WAMP MySQL start karein.
2. phpMyAdmin mein empty database `cloudpos` create karein.
3. `.env.example` ki copy `.env` banayein:

```bat
copy .env.example .env
```

4. `.env` mein apna MySQL port aur password set karein. WAMP mein aksar root password blank hota hai; apni configuration ke mutabiq rakhein:

```dotenv
APP_ENV=local
APP_URL=http://127.0.0.1:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cloudpos
DB_USERNAME=root
DB_PASSWORD=
MAIL_MAILER=log
```

5. Terminal mein:

```bat
composer install
php artisan key:generate
php artisan migrate --seed
php artisan pos:brand CloudPOS
php artisan pos:reset-password superadmin@infy-pos.com
php artisan pos:reset-password admin@infy-pos.com
php artisan serve --host=127.0.0.1 --port=8000
```

6. Browser mein `http://127.0.0.1:8000/app/login` kholein. Usi email aur apne naye password se login karein.

Compiled JS/CSS ZIP mein included hai. Sirf setup ke liye npm chalana zaroori nahi.

Seeded passwords random hain. Koi shared default password nahi. Super-admin aur store-admin dono ka password command se set karein. Sample SQL mein purana demo data hai; fresh migration/seed setup ke saath us SQL ko combine na karein.

## Agar login ab bhi fail ho

- DevTools → Network → `/api/login` response dekhein. API request mein wahi hostname aur port hona chahiye jo browser address mein hai.
- `Invalid credentials`: current database mein email confirm karein aur `pos:reset-password` use karein.
- `Email not verified`: account verification complete karein. Mail log local testing mein `storage/logs/laravel.log` mein milega; production SMTP configure karein.
- `Inactive`: account ko authorized admin panel se activate karein.
- `No role assigned`: admin panel mein correct role assign karein.
- `429`: login attempts limit hui hai; ek minute baad dobara try karein.
- `403` subscription message: store ka active plan check karein. Purane SQL dump ke subscription dates expired ho sakte hain. Super-admin plan/subscription screens se normal subscription workflow use karein.
- New JS ke baad stale login: browser site data clear karein, phir sign in karein.
- App ko domain root/public document root par serve karein. WAMP `/project/public/app/login` subfolder routing supported setup nahi hai; `php artisan serve` ya virtual host use karein.

## Apna naam, currency aur business details

Super-admin Settings mein apni branding, email, contact, country aur currency update karein. Demo seed abhi INR/India sample data use karta hai. PKR/Pakistan ke liye actual settings update karein. Copyright/license notices original terms ke mutabiq preserved hain.

Logo command CloudPOS preset apply karta hai. Agar apna logo chahiye to Settings mein upload karein. PDF logos ke liye local PNG/JPEG asset use karein; remote URLs fetch nahi kiye jate.

## React code change karna ho

Node.js LTS + npm ke saath:

```bat
npm ci --legacy-peer-deps
npm run build
```

`build` ab correct Laravel Mix production build chalata hai. Axios patched version use karta hai. Categories/brands native horizontal scrolling use karti hain.

## Checks

```bat
php artisan route:list
php artisan view:cache
php artisan view:clear
php vendor/bin/phpunit
composer audit --locked
npm audit
```

PHPUnit tests apna in-memory SQLite database banate hain; `pdo_sqlite` extension tests ke liye enable karein. Aapke actual POS database ko use nahi karte.

Live deployment se pehle `APP_ENV=production`, `APP_DEBUG=false`, correct APP_URL, HTTPS, real SMTP/payment credentials aur active plan configure karein. Remaining framework/frontend advisories ki details CHANGES_AND_TESTS.md mein hain. Is package ko fully security-cleared release na samjhein.
