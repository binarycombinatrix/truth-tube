"use client";
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import Toast from "./toast";
const client = generateClient<Schema>();

interface VideoProps {
  video: Schema["Video"]["type"];
}

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
  display: boolean;
}
export default function Comments({ video }: VideoProps) {
  const [myComment, setMyComment] = useState("");
  const [currVideo, setCurrVideo] = useState(video);
  const [showToast, setShowToast] = useState<ToastProps>({
    message: "",
    type: "error",
    display: false,
  });
  const addComment = async () => {
    try {
      if (
        myComment &&
        localStorage.getItem("username") &&
        localStorage.getItem("dn")
      ) {
        const newC = {
          dn: localStorage.getItem("dn") || "",
          content: myComment,
          username: localStorage.getItem("username") || "",
          dp: localStorage.getItem("dp") || "",
        };
        let cArr = [];
        if (video?.comment?.length) cArr = video.comment.concat(newC);
        else cArr = [newC];

        const { data, errors } = await client.models.Video.update(
          {
            partitionKey: video?.partitionKey,
            sortKey: video?.sortKey,
            comment: cArr,
          },
          {
            authMode: "userPool",
          }
        );

        if (errors) {
          console.error(errors);
        } else if (data) {
          console.log("data=>", data);
          setCurrVideo(data);
        }
      } else {
        setShowToast({
          message: "Please login to comment",
          type: "error",
          display: true,
        });
      }
    } catch (error) {
      console.log("error=>", error);
    }
  };
  return (
    <div>
      <input
        type="text"
        placeholder="Add a comment"
        value={myComment}
        onChange={(e) => setMyComment(e.target.value)}
      />
      <button type="button" onClick={addComment}>
        Post
      </button>
      {currVideo?.comment?.map((c) => (
        <div key={c?.username} className="comment">
          <p>{c?.dn}</p>
          <p>{c?.content}</p>
        </div>
      ))}
      {showToast.display && (
        <Toast message={showToast.message} type={showToast.type} />
      )}
    </div>
  );
}
