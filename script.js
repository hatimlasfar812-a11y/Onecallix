
import { db, auth } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =========================
// FILTER MODAL
// =========================

const filterBtn = document.getElementById("filterBtn");
const modal = document.getElementById("filterModal");
const closeBtn = document.getElementById("closeModal");

if (filterBtn && modal && closeBtn) {
  
  filterBtn.addEventListener("click", () => {
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  });
  
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  });
  
}





// =========================
// ELEMENTS
// =========================

const container = document.querySelector(".restaurants-scroll");
const categoriesContainer = document.getElementById("categoriesContainer");
const searchInput = document.getElementById("searchInput");

// =========================
// SMART SEARCH
// =========================

function similarity(a, b) {
  
  a = (a || "").toLowerCase();
  b = (b || "").toLowerCase();
  
  if (a.includes(b) || b.includes(a)) return true;
  
  let matches = 0;
  
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    
    if (a[i] === b[i]) matches++;
    
  }
  
  return matches >= Math.min(a.length, b.length) * 0.6;
  
}

// =========================
// LOAD RESTAURANTS
// =========================

async function loadRestaurants(category = "all", search = "") {
  
  container.innerHTML = "";
  
  let q;
  
  if (category === "all") {
    
    q = collection(db, "restaurants");
    
  } else {
    
    q = query(
      collection(db, "restaurants"),
      where("category", "==", category)
    );
    
  }
  
  const snapshot = await getDocs(q);
  
  const text = search.trim().toLowerCase();
  
  snapshot.forEach((doc) => {
    
    const item = doc.data();
    
    if (text !== "") {
      
      const name = (item.name || "").toLowerCase();
      
      const categoryName = (item.category || "").toLowerCase();
      
      const keywords = (item.searchKeywords || []).map(k =>
        k.toLowerCase()
      );
      
      const found =
        
        similarity(name, text) ||
        
        similarity(categoryName, text) ||
        
        keywords.some(keyword =>
          similarity(keyword, text)
        );
      
      if (!found) return;
      
    }
    
    container.innerHTML += `

<a href="menu.html?id=${doc.id}" class="restaurant-link">

<div class="restaurant-card">

<div class="image-wrapper">

<img src="${item.image}" alt="${item.name}">

<span class="delivery-time">

${item.deliveryTime}

</span>

</div>

<div class="restaurant-info">

<div class="top-row">

<h3 class="restaurant-name">

${item.name}

</h3>

<span class="restaurant-rating">

⭐ ${item.rating}

</span>

</div>

<p class="restaurant-category">

${item.category}

</p>

<p class="restaurant-fee">

${item.deliveryFee}

</p>

</div>

</div>

</a>

`;
    
  });
  
}
// =========================
// LOAD CATEGORIES
// =========================


async function loadCategories() {
  
  categoriesContainer.innerHTML = `
    <div class="category active" data-category="all">
      <i class="fa-solid fa-border-all"></i>
      <span>All</span>
    </div>
  `;
  
  const q = query(
    collection(db, "categories"),
    orderBy("order")
  );
  
  const snapshot = await getDocs(q);
  
  snapshot.forEach((doc) => {
    
    const item = doc.data();
    
    categoriesContainer.innerHTML += `
      <div class="category" data-category="${doc.id}">
        <i class="${item.icon}"></i>
        <span>${item.name}</span>
      </div>
    `;
    
  });
  
  const buttons = categoriesContainer.querySelectorAll(".category");
  
 
  buttons.forEach(btn => {
    
    btn.addEventListener("click", () => {
      
      window.location.href =
        `food.html?category=${btn.dataset.category}`;
      
    });
    
  });
}


// =========================
// LIVE SEARCH
// =========================

if (searchInput) {
  
  searchInput.addEventListener("input", () => {
    
    const active = document.querySelector(".category.active");
    
    const category = active ?
      active.dataset.category :
      "all";
    
    loadRestaurants(category, searchInput.value);
    
  });
  
}
const services = document.querySelectorAll(".service-item");

services.forEach(service => {
  service.addEventListener("click", () => {
    
    service.classList.add("clicked");
    
    setTimeout(() => {
      service.classList.remove("clicked");
    }, 300);
    
  });
});




// =========================
// HEADER SEARCH BEHAVIOR
// =========================

const searchSection = document.getElementById("searchSection");
const header = document.querySelector(".header");
const headerSearch = document.getElementById("header-search");

if (searchSection && header && headerSearch) {
  
  const searchBox = searchSection.querySelector(".search-box");
  
  const clone = searchBox.cloneNode(true);
  
  // نحيدو ids باش ما يكونش تعارض
  const cloneInput = clone.querySelector("#searchInput");
  if (cloneInput) {
    cloneInput.removeAttribute("id");
  }
  
  const cloneFilter = clone.querySelector("#filterBtn");
  if (cloneFilter) {
    cloneFilter.removeAttribute("id");
  }
  
  
  headerSearch.appendChild(clone);
  
  
  window.addEventListener("scroll", () => {
    
    const top = searchSection.getBoundingClientRect().top;
    
    
    if (top <= 75) {
      
      header.classList.add("header-expanded");
      
    } else {
      
      header.classList.remove("header-expanded");
      
    }
    
  });
  
}
const slides = document.querySelectorAll(".hero-slide");
const dots = document.querySelectorAll(".dot");

let current = 0;

function showSlide(index) {
  
  slides.forEach(slide => slide.classList.remove("active"));
  dots.forEach(dot => dot.classList.remove("active"));
  
  slides[index].classList.add("active");
  dots[index].classList.add("active");
  
}

// Auto Slider
setInterval(() => {
  
  current++;
  
  if (current >= slides.length) {
    current = 0;
  }
  
  showSlide(current);
  
}, 4000);

// Next
document.querySelector(".next").onclick = () => {
  
  current++;
  
  if (current >= slides.length) current = 0;
  
  showSlide(current);
  
};

// Previous
document.querySelector(".prev").onclick = () => {
  
  current--;
  
  if (current < 0) current = slides.length - 1;
  
  showSlide(current);
  
};

// Dots
dots.forEach((dot, index) => {
  
  dot.onclick = () => {
    
    current = index;
    
    showSlide(current);
    
  };
  
});
document.getElementById("copyCoupon").onclick = () => {
  
  navigator.clipboard.writeText("WELCOME20");
  
  alert("Coupon copied");
  
};

document.getElementById("inviteFriends").onclick = () => {
  
  alert("Invite Friends");
  
};

document.getElementById("viewRewards").onclick = () => {
  
  window.location.href = "rewards.html";
  
};

document.getElementById("viewFlashDeals").onclick = () => {
  
  window.location.href = "flash.html";
  
};if (true) {
  
}
// =========================
// START
// =========================




// =========================
// LOGIN / PROFILE
// =========================

const loginBtn = document.getElementById("loginBtn");
const profileBtn = document.getElementById("profileBtn");

loginBtn.onclick = () => {
  location.href = "login.html";
};

profileBtn.onclick = async () => {
  
  await signOut(auth);
  
  location.href = "login.html";
  
};

onAuthStateChanged(auth, (user) => {
  
  if (user) {
    
    loginBtn.style.display = "none";
    profileBtn.style.display = "block";
    
    profileBtn.src =
      user.photoURL ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.displayName || user.phoneNumber || "User"
      )}`;
    
  } else {
    
    loginBtn.style.display = "block";
    profileBtn.style.display = "none";
    
  }
  
});

// =========================
// START
// =========================

lucide.createIcons();

loadCategories();
loadRestaurants();
