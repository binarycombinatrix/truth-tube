"use client"
import Link from "next/link"
import Image from "next/image"
import { StorageImage } from "@aws-amplify/ui-react-storage"
import { useState, useEffect } from "react"

export default function Search() {
  const [searchText, setSearchText] = useState("")
  const [showSidebar, setShowSidebar] = useState(false)
  const [client, setClient] = useState(false)

  useEffect(() => {
    if (typeof window !== undefined) {
      setClient(true)
    }
  }, [])

  const logout = () => {
    localStorage.clear()
    window.location.reload()
  }

  if (!client) {
    return null
  } else
    return (
      <>
        <div className={`sidebar ${showSidebar ? "show-sidebar" : ""}`}>
          <div
            className="sidebar-close clickable"
            onClick={() => setShowSidebar(false)}
          >
            <h1>x</h1>
          </div>
          <div className="sidebar-header">
            <div className="sidebar-logo-container">
              <Link href="/">
                <img src="/logo.png" className="sidebar-logo" alt="logo" />
              </Link>
            </div>
            {typeof window !== undefined && localStorage.getItem("username") ? (
              <Link href={`/channel/${localStorage.getItem("username")}`}>
                <StorageImage
                  className="card-dp"
                  path={localStorage.getItem("dp") ?? ""}
                  fallbackSrc="/profile.svg"
                  alt="Profile"
                />
              </Link>
            ) : (
              <Link href="/login">
                <img className="card-dp" src="/profile.svg" alt="login" />
              </Link>
            )}
          </div>
          <ul>
            <li>
              <Link href="/">
                <Image
                  src="/home-icon.svg"
                  alt="search"
                  width={30}
                  height={30}
                />
                <span>Home</span>
              </Link>
            </li>
            {/* <li>
            <Image src="/playlist.svg" alt="search" width={30} height={30} />
            <span>Subscriptions</span>
          </li>
          <li>
            <Image src="/watch.svg" alt="search" width={30} height={30} />
            <span>Watch Later</span>
          </li> */}
            {typeof window !== undefined &&
              typeof localStorage !== "undefined" && (
                <li>
                  <Link href={`/channel/${localStorage.getItem("username")}`}>
                    <Image
                      src="/channel.svg"
                      alt="channel"
                      width={30}
                      height={30}
                    />
                    <span>Your Channel</span>
                  </Link>
                </li>
              )}

            <li>
              <div onClick={logout}>
                <Image src="/logout.svg" alt="search" width={30} height={30} />
                <span>Sign Out</span>
              </div>
            </li>
            <li>
              <Link href="/upload">
                <Image src="/create.svg" alt="search" width={30} height={30} />
                <span>Create</span>
              </Link>
            </li>
          </ul>

          <div style={{ width: "100%" }}>
            <hr />
          </div>

          <div className="subbed-channels">
            <div className="subtitle">
              <span>Subscriptions</span>
            </div>
            <ul>
              {typeof window !== undefined &&
                localStorage.getItem("subbedto") &&
                JSON.parse(localStorage.getItem("subbedto") ?? "").map(
                  (c: any) => (
                    <li key={c.username}>
                      <Link href={`/channel/${c.username}`}>
                        <StorageImage
                          className="card-dp"
                          path={c.dp ?? ""}
                          fallbackSrc="/profile.svg"
                          alt="Profile"
                        />
                        <span>{c.dn}</span>
                      </Link>
                    </li>
                  )
                )}
            </ul>
          </div>
        </div>
        <div className="navbar">
          <div>
            <div
              className="clickable menu-button"
              onClick={() => setShowSidebar(true)}
            >
              <img src="/Hamburger.svg" className="menu-image" alt="menu" />
            </div>
            <Link href="/">
              <img src="/logo.png" className="logo" alt="logo" />
            </Link>
          </div>
          <div className="search-input">
            <input
              type="search"
              results={5}
              autoSave="main search"
              name="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Link href={`/search/${searchText}`}>
              <button>
                <Image
                  src="/search.png"
                  alt="search"
                  layout="responsive"
                  width={30}
                  height={30}
                  sizes="(max-width: 600px) 5vw, (max-width: 1200px) 5vw, 5vw"
                />
              </button>
            </Link>
          </div>
          {typeof window !== undefined && localStorage.getItem("username") ? (
            <Link href={`/channel/${localStorage.getItem("username")}`}>
              <StorageImage
                className="card-dp"
                path={localStorage.getItem("dp") ?? ""}
                fallbackSrc="/profile.svg"
                alt="Profile"
              />
            </Link>
          ) : (
            <Link href="/login">
              <img className="card-dp" src="/profile.svg" alt="login" />
            </Link>
          )}
        </div>
      </>
    )
}
