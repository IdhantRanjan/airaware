# Air Quality Data Analysis & Machine Learning Plan

## Dataset Overview

**Repository:** https://github.com/DrKoz/ACS_AQ

**Data Description:**
- **Time Period:** November 2025 (Nov 1 - Nov 29)
- **Number of Sensors:** 5 sensors (IDs: 230019, 249443, 249445, 290694, 297697)
- **Sampling Frequency:** 2-minute intervals
- **Data Points per Sensor:** 
  - 230019: ~20,559 rows
  - 249443: ~20,366 rows
  - 249445: ~20,678 rows
  - 290694: ~3,741 rows (significantly fewer - potential data quality issue)
  - 297697: ~20,674 rows

**Key Column:** `pm_cf1` - This is the averaged (between A and B sensors) and EPA-corrected PM2.5 data. **This column should be used for all concentration comparisons.**

## Data Structure

Each CSV file contains the following columns:
- `time_stamp`: Timestamp of measurement (YYYY-MM-DD HH:MM:SS format)
- `sensor_index`: Sensor identifier
- `corr_pm2.5_a`: Corrected PM2.5 from sensor A
- `pm2.5_cf_1_a`: PM2.5 CF1 reading from sensor A
- `corr_pm2.5_b`: Corrected PM2.5 from sensor B
- `pm2.5_cf_1_b`: PM2.5 CF1 reading from sensor B
- `pm_cf1`: **Averaged and EPA-corrected PM2.5 (PRIMARY TARGET VARIABLE)**
- `humidity_a`, `humidity_b`: Humidity readings from sensors A and B
- `temperature_a`, `temperature_b`: Temperature readings from sensors A and B

**Note:** Each sensor has dual sensors (A and B) for redundancy/validation. The `pm_cf1` column represents the processed, averaged, and EPA-corrected value that should be used for analysis.

---

## Potential Machine Learning Tasks & Analyses

### 1. **Time Series Forecasting**

**Objective:** Predict future PM2.5 concentrations based on historical patterns.

**Approaches:**
- **Traditional Time Series Models:**
  - ARIMA (AutoRegressive Integrated Moving Average)
  - SARIMA (Seasonal ARIMA) - to capture daily/weekly patterns
  - Exponential Smoothing (Holt-Winters)
  
- **Machine Learning Models:**
  - Random Forest Regressor (with lag features)
  - Gradient Boosting (XGBoost, LightGBM)
  - Support Vector Regression (SVR)
  
- **Deep Learning Models:**
  - LSTM (Long Short-Term Memory) networks
  - GRU (Gated Recurrent Unit) networks
  - Transformer-based models (e.g., Temporal Fusion Transformer)
  - CNN-LSTM hybrid models

**Features to Engineer:**
- Lag features (PM2.5 values from previous time steps: t-1, t-2, t-3, etc.)
- Rolling statistics (moving averages, rolling standard deviations)
- Temporal features (hour of day, day of week, day of month)
- Weather features (humidity, temperature, their interactions)
- Cross-sensor features (if modeling one sensor, use others as features)

**Forecasting Horizons:**
- Short-term: 1-6 hours ahead
- Medium-term: 6-24 hours ahead
- Long-term: 1-7 days ahead

---

### 2. **Anomaly Detection**

**Objective:** Identify unusual patterns, sensor malfunctions, or pollution events.

**Approaches:**

#### **Statistical Methods:**
- **Z-score based detection:**
  - Calculate z-scores: `z = (x - μ) / σ`
  - Flag anomalies where |z| > 3 (or custom threshold)
  - Can be applied per-sensor or globally across all sensors
  
- **Interquartile Range (IQR) method:**
  - Calculate Q1 (25th percentile) and Q3 (75th percentile)
  - Flag values outside [Q1 - 1.5×IQR, Q3 + 1.5×IQR]
  - Robust to outliers, good for non-normal distributions
  
- **Moving average with standard deviation bands:**
  - Calculate rolling mean and rolling std over window (e.g., 24 hours)
  - Flag values outside mean ± 2×std or mean ± 3×std
  - Adapts to local trends, good for time series

