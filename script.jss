const statusEl = document.getElementById('status');
const currentLocationEl = document.getElementById('current-location');
const randomDestinationEl = document.getElementById('random-destination');
const distanceEl = document.getElementById('distance');
const wanderButton = document.getElementById('wander-button');
const MAX_RADIUS_KM = 1; // Maximum distance for the random point

let userLat = null;
let userLon = null;

// --- Utility Functions ---

/**
 * Calculates a random point within a given radius (in km) from a center point.
 * Uses the approximate Earth radius (R=6371 km).
 */
function getRandomDestination(lat, lon, radius) {
    // Convert radius from km to radians
    const radiusInDeg = radius / 111.32; // Approx km per degree of latitude

    // Generate random angle (bearing) and distance factor
    const randomAngle = Math.random() * 2 * Math.PI;
    const randomDistanceFactor = Math.random(); // Ensures points are scattered within the circle

    // Calculate new latitude
    let newLat = lat + randomDistanceFactor * radiusInDeg * Math.cos(randomAngle);

    // Calculate new longitude, adjusting for latitude (parallels get closer at poles)
    let newLon = lon + (randomDistanceFactor * radiusInDeg * Math.sin(randomAngle)) / Math.cos(lat * (Math.PI / 180));
    
    // Ensure the new longitude is within the -180 to 180 range
    if (newLon > 180) newLon -= 360;
    else if (newLon < -180) newLon += 360;

    return { lat: newLat, lon: newLon };
}

/**
 * Calculates the distance between two coordinates using the Haversine formula.
 * Returns distance in kilometers.
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    lat1 = lat1 * (Math.PI / 180);
    lat2 = lat2 * (Math.PI / 180);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// --- Main Logic ---

/**
 * Main function to get the user's location.
 */
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLat = position.coords.latitude;
                userLon = position.coords.longitude;
                
                statusEl.textContent = 'Location found!';
                currentLocationEl.innerHTML = `Latitude: ${userLat.toFixed(6)}<br>Longitude: ${userLon.toFixed(6)}`;
                
                // Once location is known, enable the button and get the first random location
                wanderButton.disabled = false;
                wanderButton.click(); // Trigger the first random point
            },
            (error) => {
                // Handle errors like permission denial or unavailable service
                statusEl.textContent = `Error: ${error.message}. Please allow location access.`;
                currentLocationEl.textContent = 'Location unavailable.';
                wanderButton.disabled = true;
                console.error("Geolocation Error:", error);
            }
        );
    } else {
        statusEl.textContent = "Geolocation is not supported by this browser.";
        wanderButton.disabled = true;
    }
}

/**
 * Generates and displays a new random destination.
 */
function generateRandomDestination() {
    if (userLat === null || userLon === null) {
        randomDestinationEl.textContent = "Still searching for your initial location...";
        return;
    }

    const { lat: randLat, lon: randLon } = getRandomDestination(userLat, userLon, MAX_RADIUS_KM);
    const distance = calculateDistance(userLat, userLon, randLat, randLon);
    
    randomDestinationEl.innerHTML = `Latitude: **${randLat.toFixed(6)}**<br>Longitude: **${randLon.toFixed(6)}**`;
    distanceEl.textContent = `Distance: ${distance.toFixed(2)} km`;
    
    // Optional: Create a link to Google Maps for directions
    const mapsLink = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLon}&destination=${randLat},${randLon}`;
    distanceEl.innerHTML += `<br><a href="${mapsLink}" target="_blank">Get Directions (Google Maps)</a>`;
}

// --- Event Listeners and Initialization ---

wanderButton.addEventListener('click', generateRandomDestination);
wanderButton.disabled = true; // Disable until location is found

// Start the location process when the page loads
window.onload = getUserLocation;
