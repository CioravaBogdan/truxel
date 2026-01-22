import csv
import uuid
import random
import json
from datetime import datetime, timedelta

# List of US cities extracted from the provided data
cities = [
    {"id": "9a6ad61e-8d27-4387-b213-8ef21e99abab", "name": "Los Angeles", "lat": 34.0522, "lng": -118.2437},
    {"id": "55097026-40f9-4edd-b628-d01de6fdc903", "name": "Long Beach", "lat": 33.7701, "lng": -118.1937},
    {"id": "4bf1f783-2544-4d2b-9b01-58c4a04d932b", "name": "Ontario", "lat": 34.0633, "lng": -117.6509},
    {"id": "3bb5aaa3-2c1b-4bb7-a70e-fba66918c7bf", "name": "San Diego", "lat": 32.7157, "lng": -117.1611},
    {"id": "299d438e-b9d2-455c-a068-8f49dbd53ce7", "name": "Otay Mesa", "lat": 32.5710, "lng": -116.9716},
    {"id": "78f71f0b-fd60-4c91-9347-5b0f4c0c93a3", "name": "San Francisco", "lat": 37.7749, "lng": -122.4194},
    {"id": "ba90ec58-edb3-4098-952d-de2d36dd01b6", "name": "Oakland", "lat": 37.8044, "lng": -122.2711},
    {"id": "d08f323f-24d0-4904-9ea6-fb1e7821b3cf", "name": "San Jose", "lat": 37.3382, "lng": -121.8863},
    {"id": "70b13bab-3985-4e28-8517-6561c1c8a23e", "name": "Sacramento", "lat": 38.5816, "lng": -121.4944},
    {"id": "f40cb266-d7d9-4e27-9ab0-f822d6262b52", "name": "Stockton", "lat": 37.9577, "lng": -121.2908},
    {"id": "04f9f4a4-4f06-4ae6-be66-c28fc020bf69", "name": "Modesto", "lat": 37.6391, "lng": -120.9969},
    {"id": "a40ae9a9-1938-478d-adca-aa7c98333ced", "name": "Fresno", "lat": 36.7378, "lng": -119.7871},
    {"id": "3de88140-96ae-4bb1-bab7-06719c7a2247", "name": "Bakersfield", "lat": 35.3733, "lng": -119.0187},
    {"id": "da655dc1-315a-445c-a4cf-d1ac847b7628", "name": "Las Vegas", "lat": 36.1699, "lng": -115.1398},
    {"id": "c5c345df-e9f1-4479-8de5-60e8b051b99e", "name": "Phoenix", "lat": 33.4484, "lng": -112.0740},
    {"id": "d40ae6ee-a9d1-4afc-a7bb-bbe04ed890a6", "name": "Tucson", "lat": 32.2226, "lng": -110.9747},
    {"id": "a3b54618-b9f8-42f8-a3b7-fb0b21bb669e", "name": "Salt Lake City", "lat": 40.7608, "lng": -111.8910},
    {"id": "5825f080-02b5-4d38-b4ae-375b77ee26ce", "name": "Boise", "lat": 43.6150, "lng": -116.2023},
    {"id": "2cd3a83b-642a-4d45-938d-2babdd77b966", "name": "Seattle", "lat": 47.6062, "lng": -122.3321},
    {"id": "774b50b1-60e9-482b-9ac5-4db28b6f8dc2", "name": "Tacoma", "lat": 47.2529, "lng": -122.4443},
    {"id": "b863e890-bd5b-4d7e-ab22-aefb902b2a9f", "name": "Portland", "lat": 45.5152, "lng": -122.6784},
    {"id": "4dce2c63-05cd-440b-95cb-f65dd389cf62", "name": "Denver", "lat": 39.7392, "lng": -104.9903},
    {"id": "50bf842b-1893-4ed0-a794-7dc6740b447c", "name": "Albuquerque", "lat": 35.0844, "lng": -106.6504},
    {"id": "12346dcf-a672-4ee3-b19f-01aeffdb33c6", "name": "El Paso", "lat": 31.7619, "lng": -106.4850},
    {"id": "c89d2e42-8895-4c2a-b12f-52cff7faabee", "name": "Dallas", "lat": 32.7767, "lng": -96.7970},
    {"id": "a5eba884-4c70-4b14-8a99-04a3cd33b2d0", "name": "Fort Worth", "lat": 32.7555, "lng": -97.3308},
    {"id": "1c1b94ab-7c70-4c6e-9201-9281c06c92b0", "name": "Houston", "lat": 29.7604, "lng": -95.3698},
    {"id": "d0b423df-7c19-4dda-8ed1-8f781e408595", "name": "San Antonio", "lat": 29.4241, "lng": -98.4936},
    {"id": "4a9ef9fa-77a1-4104-b6ac-f0705bd4c27d", "name": "Austin", "lat": 30.2672, "lng": -97.7431},
    {"id": "05c5fc4a-e3a7-41ad-8d9b-e902b28f12e6", "name": "Laredo", "lat": 27.5306, "lng": -99.4803},
    {"id": "c634d132-6a33-4863-85fc-342872f88239", "name": "Oklahoma City", "lat": 35.4676, "lng": -97.5164},
    {"id": "be301dd8-058f-4b49-a92b-eb0378c67f8a", "name": "Tulsa", "lat": 36.1539, "lng": -95.9928},
    {"id": "7f654ed9-a52c-4828-8d57-83e302537000", "name": "Kansas City", "lat": 39.0997, "lng": -94.5786},
    {"id": "9b39b054-254b-4dd1-b46f-f46ce9f41ea1", "name": "St. Louis", "lat": 38.6270, "lng": -90.1994},
    {"id": "b44e2467-539d-4783-9b76-d7204ea48347", "name": "Omaha", "lat": 41.2565, "lng": -95.9345},
    {"id": "e3448c90-5dfd-4574-9c4b-3d687aa6a496", "name": "Des Moines", "lat": 41.5868, "lng": -93.6250},
    {"id": "931d2c67-5a57-438b-bd47-c97209f98fb9", "name": "Minneapolis", "lat": 44.9778, "lng": -93.2650},
    {"id": "91364237-182b-466f-b27b-929bdb8e8130", "name": "Milwaukee", "lat": 43.0389, "lng": -87.9065},
    {"id": "66318f16-77ac-4734-9d2e-b753f5ed68bb", "name": "Chicago", "lat": 41.8781, "lng": -87.6298},
    {"id": "343c5c45-9503-4706-b1a8-0506dbc7539b", "name": "Indianapolis", "lat": 39.7684, "lng": -86.1581},
    {"id": "f70885c8-0a7d-48a7-89f9-1dddd9c94639", "name": "Detroit", "lat": 42.3314, "lng": -83.0458},
    {"id": "6921c173-17d1-46eb-b1e1-6c470d4d05c5", "name": "Columbus", "lat": 39.9612, "lng": -82.9988},
    {"id": "021099ba-75bc-4ae7-8823-8fe7236b72b9", "name": "Cleveland", "lat": 41.4993, "lng": -81.6944},
    {"id": "db3a0f0f-1dfa-44bc-b0ba-ed5ab4417f51", "name": "Cincinnati", "lat": 39.1031, "lng": -84.5120},
    {"id": "ae500741-9481-4556-9a57-2c9380967ced", "name": "Atlanta", "lat": 33.7490, "lng": -84.3880},
    {"id": "1b28a0d4-10b4-46c1-803d-a83054114474", "name": "Charlotte", "lat": 35.2271, "lng": -80.8431},
    {"id": "c1f72782-019f-4316-b873-1f6f87289569", "name": "Nashville", "lat": 36.1627, "lng": -86.7816},
    {"id": "e6741b0b-b530-466d-9b16-562ec85888e5", "name": "Memphis", "lat": 35.1495, "lng": -90.0490},
    {"id": "334bfc4c-ca00-4336-9053-20ebd816d49c", "name": "Birmingham", "lat": 33.5186, "lng": -86.8104},
    {"id": "3cbf7f0d-7348-4037-ae4b-5369ff6b19d1", "name": "Mobile", "lat": 30.6954, "lng": -88.0399},
    {"id": "4efd76ae-976e-4cc3-bdf5-91543329064c", "name": "Jacksonville", "lat": 30.3322, "lng": -81.6557},
    {"id": "c2049e25-d90c-4874-a035-71424e64f7b2", "name": "Miami", "lat": 25.7617, "lng": -80.1918},
    {"id": "847250e7-3860-496a-a29d-4357908b877f", "name": "Tampa", "lat": 27.9506, "lng": -82.4572},
    {"id": "6cb10069-b5f7-4632-849c-9c74578b97e9", "name": "Orlando", "lat": 28.5383, "lng": -81.3792},
    {"id": "3cc7914d-8949-4558-b90f-767cf730b981", "name": "Pittsburgh", "lat": 40.4406, "lng": -79.9959},
    {"id": "ec282006-258a-40a2-9d33-4f93425f2061", "name": "Philadelphia", "lat": 39.9526, "lng": -75.1652},
    {"id": "52570072-bc2b-4560-b74a-464850787a24", "name": "New York", "lat": 40.7128, "lng": -74.0060},
    {"id": "787c8008-0118-472d-8b02-53531201dc9d", "name": "Boston", "lat": 42.3601, "lng": -71.0589},
    {"id": "65b99136-1e0e-473d-9d41-e941198642a8", "name": "Baltimore", "lat": 39.2904, "lng": -76.6122},
    {"id": "3f508826-7ec8-4719-aa66-d97e60f8a4ff", "name": "Washington", "lat": 38.9072, "lng": -77.0369}
]

def generate_random_metadata():
    directions = ["north", "south", "east", "west", "local", "long_haul"]
    truck_types = ["20T", "Flatbed", "Box Truck", "Refrigerated", "Van"]
    return json.dumps({
        "direction": random.choice(directions),
        "truck_type": random.choice(truck_types),
        "available_hours": random.randint(1, 72)
    })

def generate_random_destination(origin_city):
    dest = random.choice(cities)
    while dest["id"] == origin_city["id"]:
        dest = random.choice(cities)
    return dest

header = [
    "id", "user_id", "post_type", "status", 
    "origin_lat", "origin_lng", "origin_city", "origin_country",
    "dest_city", "dest_country", "dest_lat", "dest_lng",
    "template_key", "metadata", "contact_phone", "contact_whatsapp", "contact_email",
    "created_at", "updated_at", "expires_at", "view_count", "contact_count"
]

rows = []

for city in cities:
    num_drivers = random.randint(5, 10)
    for _ in range(num_drivers):
        
        origin = city
        dest = generate_random_destination(city)
        
        # Randomize origin slightly around the city center
        lat_offset = random.uniform(-0.05, 0.05)
        lng_offset = random.uniform(-0.05, 0.05)
        
        post_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        
        # Fake email
        first_names = ["john", "jane", "mike", "sarah", "david", "lisa", "tom", "emma", "robert", "jessica"]
        last_names = ["smith", "doe", "johnson", "brown", "wilson", "moore", "taylor", "anderson", "thomas", "jackson"]
        email = f"{random.choice(first_names)}.{random.choice(last_names)}{random.randint(10,99)}@example.com"
        
        created_at = datetime.utcnow().isoformat()
        updated_at = created_at
        expires_at = (datetime.utcnow() + timedelta(days=7)).isoformat()
        
        row = {
            "id": post_id,
            "user_id": user_id,
            "post_type": "DRIVER_AVAILABLE",
            "status": "active",
            "origin_lat": city["lat"] + lat_offset,
            "origin_lng": city["lng"] + lng_offset,
            "origin_city": city["name"],
            "origin_country": "United States",
            "dest_city": dest["name"],
            "dest_country": "United States",
            "dest_lat": dest["lat"],
            "dest_lng": dest["lng"],
            "template_key": random.choice(["north", "south", "local", "long_haul"]),
            "metadata": generate_random_metadata(),
            "contact_phone": "",
            "contact_whatsapp": "false",
            "contact_email": email,
            "created_at": created_at,
            "updated_at": updated_at,
            "expires_at": expires_at,
            "view_count": random.randint(0, 100),
            "contact_count": random.randint(0, 5)
        }
        rows.append(row)

with open('community_posts_complete.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=header)
    writer.writeheader()
    writer.writerows(rows)

print(f"Generated {len(rows)} posts for {len(cities)} cities.")
