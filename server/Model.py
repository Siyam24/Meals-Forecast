import pandas as pd
from prophet import Prophet
import joblib
import os
import glob

# 1. Load and combine all CSV files
csv_files = glob.glob('Data/*.csv')
dataframes = []

for file in csv_files:
    df = pd.read_csv(file)
    
    # Try converting the 'Date' column to datetime
    df['Date'] = pd.to_datetime(df['Date'], dayfirst=True, errors='coerce')  # Handle invalid dates gracefully
    print(f"Rows with invalid dates in {file}:")
    print(df[df['Date'].isna()])  # Print rows with invalid dates
    
    if 'Total_Sales' not in df.columns:
        df['Total_Sales'] = df['Quantity_Sold'] * df['Price']  # Compute if needed
    dataframes.append(df)

# 2. Combine all data
full_df = pd.concat(dataframes, ignore_index=True).sort_values('Date')

# 3. Forecasting function with checks for missing 'Quantity_Sold' and 'Price' columns
def train_and_forecast(df, target_column, periods=365, model_name='model'):
    # Check if 'Quantity_Sold' exists in the dataframe before proceeding
    if 'Quantity_Sold' not in df.columns:
        print(f"⚠️ 'Quantity_Sold' column is missing in the dataframe for {model_name}.")
        print(f"Available columns: {df.columns}")
        return None  # Exit the function if 'Quantity_Sold' is missing
    
    # Check if 'Price' exists in the dataframe before proceeding
    if 'Price' not in df.columns:
        print(f"⚠️ 'Price' column is missing in the dataframe for {model_name}.")
        print(f"Available columns: {df.columns}")
        return None  # Exit the function if 'Price' is missing
    
    ts_df = df[['Date', target_column, 'Quantity_Sold', 'Price']].copy()
    ts_df.columns = ['ds', 'y', 'Quantity_Sold', 'Price']  # Prophet needs 'ds' and 'y'
    
    model = Prophet(
        growth='linear',
        seasonality_mode='multiplicative',
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False
    )
    model.add_regressor('Quantity_Sold')
    model.add_regressor('Price')

    model.fit(ts_df)

    future = model.make_future_dataframe(periods=periods)
    
    # Ensure 'Quantity_Sold' column exists in future dataframe
    if 'Quantity_Sold' not in future.columns:
        future['Quantity_Sold'] = df['Quantity_Sold'].iloc[-1]  # Fill with the last known value from df
        print(f"Filled 'Quantity_Sold' with last known value for {model_name}")
    else:
        future['Quantity_Sold'] = future['Quantity_Sold'].fillna(df['Quantity_Sold'].iloc[-1])  # Fill future values
    
    # Ensure 'Price' column exists in future dataframe
    if 'Price' not in future.columns:
        future['Price'] = df['Price'].iloc[-1]  # Fill with the last known value from df
        print(f"Filled 'Price' with last known value for {model_name}")
    else:
        future['Price'] = future['Price'].fillna(df['Price'].iloc[-1])  # Fill future values
    
    forecast = model.predict(future)

    # Save model and forecast
    os.makedirs(f'Model/{model_name}', exist_ok=True)
    joblib.dump(model, f'Model/{model_name}/prophet_model.joblib')
    forecast.to_csv(f'Data/{model_name}_forecast.csv', index=False)
    print(f"✅ Model for {model_name} trained and saved.")
    return forecast

# 4. Train and save a single model for each item
items = full_df['Item'].unique()  # List of unique items

for item in items:
    item_df = full_df[full_df['Item'] == item]
    
    # Check if 'Quantity_Sold' is present
    if 'Quantity_Sold' not in item_df.columns:
        print(f"⚠️ 'Quantity_Sold' is missing for item {item}. Skipping this item.")
        continue
    
    # Check if 'Price' is present
    if 'Price' not in item_df.columns:
        print(f"⚠️ 'Price' is missing for item {item}. Skipping this item.")
        continue
    
    # Train the model for 'Total Sales' using 'Quantity_Sold' and 'Price' as regressors
    forecast_total_sales = train_and_forecast(item_df, 'Total_Sales', model_name=f'{item}_total_sales')
