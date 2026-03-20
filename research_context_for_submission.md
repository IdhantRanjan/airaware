# Research Context: Air Quality Machine Learning Project
## Comprehensive Dataset Description and Methodology for Conference/Journal Submission

---

## 1. PROJECT OVERVIEW

### 1.1 Research Domain
**Environmental Monitoring, Air Quality Assessment, Time Series Machine Learning, Sensor Networks, Anomaly Detection, Fire Detection Systems**

### 1.2 Core Research Questions
1. Can machine learning models effectively detect anomalies in air quality sensor networks, including sensor malfunctions and pollution events?
2. What are the quantitative relationships between meteorological factors (temperature, humidity, precipitation) and PM2.5 concentrations?
3. Can PM2.5 sensor networks be used for early wildfire detection through smoke pattern recognition?
4. How can multi-sensor fusion improve the reliability and accuracy of air quality monitoring?
5. What temporal patterns exist in PM2.5 concentrations, and can they be accurately forecasted?

### 1.3 Research Contributions (Novelty)
- **Multi-sensor anomaly detection framework** combining statistical, ML, and deep learning approaches
- **Weather-PM2.5 correlation analysis** with time-lagged relationships and interaction effects
- **Fire detection system** using PM2.5 smoke signatures with multi-sensor spatial-temporal analysis
- **Dual-sensor validation methodology** leveraging A/B sensor redundancy for quality assurance
- **High-temporal-resolution analysis** (2-minute intervals) enabling fine-grained pattern detection
- **Comprehensive ML pipeline** from data quality assessment to real-time monitoring systems

---

## 2. DATASET DESCRIPTION

### 2.1 Data Source
- **Repository:** https://github.com/DrKoz/ACS_AQ
- **Data Type:** Air Quality Sensor Network Data
- **Primary Pollutant:** PM2.5 (Fine Particulate Matter, diameter ≤ 2.5 micrometers)

### 2.2 Temporal Coverage
- **Time Period:** November 1-29, 2025 (29 days)
- **Sampling Frequency:** 2-minute intervals
- **Total Possible Measurements:** ~20,880 per sensor (29 days × 24 hours × 30 measurements/hour)
- **Temporal Resolution:** High-frequency time series data suitable for:
  - Short-term pattern detection
  - Real-time monitoring applications
  - Fine-grained anomaly detection
  - Temporal correlation analysis

### 2.3 Sensor Network
- **Number of Sensors:** 5 independent sensor units
- **Sensor IDs:** 230019, 249443, 249445, 290694, 297697
- **Sensor Architecture:** Each sensor unit contains dual sub-sensors (A and B) for redundancy and validation
- **Data Completeness:**
  - Sensor 230019: ~20,559 measurements (98.5% coverage)
  - Sensor 249443: ~20,366 measurements (97.5% coverage)
  - Sensor 249445: ~20,678 measurements (99.0% coverage)
  - Sensor 290694: ~3,741 measurements (17.9% coverage) - **Data Quality Issue**
  - Sensor 297697: ~20,674 measurements (99.0% coverage)
- **Total Dataset Size:** ~85,000+ data points across all sensors

### 2.4 Data Structure and Variables

#### 2.4.1 Primary Variables
- **`pm_cf1`** (PRIMARY TARGET VARIABLE):
  - EPA-corrected and averaged PM2.5 concentration
  - Calculated from dual sensors A and B
  - Units: µg/m³ (micrograms per cubic meter)
  - Range: Typically 0-500+ µg/m³ (varies by location and conditions)
  - EPA AQI Categories:
    - Good: 0-12.0 µg/m³
    - Moderate: 12.1-35.4 µg/m³
    - Unhealthy for Sensitive Groups: 35.5-55.4 µg/m³
    - Unhealthy: 55.5-150.4 µg/m³
    - Very Unhealthy: 150.5-250.4 µg/m³
    - Hazardous: ≥250.5 µg/m³

#### 2.4.2 Raw Sensor Readings
- **`corr_pm2.5_a`**: Corrected PM2.5 from sensor A (µg/m³)
- **`pm2.5_cf_1_a`**: PM2.5 CF1 reading from sensor A (µg/m³)
- **`corr_pm2.5_b`**: Corrected PM2.5 from sensor B (µg/m³)
- **`pm2.5_cf_1_b`**: PM2.5 CF1 reading from sensor B (µg/m³)
- **Purpose:** Enable dual-sensor validation, drift detection, and quality assurance

#### 2.4.3 Meteorological Variables
- **`temperature_a`, `temperature_b`**: Temperature readings from sensors A and B
  - Units: Typically Celsius or Fahrenheit (verify in data)
  - Use: Correlation analysis, feature engineering, fire risk assessment
