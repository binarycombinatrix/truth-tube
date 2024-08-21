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
  content: HTMLInputElement;
  dn: HTMLInputElement;
  self: HTMLInputElement;
  links: HTMLInputElement;
  // dp: HTMLInputElement;
}

interface CreateForm extends HTMLFormElement {
  readonly elements: CreateFormElements;
}

export default function Upload() {
  const [debate, setDebate] = useState<Schema["Argument"]["type"]>({
    content: "",
    self: false,
    dp: "",
    dn: "",
    links: [],
  });
  const [link, setLink] = useState("");
  const [debateArr, setDebateArr] = useState<Schema["Argument"]["type"][] | []>(
    []
  );
  const [opFile, setOpFile] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null); // Specify the type for the file state
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [filePath, setFilePath] = useState<string>("");
  const [thumbnailPath, setThumbnailPath] = useState<string>("");
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleOpChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setOpFile(event.target.files[0]);
    }
  };

  const handleLink = () => {
    const oldDebate = { ...debate };
    const newLinks = oldDebate.links ? [...oldDebate.links, link] : [link];
    setDebate({
      ...oldDebate,
      links: newLinks,
    });
    setLink("");
  };

  const handleDebate = () => {
    const newDebateArr = [...debateArr, debate];
    console.log("newDebateArr", newDebateArr);
    setDebateArr(newDebateArr);
    setDebate({
      content: "",
      self: false,
      dp: "",
      dn: "",
      links: [],
    });
    setOpFile(null);
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

  const handleOpUpload = async () => {
    if (opFile) {
      try {
        const uploadres = await uploadData({
          path: ({ identityId }) => `dp/${identityId}/${opFile.name}`,
          data: opFile,
        });
        if (uploadres) {
          const fpath = (await uploadres?.result)?.path ?? "";
          setDebate({ ...debate, dp: fpath });
          alert("Upload successful!" + fpath);
          console.log("the dp of the op is ", fpath);
        } else {
          console.log("error in uploading dp: please reupload the file");
          alert("Upload failed. Please try again.");
        }
      } catch (error) {
        console.log("error in uploading dp: please reupload the file");
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
      if (localStorage.getItem("username") && localStorage.getItem("dn")) {
        const { errors, data: video } = await client.models.Video.create(
          {
            partitionKey: "Educational",
            sortKey: "v#" + title + "_" + localStorage.getItem("username"),
            type: "video",
            thumbnail: thumbnailPath,
            url: filePath,
            dp: localStorage.getItem("dp") ?? "",
            dn:
              localStorage.getItem("dn") ??
              localStorage.getItem("username") ??
              "",
            debate: debateArr,
          },
          {
            authMode: "userPool",
          }
        );

        if (errors) console.log(" Error1 in adding video data to DB:", errors);
        else {
          console.log("New video added: |> ", video);
        }

        if (video) {
          const { errors, data: user_video } = await client.models.Video.create(
            {
              partitionKey:
                "u#" + (localStorage.getItem("username") ?? "Educational"),
              sortKey: "v#" + title + "_" + localStorage.getItem("username"),
              category: "Educational",
              type: "user",
              thumbnail: thumbnailPath,
              dp: localStorage.getItem("dp") ?? "",
              dn:
                localStorage.getItem("dn") ??
                localStorage.getItem("username") ??
                "",
            },
            {
              authMode: "userPool",
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
          <label htmlFor="content">Content:</label>
          <textarea
            id="content"
            name="content" // Add name attribute for form.elements access
            // required
            value={debate.content}
            onChange={(e) => setDebate({ ...debate, content: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="self">Self:</label>
          <input
            type="checkbox"
            id="self"
            name="self"
            checked={debate.self}
            onChange={(e) => setDebate({ ...debate, self: e.target.checked })}
          />
        </div>
        <div>
          <label htmlFor="dn">Display name:</label>
          <textarea
            id="dn"
            name="dn" // Add name attribute for form.elements access
            // required
            value={debate.dn ?? ""}
            onChange={(e) => setDebate({ ...debate, dn: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="links">Links:</label>
          <input
            id="links"
            name="links" // Add name attribute for form.elements access
            // required
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <button type="button" onClick={handleLink}>
            Add Link
          </button>
        </div>
        <div>
          <label htmlFor="op">Original poster image:</label>
          <input type="file" id="op" onChange={handleOpChange} />
          {/* required  */}

          <button type="button" onClick={handleOpUpload}>
            Upload Dp
          </button>
        </div>
        <button type="button" onClick={handleDebate}>
          Add Debate
        </button>
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
