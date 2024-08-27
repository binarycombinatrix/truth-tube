// import { useRouter } from "next/router";
import { useState, useEffect } from "react"
import { GetStaticPaths, GetStaticProps } from "next"
import { getUrl } from "aws-amplify/storage"
import { generateClient } from "aws-amplify/api"
import { type Schema } from "@/amplify/data/resource"
import VideoPlayer from "../../components/videoplayer"
import Comments from "@/components/comments"
import { AWSImage } from "@/components/storageImage"
import { StorageImage } from "@aws-amplify/ui-react-storage"
import Link from "next/link"
import { VideoObject } from "@/types"
import { VideoCard } from "@/components/videocard"
// pages/video/[path].tsx

const client = generateClient<Schema>()

interface VideoProps {
  data: Schema["Video"]["type"] | null
  videoArr?: VideoObject[] | null
  channel?: Schema["Video"]["type"] | null
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
  const dpath = decodeURIComponent(path)
  const findex = dpath.indexOf("_")
  const pathArr = [
    path.substring(0, findex),
    path.substring(findex + 1, path.length),
  ] //path.substring(0, findex);
  console.log("pathArr=>", pathArr)
  // path is the video id
  // const pathArr = path.split("_");
  // const videoId = pathArr.pop();
  // const videoTitle = pathArr.join(" ");

  try {
    if (pathArr.length == 2) {
      const videosArr: Schema["Video"]["type"][] = []
      // let channelData : Schema["Video"]["type"] = {partitionKey: "", sortKey: "", type: ""}
      const { data, errors } = await client.models.Video.get({
        partitionKey: pathArr[0],
        sortKey: pathArr[1],
      })
      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      if (errors) {
        console.error(errors)
      } else if (data) {
        const bucketUrl = await getUrl({
          path: data?.url ?? "",

          options: { expiresIn: 3600 },
        })

        if (bucketUrl?.url?.toString() != "") {
          data.url = bucketUrl?.url?.toString()
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
              return { ...video, path: atag }
            })
            // data.videoArr = vidArr;
            videosArr.push(...vidArr)
          }
        } else {
          throw new Error("url not found")
          alert("url not found please reload the page")
        }
        console.log("data from dynamoDB =>", data)
        return {
          props: {
            data,
            videoArr: videosArr,
          },
          revalidate: 3600, // Revalidate every 60 seconds
        }
      }
    }
    // console.log("title=>", videoTitle, "id=>", videoId);
  } catch (error) {
    console.log("error=>", error)
  }

  return {
    props: {
      data: null,
    },
    revalidate: 3600, // Revalidate every 60 seconds
  }
}

