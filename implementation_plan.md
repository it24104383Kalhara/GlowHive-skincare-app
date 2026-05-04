# GlowHive Frontend — UI Implementation Plan

## Design System (Extracted from UI Sketches)

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#2D4B43` | Main CTA buttons, headers, nav icons, dark accents |
| Secondary | `#6F7975` | Muted text, secondary labels, subtle borders |
| Tertiary | `#A79D8B` | Warm taupe accents, rating stars, tag backgrounds |
| Neutral | `#F2F0ED` | Page backgrounds, card backgrounds, input fields |
| White | `#FFFFFF` | Card surfaces, button text on primary |
| Black | `#1A1A1A` | Headings, primary text |

### Typography
- **Headings**: Serif font (Playfair Display) — used for "Welcome Back", "Acidic Refinement Nº7", "The Botanical Archive"
- **Body/Labels**: Sans-serif (Inter or similar) — uppercase letter-spaced for labels like "EMAIL ADDRESS", "PASSWORD"
- **Buttons**: Sans-serif, uppercase, letter-spaced

### Button Styles
- **Primary CTA**: Full-width rounded pill, bg `#2D4B43`, white text, uppercase
- **Secondary/Outline**: Rounded pill, white bg, dark border, dark text
- **Tag Chips**: Small rounded pills, filled = primary, outlined = secondary

### Layout Patterns
- Soft rounded corners (~12-16px)
- Generous padding and white space
- Neumorphic/subtle shadow on input fields
- Cards with very light shadows

## Screens to Build (from Sketches)

1. **LoginScreen** — Email/password login, social login, "Create an account" link
2. **HomeScreen** — Hero banner "The Botanical Archive", trending products, seasonal picks, quote
3. **ProductListScreen** — "Full Collection" grid with product cards + "Add to Bag" buttons
4. **ProductDetailScreen** — Image carousel, price, description, composition tags, reviews
5. **AddProductScreen** — Admin form: title, price, stock, ingredients, skin type tags, image upload

## Phase 1: Frontend Base UI
1. ✅ Initialize Expo project & install dependencies
2. ✅ Create theme/design system constants
3. ✅ Build reusable UI components
4. ✅ Build all 5 screens
5. ✅ Set up navigation
6. ✅ Wire up App.js entry point

## Phase 2: Backend Core & Product Flow
1. ✅ **Connect the Backend Skeleton**: Initialize `server.js` with Express middleware and configure MongoDB.
2. [ ] **Complete Product Module**: Implement `productController.js` and `productRoutes.js` for CRUD operations based on the existing Mongoose model.
3. [ ] **Frontend to Backend Integration**: Configure Axios, create `services/api.js`, and replace mock data in `HomeScreen` and `ProductListScreen` with live API calls.
4. [ ] **Fix Minor Frontend Bugs**: E.g., standardize string quoting in `ProductDetailScreen.js` mock data.


## Phase 3: Authentication & User Handling
1. ✅ **Backend Auth Core**: Build User schema, user registration/login logic, and JWT authentication middleware.
2. ✅ **Frontend Auth Handling**: Build Auth Context, implement secure token storage, and wire up `LoginScreen`.
3. [ ] **Profile Screen**: Finalize UI for the user profile placeholder block.

---

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
