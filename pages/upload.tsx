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
  const [filePath, setFilePath] = useState<string>("");
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
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

  const handleSubmit = async (event: React.FormEvent<CreateForm>) => {
    event.preventDefault();

    const form = event.currentTarget; // Get the form element
    const title = form.elements.title.value; // Access title input value
    const description = form.elements.description.value; // Access description textarea value
    const tUUID = uuidv1();

    try {
      const { errors, data: video } = await client.models.Video.create({
        title: title,
        url: filePath,
        id: tUUID,
      });
      // Handle form submission logic here
      console.log("Video data added:", video);
      console.log(" Errors in adding video data to DB:", errors);
    } catch (error) {
      console.log("Error in adding video data to DB:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
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
          <label htmlFor="file">Upload File:</label>
          <input type="file" id="file" onChange={handleFileChange} required />
        </div>
        <button type="submit">Submit</button>
      </form>
      {/* <input type="file" onChange={handleChange} /> */}
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}