- **`humidity_a`, `humidity_b`**: Humidity readings from sensors A and B
  - Units: Typically percentage (%) or absolute humidity
  - Use: Weather-PM2.5 correlation, feature engineering

#### 2.4.4 Metadata
- **`time_stamp`**: Timestamp of measurement
  - Format: YYYY-MM-DD HH:MM:SS
  - Use: Temporal feature engineering, time series analysis
- **`sensor_index`**: Sensor identifier
  - Values: 230019, 249443, 249445, 290694, 297697
  - Use: Multi-sensor analysis, spatial patterns (if locations known)

### 2.5 Data Quality Characteristics

#### 2.5.1 Strengths
- **High temporal resolution:** 2-minute intervals enable fine-grained analysis
- **Dual-sensor redundancy:** A/B sensors allow quality validation
- **EPA-corrected values:** `pm_cf1` is pre-processed and calibrated
- **Multi-sensor network:** 5 sensors enable cross-validation and spatial analysis
- **Meteorological data:** Temperature and humidity included for correlation analysis
- **Extended time period:** 29 days sufficient for daily/weekly pattern detection

#### 2.5.2 Data Quality Issues
- **Sensor 290694:** Only 17.9% data coverage (~3,741 vs. ~20,000+ expected)
  - Potential causes: Sensor failure, deployment delay, communication issues
  - Research opportunity: Missing data imputation, failure analysis
- **Missing external data:**
  - Precipitation data not included (requires external sources: NOAA, Weather APIs)
  - Wind speed/direction not available (would enhance fire detection and dispersion modeling)
  - Sensor GPS coordinates not provided (limits spatial analysis)
- **Limited temporal scope:**
  - Single month (November) limits seasonal pattern analysis
  - May not capture long-term trends or seasonal variations

#### 2.5.3 Data Preprocessing Requirements
- Handle missing values (especially sensor 290694)
- Identify and validate outliers (potential anomalies vs. data errors)
- Temporal alignment across sensors (synchronize timestamps)
- Normalization/standardization for ML models
- Feature engineering (temporal, lag, rolling statistics)

---

## 3. MACHINE LEARNING TASKS AND METHODOLOGIES

### 3.1 Task 1: Anomaly Detection

#### 3.1.1 Problem Statement
Detect unusual patterns in PM2.5 time series data, including:
- Sensor malfunctions and calibration drift
- Pollution events (fires, industrial accidents, traffic incidents)
- Data quality issues (missing patterns, communication errors)
- Unusual weather-pollution interactions

#### 3.1.2 Methodology

**A. Statistical Methods (Baseline)**
- **Z-Score Detection:**
  - Calculate: `z = (x - μ) / σ`
  - Threshold: |z| > 3 (or adaptive threshold)
  - Application: Per-sensor or global detection
  
- **Interquartile Range (IQR) Method:**
  - Calculate Q1 (25th percentile), Q3 (75th percentile)
  - Flag values outside [Q1 - 1.5×IQR, Q3 + 1.5×IQR]
  - Robust to outliers, non-parametric
  
- **Moving Average with Standard Deviation Bands:**
  - Rolling window: 24 hours (720 measurements)
  - Flag values outside mean ± 2×std or mean ± 3×std
  - Adapts to local trends

**B. Machine Learning Methods**
- **Isolation Forest:**
  - Unsupervised anomaly detection
  - Features: PM2.5, temperature, humidity, temporal features
  - Advantages: Fast, scalable, handles high-dimensional data
  
- **One-Class SVM:**
  - Learns boundary around "normal" data
  - Good for detecting novel patterns
  - Requires hyperparameter tuning
  
- **Local Outlier Factor (LOF):**
  - Density-based detection
  - Identifies points with lower density than neighbors
  - Good for local anomalies

**C. Deep Learning Methods**
- **Autoencoders:**
  - Neural network: compress → reconstruct
  - High reconstruction error = anomaly
  - Can learn complex patterns
  
- **LSTM-based Autoencoders:**
  - Sequence-to-sequence architecture
  - Input: sliding window (e.g., 24-hour sequence)
  - Captures temporal dependencies
  - High reconstruction error indicates temporal anomalies

**D. Time Series Specific Methods**
- **Seasonal Decomposition (STL):**
  - Decompose: Trend + Seasonal + Residual
  - Flag anomalies in residual component
  - Handles daily/weekly seasonality
  
- **Prophet Anomaly Detection:**
  - Facebook's Prophet model
  - Automatic seasonality handling
  - Provides uncertainty intervals

