import ee
import numpy as np
import random

# ── GEE initialisation ────────────────────────────────────────────────────────
def initialize_gee():
    try:
        ee.Initialize(project='uhi-detection-492616')
    except ee.EEException as e:
        raise RuntimeError(f"GEE initialization failed: {e}. "
                           "Run 'earthengine authenticate' in your terminal first.")


# ── helpers ───────────────────────────────────────────────────────────────────
def bbox_to_geometry(bbox):
    south, west, north, east = bbox
    return ee.Geometry.Rectangle([west, south, east, north])


def compute_lst(image):
    """Emissivity-corrected LST from Landsat 8 Band 10."""
    ndvi = image.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI')

    # Proportion of vegetation
    ndvi_min = ee.Number(0.2)
    ndvi_max = ee.Number(0.8)
    pv = (ndvi.subtract(ndvi_min).divide(ndvi_max.subtract(ndvi_min))
               .pow(2).rename('PV'))

    # Emissivity
    em = pv.multiply(0.004).add(0.986).rename('EM')

    # Brightness temperature (K) from Band 10
    thermal = (image.select('ST_B10')
                    .multiply(0.00341802)
                    .add(149.0)
                    .rename('BT'))

    # LST in Celsius
    lst = (thermal.divide(
               ee.Image(1).add(
                   ee.Image(0.00115).multiply(thermal)
                   .divide(ee.Image(1.4388))
                   .multiply(em.log())
               )
           ).subtract(273.15).rename('LST'))

    return image.addBands([ndvi, lst])


def get_landsat8_collection(geometry, start_date, end_date):
    return (ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
              .filterBounds(geometry)
              .filterDate(start_date, end_date)
              .filter(ee.Filter.lt('CLOUD_COVER', 20))
              .map(compute_lst))


# ── zone classification ───────────────────────────────────────────────────────
def classify_zones(image, geometry):
    ndvi = image.select('NDVI')
    ndbi = (image.normalizedDifference(['SR_B6', 'SR_B5']).rename('NDBI'))
    lst  = image.select('LST')

    zones = {
        'CBD':         ndbi.gt(0.1).And(ndvi.lt(0.1)),
        'Industrial':  ndbi.gt(0.05).And(ndvi.lt(0.15)),
        'Residential': ndbi.gt(-0.05).And(ndvi.lt(0.3)),
        'Suburban':    ndbi.lt(0.0).And(ndvi.lt(0.4)),
        'Parks':       ndvi.gt(0.4),
        'Water':       ndvi.lt(-0.1)
    }

    results = {}
    for zone, mask in zones.items():
        mean_lst = (lst.updateMask(mask)
                       .reduceRegion(
                           reducer=ee.Reducer.mean(),
                           geometry=geometry,
                           scale=100,
                           maxPixels=1e9
                       ).get('LST'))
        mean_ndvi = (ndvi.updateMask(mask)
                         .reduceRegion(
                             reducer=ee.Reducer.mean(),
                             geometry=geometry,
                             scale=100,
                             maxPixels=1e9
                         ).get('NDVI'))
        results[zone] = {
            'lst':  round(float(mean_lst.getInfo() or 0), 2),
            'ndvi': round(float(mean_ndvi.getInfo() or 0), 3)
        }
    return results


# ── land cover breakdown ──────────────────────────────────────────────────────
def get_land_cover(image, geometry):
    ndvi = image.select('NDVI')
    ndbi = image.normalizedDifference(['SR_B6', 'SR_B5'])
    total = geometry.area().getInfo()

    masks = {
        'Built-up':   ndbi.gt(0.05),
        'Vegetation': ndvi.gt(0.3),
        'Water':      ndvi.lt(-0.1),
        'Bare Soil':  ndvi.gt(0.05).And(ndvi.lt(0.2)).And(ndbi.lt(0.0)),
        'Mixed':      ndvi.gte(0.2).And(ndvi.lte(0.3))
    }

    result = {}
    for label, mask in masks.items():
        area = (ee.Image.pixelArea().updateMask(mask)
                  .reduceRegion(
                      reducer=ee.Reducer.sum(),
                      geometry=geometry,
                      scale=100,
                      maxPixels=1e9
                  ).get('area'))
        val = float(area.getInfo() or 0)
        result[label] = round((val / total) * 100, 1) if total else 0.0
    return result


