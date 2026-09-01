"""
NER Logistics Disruption & Risk Dataset Generator (Synthetic Prototype Data)
Generates realistic multi-factor meteorological, topographical, and logistical transit records
tailored to the 8 North Eastern states of India.
"""

import json
import random
import os

def generate_dataset(num_samples=3000, seed=42):
    random.seed(seed)
    records = []

    for i in range(num_samples):
        # 1. Topography & Elevation
        # Plains (Assam/Tripura), Foothills (Meghalaya), High Mountain (Sikkim/Arunachal/Mizoram)
        terrain_type = random.choices([0, 1, 2, 3], weights=[0.25, 0.30, 0.30, 0.15])[0]
        if terrain_type == 0:
            elevation = random.uniform(40, 200)
            terrain_factor = random.uniform(0.1, 0.3)
        elif terrain_type == 1:
            elevation = random.uniform(200, 900)
            terrain_factor = random.uniform(0.3, 0.6)
        elif terrain_type == 2:
            elevation = random.uniform(900, 2200)
            terrain_factor = random.uniform(0.6, 0.85)
        else:
            elevation = random.uniform(2200, 3600)
            terrain_factor = random.uniform(0.85, 1.0)

        # 2. Meteorology (Monsoon vs Normal)
        is_monsoon = random.random() < 0.45
        if is_monsoon:
            rainfall = random.uniform(15.0, 140.0)
            rainfall_intensity = random.choices([2, 3, 4], weights=[0.3, 0.45, 0.25])[0]
        else:
            rainfall = random.uniform(0.0, 25.0)
            rainfall_intensity = random.choices([0, 1, 2], weights=[0.6, 0.3, 0.1])[0]

        # 3. Infrastructure & Corridors
        road_condition = random.uniform(3.0, 9.5)  # 1 to 10 scale
        bridge_condition = random.uniform(4.0, 10.0)
        traffic_level = random.choices([0, 1, 2, 3], weights=[0.35, 0.35, 0.20, 0.10])[0]

        # 4. Route metrics
        distance_km = random.uniform(30.0, 650.0)
        duration_mins = distance_km * random.uniform(1.2, 2.5)

        # 5. Incidents
        historical_incidents = random.randint(0, 12)
        active_incidents = random.choices([0, 1, 2, 3, 4], weights=[0.55, 0.25, 0.12, 0.05, 0.03])[0]
        incident_severity = 0
        if active_incidents > 0:
            incident_severity = random.choices([1, 2, 3], weights=[0.4, 0.35, 0.25])[0]

        # Calculate ground truth risk score based on physics & geotechnical models
        # Rain + Slope + Low Road Quality + Active Incident = High Risk
        base_weather_risk = (rainfall / 140.0) * 35.0 + (rainfall_intensity * 3.5)
        base_terrain_risk = terrain_factor * 25.0
        infra_penalty = (10.0 - road_condition) * 2.0 + (10.0 - bridge_condition) * 1.5
        incident_penalty = active_incidents * 8.0 + incident_severity * 6.0 + historical_incidents * 0.8
        distance_factor = min(10.0, distance_km / 65.0)

        # Compound interaction: Rain on steep slopes exponentially raises landslide danger
        landslide_interaction = 0.0
        if elevation > 1000 and rainfall > 25.0:
            landslide_interaction = min(20.0, (rainfall / 30.0) * (elevation / 1000.0) * 3.0)

        raw_score = base_weather_risk + base_terrain_risk + infra_penalty + incident_penalty + distance_factor + landslide_interaction
        # Add slight natural Gaussian noise
        raw_score += random.gauss(0, 2.5)
        risk_score = round(max(5.0, min(99.0, raw_score)), 1)

        # Risk Classification
        if risk_score < 30.0:
            risk_level = 0  # LOW
            risk_label = "LOW"
        elif risk_score < 55.0:
            risk_level = 1  # MODERATE
            risk_label = "MODERATE"
        elif risk_score < 78.0:
            risk_level = 2  # HIGH
            risk_label = "HIGH"
        else:
            risk_level = 3  # CRITICAL
            risk_label = "CRITICAL"

        # Estimated delay calculation (minutes)
        base_delay = 0
        if risk_score > 75:
            base_delay = random.uniform(120, 360) + active_incidents * 30
        elif risk_score > 50:
            base_delay = random.uniform(45, 120) + active_incidents * 20
        elif risk_score > 30:
            base_delay = random.uniform(15, 45) + active_incidents * 10
        else:
            base_delay = random.uniform(0, 15)

        estimated_delay = round(max(0, base_delay), 0)

        records.append({
            "features": {
                "rainfall_mm": round(rainfall, 1),
                "rainfall_intensity": rainfall_intensity,
                "elevation_meters": round(elevation, 0),
                "terrain_grade": terrain_type,
                "historical_incidents": historical_incidents,
                "active_incidents": active_incidents,
                "road_condition": round(road_condition, 1),
                "bridge_condition": round(bridge_condition, 1),
                "traffic_level": traffic_level,
                "route_distance_km": round(distance_km, 1),
                "route_duration_mins": round(duration_mins, 1),
                "incident_severity": incident_severity
            },
            "targets": {
                "risk_score": risk_score,
                "risk_level": risk_level,
                "risk_label": risk_label,
                "estimated_delay_mins": int(estimated_delay)
            }
        })

    return records

if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(__file__), "output")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "training_dataset.json")

    data = generate_dataset(3000)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print(f"Generated {len(data)} synthetic NER logistics risk training samples -> {out_file}")