**E. Multi-Sensor Anomaly Detection**
- **Cross-Sensor Comparison:**
  - Compare readings across all 5 sensors at same timestamp
  - Flag sensors deviating significantly from others
  - Detects sensor-specific failures
  
- **Spatial-Temporal Anomalies:**
  - If sensors geographically distributed: detect spatial anomalies
  - Unusual patterns in one location vs. others
  - Indicates localized pollution events

#### 3.1.3 Evaluation Metrics
- Precision, Recall, F1-Score
- Confusion Matrix
- Domain expert validation (if ground truth available)
- Comparison with known events (fire reports, sensor maintenance logs)

#### 3.1.4 Expected Contributions
- Comprehensive anomaly detection framework combining multiple approaches
- Multi-sensor validation methodology
- Real-time anomaly detection pipeline

---

### 3.2 Task 2: Weather and Precipitation Correlation Analysis

#### 3.2.1 Problem Statement
Quantify relationships between PM2.5 concentrations and meteorological factors:
- Temperature effects on PM2.5
- Humidity effects on PM2.5
- Precipitation effects (if external data available)
- Time-lagged relationships
- Interaction effects between weather variables

#### 3.2.2 Methodology

**A. Correlation Analysis**
- **Pearson Correlation:**
  - Linear relationships: PM2.5 vs. Temperature, PM2.5 vs. Humidity
  - Expected: Negative correlation with temperature (higher temp → better mixing → lower PM2.5)
  
- **Spearman Rank Correlation:**
  - Non-parametric, monotonic relationships
  - Robust to outliers
  
- **Time-Lagged Correlation:**
  - Cross-correlation function (CCF)
  - Find optimal lag: Does today's weather affect tomorrow's PM2.5?
  - Lags: 1h, 6h, 12h, 24h, 48h

**B. Regression Analysis**
- **Multiple Linear Regression:**
  - Model: `PM2.5 = β₀ + β₁×Temperature + β₂×Humidity + ε`
  - Interpret coefficients
  - Check multicollinearity
  
- **Polynomial Regression:**
  - Capture non-linear relationships
  - Example: Quadratic temperature effect
  
- **Interaction Terms:**
  - Model: `PM2.5 ~ Temperature × Humidity`
  - High humidity + high temperature may have different effect

**C. Machine Learning Feature Importance**
- **Random Forest / XGBoost:**
  - Predict PM2.5 using weather + temporal features
  - Extract feature importance scores
  - Identify most important weather factors
  
- **SHAP Values:**
  - Explainable AI: individual prediction explanations
  - Visualize feature contributions
  - Understand feature interactions

**D. Precipitation Analysis (If External Data Available)**
- **Data Sources:**
  - NOAA Climate Data Online (CDO)
  - OpenWeatherMap API
  - Weather Underground API
  - Local weather stations
  
- **Event-Based Analysis:**
  - Compare PM2.5: before, during, after precipitation
  - Quantify "washout" effect
  - Duration of effect
  
- **Precipitation Amount Correlation:**
  - Correlate PM2.5 with precipitation (mm)
  - Light vs. heavy rain effects
  - Cumulative precipitation over time windows

**E. Advanced Weather Feature Engineering**
- **Temperature Features:**
  - Current temperature
  - Temperature change (ΔT over 1h, 6h, 24h)
  - Daily min/max temperature
  - Temperature gradient (if multiple sensors)
  
- **Humidity Features:**
  - Current humidity
  - Humidity change rate
  - Dew point (calculated: temp + humidity)
  - Relative vs. absolute humidity
  
- **Combined Indices:**
  - Heat index (temperature + humidity)
  - Atmospheric stability indicators
  - Mixing height (if wind data available)

**F. Weather-Only Prediction Models**
- **Baseline Question:** How much PM2.5 variance can weather explain?
- **Models:** Random Forest, XGBoost, Neural Networks
- **Features:** Weather only (no historical PM2.5)
- **Evaluation:** R², MAE, RMSE

#### 3.2.3 Expected Findings
- **Temperature:** Negative correlation (higher temp → lower PM2.5 due to atmospheric mixing)
- **Humidity:** Complex relationship (can trap pollutants but also promote settling)
- **Precipitation:** Strong negative correlation (rain washes out particles)
- **Time Lags:** Weather effects may be delayed (e.g., yesterday's rain affects today's PM2.5)

#### 3.2.4 Evaluation Metrics
- Correlation coefficients (Pearson, Spearman)
- Regression metrics: R², MAE, RMSE, MAPE
- Feature importance scores
- SHAP value visualizations

---

### 3.3 Task 3: Fire Detection Using Smoke Patterns

