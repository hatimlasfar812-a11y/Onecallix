
import { db } from "./firebase.js";

import {
  getFavorites,
  isFavorite,
  toggleFavorite
} from "./favorites.js";

import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =========================
// ELEMENTS
// =========================

const foodCategories = document.getElementById("foodCategories");
const restaurantsContainer =
  document.getElementById("restaurantsContainer");
const searchInput =
  document.getElementById("searchInput");
  
  const searchSuggestions =
  document.getElementById("searchSuggestions");
  
  const params = new URLSearchParams(window.location.search);
const categoryFromHome = params.get("category");
console.log("categoryFromHome =", categoryFromHome);

// =========================
// LOAD FOOD CATEGORIES
// =========================

async function loadFoodCategories() {
  
  foodCategories.innerHTML = "";
  
  const q = query(
    collection(db, "foodCategories"),
    orderBy("order")
  );
  
  const snapshot = await getDocs(q);
  
  snapshot.forEach((doc) => {
    
    const item = doc.data();
    console.log("Food slug =", item.slug);
    
    if (!item.active) return;
    
    foodCategories.innerHTML += `

      <div
        class="food-category"
        data-category="${item.slug}">

        <img
          src="${item.image}"
          alt="${item.name}">

        <span>${item.name}</span>

      </div>

    `;
    
  });
  
}


let selectedCategories = [];
// =========================
// CATEGORY EVENTS
// =========================

function setupCategoryEvents() {
  
  const categories = document.querySelectorAll(".food-category");
  
  categories.forEach(category => {
    
    category.addEventListener("click", () => {
      
      const slug = category.dataset.category;
      
      if (category.classList.contains("active")) {
        
        category.classList.remove("active");
        
        selectedCategories =
          selectedCategories.filter(item => item !== slug);
        
      } else {
        
        category.classList.add("active");
        
        selectedCategories.push(slug);
        
      }
      
    updateRestaurantFilter();
      
    });
    
  });
  
}

// =========================
// UPDATE FILTER
// =========================

function updateRestaurantFilter() {
  
  console.log(selectedCategories);
  
const value = searchInput.value.trim().toLowerCase();
loadRestaurants(selectedCategories, value);
}
// =========================
// LOAD RESTAURANTS
// =========================

async function loadRestaurants(categories = [], search = "") {
  
  restaurantsContainer.innerHTML = "";
  
  const snapshot =
    await getDocs(collection(db, "restaurants"));
  
  snapshot.forEach((doc) => {
    
const item = doc.data();
const keywords = item.searchKeywords || [];

const matchSearch =
  search === "" ||
  item.name.toLowerCase().includes(search) ||
  keywords.some(keyword =>
    keyword.toLowerCase().includes(search)
  );
if (!matchSearch) return;

    const restaurantCategories = item.foodCategories || [];
    
    if (categories.length > 0) {
      
      const match = restaurantCategories.some(category =>
        categories.includes(category)
      );
      
      if (!match) return;
      
    }
    
   restaurantsContainer.innerHTML += `

<div
    class="restaurant-card"
    data-id="${doc.id}">

  <div class="restaurant-image-wrapper">

    <img
      class="restaurant-image"
      src="${item.image}"
      alt="${item.name}">

    <div class="restaurant-favorite">
      <i class="fa-regular fa-heart"></i>
    </div>

    <span class="restaurant-status ${item.isOpen ? "open" : "closed"}">
      ${item.isOpen ? "Open" : "Closed"}
    </span>

  </div>

  <div class="restaurant-content">

    <div class="restaurant-header">

      <h3>${item.name}</h3>

      <span class="restaurant-rating">
        ⭐ ${item.rating}
      </span>

    </div>

    <p class="restaurant-cuisine">
      ${item.categoryName || ""}
    </p>

    <div class="restaurant-meta">

      <span>🛵 ${item.deliveryFee}</span>

      <span>⏱ ${item.deliveryTime}</span>

    </div>

  </div>

</div>

`;
    
  });
  setupRestaurantEvents();
  
}
// =========================
// OPEN RESTAURANT
// =========================

