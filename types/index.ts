export interface ToastProps {
  message: string
  type: "success" | "error" | "info"
  duration?: number
}

export interface VideoObject {
  partitionKey: string
  sortKey: string ////video title or username   + uuidv1
  type: string ///specify type to avoid confusion
  category?: string | null /// category which is partition key for video entry
  debate?: any ///debate of the video
  description?: string | null ///channel or video description
  url?: string | null ///video url
  thumbnail?: string | null ///video thumbnail
  dp?: string | null ///user dp can store in both cases,
  comment?: any ///only in case of video
  dn?: string | null
  path?: string | null
  channel?: string | null
  subs?: any
  subbedto?: any
  title?: string | null
}

export interface VideoProps {
  data: VideoObject[] | null
}