#### **Machine Learning Methods:**
- **Isolation Forest:**
  - Unsupervised algorithm that isolates anomalies
  - Works well with high-dimensional data
  - Fast and scalable
  - Can use features: PM2.5, temperature, humidity, temporal features
  
- **One-Class SVM:**
  - Learns a boundary around "normal" data
  - Good for detecting novel patterns
  - Can be sensitive to hyperparameters
  
- **Local Outlier Factor (LOF):**
  - Density-based anomaly detection
  - Identifies points with significantly lower density than neighbors
  - Good for detecting local anomalies
  
- **Autoencoders (unsupervised deep learning):**
  - Neural network that learns to compress and reconstruct data
  - High reconstruction error = anomaly
  - LSTM-based autoencoders for time series sequences
  - Can capture complex temporal patterns

#### **Time Series Specific:**
- **Seasonal Decomposition of Time Series (STL):**
  - Decompose into trend, seasonal, and residual components
  - Flag anomalies in residual component
  - Handles daily/weekly seasonality well
  
- **Prophet anomaly detection:**
  - Facebook's Prophet model with anomaly detection
  - Automatically handles seasonality and holidays
  - Provides uncertainty intervals
  
- **LSTM-based autoencoders for time series:**
  - Sequence-to-sequence autoencoder
  - Input: sliding window of PM2.5 values (e.g., 24 hours)
  - High reconstruction error indicates anomaly
  - Can detect complex temporal anomalies

#### **Multi-Sensor Anomaly Detection:**
- **Cross-sensor comparison:**
  - Compare readings across all 5 sensors at same timestamp
  - Flag sensors that deviate significantly from others
  - Can detect sensor-specific failures
  
- **Spatial-temporal anomalies:**
  - If sensors are geographically distributed, detect spatial anomalies
  - Unusual patterns in one location vs. others
  - Can indicate localized pollution events

**Use Cases:**
- Detect sensor calibration drift (gradual changes over time)
- Identify pollution spikes (fire events, industrial accidents, traffic incidents)
- Find data quality issues (missing data patterns, sensor failures, communication errors)
- Identify sensor 290694's data gap reason
- Detect sudden changes in air quality patterns
- Identify unusual weather-pollution interactions

**Implementation Strategy:**
1. Start with simple statistical methods (Z-score, IQR) for baseline
2. Apply time series methods (STL, moving average) to capture temporal patterns
3. Use ML methods (Isolation Forest, LSTM autoencoder) for complex patterns
4. Combine multiple methods for robust detection
5. Validate anomalies with domain knowledge (check if they correspond to known events)

---

### 2.5. **Weather & Precipitation Correlation Analysis**

**Objective:** Understand relationships between air quality and meteorological factors.

#### **Available Weather Data:**
- Temperature (from sensors A and B)
- Humidity (from sensors A and B)
- **Note:** Precipitation data would need to be obtained from external sources (NOAA, Weather APIs)

#### **Correlation Analysis Approaches:**

**1. Direct Correlation:**
- **Pearson Correlation:**
  - Linear relationship between PM2.5 and temperature/humidity
  - Calculate correlation coefficients
  - Expected: Negative correlation with temperature (higher temp → lower PM2.5 due to atmospheric mixing)
  
- **Spearman Rank Correlation:**
  - Non-parametric, captures monotonic relationships
  - Robust to outliers
  - Good for non-linear relationships

- **Time-lagged Correlation:**
  - Correlate PM2.5 with weather at different time lags
  - Example: Does today's temperature affect tomorrow's PM2.5?
  - Use cross-correlation function (CCF) to find optimal lag

**2. Regression Analysis:**
- **Multiple Linear Regression:**
  - Model: `PM2.5 = β₀ + β₁×Temperature + β₂×Humidity + ε`
  - Interpret coefficients to understand relationships
  - Check for multicollinearity between temperature and humidity
  
- **Polynomial Regression:**
  - Capture non-linear relationships
  - Example: Temperature might have quadratic effect on PM2.5
  
- **Interaction Terms:**
  - Model interactions: `PM2.5 ~ Temperature × Humidity`
  - High humidity + high temperature might have different effect

