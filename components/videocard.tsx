import { VideoObject } from "@/types"
import { StorageImage } from "@aws-amplify/ui-react-storage"
import Link from "next/link"

export const VideoCard = ({ video }: { video: VideoObject }) => {
  return (
    <li key={video.sortKey} className="video-card">
      {video.thumbnail && (
        <div className="thumbnail-container">
          <Link href={`/video/${video.path ?? ""}`}>
            <StorageImage
              path={video.thumbnail}
              // width={400}
              className="thumbnailImage"
              // height={400}
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
            <img className="card-dp" src="/profile.svg" alt="profile" />
          )}
        </span>
        <span>
          <div className="card-title">
            {video?.title ?? video?.sortKey?.split(/[_#]/)[1]}
          </div>
          <Link href={`/channel/${video.channel ?? ""}`}>
            <div className="card-channel">{video?.dn ?? ""}</div>
          </Link>
        </span>
      </div>
    </li>
  )
}
