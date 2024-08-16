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
    // client.models.Video.observeQuery().subscribe({
    //   next: (data) => setVideos([...data.items]),
    // });

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
      <ul>
        {videos.map((video) => (
          <li key={video.sortKey}>
            {video.thumbnail && (
              <Link className="thumbnail" href={`/video/${video.path ?? ""}`}>
                <StorageImage
                  className="thumbnailImage"
                  path={video.thumbnail}
                  // width={400}
                  height={400}
                  alt={video?.sortKey?.split("_")[0]}
                />
              </Link>
            )}
            <h2 className="card-title">{video?.sortKey?.split(/[_#]/)[1]}</h2>
            <Link href={`/channel/${video.channel ?? ""}`}>
              <p className="card-channel">{video?.dn ?? ""}</p>
            </Link>
          </li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/gen2/start/quickstart/nextjs-pages-router/">
          Review next steps of this tutorial.
        </a>
      </div>
    </main>
  );
}
