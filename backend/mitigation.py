def get_mitigation_strategies(uhi_intensity):
    s = {
        "urban_forests": {"title":"Urban Forests & Street Trees","description":"Plant dense tree canopies along streets and in parks to provide shade and evapotranspiration cooling.","lst_reduction":"2.5-4.0C","difficulty":"Moderate","timeframe":"Long-term (5-10 years)","icon":"🌳","type":"green"},
        "green_roofs": {"title":"Green Roofs & Vertical Gardens","description":"Install vegetation on rooftops and building facades to reduce heat absorption.","lst_reduction":"1.5-3.0C","difficulty":"Hard","timeframe":"Medium-term (2-5 years)","icon":"🏗️","type":"green"},
        "cool_pavements": {"title":"Cool & Permeable Pavements","description":"Replace dark asphalt with high-albedo or permeable materials to reflect more solar radiation.","lst_reduction":"1.0-2.5C","difficulty":"Moderate","timeframe":"Medium-term (1-3 years)","icon":"🛣️","type":"infrastructure"},
        "water_features": {"title":"Water Bodies & Misting Systems","description":"Add urban ponds, fountains, and misting corridors to leverage evaporative cooling.","lst_reduction":"1.0-2.0C","difficulty":"Moderate","timeframe":"Medium-term (2-4 years)","icon":"💧","type":"water"},
        "urban_planning": {"title":"Smart Urban Planning","description":"Redesign street orientation and building density to improve wind flow and reduce heat trapping.","lst_reduction":"0.5-1.5C","difficulty":"Hard","timeframe":"Long-term (10+ years)","icon":"🏙️","type":"planning"},
        "green_energy": {"title":"Green Energy Transition","description":"Replace fossil fuel systems with solar and wind to reduce waste heat emissions.","lst_reduction":"0.3-1.0C","difficulty":"Hard","timeframe":"Long-term (10+ years)","icon":"☀️","type":"energy"},
        "cool_roofs": {"title":"Cool Roofs (High Albedo Coatings)","description":"Apply reflective coatings on rooftops to reflect sunlight instead of absorbing it.","lst_reduction":"1.0-2.0C","difficulty":"Easy","timeframe":"Short-term (< 1 year)","icon":"🏠","type":"infrastructure"},
    }

    if uhi_intensity > 5.0:
        keys = ["urban_forests","green_roofs","cool_pavements","water_features","cool_roofs","urban_planning","green_energy"]
        severity = "CRITICAL"
    elif uhi_intensity >= 3.0:
        keys = ["cool_pavements","water_features","cool_roofs","urban_planning","urban_forests","green_roofs","green_energy"]
        severity = "MODERATE"
    else:
        keys = ["urban_planning","green_energy","cool_roofs","water_features","cool_pavements","urban_forests","green_roofs"]
        severity = "LOW"

    return {"severity": severity, "intensity": uhi_intensity, "strategies": [s[k] for k in keys]}


def simulate_mitigation(uhi_intensity, green_pct, roof_pct, water_pct):
    lst_drop = round((green_pct * 0.08) + (roof_pct * 0.05) + (water_pct * 0.04), 2)
    new_uhi = max(0.0, round(uhi_intensity - lst_drop, 2))
    carbon_offset = round((green_pct * 10) * 2.5, 1)
    return {
        "lst_drop": lst_drop,
        "new_uhi": new_uhi,
        "carbon_offset": carbon_offset,
        "inputs": {"green_pct": green_pct, "roof_pct": roof_pct, "water_pct": water_pct}
    }