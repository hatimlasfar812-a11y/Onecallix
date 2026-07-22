import { db } from "./firebase.js";
import { addToCart, getCart } from "./cart.js";

import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =====================
// URL
// =====================

const params = new URLSearchParams(window.location.search);
const restaurantId = params.get("id");

// =====================
// ELEMENTS
// =====================



const productModal = document.getElementById("productModal");

const productContent = productModal ?
  productModal.querySelector("#productContent") :
  null;

if (!productModal || !productContent) {
  console.error("Product modal not found");
}

const menuContainer =
  document.getElementById("restaurantMenu");

const categoriesContainer =
  document.getElementById("restaurantCategories");
// =====================
// DATA
// =====================

let products = [];

// =====================
// LOAD MENU
// =====================

async function loadMenu() {
  localStorage.setItem("restaurantId", restaurantId);
  
  if (!restaurantId) {
    menuContainer.innerHTML = "<p>Restaurant not found.</p>";
    return;
  }
  
  products = [];
  
  const snapshot = await getDocs(
    collection(db, "restaurants", restaurantId, "menu")
  );
  
  console.log("Restaurant ID:", restaurantId);
console.log("Docs:", snapshot.size);


  
  snapshot.forEach((docSnap) => {
    
    products.push({
      id: docSnap.id,
      ...docSnap.data()
    });
    
  });
  
  createCategories();
  renderProducts(products);
  
}

// =====================
// CATEGORIES
// =====================

function createCategories() {
  
  categoriesContainer.innerHTML = "";
  
  const categories = [...new Set(products.map(p => p.category))];
  
  categories.unshift("All");
  
  categories.forEach(category => {
    
    const btn = document.createElement("button");
    
    btn.className = "category-btn";
    btn.textContent = category;
    
    btn.onclick = () => {
      
      document
        .querySelectorAll(".category-btn")
        .forEach(b => b.classList.remove("active"));
      
      btn.classList.add("active");
      
      if (category === "All") {
        
        renderProducts(products);
        
      } else {
        
        renderProducts(
          products.filter(p => p.category === category)
        );
        
      }
      
    };
    
    categoriesContainer.appendChild(btn);
    
  });
  
  categoriesContainer.firstElementChild?.classList.add("active");
  
}

// =====================
// RENDER PRODUCTS
// =====================

function renderProducts(list) {
  
  menuContainer.innerHTML = "";
  
  if (!list.length) {
    
    menuContainer.innerHTML =
      "<p style='padding:20px'>No menu found.</p>";
    
    return;
    
  }
  
  list.forEach(item => {
    
    menuContainer.innerHTML += `

<div class="menu-card" data-id="${item.id}">

    <div class="food-info">

        <h3>${item.name}</h3>

        <p>${item.description || ""}</p>

       <h4>${item.price} MAD</h4>

    </div>

    <div class="food-image">

        <img src="${item.image}" alt="${item.name}">

        <button class="product-plus">+</button>

    </div>

</div>

`;
    
  });
  
}
// =====================
// PRODUCT CLICK
// =====================

document.addEventListener("click", async (e) => {
        
  const trigger = e.target.closest(".product-plus, .food-image img");
        
  if (!trigger) return;
        
  const card = trigger.closest(".menu-card");
        
  const id = card.dataset.id;
  const product = products.find(p => p.id === id);
  
  if (!product) return;
  console.log(product);
console.log("optionType =", product.optionType);
 
  if (!product.optionType) {
  
 
 
 
 
 const sauce =
  document.querySelector('input[name="sauce"]:checked')?.value || "";

const extras = [...document.querySelectorAll('input[data-price]:checked')]
  .map(el => ({
    name: el.value,
    price: Number(el.dataset.price)
  }));

const without = [...document.querySelectorAll(
  '.option-group input[type="checkbox"]:checked:not([data-price])'
)].map(el => el.value);

const extraPrice = extras.reduce((sum, e) => sum + e.price, 0);

addToCart({
  
  id: product.id,
  name: product.name,
  image: product.image,
  
  price: product.price + extraPrice,
  
  sauce,
  extras,
  without,
  
  quantity: 1
  
});
  updateCartBadge();
  
  return;
  
}
  
  const optionDoc = await getDoc(
    doc(db, "menuOptions", product.optionType)
  );
  
  if (!optionDoc.exists()) {
    
    alert("Options not found");
    
    return;
    
  }
  
  const options = optionDoc.data();
  
  let html = `

<h2>${product.name}</h2>

<p>${product.description || ""}</p>

`;
  
  // Sauces
  if (options.sauces) {
    
    html += `
<details class="option-group">
<summary>Sauces</summary>
`;
    
    for (const name in options.sauces) {
      
      html += `
<label class="option-item">
<input type="radio" name="sauce" value="${name}">
<span>${name}</span>
</label>
`;
      
    }
    
    html += `</details>`;
    
  }
  
  // Extras
  if (options.extras) {
    
    html += `
<details class="option-group">
<summary>Extras</summary>
`;
    
    Object.entries(options.extras).forEach(([name, price]) => {
      
      html += `
<label class="option-item">
<input type="checkbox" value="${name}" data-price="${price}">
<span>${name} (+${price} DH)</span>
</label>
`;
      
    });
    
    html += `</details>`;
    
  }
  
  // Without
  if (options.without) {
    
    html += `
<details class="option-group">
<summary>Without</summary>
`;
    
    for (const name in options.without) {
      
      html += `
<label class="option-item">
<input type="checkbox" value="${name}">
<span>${name}</span>
</label>
`;
      
    }
    
    html += `</details>`;
    
  }
  
  html += `

<button id="addToCart">
Ajouter au panier
</button>

`;
  
 if (productModal && productContent) {
  
  productContent.innerHTML = html;
  
  productModal.style.display = "flex";
  
}
  document.getElementById("addToCart").onclick = () => {
    
   
   const sauce =
  document.querySelector('input[name="sauce"]:checked')?.value || "";

const extras = [...document.querySelectorAll('input[data-price]:checked')]
  .map(input => ({
    name: input.value,
    price: Number(input.dataset.price)
  }));

const without = [...document.querySelectorAll('.option-group input[type="checkbox"]:checked:not([data-price])')]
  .map(input => input.value);

const extraPrice = extras.reduce((sum, e) => sum + e.price, 0);

addToCart({
  id: product.id,
  name: product.name,
  image: product.image,
  price: product.price + extraPrice,
  sauce,
  extras,
  without,
  quantity: 1
});
   
   
    updateCartBadge();
    productModal.style.display = "none";
    
    alert("Produit ajouté au panier.");
    
  };
  
});

productModal.addEventListener("click", (e) => {
  
  if (e.target === productModal) {
    
    productModal.style.display = "none";
    
  }
  
});
// =====================
// START
// =====================
function updateCartBadge() {
  
  const cart = getCart();
  
  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  
  const cartBadge = document.getElementById("cartBadge");
  
  if (!cartBadge) return;
  
  cartBadge.textContent = totalItems;
  
  if (totalItems > 0) {
    cartBadge.style.display = "flex";
  } else {
    cartBadge.style.display = "none";
  }
  
}
document
  .getElementById("cartFab")
  ?.addEventListener("click", () => {
    
    window.location.href = "cart.html";
    
  });

loadMenu().then(() => {
  updateCartBadge();
});