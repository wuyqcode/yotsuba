import { ViewConfig } from '@vaadin/hilla-file-router/types.js';

import { useState, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { styled } from '@mui/system';
import DeleteIcon from '@mui/icons-material/Delete';

export const config: ViewConfig = {
  menu: { order: 1, icon: 'line-awesome/svg/comment-solid.svg' },
  title: 'Public'
};

const CustomFileDropArea = styled(Box)({
  border: '2px dashed #ccc',
  borderRadius: '5px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
  marginBottom: '20px'
});

const CustomFilePreview = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
});

const ImageUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: any) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleButtonClick = () => {
    fileInputRef?.current?.click();
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/uploadEpub', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file.name);
        document.body.appendChild(link);
        link.click();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  };

  return (
    <Box>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h2" gutterBottom>
          EPUB File Upload & Preview
        </Typography>
        <CustomFileDropArea onClick={handleButtonClick}>
          <input
            type="file"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            ref={fileInputRef}
            accept=".epub"
          />
          <label style={{ display: 'block', cursor: 'pointer' }}>
            Click to Upload EPUB File
          </label>
        </CustomFileDropArea>
        <CustomFilePreview>
          {file && (
            <List>
              <ListItem
                secondaryAction={
                  <IconButton edge="end" onClick={handleRemoveFile}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={file.name} />
              </ListItem>
            </List>
          )}
        </CustomFilePreview>
        <Button variant="contained" type="submit">
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default ImageUpload;