**3. Machine Learning Feature Importance:**
- **Random Forest / XGBoost:**
  - Use temperature, humidity, temporal features to predict PM2.5
  - Extract feature importance scores
  - Understand which weather factors matter most
  
- **SHAP Values:**
  - Explain individual predictions
  - Show how temperature/humidity contribute to each prediction
  - Visualize feature interactions

**4. Precipitation Analysis (if external data available):**

**Data Sources:**
- NOAA Climate Data Online (CDO)
- OpenWeatherMap API
- Weather Underground API
- Local weather station data

**Analysis Methods:**
- **Event-based Analysis:**
  - Compare PM2.5 before, during, and after precipitation events
  - Does rain "wash out" pollutants? (expected: yes)
  - How long does the effect last?
  
- **Precipitation Amount Correlation:**
  - Correlate PM2.5 with precipitation amount (mm)
  - Light rain vs. heavy rain effects
  - Cumulative precipitation over time windows
  
- **Time Series Analysis:**
  - Model PM2.5 as function of precipitation lag
  - Does yesterday's rain affect today's air quality?
  - Seasonal patterns in precipitation-PM2.5 relationship

**5. Advanced Weather-PM2.5 Modeling:**

**Weather Feature Engineering:**
- **Temperature features:**
  - Current temperature
  - Temperature change (ΔT over 1h, 6h, 24h)
  - Temperature gradient (if multiple sensors)
  - Daily min/max temperature
  
- **Humidity features:**
  - Current humidity
  - Humidity change rate
  - Dew point (calculated from temp + humidity)
  - Relative humidity vs. absolute humidity
  
- **Combined weather indices:**
  - Heat index (temperature + humidity)
  - Atmospheric stability indicators
  - Mixing height (if wind data available)

**Machine Learning Models:**
- **Weather-only prediction:**
  - Can we predict PM2.5 using only weather features?
  - Baseline: How much variance can weather explain?
  
- **Weather + temporal features:**
  - Combine weather with time-of-day, day-of-week
  - Capture interactions between weather and daily patterns
  
- **Multi-output models:**
  - Predict PM2.5, temperature, and humidity simultaneously
  - Capture dependencies between variables

**Expected Relationships:**
- **Temperature:**
  - Negative correlation (higher temp → better mixing → lower PM2.5)
  - Inversion layers: cold air traps pollutants near ground
  - Seasonal effects (if data spans multiple seasons)
  
- **Humidity:**
  - Complex relationship
  - High humidity can trap pollutants (fog, smog)
  - But also promotes particle growth and settling
  - May vary by location and season
  
- **Precipitation:**
  - Strong negative correlation (rain washes out particles)
  - Effect depends on intensity and duration
  - Post-rain: clean air, but may have rebound effect

**Visualization:**
- Scatter plots: PM2.5 vs. Temperature, PM2.5 vs. Humidity
- Time series overlays: PM2.5 and weather on same plot
- Correlation heatmaps
- Lag correlation plots
- Precipitation event analysis plots

---

### 2.6. **Fire Detection Using Smoke Patterns**

**Objective:** Detect and track wildfires or other fire events using PM2.5 smoke signatures.

#### **Why PM2.5 is Good for Fire Detection:**
- Fires produce significant amounts of fine particulate matter
- Smoke plumes cause sudden, dramatic increases in PM2.5
- PM2.5 sensors can detect fires before they're visible or reported
- Can track smoke dispersion and fire progression

#### **Fire Detection Approaches:**

**1. Anomaly-Based Fire Detection:**
- **Sudden Spike Detection:**
  - Detect rapid increases in PM2.5 (e.g., >50% increase in 1 hour)
  - Threshold-based: PM2.5 > 150 µg/m³ (Unhealthy level)
  - Rate of change: d(PM2.5)/dt > threshold
  
- **Multi-Sensor Confirmation:**
  - If multiple sensors detect spikes simultaneously → likely regional event
  - If only one sensor spikes → could be local source or sensor error
  - Spatial pattern analysis: which sensors detect it first? (indicates direction)
  