#### 3.3.1 Problem Statement
Detect and track wildfires or fire events using PM2.5 smoke signatures:
- Early fire detection (before visible/reported)
- Distinguish fire smoke from other pollution sources
- Track smoke dispersion and fire progression
- Estimate fire location and intensity

#### 3.3.2 Why PM2.5 Works for Fire Detection
- Fires produce significant fine particulate matter
- Smoke plumes cause sudden, dramatic PM2.5 increases
- PM2.5 sensors can detect fires earlier than visual methods
- Can track smoke dispersion patterns

#### 3.3.3 Methodology

**A. Anomaly-Based Fire Detection**
- **Sudden Spike Detection:**
  - Rapid increases: >50% increase in 1 hour
  - Threshold: PM2.5 > 150 µg/m³ (Unhealthy level)
  - Rate of change: d(PM2.5)/dt > threshold
  
- **Multi-Sensor Confirmation:**
  - Multiple sensors detect spikes simultaneously → regional event
  - Single sensor spike → local source or sensor error
  - Spatial pattern: which sensors detect first? (indicates direction)
  
- **Temporal Pattern Recognition:**
  - Fire signature: Sudden rise → Sustained high → Gradual decline
  - Different from: Traffic spikes (shorter), Industrial emissions (more regular)

**B. Machine Learning Classification**

**Feature Engineering:**
- **PM2.5 Features:**
  - Current PM2.5 value
  - Rate of change (1h, 6h, 24h)
  - Rolling maximum (sustained high levels)
  - PM2.5 gradient across sensors (spatial spread)
  
- **Temporal Features:**
  - Time of day, day of week
  - Season (fire season vs. non-fire season)
  
- **Weather Features:**
  - Temperature (high → fire risk)
  - Humidity (low → fire risk)
  - Wind speed/direction (if available) → smoke dispersion
  - Precipitation (recent rain → lower fire risk)
  
- **Multi-Sensor Features:**
  - Number of sensors detecting high PM2.5
  - Spatial correlation between sensors
  - Time delay between sensor detections (smoke propagation)

**Classification Models:**
- **Binary Classification:**
  - Classes: Fire Event vs. Normal
  - Models: Random Forest, XGBoost, Neural Networks
  - Features: PM2.5 patterns, weather, temporal
  
- **Multi-Class Classification:**
  - Classes: Normal, Traffic Spike, Industrial Emission, Fire Event, Sensor Error
  - Requires labeled data or unsupervised clustering first

**C. Deep Learning Time Series Models**
- **LSTM/GRU Sequence Classification:**
  - Input: Sequence of PM2.5 values (e.g., 24-hour window)
  - Output: Fire Event probability
  - Learns complex temporal fire signatures
  
- **CNN-LSTM Hybrid:**
  - CNN: Extracts local patterns (spikes, trends)
  - LSTM: Captures long-term dependencies
  - Good for detecting fire events in time series

**D. Fire Tracking and Dispersion Modeling**
- **Spatial Analysis (If Sensor Locations Known):**
  - Which sensor detected first? (closest to source)
  - Time delay between sensors → estimate smoke propagation speed
  - PM2.5 gradient → estimate fire direction and distance
  
- **Temporal Analysis:**
  - Track PM2.5 levels over time at each sensor
  - Identify peak times → when smoke reached each location
  - Model smoke dispersion pattern

**E. Fire Size Estimation**
- **PM2.5 Magnitude:**
  - Larger fires → higher PM2.5 concentrations
  - Depends on: distance, wind, atmospheric conditions
  
- **Spatial Extent:**
  - Number of sensors affected
  - Geographic spread of high PM2.5 readings
  - Estimate fire size and intensity

**F. Integration with External Data**
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

**G. Real-Time Fire Alert System**
- **Components:**
  - Real-time PM2.5 monitoring
  - Anomaly detection pipeline
  - Fire classification model
  - Alert generation (if fire probability > threshold)
  - Integration with emergency services APIs
  
- **Alert Criteria:**
  - PM2.5 spike at multiple sensors
  - Sustained high levels (>1 hour)
  - Weather conditions indicate fire risk
  - Spatial pattern suggests fire (not local source)

#### 3.3.4 Evaluation Metrics
- Classification: Accuracy, Precision, Recall, F1-Score, ROC-AUC
- Confusion Matrix
- Comparison with fire incident reports (ground truth)
- False positive rate (traffic, industrial sources)
- Detection time (how early can we detect?)

#### 3.3.5 Expected Contributions
- Early fire detection system using low-cost PM2.5 sensors
- Multi-sensor spatial-temporal fire detection
- Distinguishing fire smoke from other pollution sources
- Real-time alert system for public safety

