import { GetStaticPaths, GetStaticProps } from "next";
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

interface VideoProps {
  data: VideoObject[] | null;
}
export const getStaticPaths: GetStaticPaths = async () => {
  // Fetch or define your dynamic paths
  const paths = [
    { params: { path: "video-1" } },
    // { params: { path: "video-2" } },
  ];

  return {
    paths,
    fallback: true, // or true
  };
};

export const getStaticProps: GetStaticProps<VideoProps> = async ({
  params,
}) => {
  const { path } = params as { path: string };
  console.log("url path ==>", path);
  const dpath = "u#" + decodeURIComponent(path);

  try {
    if (dpath) {
      const { data, errors } = await client.models.Video.list({
        partitionKey: dpath,
      });
      if (errors) {
        console.error(errors);
      } else if (data) {
        const vidArr = data.map((video) => {
          const atag = encodeURIComponent(
            video.partitionKey + "_" + video.sortKey
          );

          const sArr = video.sortKey.split("_");
          // sArr.shift();
          const channel = sArr[1];
          return { ...video, path: atag, channel };
        });
        return {
          props: {
            data: vidArr,
          },
        };
      }
    }
  } catch (error) {
    console.log("couldn't get videos=>", error);
  }

  return {
    props: {
      data: null,
    },
  };
};
export default function App({ data }: VideoProps) {
  //   const [videos, setVideos] = useState<Array<VideoObject>>([]);

  //   async function listVideos() {
  //     // client.models.Video.observeQuery().subscribe({
  //     //   next: (data) => setVideos([...data.items]),
  //     // });

  //     try {
  //       const { data: vids, errors } = await client.models.Video.list({
  //         partitionKey: "Educational",
  //       });

  //       if (errors) {
  //         console.error(errors);
  //       } else {
  //         console.log("data from dynamoDB =>", vids);

  //         const vidArr = vids.map((video) => {
  //           const atag = encodeURIComponent(
  //             video.partitionKey + "_" + video.sortKey
  //           );

  //           return { ...video, path: atag };
  //         });

  //         setVideos(vidArr);
  //       }
  //     } catch (error) {
  //       console.log("couldn't get videos=>", error);
  //     }
  //   }

  //   useEffect(() => {
  //     listVideos();
  //   }, []);

  // function createTodo() {
  // client.models.Video.create({
  //   content: window.prompt("Todo content"),
  // });
  // }

  return (
    <main>
      {/* <h1>Channel videos</h1> */}
      {/* <button onClick={createTodo}>+ new</button> */}
      <ul>
        {data &&
          data?.length > 0 &&
          data.map((video) => (
            <li key={video.sortKey}>
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
                  <img className="card-dp" src="/narsimha.jpg" alt="narsimha" />
                </span>
                <span>
                  <h2 className="card-title">
                    {video?.sortKey?.split(/[_#]/)[1]}
                  </h2>
                  <Link href={`/channel/${video.channel ?? ""}`}>
                    <p className="card-channel">{video?.dn ?? ""}</p>
                  </Link>
                </span>
              </div>
            </li>
          ))}
      </ul>
      <div>
        🥳
        <br />
      </div>
    </main>
  );
}
