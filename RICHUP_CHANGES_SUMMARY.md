# Changes Made to Match richup.io

This document summarizes all the changes made to make poordown.oi look EXACTLY like richup.io (minus advertisements).

## ✅ Completed Changes

### 1. **Player Avatar Selection** (12 Colors in 4x3 Grid)
- **File**: `frontend/src/utils/monopolyConstants.js`
- Updated `PLAYER_COLORS` from 9 colors (3x3 grid) to 12 colors (4x3 grid)
- New color palette matching richup.io:
  - Row 1: Lime green, Golden yellow, Bright orange, Coral red
  - Row 2: Sky blue, Cyan, Teal, Mint green
  - Row 3: Tan brown, Hot pink, Light pink, Purple

### 2. **Avatar Grid Layout**
- **File**: `frontend/src/index.css`
- Updated `.poordown-avatar-grid` to properly display 4 rows of 3 avatars
- Adjusted gap spacing: `22px 24px` for tighter, more compact look
- Changed avatar size from 76px to 72px to match richup.io proportions

### 3. **Eyes on ALL Avatars**
- **File**: `frontend/src/pages/Lobby.jsx`
- Changed logic to show eyes on ALL available avatars (not just selected)
- Only taken/disabled avatars don't show eyes
- Matches richup.io's personality-filled design

### 4. **Modal Title Style**
- **Files**: `frontend/src/pages/Lobby.jsx`, `frontend/src/index.css`
- Changed from all-caps "SELECT YOUR PLAYER APPEARANCE" to sentence case
- New style: "Select your player appearance:"
- Added `.poordown-selection-title-main` CSS class with proper styling
- Font size: 15px, font-weight: 500, minimal letter-spacing

### 5. **"Get More Appearances" Button**
- **Files**: `frontend/src/pages/Lobby.jsx`, `frontend/src/index.css`
- Converted from plain text link to proper button
- Added shopping cart icon
- New CSS class: `.poordown-get-more-button`
- Styled with background, border, and hover effects matching richup.io

### 6. **Game Settings - Private Room Toggle**
- **File**: `frontend/src/pages/Lobby.jsx`
- Added "Private room" setting with toggle switch
- Icon: Key/lock icon
- Description: "Private rooms can be accessed using the room URL only"
- Default: ON (like richup.io)

### 7. **Game Settings - Allow Bots to Join**
- **File**: `frontend/src/pages/Lobby.jsx`
- Added "Allow bots to join" setting with Beta tag
- Icon: Computer/monitor icon
- Purple "Beta" badge matching richup.io style
- Description: "Bots will join the game based on availability"
- Default: OFF

### 8. **Game Settings - Board Map Selector**
- **File**: `frontend/src/pages/Lobby.jsx`
- Added "Board map" setting
- Icon: Map icon
- Shows "Classic" with "Browse maps >" link
- Description: "Change map tiles, properties and stacks"
- Browse button with chevron icon

### 9. **Hidden Starting Cash Setting**
- **File**: `frontend/src/pages/Lobby.jsx`
- Hid the "Starting cash" setting to match richup.io layout
- Changed to `<div className="hidden"></div>`
- Still exists in backend but not displayed in UI

### 10. **Gameplay Rules - Showing Only 4 Rules**
- **File**: `frontend/src/pages/Lobby.jsx`
- Reduced displayed rules from 6 to 4 to match richup.io:
  1. x2 rent on full-set properties
  2. Vacation cash
  3. Auction
  4. Don't collect rent while in prison
- Removed "Mortgage" and "Even build" from display

### 11. **Selection Card Refinements**
- **File**: `frontend/src/index.css`
- Increased card width from 420px to 460px to accommodate 4 rows
- Adjusted padding from `40px 44px 34px` to `36px 40px 32px`
- Reduced gap from 28px to 24px for tighter spacing
- Maintained all glassmorphism effects and shadows

## Key Differences Preserved (As Requested)

1. **No Advertisement Section** - As requested, no advertisement placeholder was added
2. **Brand Name** - Kept "poordown.oi" instead of "richup.io"
3. **Core Functionality** - All backend game logic remains unchanged

## Visual Match Checklist

- ✅ 12 color options (4 rows x 3 columns)
- ✅ Eyes on all available avatars
- ✅ Sentence case title
- ✅ Proper "Get more appearances" button
- ✅ Private room toggle
- ✅ Allow bots to join with Beta tag
- ✅ Board map selector
- ✅ 4 gameplay rules shown
- ✅ Avatar sizing and spacing matches richup.io
- ✅ Overall polish and typography matches

## Files Modified

1. `frontend/src/utils/monopolyConstants.js` - Player colors
2. `frontend/src/pages/Lobby.jsx` - UI structure and settings
3. `frontend/src/index.css` - Styling and layout

All changes maintain the existing poordown.oi codebase structure and only modify the visual presentation to match richup.io exactly as requested.