---

### 3.4 Task 4: Time Series Forecasting

#### 3.4.1 Problem Statement
Predict future PM2.5 concentrations based on historical patterns and features.

#### 3.4.2 Methodology

**A. Traditional Time Series Models**
- **ARIMA (AutoRegressive Integrated Moving Average):**
  - Captures autocorrelation and moving averages
  - Requires stationarity
  
- **SARIMA (Seasonal ARIMA):**
  - Captures daily/weekly seasonal patterns
  - Good for periodic behavior
  
- **Exponential Smoothing (Holt-Winters):**
  - Handles trend and seasonality
  - Simple and interpretable

**B. Machine Learning Models**
- **Random Forest Regressor:**
  - Features: Lag features, rolling statistics, temporal, weather
  - Handles non-linear relationships
  
- **Gradient Boosting (XGBoost, LightGBM):**
  - State-of-the-art performance
  - Feature importance available
  
- **Support Vector Regression (SVR):**
  - Good for non-linear relationships
  - Requires feature scaling

**C. Deep Learning Models**
- **LSTM (Long Short-Term Memory):**
  - Captures long-term dependencies
  - Sequence-to-one or sequence-to-sequence
  
- **GRU (Gated Recurrent Unit):**
  - Simpler than LSTM, often comparable performance
  
- **Transformer-based Models:**
  - Temporal Fusion Transformer
  - Attention mechanisms
  
- **CNN-LSTM Hybrid:**
  - CNN extracts local patterns
  - LSTM captures temporal dependencies

**D. Feature Engineering**
- **Lag Features:** PM2.5 at t-1, t-2, t-3, ..., t-n
- **Rolling Statistics:** Moving averages, rolling std, rolling min/max
- **Temporal Features:** Hour, day of week, day of month
- **Weather Features:** Temperature, humidity, interactions
- **Cross-Sensor Features:** Other sensors' readings as features

**E. Forecasting Horizons**
- **Short-term:** 1-6 hours ahead
- **Medium-term:** 6-24 hours ahead
- **Long-term:** 1-7 days ahead

#### 3.4.3 Evaluation Metrics
- MAE (Mean Absolute Error)
- RMSE (Root Mean Squared Error)
- MAPE (Mean Absolute Percentage Error)
- R² (Coefficient of Determination)
- Directional Accuracy (for forecasting)

---

### 3.5 Task 5: Air Quality Classification

#### 3.5.1 Problem Statement
Classify air quality into health-based categories (EPA AQI).

#### 3.5.2 Methodology
- **Models:** Logistic Regression, Random Forest, XGBoost, SVM, Neural Networks
- **Features:** Current PM2.5, trends, weather, temporal, cross-sensor
- **Classes:** Good, Moderate, Unhealthy for Sensitive Groups, Unhealthy, Very Unhealthy, Hazardous

#### 3.5.3 Evaluation Metrics
- Accuracy, Precision, Recall, F1-Score
- Confusion Matrix
- ROC-AUC (multi-class)

---

### 3.6 Task 6: Sensor Calibration and Cross-Validation

#### 3.6.1 Problem Statement
Compare sensor readings, identify calibration issues, validate sensor reliability.

#### 3.6.2 Methodology
- **Inter-Sensor Comparison:** Correlation, regression, bias detection
- **Dual Sensor Validation:** Compare A vs. B within same sensor
- **Statistical Tests:** Paired t-tests, Bland-Altman plots, cross-correlation

---

### 3.7 Task 7: Missing Data Imputation

#### 3.7.1 Problem Statement
Fill missing values, especially for sensor 290694.

#### 3.7.2 Methodology
- **Statistical:** Forward fill, backward fill, linear interpolation, seasonal interpolation
- **ML:** KNN imputation, Random Forest imputation, LSTM-based imputation, MICE
- **Strategy:** Use other sensors' data, temporal patterns, validate quality

---

### 3.8 Task 8: Multi-Sensor Fusion

#### 3.8.1 Problem Statement
Combine readings from multiple sensors for more accurate estimates.

#### 3.8.2 Methodology
- **Ensemble Methods:** Weighted averaging, stacking, voting regressors
- **Advanced:** Kalman Filtering, Bayesian model averaging, deep learning fusion

---

### 3.9 Task 9: Pattern Recognition and Clustering

#### 3.9.1 Problem Statement
Identify distinct patterns in air quality behavior.

#### 3.9.2 Methodology
- **Clustering:** K-Means, DBSCAN, Hierarchical, Time series clustering (DTW)
- **Applications:** Categorize days by pollution patterns, identify typical vs. atypical behavior