- **Temporal Pattern Recognition:**
  - Fire smoke has characteristic signature:
    - Sudden rise
    - Sustained high levels
    - Gradual decline (as fire is contained or wind shifts)
  - Different from traffic spikes (shorter duration) or industrial emissions (more regular)

**2. Machine Learning Fire Detection:**

**Feature Engineering for Fire Detection:**
- **PM2.5 features:**
  - Current PM2.5 value
  - Rate of change (1h, 6h, 24h)
  - Rolling maximum (detect sustained high levels)
  - PM2.5 gradient across sensors (spatial spread)
  
- **Temporal features:**
  - Time of day (fires more likely during certain hours?)
  - Day of week
  - Season (fire season vs. non-fire season)
  
- **Weather features:**
  - Temperature (high temp → fire risk)
  - Humidity (low humidity → fire risk)
  - Wind speed/direction (if available) → smoke dispersion
  - Precipitation (recent rain → lower fire risk)
  
- **Multi-sensor features:**
  - Number of sensors detecting high PM2.5
  - Spatial correlation between sensors
  - Time delay between sensor detections (smoke propagation)

**Classification Models:**
- **Binary Classification:**
  - Classify each time point: Fire Event vs. Normal
  - Models: Random Forest, XGBoost, Neural Networks
  - Features: PM2.5 patterns, weather, temporal features
  
- **Multi-class Classification:**
  - Normal, Traffic Spike, Industrial Emission, Fire Event, Sensor Error
  - Requires labeled data or unsupervised clustering first

**Time Series Models:**
- **LSTM/GRU for Sequence Classification:**
  - Input: Sequence of PM2.5 values (e.g., 24-hour window)
  - Output: Fire Event probability
  - Can learn complex temporal fire signatures
  
- **CNN-LSTM Hybrid:**
  - CNN extracts local patterns (spikes, trends)
  - LSTM captures long-term dependencies
  - Good for detecting fire events in time series

**3. Fire Tracking & Dispersion Modeling:**

**Smoke Plume Tracking:**
- **Spatial Analysis (if sensor locations known):**
  - Which sensor detected fire first? (closest to source)
  - Time delay between sensors → estimate smoke propagation speed
  - PM2.5 gradient → estimate fire direction and distance
  
- **Temporal Analysis:**
  - Track PM2.5 levels over time at each sensor
  - Identify peak times → when smoke reached each location
  - Model smoke dispersion pattern

**Fire Size Estimation:**
- **PM2.5 Magnitude:**
  - Larger fires → higher PM2.5 concentrations
  - But depends on distance, wind, and atmospheric conditions
  
- **Spatial Extent:**
  - Number of sensors affected
  - Geographic spread of high PM2.5 readings
  - Can estimate fire size and intensity

**4. Integration with External Data:**

**Validation Sources:**
- **Fire Incident Reports:**
  - Compare detected events with official fire reports
  - Validate detection accuracy
  - Learn fire signatures from confirmed events
  
- **Satellite Data:**
  - MODIS/VIIRS fire detection products
  - Validate PM2.5-based detections
  - Improve model training
  
- **Weather Data:**
  - Wind speed/direction → smoke dispersion modeling
  - Fire weather indices (Fire Danger Rating)
  - Correlate fire risk with detected events

**5. Real-Time Fire Alert System:**

**Components:**
- Real-time PM2.5 monitoring
- Anomaly detection pipeline
- Fire classification model
- Alert generation (if fire probability > threshold)
- Integration with emergency services APIs

**Alert Criteria:**
- PM2.5 spike detected at multiple sensors
- Sustained high levels (>1 hour)
- Weather conditions indicate fire risk
- Spatial pattern suggests fire (not local source)

#### **Implementation Strategy:**

**Phase 1: Baseline Detection**
1. Identify historical PM2.5 spikes
2. Correlate with known fire events (if available)
3. Establish baseline fire signature patterns

**Phase 2: Model Development**
1. Label data: Fire vs. Non-fire events
2. Engineer features (PM2.5 patterns, weather, temporal)
3. Train classification models
4. Validate with known fire events

**Phase 3: Multi-Sensor Integration**
1. Combine data from all 5 sensors
2. Develop spatial-temporal fire detection
3. Track smoke propagation patterns

