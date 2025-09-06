# MeadCalc Project Context Database

**Last Updated:** September 6, 2025  
**Current Branch:** Unified-Calc-Update  
**Version Status:** Development/Testing Phase

## 📋 Project Overview

**MeadCalc** is a comprehensive web-based mead brewing calculator designed for both novice and professional mead makers. The application provides real-time calculations for alcohol content, specific gravity, and ingredient requirements with smart unit conversion between Imperial and Metric systems.

### 🎯 Core Purpose
- Calculate ABV from ingredient lists
- Determine ingredient requirements for target ABV
- Convert between different alcohol and gravity measurement standards
- Provide professional-grade mead brewing calculations with mobile-responsive design

## 🏗️ Technical Architecture

### Frontend Stack
- **Pure HTML5, CSS3, JavaScript** (no frameworks/dependencies)
- **Responsive design** with mobile-first approach
- **Real-time calculations** with input validation
- **Smart unit conversion** with automatic overflow handling
- **Professional styling** with dark theme and gold accents (#d4af37)

### Key Files Structure
```
/D/MeadCalc/
├── index.html              # Main application interface (13,308 bytes)
├── calculator.js            # Core calculation logic (83,138 bytes)
├── styles.css               # Responsive styling (14,954 bytes)
├── MeadCalc_logo.png        # Project logo (956KB)
├── README.md                # Comprehensive documentation
├── future-features.md       # Planned enhancements roadmap
├── CONTAINER_UPDATE.md      # Deployment update instructions
├── meadcalc.sh              # Proxmox LXC deployment script
├── update-meadcalc.sh       # Update system with rollback
├── testing/                 # Screenshots for troubleshooting
│   ├── MeadCalc_Calculate ABV from Ingredients_ScreenShot.png
│   ├── MeadCalc_Calculate Ingredients for Target ABV_ScreenShot.png
│   └── [Additional screenshots...]
└── unified_brewing_calculator_EXAMPLE.html  # Reference implementation
```

## 🔧 Current Feature Set

### 1. Unified Brewing Calculator (Primary Feature)
**Two Calculation Modes:**

#### Mode A: Calculate ABV from Ingredients
- Input: Batch size, honey amount, additional ingredients
- Output: Estimated OG, potential ABV, weight per gallon, ingredient breakdown
- Supports: Dynamic ingredient additions with smart weight handling

#### Mode B: Calculate Ingredients for Target ABV  
- Input: Target ABV, batch size, ingredient percentages
- Output: Required ingredient amounts, OG, weight calculations
- Features: Auto-balancing honey percentage, 100% total validation

### 2. Simple ABV Calculator
- OG/FG to ABV conversion using industry formula (131.25 factor)
- Real-time calculation with input validation
- Includes potential ABV and attenuation calculations

### 3. Alcohol & Gravity Converter (Recently Enhanced)
- **Supported Formats:** ABV, ABW, Specific Gravity, BRIX, Baumé
- **Bidirectional conversion** with professional formulas
- **Live updates** as user types
- **Input validation** with range checking
- **Visual highlighting** of source vs. converted values

### 4. Smart Unit System
- **Imperial:** lbs/oz, gallons with intelligent display (e.g., "1 lbs 7 oz")
- **Metric:** kg/g, liters with smart formatting (e.g., "120 g" vs "1.25 kg")  
- **Auto-overflow handling:** 16+ oz → lbs, 1000+ g → kg
- **Real-time unit switching** with calculation preservation
- **Conversion displays** show equivalent values

### 5. Comprehensive Ingredient Database
- **25+ ingredients** with accurate sugar content percentages
- **Fruits:** Apple, berries, citrus, stone fruits, exotic varieties
- **Sweeteners:** Cane sugar, brown sugar, maple syrup, agave
- **Honey calculations** using 80% fermentable sugar content
- **Multiple additions support** with dynamic ingredient management

## 📊 Recent Development Activity

### Latest Commits (Last 10)
```
4b93cb4 - Readme Edits
bc14744 - Remove marketing language from README features  
36e125b - Comprehensive README update with screenshot and detailed features
d11043d - Update SG/Brix conversion formula documentation
1b2782d - Fix bidirectional ABV/ABW conversion accuracy
065d21c - Standardize conversion utility styling to match other calculators
58a0e01 - Fix conversion utility header styling to match other calculators
a68b5b7 - Enhance conversion utility with live updates and consistent styling
acced95 - Fix double-click to select all text in input fields
4a3b95e - Add comprehensive Alcohol & Gravity Conversion Utility
```

### Modified Files Status (Git Working Tree)
- `calculator.js` - Modified (likely calculation improvements)
- `index.html` - Modified (UI enhancements)
- `styles.css` - Modified (styling updates)
- `MeadCalc_ScreenShot.png` - Deleted (possibly updated with new version)
- `testing/` - Untracked directory (new screenshots)
- `unified_brewing_calculator_EXAMPLE.html` - Untracked (reference file)

## 🎨 User Interface Design

### Visual Identity
- **Color Scheme:** Dark theme with gold accents (#d4af37)
- **Typography:** 'Segoe UI' font family for modern readability
- **Logo Integration:** Custom MeadCalc logo with drop-shadow effects
- **Responsive Grid:** Adaptive layout for desktop/tablet/mobile

### User Experience Features
- **Double-click to select** all input field text for quick replacement
- **Real-time calculations** as user types (no submit buttons)
- **Input validation** with visual feedback (red/green borders)
- **Smooth animations** for result updates and hover effects
- **Collapsible reference sections** for space efficiency
- **Smart focus management** with automatic text selection

### Screenshot Analysis (from testing/ directory)
The screenshots show:
1. **Professional two-panel layout** with inputs on left, results on right
2. **Mode switching controls** clearly visible at top
3. **Dynamic ingredient management** with add/remove functionality
4. **Real-time results display** with professional formatting
5. **Ingredient breakdown calculations** showing contribution details

## 🚀 Deployment & Infrastructure

### Production Deployment
- **Platform:** Proxmox LXC containers with Ubuntu 22.04
- **Web Server:** nginx with optimized configuration
- **Security:** Headers, gzip compression, SSL support
- **CLI Tools:** Custom `meadcalc` command for management
- **Update System:** Automated with backup/rollback capabilities

### Update Mechanism
- **One-liner updates:** `curl -fsSL [script] | sudo bash`
- **Backup system:** Keeps last 5 versions with timestamps
- **Rollback support:** Easy revert to previous versions
- **Permission management:** Automatic www-data ownership
- **Service management:** nginx reload with testing

### Local Development
- **No dependencies** - runs directly in browser from filesystem
- **No build process** - pure HTML/CSS/JS
- **Cross-platform** - works on any modern browser
- **Offline capable** - all calculations client-side

## 📈 Roadmap & Future Features

### Phase 1 - Competitive Parity (High Priority)
- **Multi-scenario must calculations** (new must with fixed gravity/volume)
- **Enhanced ingredient database** (expand to 50+ ingredients) 
- **BRIX and Baumé support** (currently only Specific Gravity)
- **Multiple addition support** (4-5 different fruits/sugars per batch)
- **Temperature coefficient calculations** for accuracy

### Phase 2 - Advanced Features
- **Nutrient calculator** (DAP, Fermaid, Go-Ferm, SNA schedules)
- **Acid/pH balance calculator** with adjustment recommendations
- **Batch scaling tools** for recipe size adjustments
- **Fermentation timeline tracker** with gravity logging
- **Yeast strain recommendations** based on target parameters

### Phase 3 - Professional Tools
- **Advanced blending calculator** with missing value determination
- **Recipe database** with save/load and sharing capabilities
- **Professional must analysis** with batch composition recommendations
- **Progressive Web App** (PWA) with offline functionality
- **Mobile app companion** development

## ⚠️ Known Issues & Considerations

### Current Limitations
- **Single gravity scale** (only Specific Gravity, no BRIX/Baumé in main calcs)
- **Limited blending support** (no multi-must calculations)
- **No recipe persistence** (calculations reset on page reload)
- **Missing advanced features** compared to Got Mead calculator

### Technical Debt
- **Large calculator.js file** (83KB) - could benefit from modularization
- **Inline event handlers** in HTML - could be moved to JS
- **Global variables** - scope could be better managed
- **No unit testing** - calculations rely on manual verification

### Browser Compatibility
- **Modern browsers required** for ES6 features
- **Mobile Safari optimization** may need additional testing
- **Legacy IE support** not provided (acceptable for target audience)

## 🧪 Testing & Quality Assurance

### Screenshot Documentation (testing/ directory)
- `Brewing_Calculator_CalcsMissing_ScreenShot.png` - Error states
- `Calc_ABV_from_Ing_Scr.png` - ABV calculation mode
- `Calc_ING_for_Target_Scr.png` - Target ABV mode  
- `MeadCalc_Calculate ABV from Ingredients_AddIng_Amounts_ScreenShot.png` - Ingredient entry
- `MeadCalc_Calculate ABV from Ingredients_ScreenShot.png` - Results display
- `MeadCalc_Calculate Ingredients for Target ABV_ScreenShot.png` - Target calculations

### Validation Approach
- **Real-time input validation** with visual feedback
- **Range checking** for realistic brewing values
- **Unit conversion accuracy** testing
- **Cross-browser compatibility** verification
- **Mobile responsive** testing across devices

## 🔧 Development Environment

### Prerequisites
- **Git repository** with GitHub integration
- **Modern code editor** (VS Code, etc.)
- **Local web server** (optional for file:// protocol)
- **Browser developer tools** for debugging

### Development Workflow
1. **Local testing** - Open index.html directly in browser
2. **Code validation** - Use browser dev tools for JS errors
3. **Responsive testing** - Browser responsive design mode
4. **Git workflow** - Feature branches with descriptive commits
5. **Staging deployment** - Test on container before production

### Code Style Guidelines
- **Consistent indentation** (4 spaces in JS, 2 in HTML/CSS)
- **Clear function naming** with descriptive parameters
- **Comprehensive comments** for complex calculations
- **Error handling** with user-friendly messages
- **Performance consideration** for real-time calculations

---

## 📞 Quick Reference for Troubleshooting

### Common Issues
1. **Calculations not updating** → Check JavaScript console for errors
2. **Unit conversion problems** → Verify currentWeightUnit/currentVolumeUnit variables
3. **Layout issues** → Check CSS grid/flexbox compatibility
4. **Performance problems** → Review event listener efficiency

### Key Functions to Know
- `calculateUnifiedABVMode()` - Main ABV calculation
- `calculateUnifiedTargetMode()` - Target ingredient calculation  
- `updateWeightUnits()` / `updateVolumeUnits()` - Unit system switching
- `handleUnifiedWeightOverflow()` - Automatic unit conversion
- `performConversion()` - Gravity/alcohol conversion utility

### Git Branch Strategy
- **main** - Production stable releases
- **Unified-Calc-Update** - Current development branch (active)
- **Feature branches** - For specific enhancements
- **Hotfix branches** - For critical production fixes

This context database should provide comprehensive understanding of MeadCalc's current state, recent changes, and future direction for efficient troubleshooting and development planning.