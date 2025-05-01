import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import Input from "./Input";

export type FileInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function FileInput({ onChange, ...props }: FileInputProps) {
  const [preview, setPreview] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(undefined);
    }

    onChange?.(event);
  }

  function handleClear() {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(undefined);
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    onChange?.(
      new Event("change", {
        bubbles: true,
      }) as unknown as React.ChangeEvent<HTMLInputElement>,
    );
  }

  return (
    <div className="space-y-4">
      <Input ref={inputRef} type="file" onChange={handleChange} {...props} />
      {preview && (
        <div className="relative inline-block">
          <button
            type="button"
            onClick={handleClear}
            className="absolute -right-2 -top-2 rounded-full bg-neutral-900 p-1 text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <X className="h-3 w-3" />
          </button>
          <img
            src={preview}
            alt="Preview"
            className="h-48 w-48 rounded-lg object-cover"
          />
        </div>
      )}
    </div>
  );
}
