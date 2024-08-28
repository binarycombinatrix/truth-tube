import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { generateClient } from "aws-amplify/data"
import type { Schema } from "@/amplify/data/resource"
import { StorageImage } from "@aws-amplify/ui-react-storage"
import { VideoCard } from "@/components/videocard"
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

export default function App() {
  const [videos, setVideos] = useState<Array<VideoObject>>([])

  async function listVideos() {
    try {
      const { data: vids, errors } = await client.models.Video.list({
        partitionKey: "Educational",
      })

      if (errors) {
        console.error(errors)
      } else {
        console.log("data from dynamoDB =>", vids)

        const vidArr = vids.map((video) => {
          const atag = encodeURIComponent(
            video.partitionKey + "_" + video.sortKey
          )

          const sArr = video.sortKey.split("_")
          // sArr.shift();
          const channel = sArr[1]
          return { ...video, path: atag, channel }
        })

        setVideos(vidArr)
      }
    } catch (error) {
      console.log("couldn't get videos=>", error)
    }
  }

  useEffect(() => {
    listVideos()
  }, [])

  return (
    <main>
      <h3></h3>
      <ul className="video-list">
        {videos &&
          videos?.length > 0 &&
          videos.map((video) => (
            <VideoCard key={video.sortKey} video={video} />
          ))}
      </ul>
      <div>
        <br />
      </div>
    </main>
  )
}
