import requests
import folium
from flask import Flask, send_file, Response
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# 🌍 OpenRouteService API Key
API_KEY = "5b3ce3597851110001cf6248d2ef251be0264bc6a3fa272e4beb849b"

# 📍 Start & End Coordinates (Latitude, Longitude) - Using static coordinates as per instruction
start = (49.41461, 8.681495)  # (Latitude, Longitude)
end = (49.420318, 8.687872)   # (Latitude, Longitude)

# 🌐 OpenRouteService API URL
url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"

# ✅ API request headers
headers = {
    "Authorization": API_KEY,
    "Content-Type": "application/json"
}

# ✅ API request payload - Using static coordinates
payload = {
    "coordinates": [[start[1], start[0]], [end[1], end[0]]],
    "format": "geojson"
}

# Function to generate the map
def generate_map():
    # 🚀 Fetch Route Data from API
    response = requests.post(url, json=payload, headers=headers)

    # 📌 Convert Response to JSON
    data = response.json()

    # ✅ Extract Coordinates if Route Exists
    if "features" in data and len(data["features"]) > 0:
        route_coords = data["features"][0]["geometry"]["coordinates"]

        # 📌 Convert (Longitude, Latitude) to (Latitude, Longitude)
        route_coords = [(lat, lon) for lon, lat in route_coords]

        # ✅ Create Folium Map (Auto-Zoom Enabled)
        route_map = folium.Map(location=route_coords[0], zoom_start=14)

        # ✅ Draw Route on Map
        folium.PolyLine(route_coords, color="blue", weight=5, opacity=0.7, tooltip="Shortest Route").add_to(route_map)

        # ✅ Add Start & End Markers
        folium.Marker(start, popup="Start Point", icon=folium.Icon(color="green")).add_to(route_map)
        folium.Marker(end, popup="End Point", icon=folium.Icon(color="red")).add_to(route_map)

        # ✅ Auto-Zoom to Fit Entire Route
        route_map.fit_bounds(route_coords)
        route_map.options["zoomSnap"] = 1.5
        route_map.options["zoomDelta"] = 5.5

        # ✅ Save the map to an HTML file
        map_filename = "shortest_route_map.html"
        route_map.save(map_filename)

        return map_filename
    else:
        raise Exception("❌ Error: No route found or incorrect response format.")

# Endpoint to serve the map
@app.route('/get-map')
def serve_map():
    try:
        map_filename = generate_map()
        with open(map_filename, 'r', encoding='utf-8') as f:
            html_content = f.read()
        return Response(html_content, mimetype='text/html')
    except Exception as e:
        return str(e), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)