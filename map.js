// map.js

var map;
var markers = []; // Store markers in an array

function initMap() {
  var center = { lat: 40.9827, lng: 28.6439 };
  var allowedBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(40.95, 28.58),
    new google.maps.LatLng(41.03, 28.7)
  );

  map = new google.maps.Map(document.getElementById("map"), {
    center: center,
    zoom: 15,
    restriction: {
      latLngBounds: allowedBounds,
      strictBounds: false,
    },
  });

  google.maps.event.addListener(map, "dblclick", function (event) {
    const title = document.getElementById("markerDescription").value;
    addMarker(event.latLng, title);
  });

  getMarkersFromServer(); // Fetch markers from server on map load
}

async function addMarker(location, title = null, markerId = null) {
  // Send marker data to the server
  if (!markerId) {
    markerId = await sendMarkerToServer(location, title ? title : "Marker");
  }

  var marker = new google.maps.Marker({
    map: map,
    position: location,
    title: title ? title : "Marker",
    markerId: markerId,
  });

  var infowindow = new google.maps.InfoWindow({
    content: `<strong>${
      title ? title : "Marker"
    }</strong><br><button onclick="deleteMarker('${markerId}')">Delete</button>`,
  });

  marker.addListener("click", function () {
    infowindow.open(map, marker);
  });

  // Store the marker in the markers array and send to server
  markers.push({ markerId: markerId, marker: marker });
}

async function sendMarkerToServer(location, title) {
  response = await fetch("http://localhost:3000/api/markers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      latitude: location.lat(),
      longitude: location.lng(),
      title: title,
    }),
  });
  data = await response.json();
  console.log("Marker added:", data);
  markers[markers.length - 1].markerId = data._id; // Update markerId with server's ID
  return data._id;
}

function getMarkersFromServer() {
  fetch("http://localhost:3000/api/markers")
    .then((response) => response.json())
    .then((markersFromServer) => {
      markersFromServer.forEach((marker) => {
        const markerLocation = new google.maps.LatLng(
          marker.latitude,
          marker.longitude
        );
        addMarker(markerLocation, marker.title, marker._id);
      });
    })
    .catch((error) => {
      console.error("Error fetching markers:", error);
    });
}

async function deleteMarker(markerId) {
  // Find the marker in the markers array by markerId
  var markerToDeleteIndex = markers.findIndex(
    (marker) => marker.markerId === markerId
  );

  if (markerToDeleteIndex !== -1) {
    // Remove the marker from the map
    markers[markerToDeleteIndex+1].marker.setMap(null);

    // Send a request to delete the marker from the server
    try {
      const response = await fetch(
        `http://localhost:3000/api/markers/${markerId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Remove the marker from the markers array
        markers.splice(markerToDeleteIndex, 1);
        console.log("Marker deleted successfully");
      } else {
        console.error("Failed to delete marker");
        // If deletion fails, re-add the marker back to the map
        markers[markerToDeleteIndex].marker.setMap(map);
      }
    } catch (error) {
      console.error("Error deleting marker:", error);
      // If an error occurs, re-add the marker back to the map
      markers[markerToDeleteIndex].marker.setMap(map);
    }
  } else {
    console.error("Marker not found");
  }
}

function geocodeAddress() {
  var address = document.getElementById("addressInput").value;
  var markerDescription = document.getElementById("markerDescription").value;

  var geocoder = new google.maps.Geocoder();

  geocoder.geocode(
    { address: address, componentRestrictions: { country: "TR" } },
    function (results, status) {
      if (status === "OK" && results.length > 0) {
        var location = results[0].geometry.location;
        map.panTo(location);
        var formattedAddress = results[0].formatted_address;
        addMarker(location, markerDescription);
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    }
  );
}
