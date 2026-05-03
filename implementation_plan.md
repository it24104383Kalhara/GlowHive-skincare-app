# 🧴 Skin Diary Module — Implementation Plan

## Overview
Add a **Personal Skin Diary** (Skin Log) module to the existing GlowHive app. Users can log daily skin condition with a selfie, track hydration/acne levels, products used, and notes.

---

## Steps

### Step 1: Backend — MongoDB Model (`SkinLog.js`)
Create `backend/src/models/SkinLog.js` with fields:
- `user` (ObjectId, ref User, required)
- `date` (Date, required, default now)
- `hydration` (String, enum: Dry/Normal/Oily, required)
- `acne` (String, enum: None/Mild/Moderate/Severe, required)
- `productsUsed` (Array of Strings)
- `notes` (String, optional)
- `imageUrl` (String, required — selfie)
- `timestamps: true`

### Step 2: Backend — Controller (`skinLogController.js`)
Create `backend/src/controllers/skinLogController.js`:
- `createSkinLog` — POST, user-specific
- `getMySkinLogs` — GET, all logs for logged-in user (sorted by date desc)
- `getSkinLogById` — GET, single log (verify ownership)
- `updateSkinLog` — PUT, update existing (verify ownership)
- `deleteSkinLog` — DELETE, remove entry + delete image file (verify ownership)

### Step 3: Backend — Routes (`skinLogRoutes.js`)
Create `backend/src/routes/skinLogRoutes.js`:
- `POST /api/skinlogs` → createSkinLog (protected)
- `GET /api/skinlogs` → getMySkinLogs (protected)
- `GET /api/skinlogs/:id` → getSkinLogById (protected)
- `PUT /api/skinlogs/:id` → updateSkinLog (protected)
- `DELETE /api/skinlogs/:id` → deleteSkinLog (protected)

### Step 4: Backend — Register routes in `server.js`

### Step 5: Frontend — API Service (`skinLogService.js`)
Create `frontend/src/services/skinLogService.js` with methods matching CRUD operations + image upload.

### Step 6: Frontend — Skin Diary Timeline Screen
Create `frontend/src/screens/SkinDiaryScreen.js`:
- Chronological timeline of all entries
- Calendar toggle to view by date
- Each entry shows: date, selfie thumbnail, hydration/acne badges, products
- Tap to view detail, swipe/long-press to delete
- FAB button to add new entry

### Step 7: Frontend — Add/Edit Skin Log Screen
Create `frontend/src/screens/AddSkinLogScreen.js`:
- Date picker
- Hydration level selector (Dry / Normal / Oily)
- Acne condition selector (None / Mild / Moderate / Severe)
- Products used (text input, comma-separated)
- Notes (multiline)
- Image picker (required selfie)
- Save / Cancel buttons
- Reused for both Create and Edit (pass existing data via navigation params)

### Step 8: Frontend — Navigation Integration
- Add "Skin Diary" tab to bottom tab navigator (or add it as a stack screen accessible from Profile/Home)
- Register AddSkinLog and SkinDiary screens in AppNavigator