function setupRestaurantEvents() {
  
  const cards = document.querySelectorAll(".restaurant-card");
  
  cards.forEach(card => {
    
    card.addEventListener("click", () => {
      
      const id = card.dataset.id;
      
      
     window.location.href = `restaurant.html?id=${id}`;
    });
    
  });
  
document.querySelectorAll(".restaurant-favorite").forEach(btn => {
  
  const icon = btn.querySelector("i");
  
  const card = btn.closest(".restaurant-card");
  const id = card.dataset.id;
  
  if (isFavorite(id)) {
    
    icon.classList.remove("fa-regular");
    icon.classList.add("fa-solid");
    icon.style.color = "#FF3B30";
    
  }
  
  btn.addEventListener("click", (e) => {
    
    e.stopPropagation();
    
    const favorite = toggleFavorite(id);
    
    if (favorite) {
      
      icon.classList.remove("fa-regular");
      icon.classList.add("fa-solid");
      icon.style.color = "#FF3B30";
      
    } else {
      
      icon.classList.remove("fa-solid");
      icon.classList.add("fa-regular");
      icon.style.color = "";
      
    }
    
  });
  
});
}




// =========================
// LOCATION
// =========================

const locationBtn = document.getElementById("locationBtn");
const currentLocation = document.getElementById("currentLocation");
const savedAddress = localStorage.getItem("deliveryAddress");

if (savedAddress) {
  currentLocation.textContent = savedAddress;
}

const locationModal = document.getElementById("locationModal");
const locationOverlay = document.getElementById("locationOverlay");

const currentLocationBtn = document.getElementById("currentLocationBtn");
const mapLocationBtn = document.getElementById("mapLocationBtn");
const closeLocationModal = document.getElementById("closeLocationModal");

const mapContainer = document.getElementById("mapContainer");
const confirmLocation = document.getElementById("confirmLocation");

let map = null;
let marker = null;
let selectedLat = null;
let selectedLng = null;

// فتح النافذة

locationBtn.addEventListener("click", () => {
  
  locationModal.classList.add("show");
  locationOverlay.classList.add("show");
  
});

// إغلاق

function closeModal() {
  
  locationModal.classList.remove("show");
  locationOverlay.classList.remove("show");
  mapContainer.classList.remove("show");
  
}

closeLocationModal.addEventListener("click", closeModal);
locationOverlay.addEventListener("click", closeModal);

// =========================
// CURRENT LOCATION
// =========================

currentLocationBtn.addEventListener("click", () => {
  
  if (!navigator.geolocation) {
    alert("Geolocation is not supported.");
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    
    (position) => {
      
     const lat = position.coords.latitude;
const lng = position.coords.longitude;

selectedLat = lat;
selectedLng = lng;

fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  )
  .then(response => response.json())
  .then(data => {
    
   
   const a = data.address;

const place =
  a.road ||
  a.suburb ||
  a.neighbourhood ||
  a.city_district ||
  a.city ||
  a.town ||
  a.village;

const city =
  a.city ||
  a.town ||
  a.village ||
  "";

const address = city && place !== city ?
  `${place}, ${city}` :
  place;

currentLocation.textContent = `📍 ${address}`;

localStorage.setItem(
  "deliveryAddress",
  `📍 ${address}`
);
    
    closeModal();
    
  })
  .catch(() => {
    
    currentLocation.textContent = "Current Location";
    
    closeModal();
    
  });
    },
    
    (error) => {
      
      alert(error.message);
      
    }
    
  );
  
});

// =========================
// CHOOSE ON MAP
// =========================

