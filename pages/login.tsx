"use client"
import type { ChangeEvent, FormEvent, MouseEvent } from "react"
import { useState, useEffect } from "react"
import Router from "next/router"
import { v1 as uuidv1 } from "uuid"
import { signIn } from "aws-amplify/auth"
import { generateClient } from "aws-amplify/data"
import { type Schema } from "../amplify/data/resource"
import Toast from "../components/toast"
import { uploadData } from "aws-amplify/storage"
import { StorageImage } from "@aws-amplify/ui-react-storage"

const client = generateClient<Schema>()

export default function Login() {
  const [message, setMessage] = useState("")
  const [type, setType] = useState<"success" | "error" | "info">("success")
  const [showProfile, setShowProfile] = useState(false)
  const [dp, setDp] = useState<File | null>(null)
  const [dpPath, setDpPath] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [profile, setProfile] = useState({
    dn: "",
    description: "",
  })

  // const handleNewUserProfile = async () => {
  //   // event.preventDefault()

  //   // ... validate inputs
  //   try {
  //     if (dpPath != "" && email != "") {
  //       const tUUID = uuidv1()
  //       const { errors, data: user_profile } = await client.models.Video.create(
  //         {
  //           partitionKey: email,
  //           sortKey: email,
  //           type: "user_profile",
  //           dn: profile.dn,
  //           dp: dpPath,
  //           description: profile.description,
  //           username: profile.dn + tUUID,
  //         },
  //         {
  //           authMode: "userPool",
  //         }
  //       )

  //       if (errors) {
  //         console.log("Error setting up user profile try again: ", errors)
  //         setType("error")
  //         setMessage("Error setting up profile try agin: " + errors)
  //       } else {
  //         const { errors, data: new_profile } = await client.models.Video.get({
  //           partitionKey: email,
  //           sortKey: email,
  //         })

  //         if (
  //           new_profile &&
  //           new_profile.username != null &&
  //           new_profile.dn != null &&
  //           new_profile.dp != null
  //         ) {
  //           console.log("Profile data added:", new_profile)
  //           new_profile?.dp && localStorage.setItem("dp", new_profile.dp)
  //           new_profile?.username &&
  //             localStorage.setItem("username", new_profile.username)
  //           new_profile?.dn && localStorage.setItem("dn", new_profile.dn)
  //           setType("success")
  //           setMessage("Profile created successfully")
  //         } else {
  //           localStorage.clear()
  //           setType("error")
  //           setMessage("Error getting profile data please re-login")
  //           setShowProfile(false)
  //
  //         }
  //       }
  //     }
  //   } catch (err) {
  //     setType("error")
  //     setMessage("Error setting up profile try agin: " + err)
  //     console.log("Error setting up profile try agin:", err)
  //   }
  // }

  // const handleProfileDelete = async () => {
  //   try {
  //     if (email !== "" || localStorage.getItem("email")) {
  //       const keyval =
  //         email !== "" ? email : localStorage.getItem("email") ?? ""

  //       const { errors, data } = await client.models.Video.delete(
  //         {
  //           partitionKey: keyval,
  //           sortKey: keyval,
  //         },
  //         {
  //           authMode: "userPool",
  //         }
  //       )

  //       if (errors) {
  //         console.log("Error updating profile data:", errors)
  //         setType("error")
  //         setMessage("Error updating profile data: " + errors)
  //       } else {
  //         localStorage.removeItem("dp")
  //         localStorage.removeItem("username")
  //         localStorage.removeItem("dn")
  //         console.log("Profile data deleted:", data)
  //         setType("success")
  //         setMessage("Profile data deleted")
  //         setProfile({
  //           dn: "",
  //           description: "",
  //         })
  //         setDpPath("")
  //       }
  //     } else {
  //       setType("error")
  //       setMessage("Error deleting profile data: Please re-login")
  //     }
  //   } catch (error) {
  //     console.log("Error deleting profile data:", error)
  //   }
  // }

  function handleDpInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      setDp(event.target.files[0])
    }
  }

  const uploadDp = async () => {
    if (dp) {
      try {
        const uploadres = await uploadData({
          path: ({ identityId }) => `dp/${identityId}/${dp.name}`,
          data: dp,
        })
        const fpath = (await uploadres?.result)?.path ?? ""
        setDpPath(fpath)
        console.log("Upload result:", uploadres)
        alert("Upload successful!" + fpath)
      } catch (error) {
        console.error("Upload failed:", error)
        alert("Upload failed. Please try again.")
      }
    } else {
      alert("Please select a file to upload.")
    }
  }

  async function handleSubmit() {
    try {
      const signInResult = await signIn({
        username: email,
        password: password,
      })

      console.log("sign in outcome=>`", signInResult)

      if (signInResult.isSignedIn === true) {
        localStorage.setItem("email", email)

        const { errors: err, data: old_user } = await client.models.Video.get({
          partitionKey: email,
          sortKey: email,
        })

        if (err) {
          console.log("error in getting old user", err)
        }
        if (old_user) {
          console.log("user found", old_user)
          if (old_user.username && old_user.dn && old_user.dp) {
            localStorage.setItem("username", old_user.username)
            localStorage.setItem("dn", old_user.dn)
            localStorage.setItem("dp", old_user.dp)
            old_user.subbedto &&
              localStorage.setItem(
                "subbedto",
                JSON.stringify(old_user.subbedto)
              )
            old_user.likedTo &&
              localStorage.setItem("likedTo", JSON.stringify(old_user.likedTo))
            setProfile({
              dn: old_user.dn,
              description: old_user.description ?? "",
            })
            setDpPath(old_user.dp)
          }

          setType("success")
          setMessage("Signed in successfully")
          setShowProfile(true)
          setPassword("")
        } else {
          const { errors: err, data: new_user } =
            await client.models.Video.create(
              {
                partitionKey: email,
                sortKey: email,
                type: "user_profile",
                subbedto: [],
                likedTo: [],
              },
              {
                authMode: "userPool",
              }
            )

          if (err) {
            console.log("error in setting up user", err)
            setType("error")
            setMessage("Error setting up user please login again")
            localStorage.clear()
          }
          if (new_user) {
            console.log("user created", new_user)
            localStorage.setItem("subbedto", JSON.stringify(new_user.subbedto))
            localStorage.setItem("likedTo", JSON.stringify(new_user.likedTo))
            setShowProfile(true)
            setType("info")
            setMessage("Please setup your profile")
            setPassword("")
          }
        }
      }
    } catch (err) {
      setType("error")
      setMessage("Sign in error: " + err)
      console.log("sign in error=>`", err)
    }
  }

  const updateProfileData = async () => {
    try {
      if (email !== "" || localStorage.getItem("email")) {
        const keyval =
          email !== "" ? email : localStorage.getItem("email") ?? ""
        const newUsername =
          localStorage.getItem("username") ?? profile.dn + uuidv1()

        const { errors, data } = await client.models.Video.update(
          {
            partitionKey: keyval,
            sortKey: keyval,
            type: "user_profile",
            dn: profile.dn,
            dp: dpPath,
            username: newUsername,
            description: profile.description,
          },
          {
            authMode: "userPool",
          }
        )

        if (errors) {
          console.log("Error updating profile data:", errors)
          setType("error")
          setMessage("Error updating profile data: " + errors)
        } else {
          const { data: channelData, errors } =
            await client.models.Video.create(
              {
                partitionKey: "channel",
                sortKey: newUsername,
                type: "channel_profile",
                subs: [],
                username: newUsername,
                likes: "0",
              },
              {
                authMode: "userPool",
              }
            )

          // if (errors) {
          //   console.log("Error updating channel data:", errors)
          //   setType("error")
          //   setMessage("Error updating channel data: " + errors)
          // }
          if (channelData) {
            console.log("channel profile data added", channelData)
            setType("success")
            setMessage("Channel created successfully")
          }

          localStorage.setItem("dp", dpPath)
          localStorage.setItem("username", newUsername)
          localStorage.setItem("dn", profile.dn)
          console.log("Profile data updated:", data)
          Router.push("/")
          // setProfile({
          //   dn: "",
          //   description: "",
          // })
          // setDpPath("")
        }
      } else {
        setType("error")
        setMessage("Error updating profile data: Please re-login")
      }
    } catch (error) {
      console.log("Error updating profile data:", error)
    }
  }

  return (
    <>
      {showProfile === true ? (
        <div className="upload-form">
          <div className="form-group">
            <label htmlFor="dn">Display Name:</label>
            <input
              type="text"
              id="dn"
              name="dn"
              required
              value={profile.dn}
              onChange={(e) => setProfile({ ...profile, dn: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">About Channel</label>
            <input
              type="text"
              id="description"
              name="description"
              required
              value={profile.description}
              onChange={(e) =>
                setProfile({ ...profile, description: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="dp">Profile Picture:</label>
            <input
              type="file"
              id="dp"
              name="dp"
              onChange={handleDpInput}
              required
            />

            <div>
              <button type="button" onClick={uploadDp}>
                Upload
              </button>
              {dpPath && dpPath != "" && (
                <StorageImage
                  className="upload-preview"
                  path={dpPath}
                  alt="Profile Picture"
                />
              )}
            </div>
          </div>
          <button
            type="button"
            className="submit-button"
            onClick={updateProfileData}
          >
            Update
          </button>
          {/* <div className="form-group"> */}
          {/* <button type="button" onClick={handleNewUserProfile}>
              Save
            </button> */}
          {/* <button type="button" onClick={handleProfileDelete}>
              Delete
            </button> */}
          {/* </div> */}
        </div>
      ) : (
        <div onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="text"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="button" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      )}
      {message && <Toast message={message} type={type} />}
    </>
  )
}
