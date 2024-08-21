// import { useRouter } from "next/router";
import { GetStaticPaths, GetStaticProps } from "next";
import { getUrl } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/api";
import { type Schema } from "@/amplify/data/resource";
import VideoPlayer from "../../components/videoplayer";
import Comments from "@/components/comments";
import { AWSImage } from "@/components/storageImage";
import { StorageImage } from "@aws-amplify/ui-react-storage";
import Link from "next/link";
import { VideoObject } from "@/types";
// pages/video/[path].tsx

const client = generateClient<Schema>();

interface VideoProps {
  data: Schema["Video"]["type"] | null;
  videoArr?: VideoObject[] | null;
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
  const dpath = decodeURIComponent(path);
  const findex = dpath.indexOf("_");
  const pathArr = [
    path.substring(0, findex),
    path.substring(findex + 1, path.length),
  ]; //path.substring(0, findex);
  console.log("pathArr=>", pathArr);
  // path is the video id
  // const pathArr = path.split("_");
  // const videoId = pathArr.pop();
  // const videoTitle = pathArr.join(" ");

  try {
    if (pathArr.length == 2) {
      const videosArr: Schema["Video"]["type"][] = [];
      const { data, errors } = await client.models.Video.get({
        partitionKey: pathArr[0],
        sortKey: pathArr[1],
      });
      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      if (errors) {
        console.error(errors);
      } else if (data) {
        const bucketUrl = await getUrl({
          path: data?.url ?? "",

          options: { expiresIn: 3600 },
        });

        if (bucketUrl?.url?.toString() != "") {
          data.url = bucketUrl?.url?.toString();
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
              return { ...video, path: atag };
            });
            // data.videoArr = vidArr;
            videosArr.push(...vidArr);
          }
        } else {
          throw new Error("url not found");
          alert("url not found please reload the page");
        }
        console.log("data from dynamoDB =>", data);
        return {
          props: {
            data,
            videoArr: videosArr,
          },
          revalidate: 3600, // Revalidate every 60 seconds
        };
      }
    }
    // console.log("title=>", videoTitle, "id=>", videoId);
  } catch (error) {
    console.log("error=>", error);
  }

  return {
    props: {
      data: null,
    },
    revalidate: 3600, // Revalidate every 60 seconds
  };
};

const VideoPage = ({ data, videoArr }: VideoProps) => {
  console.log("data from dynamoDB =>", data);
  return (
    <div>
      {data && (
        <>
          <h1>{data?.sortKey ?? ""}</h1>
          <VideoPlayer
            url={data?.url ?? ""}
            title={data?.sortKey ?? ""}
            thumbnail={data?.thumbnail ?? ""}
          />
          <iframe
            id="existing-iframe-example"
            className="youtube-iframe"
            // width="640"
            // height="360"
            src="https://www.youtube.com/embed/UwsrzCVZAb8?enablejsapi=1"
            // frameborder="0"
            // style="border: solid 4px #37474f"
          ></iframe>

          {data?.debate && (
            <div>
              <h2>Debate</h2>
              {data?.debate?.map((argument, index) => (
                <div key={index}>
                  {typeof window !== undefined &&
                  argument?.dp != null &&
                  argument?.dp != "" ? (
                    <StorageImage
                      className="card-dp"
                      path={argument?.dp}
                      fallbackSrc="/profile.svg"
                      alt="Profile"
                    />
                  ) : (
                    <img className="card-dp" src="/profile.svg" alt="login" />
                  )}

                  <h3>{argument?.dn}</h3>
                  <h3>{argument?.content}</h3>
                </div>
              ))}
            </div>
          )}

          {videoArr && videoArr.length > 0 && (
            <div>
              <h2>Related Videos</h2>
              <ul className="video-list">
                {videoArr &&
                  videoArr?.length > 0 &&
                  videoArr.map((video) => (
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
                            <div className="card-channel">
                              {video?.dn ?? ""}
                            </div>
                          </Link>
                        </span>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <Comments video={data} />
        </>
      )}
    </div>
  );
};

export default VideoPage;
