"use client";

import { FileUploadForm } from "./file-upload-form";

export const UploadFormWrapper = ({ apiKey }: { apiKey: string }) => {
  const submitFile = async (formData: FormData) => {
    const response = await fetch("/api/dashboard/upload-file", {
      method: "POST",
      headers: {
        authorization: apiKey,
      },
      body: formData,
    });

    return response;
  };

  return <FileUploadForm submitFile={submitFile} />;
};
