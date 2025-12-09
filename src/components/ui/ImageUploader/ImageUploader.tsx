"use client";

import React, { useRef } from "react";
import { Button } from "@mui/material";

interface Props {
  onImageSelected: (base64: string) => void;
}

export default function ImageUploader({ onImageSelected }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onImageSelected(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={fileRef}
        onChange={handleFile}
        style={{ display: "none" }}
      />

      <Button variant="outlined" onClick={() => fileRef.current?.click()}>
        Upload Photo
      </Button>
    </>
  );
}