**Phase 4: Validation & Refinement**
1. Compare with external fire data
2. Reduce false positives (traffic, industrial sources)
3. Improve detection sensitivity

**Challenges:**
- Distinguishing fire smoke from other pollution sources
- False positives: traffic spikes, industrial emissions, agricultural burning
- Need for labeled data (known fire events)
- Sensor location information needed for spatial analysis
- Weather data integration (wind, precipitation)

**Expected Outcomes:**
- Early fire detection capability
- Fire location estimation (if sensors are geographically distributed)
- Smoke dispersion tracking
- Fire size/intensity estimation
- Real-time alert system for public safety

---

### 3. **Sensor Calibration & Cross-Validation**

**Objective:** Compare sensor readings and identify calibration issues.

**Approaches:**
- **Inter-Sensor Comparison:**
  - Correlation analysis between sensors
  - Regression models to predict one sensor from others
  - Identify sensors with systematic bias
  
- **Dual Sensor Validation (A vs B within same sensor):**
  - Compare `corr_pm2.5_a` vs `corr_pm2.5_b`
  - Analyze discrepancies to identify sensor drift
  - Validate that averaging (pm_cf1) is appropriate
  
- **Statistical Tests:**
  - Paired t-tests between sensor pairs
  - Bland-Altman plots for agreement analysis
  - Cross-correlation analysis

**Features:**
- Compare `pm_cf1` values across all 5 sensors at same timestamps
- Analyze spatial patterns if sensor locations are known
- Identify which sensors are most/least reliable

---

### 4. **Air Quality Classification**

**Objective:** Classify air quality into health-based categories (e.g., Good, Moderate, Unhealthy).

**Approaches:**
- **Classification Models:**
  - Logistic Regression
  - Random Forest Classifier
  - Gradient Boosting Classifier
  - Support Vector Classifier (SVC)
  - Neural Networks (Multi-layer Perceptron)

**Categories (EPA AQI-based):**
- Good (0-12.0 µg/m³)
- Moderate (12.1-35.4 µg/m³)
- Unhealthy for Sensitive Groups (35.5-55.4 µg/m³)
- Unhealthy (55.5-150.4 µg/m³)
- Very Unhealthy (150.5-250.4 µg/m³)
- Hazardous (≥250.5 µg/m³)

**Features:**
- Current `pm_cf1` value
- Historical trends (rate of change)
- Weather conditions (humidity, temperature)
- Time of day, day of week
- Cross-sensor readings

---

### 5. **Spatial Interpolation & Mapping**

**Objective:** Estimate PM2.5 concentrations at unmonitored locations (if sensor locations are available).

**Approaches:**
- **Geostatistical Methods:**
  - Kriging (Ordinary Kriging, Universal Kriging)
  - Inverse Distance Weighting (IDW)
  
- **Machine Learning Methods:**
  - Random Forest with spatial features
  - Gaussian Process Regression
  - Neural Networks with location embeddings

**Requirements:**
- Sensor GPS coordinates (may need to be obtained separately)
- Spatial correlation analysis
- Create pollution heat maps

---

### 6. **Feature Importance & Causal Analysis**

**Objective:** Understand which factors most influence PM2.5 concentrations.

**Approaches:**
- **Feature Importance:**
  - Random Forest feature importance
  - Permutation importance
  - SHAP (SHapley Additive exPlanations) values
  
- **Causal Inference:**
  - Granger Causality tests
  - Correlation vs. causation analysis
  - Time-lagged correlation analysis

**Questions to Answer:**
- Does temperature affect PM2.5? (inverse relationship expected)
- Does humidity affect PM2.5? (complex relationship)
- Are there daily/weekly patterns?
- Do sensors show consistent patterns?

---

### 7. **Missing Data Imputation**

**Objective:** Fill in missing values (especially for sensor 290694 with fewer data points).

**Approaches:**
- **Statistical Methods:**
  - Forward fill / backward fill
  - Linear interpolation
  - Seasonal interpolation
  
- **Machine Learning Methods:**
  - K-Nearest Neighbors imputation
  - Random Forest imputation
  - LSTM-based imputation for time series
  - MICE (Multiple Imputation by Chained Equations)

