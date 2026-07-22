// =========================
// CART
// =========================

export let cart = JSON.parse(localStorage.getItem("cart")) || [];

// =========================
// SAVE
// =========================

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// =========================
// ADD TO CART
// =========================

export function addToCart(product) {
  
 const existing = cart.find(item =>
  item.id === product.id &&
  item.sauce === product.sauce &&
  JSON.stringify(item.extras) === JSON.stringify(product.extras) &&
  JSON.stringify(item.without) === JSON.stringify(product.without)
);
  if (existing) {
    
    existing.quantity++;
    
  } else {
    
    cart.push({
      ...product,
      quantity: 1
    });
    
  }
  
  saveCart();
  
  console.log(cart);
  
}

// =========================
// GET CART
// =========================

export function getCart() {
  return cart;
}

// =========================
// CLEAR CART
// =========================

export function clearCart() {
  
  cart = [];
  
  saveCart();
  
}
// =========================
// INCREASE
// =========================

export function increaseQuantity(index) {
  
  cart[index].quantity++;
  
  saveCart();
  
}

// =========================
// REMOVE
// =========================

export function removeFromCart(index) {
  
  cart.splice(index, 1);
  
  saveCart();
  
}

// =========================
// DECREASE
// =========================

export function decreaseQuantity(index) {
  
  cart[index].quantity--;
  
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  
  saveCart();
  
}