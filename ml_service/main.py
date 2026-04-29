from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

app = FastAPI(title="Inventory Demand Prediction API")

class SalesData(BaseModel):
    product_id: str
    historical_sales: List[float] # List of sales quantities per period (e.g., daily or weekly)

class PredictionResponse(BaseModel):
    product_id: str
    predicted_demand: float
    confidence_score: float

@app.get("/")
def read_root():
    return {"message": "Demand Prediction Service is Online"}

@app.post("/predict", response_model=PredictionResponse)
async def predict_demand(data: SalesData):
    if len(data.historical_sales) < 3:
        # Not enough data to predict, return a simple average or error
        if not data.historical_sales:
             raise HTTPException(status_code=400, detail="Insufficient sales data")
        prediction = np.mean(data.historical_sales)
        return {
            "product_id": data.product_id,
            "predicted_demand": float(prediction),
            "confidence_score": 0.2
        }

    # Prepare data for Linear Regression
    # X = index (0, 1, 2...), y = sales
    X = np.array(range(len(data.historical_sales))).reshape(-1, 1)
    y = np.array(data.historical_sales)

    model = LinearRegression()
    model.fit(X, y)

    # Predict the next step
    next_step = np.array([[len(data.historical_sales)]])
    prediction = model.predict(next_step)[0]

    # Simple confidence score based on R^2 (clamped between 0 and 1)
    score = max(0, min(1, model.score(X, y)))

    return {
        "product_id": data.product_id,
        "predicted_demand": float(max(0, prediction)), # Demand can't be negative
        "confidence_score": float(score)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
