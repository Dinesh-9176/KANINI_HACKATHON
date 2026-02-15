"""Train the triage level prediction model using synthetic_medical_triage.csv.

IMPORTANT: pain_level is EXCLUDED because the intake form does not collect it.
Including it caused 84.8% feature importance on pain_level alone, making
vitals-based predictions useless when pain_level=0 at inference.
"""

import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from xgboost import XGBClassifier
import joblib

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, "dataset", "synthetic_medical_triage.csv")
MODEL_DIR = os.path.join(BASE_DIR, "saved_models")
MODEL_PATH = os.path.join(MODEL_DIR, "triage_model.joblib")


def train():
    print("Loading dataset...")
    df = pd.read_csv(DATASET_PATH)
    print(f"Dataset shape: {df.shape}")
    print(f"\nTriage level distribution:\n{df['triage_level'].value_counts().sort_index()}")

    # Features - pain_level EXCLUDED (not collected in intake form)
    feature_cols = [
        "age",
        "heart_rate",
        "systolic_blood_pressure",
        "oxygen_saturation",
        "body_temperature",
        "chronic_disease_count",
    ]

    X = df[feature_cols].values
    y = df["triage_level"].values

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"\nTraining set: {X_train.shape[0]} samples")
    print(f"Test set: {X_test.shape[0]} samples")

    # Train XGBoost with class weight handling for imbalanced data
    class_counts = np.bincount(y_train)
    total = len(y_train)
    sample_weights = np.array([total / (len(class_counts) * class_counts[yi]) for yi in y_train])

    model = XGBClassifier(
        n_estimators=300,
        max_depth=8,
        learning_rate=0.1,
        objective="multi:softprob",
        num_class=4,
        random_state=42,
        eval_metric="mlogloss",
    )

    print("\nTraining XGBoost model...")
    model.fit(X_train, y_train, sample_weight=sample_weights)

    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nAccuracy: {accuracy:.4f}")
    print(f"\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Low (0)", "Medium (1)", "High (2)", "Critical (3)"]))

    # Feature importances
    print("\nFeature Importances:")
    for col, imp in zip(feature_cols, model.feature_importances_):
        print(f"  {col}: {imp:.4f}")

    # Save model
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"\nModel saved to {MODEL_PATH}")

    # Also save feature column names for reference
    joblib.dump(feature_cols, os.path.join(MODEL_DIR, "triage_features.joblib"))


if __name__ == "__main__":
    train()
