import requests

def get_coordinates(location):

    url = "https://nominatim.openstreetmap.org/search"

    params = {
        "q": location,
        "format": "json",
        "limit": 1
    }

    headers = {
        "User-Agent": "ai-grievance-system"
    }

    response = requests.get(url, params=params, headers=headers)

    data = response.json()

    if len(data) == 0:
        return None, None

    lat = float(data[0]["lat"])
    lng = float(data[0]["lon"])

    return lat, lng