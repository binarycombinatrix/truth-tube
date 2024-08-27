"use client"
import type { FormEvent } from "react"
import Router from "next/router"
import { signUp, confirmSignUp } from "aws-amplify/auth"
import { useState, useEffect } from "react"
import { generateClient } from "aws-amplify/data"
import type { Schema } from "@/amplify/data/resource"
import Toast from "../components/toast"

const client = generateClient<Schema>()

interface SignUpFormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement
  password: HTMLInputElement
}

interface VerifyFormElements extends HTMLFormControlsCollection {
  code: HTMLInputElement
  email: HTMLInputElement
}

interface SignUpForm extends HTMLFormElement {
  readonly elements: SignUpFormElements
}

interface VerifyForm extends HTMLFormElement {
  readonly elements: VerifyFormElements
}

export default function App() {
  const [message, setMessage] = useState("")
  const [type, setType] = useState<"success" | "error" | "info">("success")
  async function handleSubmit(event: FormEvent<SignUpForm>) {
    event.preventDefault()
    const form = event.currentTarget
    // ... validate inputs

    try {
      const signUpResult = await signUp({
        username: form.elements.email.value,
        password: form.elements.password.value,
      })
      if (signUpResult.nextStep) {
        setType("info")
        setMessage("Verify the account using code in email: ")
        console.log("sign up next Step= verify`", signUpResult)
      }
    } catch (err) {
      setType("error")
      setMessage("Sign up error: " + err)
      console.log("sign up error=>`", err)
    }
  }

  async function handleVerifySubmit(event: FormEvent<VerifyForm>) {
    event.preventDefault()
    const form = event.currentTarget
    // ... validate inputs
    try {
      const confirmSignUpResult = await confirmSignUp({
        username: form.elements.email.value,
        confirmationCode: form.elements.code.value,
      })
      if (confirmSignUpResult.nextStep) {
        setType("success")
        setMessage("Account created successfully")

        console.log("sign up success=>`", confirmSignUpResult)
        Router.push("/login")
      }
    } catch (err) {
      setType("error")
      setMessage("Sign up error: " + err)
      console.log("sign up error=>`", err)
    }
  }

  return (
    <>
      {message && <Toast message={message} type={type} />}

      {type === "info" ? (
        <form onSubmit={handleVerifySubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="text" id="email" name="email" />
          </div>
          <div className="form-group">
            <label htmlFor="code">Code:</label>
            <input type="text" id="code" name="code" />
          </div>
          <button type="submit" className="submit-button">
            Sign Up
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="text" id="email" name="email" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" />
          </div>
          <button type="submit" className="submit-button">
            Sign Up
          </button>
        </form>
      )}
    </>
  )
}
