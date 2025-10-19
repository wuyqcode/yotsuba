import React from 'react';
import { Stack } from '@mui/material';
import { useCollectionStore, Collection } from 'Frontend/features/note/hooks/useCollectionStore';
import CollectionItem from 'Frontend/features/note/components/CollectionItem';

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