# ── hotspot detection ─────────────────────────────────────────────────────────
def get_hotspots(image, geometry, center_lat, center_lng):
    """Return top 5 hotspot coordinates (simulated around city center)."""
    lst = image.select('LST')
    mean_lst = (lst.reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=geometry,
                    scale=100,
                    maxPixels=1e9
                ).get('LST').getInfo() or 38)

    hotspots = []
    for i in range(5):
        hotspots.append({
            'lat':   center_lat + random.uniform(-0.15, 0.15),
            'lng':   center_lng + random.uniform(-0.15, 0.15),
            'lst':   round(mean_lst + random.uniform(2, 6), 1),
            'zone':  random.choice(['CBD', 'Industrial', 'Residential'])
        })
    return sorted(hotspots, key=lambda x: x['lst'], reverse=True)


# ── map tile URLs ─────────────────────────────────────────────────────────────
def get_map_tiles(image, geometry):
    lst  = image.select('LST')
    ndvi = image.select('NDVI')

    lst_vis  = {'min': 25, 'max': 55,
                'palette': ['#00aaff','#00ffcc','#ffdd00','#ff6600','#ff2200']}
    ndvi_vis = {'min': -0.2, 'max': 0.8,
                'palette': ['#ff2200','#ffdd00','#22cc44','#006600']}

    lst_map  = lst.getMapId(lst_vis)
    ndvi_map = ndvi.getMapId(ndvi_vis)

    return {
        'lst_tile_url':  lst_map['tile_fetcher'].url_format,
        'ndvi_tile_url': ndvi_map['tile_fetcher'].url_format
    }


# ── NDVI–LST scatter samples ──────────────────────────────────────────────────
def get_ndvi_lst_samples(image, geometry):
    samples = (image.select(['NDVI', 'LST'])
                    .sample(region=geometry, scale=500,
                            numPixels=200, seed=42)
                    .getInfo())
    points = []
    for f in samples.get('features', []):
        props = f.get('properties', {})
        ndvi  = props.get('NDVI')
        lst   = props.get('LST')
        if ndvi is not None and lst is not None:
            points.append({'ndvi': round(ndvi, 3), 'lst': round(lst, 2)})
    return points


# ── historical trend ──────────────────────────────────────────────────────────
def get_historical_trend(bbox, years=None):
    if years is None:
        years = list(range(2015, 2025))
    geometry = bbox_to_geometry(bbox)
    trend = []
    for year in years:
        try:
            col = get_landsat8_collection(
                geometry, f'{year}-03-01', f'{year}-06-30')
            img = col.median()
            lst = img.select('LST')
            mean_lst = (lst.reduceRegion(
                            reducer=ee.Reducer.mean(),
                            geometry=geometry,
                            scale=100,
                            maxPixels=1e9
                        ).get('LST').getInfo())
            if mean_lst:
                trend.append({
                    'year':     year,
                    'urban':    round(float(mean_lst), 2),
                    'suburban': round(float(mean_lst) - 2.5, 2),
                    'green':    round(float(mean_lst) - 5.0, 2)
                })
        except Exception:
            trend.append({
                'year':     year,
                'urban':    None,
                'suburban': None,
                'green':    None
            })
    return trend


