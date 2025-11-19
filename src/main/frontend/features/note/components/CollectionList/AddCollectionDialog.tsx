import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useCollectionStore } from '../../hooks/useCollection';

interface Props {
  open: boolean;
  onClose: () => void;
}

const AddCollectionDialog: React.FC<Props> = ({ open, onClose }) => {
  const [name, setName] = useState('');
  const addCollection = useCollectionStore((s) => s.addCollection);

  useEffect(() => {
    if (!open) {
      setName('');
    }
  }, [open]);

  const handleClose = () => {
    setName('');
    onClose();
  };

  const handleAdd = () => {
    if (name.trim()) {
      Promise.resolve(addCollection(name.trim()))
        .then(() => {
          setName('');
          onClose();
        })
        .catch((err) => {
          console.error('[AddCollectionDialog] 创建集合失败:', err);
        });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
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
        <Button onClick={handleClose}>キャンセル</Button>
        <Button onClick={handleAdd} disabled={!name.trim()} variant="contained">
          追加
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCollectionDialog;
