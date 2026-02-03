# Fix install issues: BIN file & "Problem parsing the package"

---

## If the file comes as .BIN (WhatsApp/Telegram/email)

When you share the APK, some apps save it as **.bin** instead of **.apk**. Use one of these:

### Option A: Share the ZIP (best)

1. **Share this file:** `Biochar-Management-System-INSTALL.zip` (3.5 MB)
2. Recipient: **Download** the ZIP → open it (Files app or any unzip app) → **Extract**
3. Inside the ZIP you get: **Biochar-Management-System-LATEST.apk**
4. Tap the **.apk** file → Install

No .bin issue, correct file name and type.

### Option B: Rename .bin to .apk on the phone

1. Open **Files** (or My Files / File Manager).
2. Find the downloaded file (e.g. `Biochar-Management-System-LATEST.bin` or `document.bin`).
3. **Long-press** the file → **Rename**.
4. Change the name so it **ends with .apk**, e.g.:
   - `Biochar-Management-System-LATEST.bin` → `Biochar-Management-System-LATEST.apk`
   - or `document.bin` → `app.apk`
5. Save, then tap the file → Install.

---

## What we changed (for parsing errors)

1. **v1-only signing** – APK is signed with v1 (JAR) only. Some devices fail to parse APKs that use v2 signing.
2. **targetSdk 34** – Better compatibility with older Android versions.
3. **Universal APK** – Single APK for all architectures (no split APKs).

## If you still get "parsing the package"

### 1. Share as ZIP (recommended)

- **Put the APK in a ZIP file** before sending (WhatsApp/Telegram/email).
- Recipient: **unzip on the phone**, then install the `.apk` from the unzipped folder.
- This avoids corruption when the APK is sent as a raw file.

### 2. Use Google Drive / direct link

- Upload **Biochar-Management-System-LATEST.apk** to Google Drive.
- Share a **download link** (not “Open in Drive”).
- On the phone: open the link in Chrome → download → install.
- Do not “Open with” from Drive; use “Download” then open the downloaded file.

### 3. Transfer via USB

- Copy the APK to the phone with a USB cable (or SD card).
- Open the APK from **Files** (or your file manager) and install.
- Avoid sending the same file through chat apps if you’ve had parsing errors before.

### 4. Device settings

- **Settings → Security** (or **Apps**) → allow **Install from unknown sources** (or **Unknown apps**) for the app you use to open the APK (e.g. Chrome, Files, Drive).

## Files in this folder

- **Biochar-Management-System-INSTALL.zip** – **Share this.** Contains the APK; unzip to get .apk (avoids .bin).
- **Biochar-Management-System-LATEST.apk** – The app (v1-signed, targetSdk 34). Use inside ZIP or rename from .bin to .apk.
- **Biochar-Management-System-v1-signed-YYYYMMDD.apk** – Same build with date (backup).

## Still not working?

- Try on another Android device to see if the issue is device-specific.
- Make sure the downloaded file size is about **3.9 MB**. If it’s much smaller, the file was corrupted during transfer; use ZIP or USB instead.