---

## 4. EXPERIMENTAL DESIGN

### 4.1 Data Preprocessing Pipeline
1. **Data Loading:** Load all 5 CSV files into pandas DataFrames
2. **Data Quality Assessment:**
   - Identify missing values and patterns
   - Investigate sensor 290694's data gap
   - Check for outliers and anomalies
   - Validate temporal coverage
3. **Data Cleaning:**
   - Handle missing values
   - Temporal alignment across sensors
   - Outlier detection and validation
4. **Feature Engineering:**
   - Temporal features (hour, day, week, etc.)
   - Lag features for time series
   - Rolling statistics
   - Weather feature interactions
   - Cross-sensor features
5. **Data Splitting:**
   - Temporal split (not random): Train (70%), Validation (15%), Test (15%)
   - Preserve temporal order

### 4.2 Model Development Workflow
1. **Baseline Models:**
   - Simple statistical baselines (mean, median, last value)
   - Linear regression with temporal features
   - Simple time series models (ARIMA)
2. **Advanced Models:**
   - Machine learning models (Random Forest, XGBoost)
   - Deep learning models (LSTM, GRU, Autoencoders)
   - Ensemble methods
3. **Hyperparameter Tuning:**
   - Grid search or random search
   - Cross-validation (time series aware)
4. **Model Evaluation:**
   - Compare all models on test set
   - Analyze feature importance
   - Visualize predictions vs. actuals

### 4.3 Validation Strategy
- **Temporal Cross-Validation:** Time series aware splitting
- **External Validation:** Compare with fire reports, satellite data (if available)
- **Domain Expert Validation:** Anomaly detection results validated by experts
- **Ablation Studies:** Remove features/components to understand contributions

---

## 5. EXPECTED RESULTS AND CONTRIBUTIONS

### 5.1 Anomaly Detection
- Comprehensive framework combining statistical, ML, and deep learning
- Multi-sensor validation methodology
- Detection of sensor malfunctions and pollution events
- Real-time anomaly detection pipeline

### 5.2 Weather Correlation
- Quantitative relationships between PM2.5 and temperature/humidity
- Time-lagged effects
- Interaction effects
- Feature importance rankings
- Precipitation effects (if data available)

### 5.3 Fire Detection
- Early fire detection capability
- Multi-class classification (Fire vs. Traffic vs. Industrial vs. Normal)
- Spatial-temporal fire tracking
- Real-time alert system
- Comparison with traditional fire detection methods

### 5.4 Forecasting
- Accurate short-term and medium-term PM2.5 predictions
- Feature importance for forecasting
- Comparison of traditional vs. ML vs. deep learning approaches

### 5.5 Sensor Network Analysis
- Sensor reliability assessment
- Calibration issue detection
- Multi-sensor fusion improvements
- Missing data imputation strategies

---

## 6. TECHNICAL STACK

### 6.1 Programming Language
- **Primary:** Python 3.8+

### 6.2 Libraries and Frameworks
- **Data Manipulation:** pandas, numpy
- **Visualization:** matplotlib, seaborn, plotly
- **Time Series:** statsmodels, pmdarima, prophet, darts, sktime
- **Machine Learning:** scikit-learn, xgboost, lightgbm
- **Deep Learning:** tensorflow, pytorch, keras
- **Statistical Analysis:** scipy, statsmodels
- **Explainable AI:** SHAP, LIME
- **Geospatial (if needed):** geopandas, folium

### 6.3 Development Tools
- Jupyter Notebooks for exploration
- Python scripts for production code
- Git for version control
- MLflow or Weights & Biases for experiment tracking

---

## 7. LIMITATIONS AND CHALLENGES

### 7.1 Data Limitations
- **Single Month:** November 2025 only, limits seasonal analysis
- **Missing Sensor Data:** Sensor 290694 has only 17.9% coverage
- **No Precipitation Data:** Requires external data sources
- **No Wind Data:** Would enhance fire detection and dispersion modeling
- **Unknown Sensor Locations:** Limits spatial analysis
- **No Ground Truth Labels:** Fire events, anomaly labels may need manual annotation

### 7.2 Methodological Challenges
- **Distinguishing Fire Smoke:** From traffic spikes, industrial emissions, agricultural burning
- **False Positives:** Anomaly detection may flag normal variations
- **Temporal Patterns:** Limited to one month may not capture all patterns
- **Model Generalization:** Models trained on November may not generalize to other months
- **Labeled Data:** Fire detection requires labeled events (may need manual annotation or external data)

