export type TaskType = {
  id: string;
  title: string;
  description: string;
  editable?: boolean; // New property
};

export type ColumnType = {
  id: string;
  title: string;
  taskIds: string[];
};
