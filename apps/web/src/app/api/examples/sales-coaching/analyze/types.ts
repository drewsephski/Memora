export type MemoraUploadResponse = {
  success: boolean;
  message: string;
  file_id: string;
};

export type MemoraSearchResponse = {
  success: boolean;
  documents: Array<{
    content: string;
    file_id: string;
    score: string;
  }>;
};