### 7.3 Computational Considerations
- **Deep Learning Models:** LSTM, autoencoders require significant computation
- **Hyperparameter Tuning:** Can be time-consuming
- **Real-Time Systems:** Need lightweight models for deployment

---

## 8. FUTURE WORK AND EXTENSIONS

### 8.1 Data Extensions
- **Extended Temporal Coverage:** Multiple months/years for seasonal analysis
- **Additional Sensors:** Expand sensor network
- **External Data Integration:**
  - Precipitation data (NOAA, Weather APIs)
  - Wind speed/direction
  - Satellite data (MODIS/VIIRS for fire validation)
  - Fire incident reports
- **Sensor Location Data:** Enable spatial analysis and mapping

### 8.2 Methodological Extensions
- **Transfer Learning:** Pre-train on larger datasets, fine-tune on this data
- **Online Learning:** Models that adapt in real-time
- **Uncertainty Quantification:** Bayesian methods, ensemble uncertainty
- **Causal Inference:** Beyond correlation, understand causation
- **Multi-Task Learning:** Jointly learn forecasting, classification, anomaly detection

### 8.3 Application Extensions
- **Real-Time Monitoring Dashboard:** Web application for live monitoring
- **Mobile App:** Public-facing air quality alerts
- **Integration with Emergency Services:** Automated fire alerts
- **Policy Recommendations:** Data-driven air quality management

---

## 9. RELATED WORK AND LITERATURE

### 9.1 Air Quality Machine Learning
- Time series forecasting of air pollutants
- Sensor network calibration and fusion
- Anomaly detection in environmental monitoring

### 9.2 Fire Detection Systems
- Satellite-based fire detection (MODIS, VIIRS)
- Ground-based sensor networks
- Early warning systems

### 9.3 Weather-Air Quality Relationships
- Meteorological factors affecting PM2.5
- Precipitation washout effects
- Temperature inversions and pollution trapping

### 9.4 Sensor Networks
- Multi-sensor fusion
- Sensor calibration and validation
- Missing data imputation in sensor networks

---

## 10. PUBLICATION VENUES

### 10.1 Conference Venues
- **ICML, NeurIPS, ICLR:** Machine learning focus
- **KDD, ICDM:** Data mining and knowledge discovery
- **AAAI, IJCAI:** Artificial intelligence
- **IGARSS:** Geoscience and remote sensing (if spatial analysis included)
- **Environmental Science Conferences:** Air quality, environmental monitoring

### 10.2 Journal Venues
- **Machine Learning Journals:** Journal of Machine Learning Research, Machine Learning
- **Environmental Science Journals:** Atmospheric Environment, Environmental Science & Technology
- **Applied AI Journals:** Applied Intelligence, Expert Systems with Applications
- **Sensor Network Journals:** IEEE Sensors Journal, Sensors

### 10.3 Paper Structure Suggestions
1. **Abstract:** Problem, methodology, key results
2. **Introduction:** Motivation, research questions, contributions
3. **Related Work:** Literature review
4. **Dataset Description:** Comprehensive data description (this document)
5. **Methodology:** Detailed ML approaches for each task
6. **Experimental Setup:** Preprocessing, model selection, evaluation
7. **Results:** Quantitative results, visualizations, analysis
8. **Discussion:** Insights, limitations, implications
9. **Conclusion and Future Work**

---

## 11. KEY RESEARCH QUESTIONS FOR PAPER

1. **Can multi-sensor PM2.5 networks effectively detect anomalies including sensor malfunctions and pollution events?**
   - Compare statistical, ML, and deep learning approaches
   - Evaluate multi-sensor validation methodology

2. **What are the quantitative relationships between meteorological factors and PM2.5 concentrations?**
   - Correlation analysis, regression, feature importance
   - Time-lagged effects, interaction effects

3. **Can PM2.5 sensor networks be used for early wildfire detection?**
   - Classification accuracy, early detection capability
   - Comparison with traditional methods
   - False positive analysis

4. **How can multi-sensor fusion improve air quality monitoring reliability?**
   - Compare single-sensor vs. multi-sensor approaches
   - Sensor reliability assessment
   - Missing data imputation effectiveness

5. **What temporal patterns exist in PM2.5 concentrations, and can they be accurately forecasted?**
   - Pattern discovery (daily, weekly cycles)
   - Forecasting accuracy across different horizons
   - Feature importance for forecasting

---

## 12. METRICS AND EVALUATION FRAMEWORK

### 12.1 Regression/Forecasting Metrics
- **MAE (Mean Absolute Error):** Average absolute difference
- **RMSE (Root Mean Squared Error):** Penalizes large errors more
- **MAPE (Mean Absolute Percentage Error):** Percentage error
- **R² (Coefficient of Determination):** Variance explained
- **Directional Accuracy:** Correct direction of change prediction

