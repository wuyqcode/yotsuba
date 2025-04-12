import { useState } from 'react';

export const useUpload = () => {
  const [loading, setLoading] = useState(false);

  const upload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/file-resource', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const url = await response.text();
      return url;
    } finally {
      setLoading(false);
    }
  };

  return {
    upload,
    loading,
  };
};
