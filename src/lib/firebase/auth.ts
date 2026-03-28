"use client";

import { GoogleAuthProvider, signInWithPopup, signOut, getAuth } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { app, db } from "./config";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth };

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      createdAt: serverTimestamp(),
    });
  }

  return user;
}

export async function logout() {
  await signOut(auth);
}
