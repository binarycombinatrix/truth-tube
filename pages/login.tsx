"use client";
import type { FormEvent } from "react";
import { useState, useEffect } from "react";
import { signIn } from "aws-amplify/auth";
import Toast from "./components/toast";

interface SignInFormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
}

interface SignInForm extends HTMLFormElement {
  readonly elements: SignInFormElements;
}

export default function Login() {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "error" | "info">("success");
  async function handleSubmit(event: FormEvent<SignInForm>) {
    event.preventDefault();
    const form = event.currentTarget;
    // ... validate inputs
    try {
      const signInResult = await signIn({
        username: form.elements.email.value,
        password: form.elements.password.value,
      });

      console.log("sign in outcome=>`", signInResult);

      if (signInResult.isSignedIn === true) {
        setType("success");
        setMessage("Signed in successfully");
      }
    } catch (err) {
      setType("error");
      setMessage("Sign in error: " + err);
      console.log("sign in error=>`", err);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input type="text" id="email" name="email" />
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" name="password" />
        <input type="submit" />
      </form>

      {message && <Toast message={message} type={type} />}
    </>
  );
}
