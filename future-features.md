# MeadCalc - Future Feature Ideas

## Competitive Analysis & Feature Gaps

Based on analysis of professional mead calculators like Got Mead's comprehensive calculator, MeadCalc can be enhanced with the following advanced features to provide professional-grade brewing calculations:

### Key Missing Features (Compared to Got Mead Calculator)
- **Multi-scenario must calculations** (new must with fixed gravity/volume, adding to existing)
- **BRIX and Baume gravity scales** (currently only supports SG)
- **Professional blending calculator** with missing value determination
- **Comprehensive sugar source database** (50+ options vs current 25+)
- **Multiple addition support** (4-5 different fruits/sugars per batch)
- **Temperature coefficient calculations** for accurate readings
- **Alcohol conversion utilities** between different measurement standards

### Competitive Advantages to Maintain
- **Smart unit display** with automatic metric/imperial formatting
- **Modern responsive design** optimized for mobile devices
- **Professional deployment system** with LXC containerization
- **Built-in CLI management tools** for easy updates and maintenance
- **Clean, intuitive interface** focused on ease of use

## Additional Considerations for Future Development

### 1. Nutrient Calculator
- **DAP (Diammonium Phosphate)** dosing calculator
- **Fermaid K/O/N** recommendations based on batch size and starting gravity
- **Go-Ferm** calculations for yeast rehydration
- **Organic nutrients** (yeast hulls, boiled yeast) calculator
- **SNA (Staggered Nutrient Additions)** schedule generator
- YAN (Yeast Assimilable Nitrogen) calculations

### 2. Acid/pH Balance Calculator
- **Acid blend** calculations for proper pH balance
- **Tartaric, citric, malic acid** individual dosing
- **Potassium metabisulfite** (K-meta) calculator for preservation
- **Potassium sorbate** calculations for stabilization
- pH adjustment recommendations based on fruit additions
- Buffer capacity calculations

### 3. Batch Scaling Tools
- **Recipe scaling** up/down for different batch sizes
- **Proportional ingredient** adjustment calculator
- **Equipment size** recommendations based on batch size
- **Fermentation vessel** headspace calculations
- Cost per gallon calculator

### 4. Fermentation Timeline Tracker
- **Primary fermentation** duration estimates
- **Secondary/aging** timeline recommendations
- **Racking schedule** based on gravity readings
- **Clearing agent** timing (bentonite, Super-Kleer, etc.)
- **Bottling readiness** indicator
- Gravity reading logger with trend analysis

### 5. Yeast Strain Recommendations
- **Yeast selection** based on target ABV
- **Temperature tolerance** matching
- **Flavor profile** recommendations (clean vs. complex)
- **Alcohol tolerance** warnings
- **Nutrient requirements** by yeast strain
- Pitch rate calculator

### 6. Advanced Calculators
- **Blending calculator** for mixing different meads
  - Support for multiple must sources with different gravities and ABVs
  - Calculate final SG, BRIX, Baume, %ABV, and %ABW after blending
  - Missing value calculation (determine required amounts for target values)
- **Backsweetening** calculator with stabilization requirements
- **Carbonation** calculator for sparkling meads
- **Water chemistry** adjustments for brewing water
- **Refractometer correction** for alcohol presence
- **Temperature correction** for hydrometer readings
- **Multi-scenario must calculator**
  - New must with fixed gravity calculations
  - New must with fixed volume calculations
  - Adding to existing must calculations
- **Comprehensive sugar/fruit addition calculator**
  - Support for 50+ sugar sources and fruits
  - Multiple addition calculator (up to 4-5 different additions per batch)
  - Automatic sugar content conversion and quantity calculations
- **Alcohol conversion utility**
  - Convert between ABV, ABW, SG, BRIX, and Baume
  - Temperature coefficient calculations for accurate readings
- **Gravity and volume relationship calculator**
  - Target gravity achievement through volume adjustment
  - Target volume achievement through gravity adjustment
  - Current must analysis and adjustment recommendations

### 7. Recipe Database & Management
- **Save/load recipes** functionality
- **Recipe sharing** between users
- **Batch notes** and tasting records
- **Photo uploads** for batch documentation
- **Rating system** for completed batches

### 8. Enhanced Unit System & Calculations
- **Comprehensive measurement support**
  - Full metric, US customary, and Imperial unit systems
  - BRIX, Baume, and additional gravity scales
  - Temperature-corrected calculations (Celsius/Fahrenheit)
- **Professional must analysis**
  - Multiple calculation scenarios in single interface
  - Batch composition analysis and recommendations
  - Real-time unit conversion across all measurement systems
- **Advanced fruit and sugar database**
  - Expand current 25+ ingredients to 50+ options
  - Include exotic fruits and specialty sugars
  - Detailed sugar content profiles and brewing characteristics
  - Regional availability and seasonal recommendations

### 9. Educational Resources
- **Troubleshooting guide** for common issues
- **Ingredient profiles** with flavor descriptions
- **Style guidelines** for traditional mead varieties
- **Conversion tools** (metric/imperial, temperature, etc.)
- **Glossary** of mead-making terms

### 9. Quality Control Tools
- **Hydrometer calibration** checker
- **Equipment sanitization** calculator (Star-San, etc.)
- **Storage recommendations** based on mead type
- **Shelf life** estimates
- **Competition judging** score sheets

### 10. Integration Features
- **Shopping list** generator from recipes
- **Supplier links** for ingredients
- **Calendar integration** for racking/bottling reminders
- **Export options** (PDF recipes, CSV data)
- **Mobile app** companion

## Implementation Priority Suggestions

### Phase 1 (High Impact, Low Complexity)
1. Enhanced fruit and sugar database (expand to 50+ ingredients)
2. BRIX and Baume gravity scale support
3. Temperature correction for readings
4. Multiple sugar/fruit addition calculator (up to 4-5 additions)
5. Batch scaling tools
6. Recipe save/load functionality

### Phase 2 (Medium Impact, Medium Complexity)
1. Multi-scenario must calculator (fixed gravity/volume, adding to existing)
2. Alcohol conversion utility (ABV/ABW/SG/BRIX/Baume)
3. Gravity and volume relationship calculator
4. Nutrient calculator (basic DAP/Fermaid)
5. Fermentation timeline tracker
6. Yeast strain recommendations

### Phase 3 (High Impact, High Complexity)
1. Advanced blending calculator with missing value calculation
2. Professional must analysis with batch composition recommendations
3. Acid/pH balance calculator
4. Recipe database with sharing
5. Carbonation calculator for sparkling meads
6. Mobile app development

## Technical Considerations
- **Local storage** for saved recipes
- **Progressive Web App** (PWA) capabilities
- **Offline functionality** for core calculators
- **Database backend** for recipe sharing
- **API integration** with ingredient suppliers
- **Responsive design** maintenance across new features