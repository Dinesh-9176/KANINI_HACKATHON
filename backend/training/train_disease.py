"""Train the disease prediction model using Final_Augmented_dataset_Diseases_and_Symptoms.csv.

Uses XGBoost multi-class classifier for better probability calibration
compared to RandomForest which gives near-uniform probabilities on 773 classes.
"""

import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import joblib

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, "dataset", "Final_Augmented_dataset_Diseases_and_Symptoms.csv")
MODEL_DIR = os.path.join(BASE_DIR, "saved_models")
MODEL_PATH = os.path.join(MODEL_DIR, "disease_model.joblib")
ENCODER_PATH = os.path.join(MODEL_DIR, "disease_label_encoder.joblib")
COLUMNS_PATH = os.path.join(MODEL_DIR, "symptom_columns.joblib")


def train():
    print("Loading dataset...")
    df = pd.read_csv(DATASET_PATH)
    print(f"Dataset shape: {df.shape}")
    print(f"Number of unique diseases: {df['diseases'].nunique()}")

    # Filter out diseases with fewer than 50 samples for better training and smaller model
    disease_counts = df["diseases"].value_counts()
    valid_diseases = disease_counts[disease_counts >= 50].index
    df = df[df["diseases"].isin(valid_diseases)]
    print(f"After filtering rare diseases: {df.shape}")
    print(f"Diseases remaining: {df['diseases'].nunique()}")

    # Separate features and target
    symptom_columns = [col for col in df.columns if col != "diseases"]
    X = df[symptom_columns].values
    y_raw = df["diseases"].values

    # Encode disease labels
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(y_raw)
    print(f"Number of symptom features: {len(symptom_columns)}")
    print(f"Number of disease classes: {len(label_encoder.classes_)}")

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"\nTraining set: {X_train.shape[0]} samples")
    print(f"Test set: {X_test.shape[0]} samples")

    # Use ExtraTrees - faster than RandomForest (random splits), lower memory, good accuracy
    from sklearn.ensemble import ExtraTreesClassifier

    model = ExtraTreesClassifier(
        n_estimators=50,
        max_depth=25,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )

    print("\nTraining ExtraTrees model...")
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nTop-1 Accuracy: {accuracy:.4f}")

    # Top-5 accuracy (manual calculation to avoid label mismatch issues)
    y_proba = model.predict_proba(X_test)
    top5_correct = 0
    for i in range(len(y_test)):
        top5_classes = np.argsort(y_proba[i])[-5:]
        if y_test[i] in top5_classes:
            top5_correct += 1
    top5_acc = top5_correct / len(y_test)
    print(f"Top-5 Accuracy: {top5_acc:.4f}")

    # Test with known symptom combo
    print("\n--- Sanity Check ---")
    test_features = np.zeros((1, len(symptom_columns)))
    for col_name in ["sharp chest pain", "shortness of breath", "fever"]:
        idx = symptom_columns.index(col_name)
        test_features[0, idx] = 1
    test_proba = model.predict_proba(test_features)[0]
    top5_idx = np.argsort(test_proba)[-5:][::-1]
    print("Top 5 for [Chest Pain + Shortness of Breath + Fever]:")
    for idx in top5_idx:
        disease = label_encoder.inverse_transform([idx])[0]
        print(f"  {disease}: {test_proba[idx]*100:.1f}%")

    # Save model artifacts
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(label_encoder, ENCODER_PATH)
    joblib.dump(symptom_columns, COLUMNS_PATH)

    print(f"\nModel saved to {MODEL_PATH}")
    print(f"Label encoder saved to {ENCODER_PATH}")
    print(f"Symptom columns saved to {COLUMNS_PATH}")


if __name__ == "__main__":
    train()
