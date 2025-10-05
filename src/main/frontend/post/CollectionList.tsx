import React from 'react';
import { Stack } from '@mui/material';
import { useCollectionStore } from './hook/useCollectionStore';
import { Collection } from './hook/useCollectionStore';
import CollectionItem from './CollectionItem';

interface Props {
  onEdit: (col: Collection) => void;
}

const CollectionList: React.FC<Props> = ({ onEdit }) => {
  const { collections, deleteCollection } = useCollectionStore();

  return (
    <Stack spacing={1} mt={1}>
      {collections.map((col) => (
        <CollectionItem key={col.id} col={col} onEdit={onEdit} onDelete={deleteCollection} />
      ))}
    </Stack>
  );
};

export default CollectionList;