const VideoPage = ({ data, videoArr, channel }: VideoProps) => {
  const [vidpage, setVidPage] = useState<VideoProps>({ data, videoArr })
  const [channelStat, setChannelStat] = useState<
    Schema["Video"]["type"] | null
  >(channel ?? null)

  useEffect(() => {
    const getclient = async () => {
      try {
        if (data?.sortKey.split("_")[1]) {
          const { data: channel, errors } = await client.models.Video.get({
            partitionKey: "channel",
            sortKey: data?.sortKey.split("_")[1],
          })
          if (channel) {
            console.log("channel=>", channel)
            setChannelStat(channel)
          }
        }
      } catch (error) {
        console.log("error=>", error)
      }
    }

    getclient()
  }, [data?.sortKey])
  const handleLike = async () => {
    if (
      vidpage?.data?.sortKey &&
      localStorage.getItem("username") &&
      localStorage.getItem("username") != null &&
      localStorage.getItem("email") &&
      localStorage.getItem("email") != null
    ) {
      if (
        vidpage?.data?.likes &&
        localStorage.getItem("likedTo") &&
        JSON.parse(localStorage.getItem("likedTo") ?? "").length &&
        JSON.parse(localStorage.getItem("likedTo") ?? "").find(
          (c: any) => c === vidpage?.data?.sortKey
        )
      ) {
        try {
          const uLikes = parseInt(vidpage.data?.likes) - 1

          const { data: videodata, errors } = await client.models.Video.update(
            {
              partitionKey: "Educational",
              sortKey: vidpage?.data?.sortKey,
              likes: uLikes.toString(),
            },
            {
              authMode: "userPool",
            }
          )

          if (errors) {
            console.log("error in unliking video", errors)
            alert("Error in unliking video please try again")
            return
          }

          if (videodata) {
            let userliked = JSON.parse(localStorage.getItem("likedTo") ?? "[]")

            userliked = userliked.filter(
              (c: any) => c !== vidpage?.data?.sortKey
            )

            const { data: u, errors } = await client.models.Video.update(
              {
                partitionKey: localStorage.getItem("email") ?? "",
                sortKey: localStorage.getItem("email") ?? "",
                likedTo: userliked,
              },
              {
                authMode: "userPool",
              }
            )

            if (errors) {
              console.log("error in unliking video", errors)
              alert("Error in unliking video please try again")
              return
            }
            if (u) {
              localStorage.setItem("likedTo", JSON.stringify(u.likedTo))
              alert("Unliked video")
              setVidPage({ ...vidpage, data: videodata })
            }
          }
        } catch (error) {
          console.log("error in liking video", error)
          alert("Error in liking video please try again")
          return
        }
      } else {
        try {
          let newlikes = 1

          if (vidpage.data && vidpage.data?.likes) {
            newlikes = parseInt(vidpage.data?.likes) + 1
          }

          const { data: channeldata, errors } =
            await client.models.Video.update(
              {
                partitionKey: "Educational",
                sortKey: vidpage?.data?.sortKey,
                likes: newlikes.toString(),
              },
              {
                authMode: "userPool",
              }
            )
          // console.log("channel update res ", res)
          console.log("channel update res ", channeldata, errors)

          if (errors) {
            console.log("error in liking video", errors)
            alert("Error in liking video please try again")
            return
          }
          if (channeldata) {
            let newLikedVideos: (string | null)[] = []
            if (
              localStorage.getItem("likedTo") &&
              localStorage.getItem("likedTo") != null
            ) {
              newLikedVideos = JSON.parse(localStorage.getItem("likedTo") ?? "")
            }
            newLikedVideos.push(vidpage?.data.sortKey)

            const { data: v, errors } = await client.models.Video.update(
              {
                partitionKey: localStorage.getItem("email") ?? "",
                sortKey: localStorage.getItem("email") ?? "",
                likedTo: newLikedVideos,
              },
              {
                authMode: "userPool",
              }
            )

            if (errors) {
              console.error(errors)
            }
            if (v) {
              alert("Video liked")
              localStorage.setItem("likedTo", JSON.stringify(v.likedTo))
              setVidPage({ ...vidpage, data: channeldata })
            }
          }
        } catch (error) {
          console.log("error in liking video")
        }
      }
    }
  }
  const handleSubscribe = async () => {
    if (
      data &&
      data.sortKey &&
      localStorage.getItem("username") &&
      localStorage.getItem("username") != null &&
      localStorage.getItem("email") &&
      localStorage.getItem("email") != null
    ) {
      if (
        channelStat?.subs &&
        localStorage.getItem("subbedto") &&
        JSON.parse(localStorage.getItem("subbedto") ?? "").length &&
        JSON.parse(localStorage.getItem("subbedto") ?? "").find(
          (c: any) => c.username === data?.sortKey.split("_")[1]
        )
      ) {
        try {
          let subA = channelStat?.subs
          subA = subA.filter((c: any) => c !== localStorage.getItem("username"))

          const { data: channelData, errors } =
            await client.models.Video.update(
              {
                partitionKey: "channel",
                sortKey: data.sortKey.split("_")[1],
                subs: subA,
              },
              {
                authMode: "userPool",
              }
            )

          if (errors) {
            console.error(errors)
            alert("Error in subscribing please try again")
            return
          }

          if (channelData && vidpage.data) {
            let newSubbed = JSON.parse(localStorage.getItem("subbedto") ?? "")

            newSubbed = newSubbed.filter(
              (c: any) => c.username !== vidpage.data?.sortKey.split("_")[1]
            )

            const { data: user, errors } = await client.models.Video.update(
              {
                partitionKey: localStorage.getItem("email") ?? "",
                sortKey: localStorage.getItem("email") ?? "",
                subbedto: newSubbed,
              },
              {
                authMode: "userPool",
              }
            )

            if (errors) {
              alert("Error in unsubscribing please try again")
              console.log("could not unscribe", errors)
            }

            if (user) {
              console.log("user unsubbed", user)
              localStorage.setItem("subbedto", JSON.stringify(newSubbed))
              alert("Unsubscribed")
              setChannelStat(channelData)
            }
          }
        } catch (error) {
          console.error("could not unscribe", error)
        }
      } else {
        try {
          let newsubs: (string | null)[] = []
          if (channelStat?.subs) {
            if (
              channelStat?.subs.find((sub) => {
                sub === localStorage.getItem("username")
              })
            ) {
              alert("Already Subscribed")
              return
            }

            newsubs = channelStat?.subs
          }
          newsubs.push(localStorage.getItem("username") ?? "")
          const { data: vids, errors } = await client.models.Video.update(
            {
              partitionKey: "channel",
              sortKey: data.sortKey.split("_")[1],
              subs: newsubs,
            },
            {
              authMode: "userPool",
            }
          )

          if (errors) {
            console.error(errors)
            alert("Error in subscribing please try again")
            return
          }

          if (vids && vidpage.data) {
            let newSubChannel = { username: "", dp: "", dn: "" }
            let newSubbedTo = []
            if (
              localStorage.getItem("subbedto") &&
              localStorage.getItem("subbedto") != null
            )
              newSubbedTo = JSON.parse(localStorage.getItem("subbedto") ?? "[]")
            newSubChannel = {
              username: vidpage.data.sortKey.split("_")[1],
              dp: vidpage.data.dp ?? "",
              dn: vidpage.data.dn ?? "",
            }
            newSubbedTo.push(newSubChannel)

            const { data: v, errors } = await client.models.Video.update(
              {
                partitionKey: localStorage.getItem("email") ?? "",
                sortKey: localStorage.getItem("email") ?? "",
                subbedto: newSubbedTo,
              },
              {
                authMode: "userPool",
              }
            )

            if (errors) {
              alert("Error in subscribing please try again: " + errors)
              console.error("sub error =>", errors)
            }
            if (v) {
              console.log("video data updated in video channel =>", vids.subs)
              alert("Subscribed to :" + newSubChannel.dn)
              v.subbedto &&
                localStorage.setItem("subbedto", JSON.stringify(v?.subbedto))
              setChannelStat(vids)
              // setVidPage({ ...vidpage, data: vids })
            }
          }
        } catch (error) {
          console.log("error in adding subs", error)
        }
      }
    }
  }
  console.log("data from dynamoDB =>", data)
  return (
    <div className="video-page">
      {data && (
        <>
          <div className="video-main">
            <VideoPlayer
              url={data?.url ?? ""}
              title={data?.sortKey ?? ""}
              thumbnail={data?.thumbnail ?? ""}
            />
            <div className="title">
              {data?.title ?? data?.sortKey?.split(/[_#]/)[1] ?? ""}
            </div>
            <div className="video-dp-section">
              <div className="video-dn">
                {typeof window !== undefined &&
                data?.dp != null &&
                data?.dp != "" ? (
                  <StorageImage
                    className="card-dp"
                    path={data?.dp}
                    fallbackSrc="/profile.svg"
                    alt="Profile"
                  />
                ) : (
                  <img className="card-dp" src="/profile.svg" alt="login" />
                )}
                <div>
                  <strong>{data?.dn}</strong>
                  <strong>{channelStat?.subs?.length}</strong>
                </div>
              </div>

              <div className="like-share">
                {/* {typeof window !== "undefined" &&
                localStorage.getItem("subbedto") &&
                JSON.parse(localStorage.getItem("subbedto") ?? "").length &&
                JSON.parse(localStorage.getItem("subbedto") ?? "").find(
                  (c: any) => c.username === data?.sortKey.split("_")[1]
                ) ? (
                  <button className="subscribe">Subscribed</button>
                ) : ( */}
                <button className="subscribe" onClick={handleSubscribe}>
                  Subscribe
                </button>
                {/* )} */}

                <div className="like-section">
                  <button>{vidpage.data?.likes ?? "0"}</button>

                  <div>
                    <button className="like" onClick={handleLike}>
                      <img src="/like.svg" alt="like" />
                    </button>
                    <button className="dislike">
                      <img src="/dislike.svg" alt="dislike" />
                    </button>
                  </div>
                </div>
                <div>
                  <button className="share">
                    <img src="/share.svg" alt="share" />
                  </button>
                </div>
              </div>
            </div>
            <iframe
              className="youtube-iframe main-iframe"
              src="https://www.youtube.com/embed/UwsrzCVZAb8?enablejsapi=1"
            ></iframe>

            {data?.debate && (
              <div className="debate-section">
                <h2>Debate</h2>
                {data?.debate?.map((argument, index) => (
                  <div
                    key={index}
                    className={`debate-card ${
                      argument?.self === true && "right-align"
                    }`}
                  >
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
          </div>

          {videoArr && videoArr.length > 0 && (
            <div className="recommended">
              <iframe
                className="youtube-iframe side-iframe"
                src="https://www.youtube.com/embed/UwsrzCVZAb8?enablejsapi=1"
              ></iframe>
              <ul className="video-list">
                {videoArr &&
                  videoArr?.length > 0 &&
                  videoArr.map((video) => (
                    <VideoCard key={video.sortKey} video={video} />
                  ))}
              </ul>
            </div>
          )}

          <div className="video-comments">
            <Comments video={data} />
          </div>
        </>
      )}
    </div>
  )
}

export default VideoPage
