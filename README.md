# Talos - Expense Tracker PWA

Talos is a Progressive Web App (PWA) designed to help users manage and control their monthly gasoline expenses. It features a clean, dark-themed UI with a prominent circular progress counter for at-a-glance budget tracking. The app allows for both manual expense entry and OCR-based scanning of receipts.

Built with modern web technologies and wrapped with Capacitor, Talos offers a seamless experience on the web and as a native app on Android and iOS.

## ✨ Features

- **Budget Visualization:** A large circular progress bar shows the remaining percentage of the monthly budget.
- **Manual & OCR Entry:** Add expenses manually or scan receipts using the device's camera (OCR functionality is currently mocked).
- **Detailed History:** View a complete history of all expenses, grouped and sorted by month.
- **Data Visualization:** A line graph displays spending trends over the last few months.
- **Customizable Settings:** Set your monthly budget and adjust the OCR confidence threshold.
- **Offline First:** As a PWA with a Service Worker and IndexedDB, the app works reliably even without an internet connection.
- **Cross-Platform:** Runs in any modern web browser and can be compiled into native Android and iOS apps using Capacitor.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, TailwindCSS
- **State Management:** React Hooks (`useState`, `useEffect`, etc.)
- **Local Storage:** IndexedDB via the `idb` library
- **Native Wrapper:** Capacitor
- **Icons:** Custom SVG components

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/talos.git
   ```
2. Navigate to the project directory:
   ```sh
   cd talos
   ```
3. Install NPM packages:
   ```sh
   npm install
   ```

### Building the Web App

The project is set up to be served as static files. The build script copies all necessary assets into the `www` directory.

```sh
npm run build:web
```

After building, you can use a simple local server (like `serve` or Python's `http.server`) to view the app in your browser from the `www` directory.

## 📱 Capacitor (Native Apps)

### Initial Setup

To add native platforms (Android/iOS), run the initialization script.

```sh
npm run capacitor:init
```
*This will add the `android` and `ios` project folders.*

### Syncing Web Assets

Whenever you make changes to the web code, you need to rebuild and sync the assets with the native projects.

```sh
npm run build:web
npm run capacitor:sync
```

### Running on Devices

1. **Open the native project in its IDE:**
   - For Android: `npm run capacitor:open:android` (requires Android Studio)
   - For iOS: `npm run capacitor:open:ios` (requires Xcode on a Mac)

2. **Build and run the app** from within the native IDE onto an emulator or a connected device.

### Building an Android APK

A GitHub Actions workflow is included to automatically build a debug APK on every push to the `main` branch.

To build it locally, run:

```sh
npm run build:android-debug
```

The resulting APK will be located at `android/app/build/outputs/apk/debug/app-debug.apk`.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.