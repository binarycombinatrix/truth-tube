import { useEffect, useState } from "react"
import { GetStaticPaths, GetStaticProps } from "next"
import Link from "next/link"
import Image from "next/image"
import { generateClient } from "aws-amplify/data"
import type { Schema } from "@/amplify/data/resource"
import { StorageImage } from "@aws-amplify/ui-react-storage"
import { VideoCard } from "@/components/videocard"
import Router from "next/router"

const client = generateClient<Schema>()

interface VideoObject {
  partitionKey: string
  sortKey: string ////video title or username   + uuidv1
  type: string ///specify type to avoid confusion
  category?: string | null /// category which is partition key for video entry
  debate?: any ///debate of the video
  description?: string | null ///channel or video description
  url?: string | null ///video url
  thumbnail?: string | null ///video thumbnail
  dp?: string | null ///user dp can store in both cases,
  comment?: any ///only in case of video
  dn?: string | null
  path?: string | null
  channel?: string | null
}

interface VideoProps {
  data: VideoObject[] | null
  path: string
}
export const getStaticPaths: GetStaticPaths = async () => {
  // Fetch or define your dynamic paths
  const paths = [
    { params: { path: "video-1" } },
    // { params: { path: "video-2" } },
  ]

  return {
    paths,
    fallback: true, // or true
  }
}

export const getStaticProps: GetStaticProps<VideoProps> = async ({
  params,
}) => {
  const { path } = params as { path: string }
  console.log("url path ==>", path)
  const dpath = "u#" + decodeURIComponent(path)

  try {
    if (dpath) {
      const { data, errors } = await client.models.Video.list({
        partitionKey: dpath,
      })
      if (errors) {
        console.error(errors)
      } else if (data) {
        const vidArr = data.map((video) => {
          const atag = encodeURIComponent("Educational" + "_" + video.sortKey)

          const sArr = video.sortKey.split("_")
          // sArr.shift();
          const channel = sArr[1]
          return { ...video, path: atag, channel }
        })
        return {
          props: {
            data: vidArr,
            path,
          },
        }
      }
    }
  } catch (error) {
    console.log("couldn't get videos=>", error)
  }

  return {
    props: {
      data: null,
      path,
    },
  }
}
export default function App({ data, path }: VideoProps) {
  const [myChannel, setMyChannel] = useState(false)

  useEffect(() => {
    if(path === localStorage.getItem("username")) setMyChannel(true)
  }, [path])

  const logout = () => {
    localStorage.clear()
    Router.push("/")
  }

  console.log("the path is ", path)

  return (
    <main>
      <div className="channel-profile">
        {path == "null" ? (
          <div className="title">
            <h1>Please login and setup your channel</h1>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              {data?.[0]?.dp ? (
                <StorageImage
                  className="card-dp"
                  path={data[0].dp ?? ""}
                  fallbackSrc="/profile.svg"
                  alt="Profile"
                />
              ) : (
                <Link href="/login">
                  <img className="card-dp" src="/profile.svg" alt="login" />
                </Link>
              )}

              <h1>{data?.[0]?.dn}</h1>
            </div>
          </>
        )}
        
        {myChannel && <button
          style={{
            cursor: "pointer",
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}
          onClick={logout}
        >
          <Image src="/logout.svg" alt="search" width={30} height={30} />
          <span>Sign Out</span>
        </button>}
        
      </div>
      <ul className="video-list">
        {data &&
          data?.length > 0 &&
          data.map((video) => <VideoCard key={video.sortKey} video={video} />)}
      </ul>
      <div>
        <br />
      </div>
    </main>
  )
}
