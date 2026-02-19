# NYCSC - Sports Club Management System

A comprehensive management system for the National Youth Services Council Sports Club (NYCSC), built with a modern tech stack to streamline operations including member management, facility scheduling, inventory control, and payments.

## 🚀 Tech Stack

### Backend
- **Framework:** Laravel 12
- **Authentication:** Laravel Fortify & Sanctum
- **Database:** MySQL / SQLite
- **Permissions:** Spatie Laravel Permission
- **SMS Integration:** TextLK
- **Excel Exports:** Maatwebsite Excel

### Frontend
- **Framework:** React 19 (via Inertia.js)
- **Language:** TypeScript
- **Styling:** TailwindCSS 4
- **UI Components:** Shadcn/UI (Radix UI)
- **Icons:** Lucide React
- **Calendar:** FullCalendar
- **Build Tool:** Vite

### Mobile App
- **Framework:** Flutter
- **Platform:** Android & iOS

## ✨ Key Features

- **Member Management:** Registration, profiles, and approval workflows.
- **Sports & Facility Scheduling:** Interactive calendar for booking grounds, swimming pools, and other facilities.
- **Inventory Management:** GRN (Goods Received Notes), Supplier management, Item Master, and Barcode scanning.
- **Payments:** Payment tracking and processing.
- **SMS Notifications:** Automated alerts for registrations, approvals, and reminders.
- **Reporting:** Generate detailed reports and export them to Excel.

## 🛠️ Prerequisites

Ensure you have the following installed on your local machine:
- [PHP](https://www.php.net/) 8.2 or higher
- [Composer](https://getcomposer.org/)
- [Node.js](https://nodejs.org/) & [NPM](https://www.npmjs.com/)
- [Git](https://git-scm.com/)
- [Flutter SDK](https://flutter.dev/) (for mobile app)

## 📦 Installation Guide

### 1. Clone the Repository
```bash
git clone <repository-url>
cd nycsc
```

### 2. Backend Setup
Install PHP dependencies:
```bash
composer install
```

Set up independent environment variables:
```bash
cp .env.example .env
```

Generate the application key:
```bash
php artisan key:generate
```

Configure your database in the `.env` file. Then, run migrations and seeders:
```bash
php artisan migrate --seed
```

### 3. Frontend Setup
Install JavaScript dependencies:
```bash
npm install
```

Build the frontend assets:
```bash
npm run build
```

### 4. Mobile App Setup
Navigate to the mobile directory:
```bash
cd mobile
```

Get Flutter dependencies:
```bash
flutter pub get
```

## 🚀 Running the Application

To run the web application locally, start the Laravel server and the Vite development server:

```bash
# Terminal 1: Laravel Server
php artisan serve

# Terminal 2: Vite Dev Server
npm run dev
```

The application will be accessible at `http://localhost:8000`.

To run the mobile application:
```bash
cd mobile
flutter run
```

## 📂 Project Structure

- `app/`: Laravel core code (Models, Controllers, etc.)
- `resources/js/`: React frontend pages and components
- `mobile/`: Flutter mobile application source code
- `routes/`: API and Web routes
- `database/`: Migrations, factories, and seeders

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
