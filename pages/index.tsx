import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { StorageImage } from "@aws-amplify/ui-react-storage";

const client = generateClient<Schema>();

interface VideoObject {
  partitionKey: string;
  sortKey: string; ////video title or username   + uuidv1
  type: string; ///specify type to avoid confusion
  category?: string | null; /// category which is partition key for video entry
  debate?: any; ///debate of the video
  description?: string | null; ///channel or video description
  url?: string | null; ///video url
  thumbnail?: string | null; ///video thumbnail
  dp?: string | null; ///user dp can store in both cases,
  comment?: any; ///only in case of video
  dn?: string | null;
  path?: string | null;
  channel?: string | null;
}

export default function App() {
  const [videos, setVideos] = useState<Array<VideoObject>>([]);

  async function listVideos() {
    try {
      const { data: vids, errors } = await client.models.Video.list({
        partitionKey: "Educational",
      });

      if (errors) {
        console.error(errors);
      } else {
        console.log("data from dynamoDB =>", vids);

        const vidArr = vids.map((video) => {
          const atag = encodeURIComponent(
            video.partitionKey + "_" + video.sortKey
          );

          const sArr = video.sortKey.split("_");
          // sArr.shift();
          const channel = sArr[1];
          return { ...video, path: atag, channel };
        });

        setVideos(vidArr);
      }
    } catch (error) {
      console.log("couldn't get videos=>", error);
    }
  }

  useEffect(() => {
    listVideos();
  }, []);

  // function createTodo() {
  // client.models.Video.create({
  //   content: window.prompt("Todo content"),
  // });
  // }

  return (
    <main>
      <h1>My videos</h1>
      {/* <button onClick={createTodo}>+ new</button> */}
      <ul className="video-list">
        {videos &&
          videos?.length > 0 &&
          videos.map((video) => (
            <li key={video.sortKey} className="video-card">
              {video.thumbnail && (
                <div className="thumbnail-container">
                  <Link href={`/video/${video.path ?? ""}`}>
                    <StorageImage
                      path={video.thumbnail}
                      // width={400}
                      className="thumbnailImage"
                      height={400}
                      alt={video?.sortKey?.split("_")[0]}
                    />
                  </Link>
                </div>
              )}
              <div className="card-details">
                <span>
                  {video?.dp ? (
                    <StorageImage
                      className="card-dp"
                      path={video.dp ?? ""}
                      fallbackSrc="/profile.svg"
                      alt="Profile"
                    />
                  ) : (
                    <img
                      className="card-dp"
                      src="/profile.svg"
                      alt="narsimha"
                    />
                  )}
                </span>
                <span>
                  <h2 className="card-title">
                    {video?.sortKey?.split(/[_#]/)[1]}
                  </h2>
                  <Link href={`/channel/${video.channel ?? ""}`}>
                    <div className="card-channel">{video?.dn ?? ""}</div>
                  </Link>
                </span>
              </div>
            </li>
          ))}
      </ul>
      <div>
        🥳 Try creating a new video!
        <br />
      </div>
    </main>
  );
}
