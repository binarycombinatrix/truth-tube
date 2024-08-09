"use client";
import { getUrl } from "aws-amplify/storage";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";

export default function Viewer({
  url,
  title,
  thumbnail,
}: {
  url: string;
  title: string;
  thumbnail: string | null;
}) {
  return (
    <MediaPlayer title={title} src={url}>
      <MediaProvider />
      <DefaultVideoLayout
        thumbnails={
          thumbnail
            ? thumbnail
            : "https://files.vidstack.io/sprite-fight/thumbnails.vtt"
        }
        icons={defaultLayoutIcons}
      />
    </MediaPlayer>
  );
}
