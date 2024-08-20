"use client";
import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import { useState, useEffect } from "react";
import { v1 as uuidv1 } from "uuid";
import { signIn } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import { type Schema } from "../amplify/data/resource";
import Toast from "../components/toast";
import { uploadData } from "aws-amplify/storage";

const client = generateClient<Schema>();

interface SignInFormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
}

interface UserProfileFormELements extends HTMLFormControlsCollection {
  dn: HTMLInputElement;
  description: HTMLInputElement;
}

interface SignInForm extends HTMLFormElement {
  readonly elements: SignInFormElements;
}

interface UserProfileForm extends HTMLFormElement {
  readonly elements: UserProfileFormELements;
}

export default function Login() {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "error" | "info">("success");
  const [showProfile, setShowProfile] = useState(false);
  const [dp, setDp] = useState<File | null>(null);
  const [dpPath, setDpPath] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  function handleDpInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      setDp(event.target.files[0]);
    }
  }

  const uploadDp = async () => {
    if (dp) {
      try {
        const uploadres = await uploadData({
          path: ({ identityId }) => `dp/${identityId}/${dp.name}`,
          data: dp,
        });
        const fpath = (await uploadres?.result)?.path ?? "";
        setDpPath(fpath);
        console.log("Upload result:", uploadres);
        alert("Upload successful!" + fpath);
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Upload failed. Please try again.");
      }
    } else {
      alert("Please select a file to upload.");
    }
  };

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
        const { errors: err, data: old_user } = await client.models.Video.get({
          partitionKey: form.elements.email.value,
          sortKey: form.elements.email.value,
        });

        if (old_user) {
          console.log("user found", old_user);
          old_user.username &&
            localStorage.setItem("username", old_user.username);
          old_user.dn && localStorage.setItem("dn", old_user.dn);
          old_user.dp && localStorage.setItem("dp", old_user.dp);
          // localStorage.setItem("dn", form.elements.email.value.split("@")[0]);
          setType("success");
          setMessage("Signed in successfully");
        } else {
          // localStorage.setItem("username", form.elements.email.value);
          // localStorage.setItem("dn", form.elements.email.value.split("@")[0]);
          setEmail(form.elements.email.value);
          setShowProfile(true);
          setType("info");
          setMessage("Please setup your profile");
          // console.log("user not found errors: ", err, "old_user: ", old_user);
          // const { errors, data: user_user } = await client.models.Video.create(
          //   {
          //     partitionKey: form.elements.email.value,
          //     sortKey: form.elements.email.value,
          //     type: "user_user",
          //   },
          //   {
          //     authMode: "userPool",
          //   }
          // );

          // if (user_user) console.log("user created", user_user);
          // else console.log("user creation error", errors);
        }

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // localStorage.setItem("username", form.elements.email.value);
        // localStorage.setItem("dn", form.elements.email.value.split("@")[0]);
        // setType("success");
        // setMessage("Signed in successfully");
      }
    } catch (err) {
      setType("error");
      setMessage("Sign in error: " + err);
      console.log("sign in error=>`", err);
    }
  }

  async function handleNewUserProfile(event: FormEvent<UserProfileForm>) {
    event.preventDefault();
    const form = event.currentTarget;

    // ... validate inputs
    try {
      const tUUID = uuidv1();
      const { errors, data: user_profile } = await client.models.Video.create(
        {
          partitionKey: email,
          sortKey: email,
          type: "user_profile",
          dn: form.elements.dn.value,
          dp: dpPath,
          description: form.elements.description.value,
          username: form.elements.dn.value + tUUID,
        },
        {
          authMode: "userPool",
        }
      );

      if (user_profile) {
        console.log("Profile data added:", user_profile);
        user_profile.dp && localStorage.setItem("dp", user_profile.dp);
        user_profile.username &&
          localStorage.setItem("username", user_profile.username);
        user_profile.dn && localStorage.setItem("dn", user_profile.dn);
        setType("success");
        setMessage("Profile created successfully");
      } else {
        console.log("Error setting up user profile try again: ", errors);
        setType("error");
        setMessage("Error setting up profile try agin: " + errors);
      }
    } catch (err) {
      setType("error");
      setMessage("Error setting up profile try agin: " + err);
      console.log("Error setting up profile try agin:", err);
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

      {type === "info" && (
        <form className="modal-form" onSubmit={handleNewUserProfile}>
          <label htmlFor="dn">Display Name:</label>
          <input type="text" id="dn" name="dn" required />

          <label htmlFor="description">About Channel</label>
          <input type="text" id="description" name="description" required />

          <label htmlFor="dp">Profile Picture:</label>
          <input
            type="file"
            id="dp"
            name="dp"
            onChange={handleDpInput}
            required
          />

          <button type="button" onClick={uploadDp}>
            Upload
          </button>
          <button type="submit">Save</button>
        </form>
      )}
      {message && <Toast message={message} type={type} />}
    </>
  );
}