**Strategy:**
- Use other sensors' data to impute missing values
- Use temporal patterns within the same sensor
- Validate imputation quality

---

### 8. **Multi-Sensor Fusion**

**Objective:** Combine readings from multiple sensors to get more accurate estimates.

**Approaches:**
- **Ensemble Methods:**
  - Weighted averaging (weights based on sensor reliability)
  - Stacking (meta-learner on top of individual sensor models)
  - Voting regressors
  
- **Advanced Methods:**
  - Kalman Filtering for sensor fusion
  - Bayesian model averaging
  - Deep learning fusion networks

**Benefits:**
- Reduce noise and uncertainty
- Handle sensor failures gracefully
- Improve overall accuracy

---

### 9. **Pattern Recognition & Clustering**

**Objective:** Identify distinct patterns in air quality behavior.

**Approaches:**
- **Clustering:**
  - K-Means clustering on time series features
  - DBSCAN for density-based clustering
  - Hierarchical clustering
  - Time series clustering (DTW - Dynamic Time Warping)
  
- **Pattern Discovery:**
  - Identify typical daily patterns
  - Find pollution event signatures
  - Discover sensor-specific patterns

**Applications:**
- Categorize days by pollution patterns
- Identify typical vs. atypical behavior
- Group sensors with similar behavior

---

### 10. **Real-Time Monitoring & Alert System**

**Objective:** Build a system that can provide real-time air quality alerts.

**Components:**
- Real-time data ingestion pipeline
- Fast prediction models (lightweight ML models)
- Alert thresholds based on health guidelines
- Dashboard visualization

**Models:**
- Lightweight models for low latency (Random Forest, XGBoost)
- Pre-trained models that can be updated incrementally
- Rule-based systems combined with ML predictions

---

## Recommended Analysis Workflow

### Phase 1: Data Exploration & Understanding
1. Load all 5 sensor CSV files
2. Examine data quality (missing values, outliers, data gaps)
3. Basic statistics for `pm_cf1` across all sensors
4. Temporal coverage analysis (which sensors have complete data?)
5. Visualize time series for each sensor
6. Correlation analysis between sensors

### Phase 2: Data Preprocessing
1. Handle missing data (especially sensor 290694)
2. Identify and handle outliers
3. Create temporal features (hour, day, week, etc.)
4. Create lag features for time series models
5. Normalize/standardize features as needed
6. Split data into train/validation/test sets (temporal split, not random)

### Phase 3: Baseline Models
1. Simple statistical baselines (mean, median, last value)
2. Linear regression with temporal features
3. Simple time series models (ARIMA)
4. Establish performance benchmarks

### Phase 4: Advanced Modeling
1. Implement forecasting models (LSTM, XGBoost, etc.)
2. Implement classification models
3. Implement anomaly detection
4. Cross-validate and tune hyperparameters

### Phase 5: Evaluation & Interpretation
1. Compare model performance
2. Analyze feature importance
3. Visualize predictions vs. actuals
4. Identify model limitations
5. Generate insights and recommendations

### Phase 6: Deployment Considerations (if applicable)
1. Model serialization
2. Real-time prediction pipeline
3. Monitoring and retraining strategy

---

## Key Considerations

### Data Quality Issues
- **Sensor 290694** has significantly fewer data points (~3,741 vs ~20,000+). Investigate:
  - When did data collection start/stop?
  - Are there specific time periods missing?
  - Is this a sensor failure or deployment issue?

### Temporal Aspects
- Data spans one month (November 2025)
- 2-minute intervals provide high temporal resolution
- Consider daily patterns (morning rush, evening patterns)
- Consider weekly patterns (weekday vs. weekend)
- Limited to one month - may not capture seasonal patterns

### Sensor Redundancy
- Each sensor has A and B sub-sensors
- `pm_cf1` is already averaged and corrected
- Can use A/B comparison to detect sensor drift
- Can analyze agreement between A and B sensors

### Environmental Context
- Temperature and humidity data available
- Can explore relationships between weather and PM2.5
- May need external data (wind speed, wind direction) for more complete analysis

### Evaluation Metrics

