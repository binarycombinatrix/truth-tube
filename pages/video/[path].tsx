// import { useRouter } from "next/router";
import { GetStaticPaths, GetStaticProps } from "next";
import { getUrl } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/api";
import { type Schema } from "@/amplify/data/resource";
import VideoPlayer from "../components/videoplayer";
// pages/video/[path].tsx

const client = generateClient<Schema>();

interface VideoProps {
  data: Schema["Video"]["type"] | null;
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

  // path is the video id
  const pathArr = path.split("_");
  const videoId = pathArr.pop();
  const videoTitle = pathArr.join(" ");

  try {
    if (videoId && videoTitle) {
      const { data, errors } = await client.models.Video.get({
        title: videoTitle,
        id: videoId,
      });

      if (errors) {
        console.error(errors);
      } else if (data) {
        const bucketUrl = await getUrl({
          path: data?.url ?? "",

          options: { expiresIn: 3600 },
        });

        if (bucketUrl?.url?.toString() != "") {
          data.url = bucketUrl?.url?.toString();
        } else {
          throw new Error("url not found");
        }
        console.log("data from dynamoDB =>", data);
        return {
          props: {
            data,
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

const VideoPage = ({ data }: VideoProps) => {
  return (
    <div>
      <h1>{data?.title ?? ""}</h1>
      <VideoPlayer
        url={data?.url ?? ""}
        title={data?.title ?? ""}
        thumbnail={data?.thumbnail ?? ""}
      />
      {/* <p>{videoData.description}</p> */}
    </div>
  );
};

export default VideoPage;
