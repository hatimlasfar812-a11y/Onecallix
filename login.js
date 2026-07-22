import { auth, db } from "./firebase.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =====================
// GOOGLE LOGIN
// =====================

const googleBtn = document.getElementById("googleLogin");
const provider = new GoogleAuthProvider();

googleBtn.addEventListener("click", async () => {
  
  try {
    
    const result = await signInWithPopup(auth, provider);
    
    const user = result.user;
    
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: user.displayName || "",
      email: user.email || "",
      phone: user.phoneNumber || "",
      photo: user.photoURL || "",
      createdAt: serverTimestamp()
    }, { merge: true });
    
    window.location.href = "index.html";
    
  } catch (error) {
    
    alert(error.message);
    console.error(error);
    
  }
  
});

// =====================
// PHONE LOGIN
// =====================

window.recaptchaVerifier = new RecaptchaVerifier(
  auth,
  "recaptcha-container",
  {
    size: "invisible"
  }
);

document.getElementById("phoneLogin").addEventListener("click", async () => {
  
  const phone = prompt("Enter phone number\nExample: +212612345678");
  
  if (!phone) return;
  
  try {
    
    const confirmation = await signInWithPhoneNumber(
      auth,
      phone,
      window.recaptchaVerifier
    );
    
    const code = prompt("Verification code");
    
    if (!code) return;
    
    const result = await confirmation.confirm(code);
    
    const user = result.user;
    
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      phone: user.phoneNumber,
      createdAt: serverTimestamp()
    }, { merge: true });
    
    window.location.href = "index.html";
    
  } catch (error) {
    
    alert(error.message);
    console.error(error);
    
  }
  
});