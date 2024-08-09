import { useState, useEffect } from "react";
import Link from "next/link";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

interface VideoObject {
  title: string;
  description: any;
  path?: string;
  id: string;
  url: string | null;
  thumbnail: string | null;
  channel: string | null;
}

export default function App() {
  const [videos, setVideos] = useState<Array<VideoObject>>([]);

  async function listVideos() {
    // client.models.Video.observeQuery().subscribe({
    //   next: (data) => setVideos([...data.items]),
    // });

    try {
      const { data: vids, errors } = await client.models.Video.list();

      if (errors) {
        console.error(errors);
      } else {
        const videolist = vids.map((v) => {
          const newtitle = v.title.replace(/ /g, "_");
          const path = newtitle.concat("_", v.id);
          return { ...v, path: path };
        });
        console.log("videos=>", videolist);
        setVideos(videolist);
      }
    } catch (error) {
      console.log("couldn't get videos=>", error);
    }
  }

  useEffect(() => {
    listVideos();
  }, []);

  function createTodo() {
    // client.models.Video.create({
    //   content: window.prompt("Todo content"),
    // });
  }

  return (
    <main>
      <h1>My videos</h1>
      {/* <button onClick={createTodo}>+ new</button> */}
      <ul>
        {videos.map((video) => (
          <Link href={`/video/${video.path}`} key={video.id}>
            <li>{video.title}</li>
          </Link>
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
