// import { useRouter } from "next/router";
import { GetStaticPaths, GetStaticProps } from "next";
import { getUrl } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/api";
import { type Schema } from "@/amplify/data/resource";
import VideoPlayer from "../../components/videoplayer";
import Comments from "@/components/comments";
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
          <Comments video={data} />
        </>
      )}
    </div>
  );
};

export default VideoPage;
