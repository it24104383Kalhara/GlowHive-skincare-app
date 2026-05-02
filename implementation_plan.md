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

