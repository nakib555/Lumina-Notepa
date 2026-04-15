<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/a3e213f8-5bad-4130-8360-e8646ca324cb

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Android Project Structure & Architecture

The `android` folder contains the native Android container for this application, generated and managed by **Capacitor**. Capacitor acts as a bridge, wrapping the modern web application (React/Vite) inside a native Android `WebView`, allowing it to run as a native app while accessing device-level APIs.

Here is a deep dive into the key components of the `android` folder and *why* they are configured this way:

### 1. The Core Application (`android/app/src/main/`)
This is where the actual Android application lives.

*   **`res/layout/activity_main.xml`**: 
    *   **What it is:** The main UI layout file for the Android app.
    *   **Why it's important:** Instead of native Android UI components (like `TextView` or `Button`), this layout primarily contains a single, full-screen `WebView`. This is the core of the hybrid app architecture—it loads the `index.html` from the Vite build and renders the React application.
*   **`res/values/styles.xml`**:
    *   **What it is:** Defines the visual themes for the Android application.
    *   **Why it's important:** It includes specific themes like `AppTheme.NoActionBar` and `AppTheme.NoActionBarLaunch`. The `NoActionBarLaunch` theme uses the `splash.png` drawable as its background. This is crucial for user experience: it displays a native splash screen immediately when the app is tapped, masking the brief loading time required for the `WebView` and React to initialize.
*   **`res/values/strings.xml`**:
    *   **What it is:** Centralized string resources.
    *   **Why it's important:** It defines the OS-level app identity, such as `app_name` ("Lumina") and `custom_url_scheme` ("com.lumina.app"). The custom URL scheme allows the app to be opened via deep links from other apps or the web.
*   **`res/mipmap-*` & `res/drawable-*`**:
    *   **What it is:** Image assets for app icons and splash screens.
    *   **Why it's important:** Android devices come in thousands of different screen sizes and pixel densities (mdpi, hdpi, xhdpi, etc.). Providing assets in all these buckets ensures the app icon and splash screen look crisp on every device. It also includes `ic_launcher.xml` for Android's Adaptive Icons, which allow the OS to mask the icon into circles, squarcles, or teardrops depending on the device manufacturer's theme.

### 2. The Build System (Gradle)
Android uses Gradle to compile code, resolve dependencies, and package the final APK/AAB.

*   **`android/build.gradle` & `android/app/build.gradle`**:
    *   **What they are:** The top-level and module-level build scripts.
    *   **Why they are important:** They configure the Android Gradle Plugin (AGP) and define repositories (like Google's Maven). They dictate how the native code is compiled and packaged.
*   **`android/variables.gradle`**:
    *   **What it is:** A centralized file for defining SDK versions and dependency versions.
    *   **Why it's important:** It ensures consistency. By defining `minSdkVersion`, `compileSdkVersion`, and `androidxAppCompatVersion` here, both the main app and any Capacitor/Cordova plugins use the exact same versions, preventing build conflicts and runtime crashes.
*   **`android/gradle.properties`**:
    *   **What it is:** Configuration properties for the Gradle build environment.
    *   **Why it's important:** It contains `android.useAndroidX=true`. AndroidX is the modern standard for Android support libraries. Setting this to true is mandatory for Capacitor and modern plugins to function correctly.
*   **`android/gradlew` & `android/gradle/wrapper/`**:
    *   **What it is:** The Gradle Wrapper.
    *   **Why it's important:** It allows anyone (or any CI/CD pipeline) to build the Android project without needing to manually install a specific version of Gradle on their machine. It guarantees that the build is reproducible and uses the exact Gradle version the project was designed for.

### 3. Plugin Ecosystem
*   **`android/capacitor-cordova-android-plugins/`**:
    *   **What it is:** An auto-generated module by Capacitor.
    *   **Why it's important:** While Capacitor has its own modern plugin system, it also maintains backward compatibility with the massive ecosystem of older Cordova plugins. This folder acts as an adapter, automatically wrapping installed Cordova plugins so they can be compiled into the Capacitor Android project seamlessly.