**For Regression/Forecasting:**
- MAE (Mean Absolute Error)
- RMSE (Root Mean Squared Error)
- MAPE (Mean Absolute Percentage Error)
- R² (Coefficient of Determination)
- Directional Accuracy (for forecasting)

**For Classification:**
- Accuracy
- Precision, Recall, F1-Score
- Confusion Matrix
- ROC-AUC (if multi-class, use macro/micro averaging)

**For Anomaly Detection:**
- Precision, Recall, F1-Score
- Confusion Matrix
- May need domain expert validation for true positives

---

## Potential Research Questions

1. **Temporal Patterns:**
   - Are there consistent daily patterns in PM2.5?
   - Do weekends differ from weekdays?
   - Are there specific times of day with higher pollution?

2. **Sensor Reliability:**
   - Which sensors are most consistent?
   - Are there systematic biases between sensors?
   - How well do A and B sensors agree within each unit?

3. **Environmental Factors:**
   - How does temperature correlate with PM2.5?
   - How does humidity affect readings?
   - Can we predict PM2.5 from weather alone?

4. **Spatial Patterns (if locations known):**
   - Are there spatial clusters of high/low pollution?
   - Do nearby sensors show similar patterns?
   - Can we identify pollution sources?

5. **Forecasting:**
   - How far ahead can we accurately predict?
   - What features are most important for forecasting?
   - Do different sensors require different models?

---

## Tools & Libraries Recommended

**Python Ecosystem:**
- **Data Manipulation:** pandas, numpy
- **Visualization:** matplotlib, seaborn, plotly
- **Time Series:** statsmodels, pmdarima, prophet
- **Machine Learning:** scikit-learn, xgboost, lightgbm
- **Deep Learning:** tensorflow, pytorch, keras
- **Time Series ML:** darts, sktime
- **Geospatial (if needed):** geopandas, folium
- **Statistical Analysis:** scipy, statsmodels

**R Ecosystem (alternative):**
- **Time Series:** forecast, tseries, vars
- **ML:** caret, randomForest, xgboost
- **Visualization:** ggplot2, plotly

---

## Next Steps

1. **Data Loading & Initial Exploration:**
   - Download all 5 CSV files
   - Load into pandas DataFrames
   - Examine basic statistics and data quality
   - Create initial visualizations

2. **Data Quality Assessment:**
   - Identify missing data patterns
   - Investigate sensor 290694's data gap
   - Check for outliers and anomalies
   - Validate temporal coverage

3. **Feature Engineering:**
   - Create temporal features
   - Create lag features
   - Create rolling statistics
   - Prepare data for modeling

4. **Choose Primary Task:**
   - Based on project goals, select 1-2 main ML tasks to focus on
   - Start with simpler models and iterate
   - Build up to more complex models

5. **Iterative Development:**
   - Start with baseline models
   - Gradually add complexity
   - Evaluate and refine
   - Document findings

---

## Notes for AI Implementation

When implementing this plan with an AI assistant, provide:
1. This entire document for context
2. Specific task(s) you want to focus on
3. Any constraints (time, computational resources, etc.)
4. Preferred programming language (Python recommended)
5. Any specific models or approaches you want to prioritize
6. Whether you have sensor location data
7. Project goals (research, deployment, learning, etc.)

The AI can then generate appropriate code, handle data loading, implement models, and provide visualizations based on this comprehensive plan.

---

## Executive Summary for Professor Meeting

### Project Overview
**Air Quality Machine Learning Analysis** using PM2.5 sensor data from 5 sensors collected over November 2025 (2-minute intervals, ~20,000 data points per sensor).

### Key Machine Learning Objectives

#### 1. **Anomaly Detection**
**Goal:** Identify unusual patterns, sensor malfunctions, and pollution events.

**Approaches:**
- **Statistical Methods:**** Z-score, IQR, moving average with standard deviation bands
- **ML Methods:** Isolation Forest, One-Class SVM, Local Outlier Factor, Autoencoders
- **Time Series Methods:** STL decomposition, Prophet, LSTM-based autoencoders
- **Multi-Sensor:** Cross-sensor comparison to detect sensor-specific failures