### 12.2 Classification Metrics
- **Accuracy:** Overall correctness
- **Precision:** True positives / (True positives + False positives)
- **Recall:** True positives / (True positives + False negatives)
- **F1-Score:** Harmonic mean of precision and recall
- **ROC-AUC:** Area under ROC curve (binary) or macro/micro averaging (multi-class)
- **Confusion Matrix:** Detailed class-wise performance

### 12.3 Anomaly Detection Metrics
- **Precision, Recall, F1-Score:** Based on anomaly vs. normal classification
- **Confusion Matrix:** True/False positives/negatives
- **Domain Expert Validation:** Manual review of detected anomalies
- **Comparison with Known Events:** Fire reports, sensor maintenance logs

### 12.4 Correlation Analysis Metrics
- **Pearson Correlation Coefficient:** Linear relationships
- **Spearman Rank Correlation:** Monotonic relationships
- **Cross-Correlation Function:** Time-lagged relationships
- **Regression Metrics:** R², MAE, RMSE for weather-PM2.5 models

---

## 13. DELIVERABLES

### 13.1 Code and Implementation
- Data preprocessing pipeline
- Feature engineering scripts
- Model implementations (all tasks)
- Evaluation scripts
- Visualization code
- Real-time monitoring system (if applicable)

### 13.2 Results and Analysis
- Model performance metrics (tables, figures)
- Feature importance analysis
- Anomaly detection results
- Weather correlation analysis
- Fire detection results
- Forecasting results
- Visualizations (time series, heatmaps, scatter plots)

### 13.3 Documentation
- Code documentation
- Methodology documentation
- Results interpretation
- Limitations and future work

### 13.4 Paper/Publication
- Conference or journal submission
- Supplementary materials
- Reproducibility package (code, data preprocessing steps)

---

## 14. TIMELINE AND MILESTONES

### Phase 1: Data Exploration (Week 1-2)
- Load and explore data
- Data quality assessment
- Initial visualizations
- Basic statistics

### Phase 2: Preprocessing and Feature Engineering (Week 2-3)
- Handle missing data
- Feature engineering
- Data splitting
- Baseline models

### Phase 3: Model Development (Week 3-6)
- Implement ML models
- Implement deep learning models
- Hyperparameter tuning
- Model evaluation

### Phase 4: Analysis and Interpretation (Week 6-7)
- Results analysis
- Feature importance
- Visualizations
- Insights generation

### Phase 5: Paper Writing (Week 7-10)
- Literature review
- Methodology section
- Results section
- Discussion and conclusion
- Revision and submission

---

## 15. NOTES FOR AI ASSISTANT (PERPLEXITY)

This document provides comprehensive context for crafting a conference-level or journal-level machine learning research paper. Key points:

1. **Dataset:** High-temporal-resolution PM2.5 sensor network data (5 sensors, 2-minute intervals, November 2025)

2. **Primary ML Tasks:**
   - Anomaly Detection (statistical, ML, deep learning)
   - Weather-PM2.5 Correlation Analysis
   - Fire Detection Using Smoke Patterns
   - Time Series Forecasting
   - Air Quality Classification
   - Sensor Calibration and Cross-Validation
   - Missing Data Imputation
   - Multi-Sensor Fusion
   - Pattern Recognition and Clustering

3. **Key Contributions:**
   - Multi-sensor anomaly detection framework
   - Weather-PM2.5 correlation with time lags
   - Early fire detection using PM2.5 signatures
   - Dual-sensor validation methodology
   - High-temporal-resolution analysis

4. **Methodology:** Comprehensive ML pipeline from statistical baselines to deep learning, with proper evaluation metrics

5. **Expected Results:** Quantitative performance metrics, feature importance, correlation coefficients, classification accuracy

6. **Limitations:** Single month data, missing sensor data, no precipitation/wind data, unknown sensor locations

7. **Future Work:** Extended temporal coverage, external data integration, real-time systems, policy applications

**Use this document to:**
- Craft abstract and introduction
- Write comprehensive methodology sections
- Structure experimental design
- Develop results and discussion sections
- Create literature review
- Identify appropriate venues
- Structure the paper according to venue requirements

**Focus Areas for Paper:**
- Emphasize the multi-sensor network aspect
- Highlight the high temporal resolution (2-minute intervals)
- Stress the practical applications (fire detection, real-time monitoring)
- Compare multiple ML approaches (statistical, ML, deep learning)
- Provide comprehensive evaluation and analysis

---

**END OF RESEARCH CONTEXT DOCUMENT**
