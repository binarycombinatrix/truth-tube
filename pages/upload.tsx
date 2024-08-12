// Upload successful! videos/ap-south-1:9576007c-a938-c03d-4615-dbc1b99bc041/RavanHeadReplace.mp4
import { useState, ChangeEvent } from "react";
import { v1 as uuidv1 } from "uuid";
import { uploadData } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/data";
import { type Schema } from "../amplify/data/resource";

const client = generateClient<Schema>();

interface CreateFormElements extends HTMLFormControlsCollection {
  title: HTMLInputElement;
  description: HTMLInputElement;
}

interface CreateForm extends HTMLFormElement {
  readonly elements: CreateFormElements;
}

export default function Upload() {
  const [file, setFile] = useState<File | null>(null); // Specify the type for the file state
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [filePath, setFilePath] = useState<string>("");
  const [thumbnailPath, setThumbnailPath] = useState<string>("");
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleThumbnailChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setThumbnail(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      try {
        const uploadres = await uploadData({
          path: ({ identityId }) => `videos/${identityId}/${file.name}`,
          data: file,
        });

        const fpath = (await uploadres?.result)?.path ?? "";
        console.log("Upload result:", uploadres);
        alert("Upload successful!" + fpath);
        setFilePath(fpath);
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Upload failed. Please try again.");
      }
    } else {
      alert("Please select a file to upload.");
    }
  };

  const thumbnailUpload = async () => {
    if (thumbnail) {
      try {
        const uploadres = await uploadData({
          path: `thumbnails/${thumbnail.name}`,
          data: thumbnail,
        });

        const fpath = (await uploadres?.result)?.path ?? "";
        console.log("Upload result:", uploadres);
        alert("Upload successful!" + fpath);
        setThumbnailPath(fpath);
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Upload failed. Please try again.");
      }
    } else {
      alert("Please select a file to upload.");
    }
  };

  const handleSubmit = async (event: React.FormEvent<CreateForm>) => {
    event.preventDefault();

    const form = event.currentTarget; // Get the form element
    const title = form.elements.title.value;
    // const title = tInp.replace(/ +/g, (match) => "_".repeat(match.length));
    // Access title input value
    const description = form.elements.description.value; // Access description textarea value
    const tUUID = uuidv1();

    try {
      if (localStorage.getItem("username")) {
        const { errors, data: video } = await client.models.Video.create({
          partitionKey: "Educational",
          sortKey:
            "v#" + title + "_" + localStorage.getItem("dn") + "_" + tUUID,
          type: "video",
          thumbnail: thumbnailPath,
          url: filePath,
          dp: localStorage.getItem("dp") ?? "",
          dn:
            localStorage.getItem("dn") ??
            localStorage.getItem("username") ??
            "",
        });

        if (errors) console.log(" Error1 in adding video data to DB:", errors);

        if (video) {
          const { errors, data: user_video } = await client.models.Video.create(
            {
              partitionKey:
                "u#" + (localStorage.getItem("username") ?? "Educational"),
              sortKey:
                "v#" + title + "_" + localStorage.getItem("dn") + "_" + tUUID,
              category: "Educational",
              type: "user",
              thumbnail: thumbnailPath,
              dp: localStorage.getItem("dp") ?? "",
              dn:
                localStorage.getItem("dn") ??
                localStorage.getItem("username") ??
                "",
            }
          );
          console.log("Video data added:", user_video);
          if (errors)
            console.log(" Error2 in adding video data to DB:", errors);
          if (user_video)
            alert(`Video uploaded successfully! ${user_video.sortKey}`);
        }
        // Handle form submission logic here
      } else {
        throw new Error("Please create you channel or relogin");
      }
    } catch (error) {
      console.log("Error in adding video data to DB:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="thumbnail">Upload Thumbnail:</label>
          <input
            type="file"
            id="thumbnail"
            onChange={handleThumbnailChange}
            required
          />
          <button type="button" onClick={thumbnailUpload}>
            Upload
          </button>
        </div>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            name="title" // Add name attribute for form.elements access
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description" // Add name attribute for form.elements access
            required
          />
        </div>
        <div>
          <label htmlFor="file">Upload Video:</label>
          <input type="file" id="file" onChange={handleFileChange} required />
          <button type="button" onClick={handleUpload}>
            Upload
          </button>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