**Applications:**
- Detect sensor calibration drift
- Identify pollution spikes (fires, industrial accidents)
- Find data quality issues
- Investigate sensor 290694's data gap

#### 2. **Weather & Precipitation Correlation**
**Goal:** Understand relationships between air quality and meteorological factors.

**Available Data:** Temperature and humidity from sensors (precipitation would need external sources)

**Methods:**
- **Correlation Analysis:** Pearson, Spearman, time-lagged correlations
- **Regression:** Multiple linear, polynomial, with interaction terms
- **ML Feature Importance:** Random Forest/XGBoost to identify important weather factors
- **Precipitation Analysis:** Event-based analysis (before/during/after rain), correlation with precipitation amount

**Expected Findings:**
- Negative correlation with temperature (higher temp → better mixing → lower PM2.5)
- Complex relationship with humidity
- Strong negative correlation with precipitation (rain washes out pollutants)

#### 3. **Fire Detection Using Smoke Patterns**
**Goal:** Detect and track wildfires using PM2.5 smoke signatures.

**Why PM2.5 Works:**
- Fires produce significant fine particulate matter
- Smoke plumes cause sudden, dramatic PM2.5 increases
- Can detect fires before they're visible or reported

**Detection Methods:**
- **Anomaly-Based:** Sudden spike detection, multi-sensor confirmation, temporal pattern recognition
- **ML Classification:** Binary (Fire vs. Normal) or Multi-class (Fire, Traffic, Industrial, Normal, Sensor Error)
- **Time Series Models:** LSTM/GRU for sequence classification, CNN-LSTM hybrid
- **Fire Tracking:** Spatial-temporal analysis, smoke plume tracking, fire size estimation

**Features:**
- PM2.5 rate of change, rolling maximums
- Multi-sensor spatial patterns
- Weather features (temperature, humidity, wind)
- Temporal patterns (fire signatures vs. traffic spikes)

**Integration:**
- Validate with fire incident reports
- Cross-reference with satellite data (MODIS/VIIRS)
- Real-time alert system for public safety

### Additional ML Tasks Available

4. **Time Series Forecasting** (LSTM, ARIMA, XGBoost)
5. **Air Quality Classification** (EPA AQI categories)
6. **Sensor Calibration & Cross-Validation**
7. **Missing Data Imputation** (especially for sensor 290694)
8. **Multi-Sensor Fusion** (ensemble methods, Kalman filtering)
9. **Pattern Recognition & Clustering** (K-means, DBSCAN, time series clustering)

### Implementation Plan

**Phase 1:** Data exploration and quality assessment
**Phase 2:** Feature engineering (temporal, lag features, weather interactions)
**Phase 3:** Baseline models (statistical methods, simple ML)
**Phase 4:** Advanced models (deep learning, ensemble methods)
**Phase 5:** Evaluation, interpretation, and insights

### Expected Deliverables

1. **Anomaly Detection System:** Identify sensor issues and pollution events
2. **Weather Correlation Analysis:** Quantify relationships between PM2.5 and temperature/humidity/precipitation
3. **Fire Detection Model:** Classify fire events from PM2.5 patterns
4. **Visualizations:** Time series plots, correlation heatmaps, anomaly detection results
5. **Model Performance Metrics:** Accuracy, precision, recall for classification; MAE, RMSE for regression

### Technical Stack
- **Python:** pandas, numpy, scikit-learn, xgboost
- **Deep Learning:** TensorFlow/Keras, PyTorch
- **Time Series:** statsmodels, pmdarima, darts
- **Visualization:** matplotlib, seaborn, plotly

### Research Questions
1. Can we detect fires earlier than traditional methods using PM2.5 patterns?
2. How much variance in PM2.5 can weather factors explain?
3. Which sensors are most reliable, and can we identify calibration issues?
4. What are the temporal patterns in air quality (daily, weekly cycles)?
5. Can we predict future PM2.5 levels using historical data and weather?

### Next Steps
1. Load and explore the 5 sensor datasets
2. Implement anomaly detection pipeline
3. Perform weather correlation analysis
4. Develop fire detection classification model
5. Validate findings with external data sources (if available)
