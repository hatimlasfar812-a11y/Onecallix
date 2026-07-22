
import {
  getCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart
} from "./cart.js";

const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const backBtn = document.querySelector(".back-btn");

const restaurantId = localStorage.getItem("restaurantId");

backBtn.href = `restaurant.html?id=${restaurantId}`;



function renderCart() {
  
  const cart = getCart();
  
  cartItems.innerHTML = "";
  
  let total = 0;
  
  if (cart.length === 0) {
    
    cartItems.innerHTML =
      "<p style='padding:20px;text-align:center;'>Votre panier est vide</p>";
    
 cartTotal.textContent = "0 MAD";
    
    return;
  }
  
  cart.forEach((item, index) => {
    
    total += item.price * item.quantity;
    
    cartItems.innerHTML += `

    <div class="cart-item">

      <img src="${item.image}" class="cart-image">

      <div class="cart-info">

        <div class="cart-top">

          <h3>${item.name}</h3>

          <button class="delete-item" data-index="${index}">
            🗑️
          </button>

        </div>

        ${
          item.sauce
            ? `<p><strong>Sauce:</strong> ${item.sauce}</p>`
            : ""
        }

        ${
          item.extras?.length
            ? `<p><strong>Extras:</strong> ${item.extras.map(e => `${e.name} (+${e.price} DH)`).join(", ")}</p>`
            : ""
        }

        ${
          item.without?.length
            ? `<p><strong>Without:</strong> ${item.without.join(", ")}</p>`
            : ""
        }

       <p class="price">${item.price} MAD</p>

        <div class="qty-box">

          <button class="minus" data-index="${index}">−</button>

          <span>${item.quantity}</span>

          <button class="plus" data-index="${index}">+</button>

        </div>

      </div>

    </div>

    `;
    
  });
  
  cartTotal.textContent = total.toFixed(2) + " MAD";
}

document.addEventListener("click", (e) => {
  
  if (e.target.classList.contains("plus")) {
    increaseQuantity(Number(e.target.dataset.index));
    renderCart();
  }
  
  if (e.target.classList.contains("minus")) {
    decreaseQuantity(Number(e.target.dataset.index));
    renderCart();
  }
  
  if (e.target.classList.contains("delete-item")) {
    removeFromCart(Number(e.target.dataset.index));
    renderCart();
  }
  
});

renderCart();