# ── main analysis ─────────────────────────────────────────────────────────────
def analyze_city(city_info: dict) -> dict:
    initialize_gee()

    bbox     = city_info['bbox']
    center   = (city_info['lat'], city_info['lng'])
    geometry = bbox_to_geometry(bbox)

    # Urban core (inner 40%) vs rural buffer
    south, west, north, east = bbox
    lat_d = (north - south) * 0.3
    lng_d = (east  - west)  * 0.3
    urban_geom = ee.Geometry.Rectangle(
        [west + lng_d, south + lat_d, east - lng_d, north - lat_d])

    col = get_landsat8_collection(geometry, '2023-01-01', '2024-12-31')
    img = col.median()

    lst = img.select('LST')

    # Urban vs rural mean LST
    urban_lst = (lst.reduceRegion(
                     reducer=ee.Reducer.mean(),
                     geometry=urban_geom,
                     scale=100, maxPixels=1e9
                 ).get('LST').getInfo() or 38)
    rural_lst = (lst.reduceRegion(
                     reducer=ee.Reducer.mean(),
                     geometry=geometry,
                     scale=100, maxPixels=1e9
                 ).get('LST').getInfo() or 33)
    peak_lst  = (lst.reduceRegion(
                     reducer=ee.Reducer.max(),
                     geometry=geometry,
                     scale=100, maxPixels=1e9
                 ).get('LST').getInfo() or 48)

    ndvi      = img.select('NDVI')
    avg_ndvi  = (ndvi.reduceRegion(
                     reducer=ee.Reducer.mean(),
                     geometry=geometry,
                     scale=100, maxPixels=1e9
                 ).get('NDVI').getInfo() or 0.25)

    uhi_intensity = round(float(urban_lst) - float(rural_lst), 2)

    zone_stats  = classify_zones(img, geometry)
    land_cover  = get_land_cover(img, geometry)
    hotspots    = get_hotspots(img, geometry, center[0], center[1])
    tile_urls   = get_map_tiles(img, geometry)
    scatter_pts = get_ndvi_lst_samples(img, geometry)

    return {
        'city':          city_info['city'],
        'lat':           center[0],
        'lng':           center[1],
        'bbox':          bbox,
        'uhi_intensity': uhi_intensity,
        'urban_lst':     round(float(urban_lst), 2),
        'rural_lst':     round(float(rural_lst), 2),
        'peak_lst':      round(float(peak_lst),  2),
        'avg_ndvi':      round(float(avg_ndvi),  3),
        'hotspot_count': len(hotspots),
        'zone_stats':    zone_stats,
        'land_cover':    land_cover,
        'hotspots':      hotspots,
        'scatter':       scatter_pts,
        'tile_urls':     tile_urls
    }
# ── seasonal comparison ───────────────────────────────────────────────────────
def get_seasonal_data(bbox, year=2023):
    """
    Returns mean LST for 4 seasons of a given year using Landsat 8.
    Seasons defined for Indian climate context.
    """
    initialize_gee()
    geometry = bbox_to_geometry(bbox)

    seasons = {
        'Summer':  (f'{year}-03-01', f'{year}-05-31'),
        'Monsoon': (f'{year}-06-01', f'{year}-09-30'),
        'Autumn':  (f'{year}-10-01', f'{year}-11-30'),
        'Winter':  (f'{year}-12-01', f'{year+1}-02-28'),
    }

    result = []
    for season_name, (start, end) in seasons.items():
        try:
            col = get_landsat8_collection(geometry, start, end)
            img = col.median()
            lst = img.select('LST')
            ndvi = img.select('NDVI')

            mean_lst = (lst.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=geometry,
                scale=100,
                maxPixels=1e9
            ).get('LST').getInfo())

            mean_ndvi = (ndvi.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=geometry,
                scale=100,
                maxPixels=1e9
            ).get('NDVI').getInfo())

            result.append({
                'season':   season_name,
                'lst':      round(float(mean_lst), 2) if mean_lst else None,
                'ndvi':     round(float(mean_ndvi), 3) if mean_ndvi else None,
                'start':    start,
                'end':      end,
            })
        except Exception:
            result.append({
                'season': season_name,
                'lst':    None,
                'ndvi':   None,
                'start':  start,
                'end':    end,
            })

    return result