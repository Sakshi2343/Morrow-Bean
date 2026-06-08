from __future__ import annotations

from pathlib import Path
from typing import List, Optional

import joblib
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel, Field

try:
    from xgboost import XGBRegressor
except Exception:  # pragma: no cover - graceful fallback when dependency is absent
    XGBRegressor = None


MODEL_DIR = Path(__file__).resolve().parent.parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = MODEL_DIR / "flavor_matcher.joblib"

app = FastAPI(title="Flavor Matcher", version="1.0.0")


class BeanProfile(BaseModel):
    origin: str = ""
    region: str = ""
    species: str = "arabica"
    roastLevel: str = "medium"
    acidity: float = 3
    body: float = 3
    processingMethod: str = "washed"
    tastingNotes: List[str] = Field(default_factory=list)


class EquipmentProfile(BaseModel):
    equipmentType: str = ""
    material: str = ""
    supportedBrewingMethods: List[str] = Field(default_factory=list)


class InventoryItem(BaseModel):
    id: str
    name: str
    product_type: str = "beans"
    price: float = 0
    rating: float = 0
    bean_profile: BeanProfile = Field(default_factory=BeanProfile)
    equipment_profile: EquipmentProfile = Field(default_factory=EquipmentProfile)
    brewing_methods: List[str] = Field(default_factory=list)


class UserProfile(BaseModel):
    brewingMethods: List[str] = Field(default_factory=list)
    acidityTolerance: float = 3
    roastPreference: str = "medium"
    beanPreference: str = "single-origin arabica"
    flavorNotes: List[str] = Field(default_factory=list)
    preferredOrigins: List[str] = Field(default_factory=list)
    preferredEquipment: List[str] = Field(default_factory=list)
    dailyCups: float = 2


class RecommendationRequest(BaseModel):
    user_profile: UserProfile
    inventory: List[InventoryItem]


class FeedbackRow(BaseModel):
    user_profile: UserProfile
    item: InventoryItem
    purchased: float = 0
    rating_signal: float = 0


class TrainingRequest(BaseModel):
    rows: List[FeedbackRow]


class ModelBundle(BaseModel):
    available: bool = False
    feature_names: List[str] = Field(default_factory=list)


def _overlap(left: List[str], right: List[str]) -> float:
    if not left or not right:
      return 0.0

    left_set = {value.strip().lower() for value in left if value}
    right_set = {value.strip().lower() for value in right if value}
    if not left_set or not right_set:
        return 0.0
    return len(left_set & right_set) / max(len(left_set), len(right_set))


def _extract_features(user_profile: UserProfile, item: InventoryItem) -> List[float]:
    bean_profile = item.bean_profile
    equipment_profile = item.equipment_profile
    roast_match = float(user_profile.roastPreference.lower() == bean_profile.roastLevel.lower())
    bean_match = float(bean_profile.species.lower() in user_profile.beanPreference.lower())
    brew_overlap = _overlap(
        user_profile.brewingMethods,
        item.brewing_methods
        or bean_profile.tastingNotes
        or equipment_profile.supportedBrewingMethods,
    )
    flavor_overlap = _overlap(user_profile.flavorNotes, bean_profile.tastingNotes)
    origin_overlap = _overlap(
        user_profile.preferredOrigins, [bean_profile.origin, bean_profile.region]
    )
    equipment_overlap = _overlap(
        user_profile.preferredEquipment, [equipment_profile.equipmentType]
    )
    acidity_alignment = max(0.0, 1 - abs(user_profile.acidityTolerance - bean_profile.acidity) / 5)
    cups_signal = min(user_profile.dailyCups / 5, 1.0)
    price_signal = max(0.0, 1 - min(item.price, 100) / 100)
    rating_signal = item.rating / 5
    product_type_signal = 1.0 if item.product_type == "beans" else 0.65

    return [
        roast_match,
        bean_match,
        brew_overlap,
        flavor_overlap,
        origin_overlap,
        equipment_overlap,
        acidity_alignment,
        cups_signal,
        price_signal,
        rating_signal,
        product_type_signal,
    ]


def _feature_names() -> List[str]:
    return [
        "roast_match",
        "bean_match",
        "brew_overlap",
        "flavor_overlap",
        "origin_overlap",
        "equipment_overlap",
        "acidity_alignment",
        "cups_signal",
        "price_signal",
        "rating_signal",
        "product_type_signal",
    ]


def _load_model() -> Optional[object]:
    if not MODEL_PATH.exists():
        return None
    return joblib.load(MODEL_PATH)


def _save_model(model: object) -> None:
    joblib.dump(model, MODEL_PATH)


def _heuristic_score(user_profile: UserProfile, item: InventoryItem) -> float:
    features = _extract_features(user_profile, item)
    weights = np.array([14, 10, 16, 16, 10, 10, 12, 6, 2, 8, 6], dtype=float)
    return float(np.dot(np.array(features), weights))


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "model_path": str(MODEL_PATH),
        "model_loaded": MODEL_PATH.exists(),
        "xgboost_available": XGBRegressor is not None,
    }


@app.post("/train")
def train(request: TrainingRequest) -> dict:
    if not request.rows:
        return {"trained": False, "message": "No rows provided."}

    features = np.array(
        [_extract_features(row.user_profile, row.item) for row in request.rows], dtype=float
    )
    targets = np.array(
        [row.purchased * 0.7 + row.rating_signal * 0.3 for row in request.rows], dtype=float
    )

    if XGBRegressor is None:
        model = {
            "type": "heuristic",
            "feature_names": _feature_names(),
            "mean_target": float(np.mean(targets)),
        }
        _save_model(model)
        return {
            "trained": True,
            "model_type": "heuristic",
            "rows": len(request.rows),
        }

    model = XGBRegressor(
        n_estimators=80,
        max_depth=4,
        learning_rate=0.08,
        objective="reg:squarederror",
        subsample=0.9,
        colsample_bytree=0.9,
    )
    model.fit(features, targets)
    _save_model(
        {
            "type": "xgboost",
            "feature_names": _feature_names(),
            "model": model,
        }
    )
    return {"trained": True, "model_type": "xgboost", "rows": len(request.rows)}


@app.post("/recommend")
def recommend(request: RecommendationRequest) -> dict:
    bundle = _load_model()
    recommendations = []

    for item in request.inventory:
        feature_vector = np.array([_extract_features(request.user_profile, item)], dtype=float)
        if bundle and bundle.get("type") == "xgboost":
            score = float(bundle["model"].predict(feature_vector)[0] * 100)
            source = "xgboost"
        else:
            score = _heuristic_score(request.user_profile, item)
            source = "heuristic"

        reasons = []
        if request.user_profile.roastPreference.lower() == item.bean_profile.roastLevel.lower():
            reasons.append("Roast profile aligns with the user's stated preference.")
        if _overlap(request.user_profile.flavorNotes, item.bean_profile.tastingNotes) > 0:
            reasons.append("Flavor notes overlap with the user's tasting preferences.")
        if _overlap(request.user_profile.brewingMethods, item.brewing_methods) > 0:
            reasons.append("Supports the brewing techniques the user already enjoys.")

        recommendations.append(
            {
                "product_id": item.id,
                "name": item.name,
                "score": round(score, 2),
                "reasons": reasons[:3],
                "source": source,
            }
        )

    recommendations.sort(key=lambda row: row["score"], reverse=True)
    return {"recommendations": recommendations[:6], "model_loaded": bool(bundle)}
