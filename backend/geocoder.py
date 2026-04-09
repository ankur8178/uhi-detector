from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError

def get_city_bbox(city_name: str):
    """
    Convert city name to bounding box [south, west, north, east]
    and center point (lat, lng)
    """
    geolocator = Nominatim(user_agent="uhi_detector_app")
    
    try:
        location = geolocator.geocode(city_name, exactly_one=True, timeout=10)
        
        if not location:
            return None
        
        # Extract bounding box if available
        if hasattr(location, 'raw') and 'boundingbox' in location.raw:
            bb = location.raw['boundingbox']
            south = float(bb[0])
            north = float(bb[1])
            west  = float(bb[2])
            east  = float(bb[3])
        else:
            # Fallback: create a ~0.5 degree box around center
            lat = location.latitude
            lng = location.longitude
            south = lat - 0.25
            north = lat + 0.25
            west  = lng - 0.25
            east  = lng + 0.25

        # Cap the bounding box to avoid huge regions (max ~50km box)
        lat_center = (south + north) / 2
        lng_center = (west  + east)  / 2
        max_delta  = 0.45   # ~50 km

        if (north - south) > max_delta * 2:
            south = lat_center - max_delta
            north = lat_center + max_delta
        if (east - west) > max_delta * 2:
            west  = lng_center - max_delta
            east  = lng_center + max_delta

        return {
            "city":   location.address,
            "lat":    lat_center,
            "lng":    lng_center,
            "bbox":   [south, west, north, east]
        }

    except GeocoderTimedOut:
        raise Exception("Geocoder timed out. Try again.")
    except GeocoderServiceError as e:
        raise Exception(f"Geocoder service error: {str(e)}")