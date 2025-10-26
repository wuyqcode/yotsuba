import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import React, { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const AddCollectionDialog: React.FC<Props> = ({ open, onClose }) => {
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (name.trim()) {
      // TODO: API call
      setName('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>新規コレクション</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          autoFocus
          margin="dense"
          label="コレクション名"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleAdd} disabled={!name.trim()} variant="contained">
          追加
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCollectionDialog;