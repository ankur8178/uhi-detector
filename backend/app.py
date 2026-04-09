from flask import Flask, request, jsonify
from flask_cors import CORS
from geocoder import get_city_bbox
from gee_analysis import analyze_city, get_historical_trend, initialize_gee
from mitigation import get_mitigation_strategies, simulate_mitigation
from gee_analysis import analyze_city, get_historical_trend, initialize_gee, get_seasonal_data
app = Flask(__name__)
CORS(app)


def error_response(message: str, code: int = 400):
    return jsonify({"error": message}), code


# ── /api/analyze ──────────────────────────────────────────────────────────────
@app.route('/api/analyze')
def analyze():
    city = request.args.get('city', '').strip()
    if not city:
        return error_response("city parameter is required")

    try:
        city_info = get_city_bbox(city)
        if not city_info:
            return error_response(f"City '{city}' not found", 404)

        gee_data   = analyze_city(city_info)
        mitigation = get_mitigation_strategies(gee_data['uhi_intensity'])

        return jsonify({**gee_data, "mitigation": mitigation})

    except Exception as e:
        return error_response(str(e), 500)


# ── /api/trend ────────────────────────────────────────────────────────────────
@app.route('/api/trend')
def trend():
    city = request.args.get('city', '').strip()
    if not city:
        return error_response("city parameter is required")

    try:
        city_info = get_city_bbox(city)
        if not city_info:
            return error_response(f"City '{city}' not found", 404)

        initialize_gee()
        trend_data = get_historical_trend(city_info['bbox'])
        return jsonify({"city": city, "trend": trend_data})

    except Exception as e:
        return error_response(str(e), 500)

# ── /api/seasonal ─────────────────────────────────────────────────────────────
@app.route('/api/seasonal')
def seasonal():
    city = request.args.get('city', '').strip()
    year = int(request.args.get('year', 2023))
    if not city:
        return error_response("city parameter is required")

    try:
        city_info = get_city_bbox(city)
        if not city_info:
            return error_response(f"City '{city}' not found", 404)

        seasonal_data = get_seasonal_data(city_info['bbox'], year)
        return jsonify({"city": city, "year": year, "seasons": seasonal_data})

    except Exception as e:
        return error_response(str(e), 500)
# ── /api/compare ──────────────────────────────────────────────────────────────
@app.route('/api/compare')
def compare():
    city1 = request.args.get('city1', '').strip()
    city2 = request.args.get('city2', '').strip()
    if not city1 or not city2:
        return error_response("city1 and city2 parameters are required")

    try:
        info1 = get_city_bbox(city1)
        info2 = get_city_bbox(city2)
        if not info1:
            return error_response(f"City '{city1}' not found", 404)
        if not info2:
            return error_response(f"City '{city2}' not found", 404)

        data1 = analyze_city(info1)
        data2 = analyze_city(info2)
        return jsonify({"city1": data1, "city2": data2})

    except Exception as e:
        return error_response(str(e), 500)


# ── /api/simulate ─────────────────────────────────────────────────────────────
@app.route('/api/simulate')
def simulate():
    city      = request.args.get('city', '').strip()
    green_pct = float(request.args.get('greenPct', 0))
    roof_pct  = float(request.args.get('roofPct',  0))
    water_pct = float(request.args.get('waterPct', 0))

    if not city:
        return error_response("city parameter is required")

    try:
        city_info  = get_city_bbox(city)
        if not city_info:
            return error_response(f"City '{city}' not found", 404)

        gee_data   = analyze_city(city_info)
        sim_result = simulate_mitigation(
            gee_data['uhi_intensity'], green_pct, roof_pct, water_pct)
        return jsonify({**sim_result, "city": city})

    except Exception as e:
        return error_response(str(e), 500)


if __name__ == '__main__':
    app.run(debug=True, port=5000)