mapLocationBtn.addEventListener("click", () => {
  
  mapContainer.classList.add("show");
  
  if (!map) {
    
    map = L.map("map").setView([34.68139, -1.90858], 13);
    
    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "© OpenStreetMap"
      }
    ).addTo(map);
    
    marker = L.marker([34.68139, -1.90858], {
      draggable: true
    }).addTo(map);
    
    map.on("click", (e) => {
      
      marker.setLatLng(e.latlng);
      
      selectedLat = e.latlng.lat;
      selectedLng = e.latlng.lng;
      
    });
    
    marker.on("dragend", () => {
      
      const pos = marker.getLatLng();
      
      selectedLat = pos.lat;
      selectedLng = pos.lng;
      
    });
    
  }
  
  setTimeout(() => {
    
    map.invalidateSize();
    
  }, 300);
  
});

// =========================
// CONFIRM LOCATION
// =========================

confirmLocation.addEventListener("click", () => {
  
  if (selectedLat === null || selectedLng === null) {
    alert("Please choose a location.");
    return;
  }
  
  fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${selectedLat}&lon=${selectedLng}`
    )
    .then(response => response.json())
  .then(data => {
  
  const a = data.address;
  
  const place =
    a.road ||
    a.suburb ||
    a.neighbourhood ||
    a.city_district ||
    a.city ||
    a.town ||
    a.village;
  
  const city =
    a.city ||
    a.town ||
    a.village ||
    "";
  
  const address = city && place !== city ?
    `${place}, ${city}` :
    place;
  
  currentLocation.textContent = `📍 ${address}`;
  
  localStorage.setItem(
    "deliveryAddress",
    `📍 ${address}`
  );
  
  closeModal();
  
})
    .catch(() => {
      
      currentLocation.textContent = "Selected Location";
      
      closeModal();
      
    });
  
});

searchInput.addEventListener("input", async () => {
  
  const value = searchInput.value.trim().toLowerCase();
  
  if (value === "") {
    
    searchSuggestions.classList.remove("show");
    searchSuggestions.innerHTML = "";
    
   loadRestaurants(selectedCategories, value);
    
    return;
  }
  
  searchSuggestions.innerHTML = "";
  
  const snapshot =
    await getDocs(collection(db, "restaurants"));
  
  snapshot.forEach((doc) => {
    
    const item = doc.data();
    
  const keywords = item.searchKeywords || [];

const matchName =
  item.name.toLowerCase().includes(value);

const matchKeywords =
  keywords.some(keyword =>
    keyword.toLowerCase().includes(value)
  );

if (!matchName && !matchKeywords) return;
    
    searchSuggestions.innerHTML += `

      <div
        class="search-item"
        data-name="${item.name}">

        🍽️ ${item.name}

      </div>

    `;
    
  });
  
  if (searchSuggestions.innerHTML !== "") {
    
    searchSuggestions.classList.add("show");
    
  } else {
    
    searchSuggestions.classList.remove("show");
    
  }
  
  document.querySelectorAll(".search-item").forEach(item => {
    
    item.addEventListener("click", () => {
      
      searchInput.value = item.dataset.name;
      
      searchSuggestions.classList.remove("show");
      
     loadRestaurants(selectedCategories, value);
      
    });
    
  });
  
 loadRestaurants(selectedCategories, value);
  
});
document.addEventListener("click", (e) => {
  
  if (!e.target.closest(".search-box")) {
    
    searchSuggestions.classList.remove("show");
    
  }
  
});

// =========================
// START
// =========================

await loadFoodCategories();

setupCategoryEvents();

// بعد ما يتحملو الكاتيغوريز
if (categoryFromHome && categoryFromHome !== "all") {
  
  setTimeout(() => {
    
    const category = document.querySelector(
      `.food-category[data-category="${categoryFromHome}"]`
    );
    
    if (category) {
      category.click();
      console.log("Category found:", category.dataset.category);
    }
    
  }, 100);
  
} else {
  
  await loadRestaurants();
  
}