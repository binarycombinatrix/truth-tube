"use client";

import { StorageImage } from "@aws-amplify/ui-react-storage";

export const AWSImage = ({
  className,
  path,
  fallbackSrc,
  alt,
}: {
  className: string;
  path: string;
  fallbackSrc: string;
  alt: string;
}) => {
  return (
    <StorageImage
      className={className ?? ""}
      path={path ?? ""}
      fallbackSrc={fallbackSrc ?? ""}
      alt={alt ?? ""}
    />
  );
};
