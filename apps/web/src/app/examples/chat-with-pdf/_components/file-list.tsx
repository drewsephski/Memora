"use client";

import { Button } from "@/components/ui/button";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { X, File } from "lucide-react";
import { useRouter } from "next/navigation";

export const FileList = ({
  fileName,
  setFileName,
}: {
  fileName: string;
  setFileName: (fileName: string | null) => void;
}) => {
  const router = useRouter();

  const removeFile = () => {
    localStorage.removeItem("pdfFileId_demo");
    localStorage.removeItem("pdfFileName_demo");
    setFileName(null);

    router.refresh();
  };

  return (
    <div className="bg-muted-foreground/15 p-2 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-2">
        <File className="size-5" />
        <span>{fileName}</span>
      </div>
      <DeleteConfirmationDialog
        title="Remove uploaded document?"
        description={
          <p>
            This clears <span className="font-medium">{fileName}</span> from
            this demo and returns you to the upload step.
          </p>
        }
        confirmLabel="Remove document"
        pendingLabel="Removing..."
        trigger={
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Remove ${fileName}`}
          >
            <X />
          </Button>
        }
        onConfirm={removeFile}
      />
    </div>
  );
};
