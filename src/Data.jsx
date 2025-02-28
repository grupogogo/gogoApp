import { CompactTable } from '@table-library/react-table-library/compact';

export const nodes = [
  {
    id: '0',
    name: 'Shopping List',
    deadline: new Date(2020, 1, 15),
    type: 'TASK',
    isComplete: true,
    nodes: 3,
  },
];
for (let i = 1; i <= 20; i++) {
  nodes.push({
    id: i.toString(),
    name: `Task ${i}`,
    deadline: new Date(2020, 1, 15 + i),
    type: 'TASK',
    isComplete: i % 2 === 0,
    nodes: i,
  });
}

const COLUMNS = [
  { label: 'Task', renderCell: (item) => item.name },
  {
    label: 'Deadline',
    renderCell: (item) =>
      item.deadline.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
  },
  { label: 'Type', renderCell: (item) => item.type },
  {
    label: 'Complete',
    renderCell: (item) => item.isComplete.toString(),
  },
  { label: 'Tasks', renderCell: (item) => item.nodes },
];

export const Data = () => {
  const data = { nodes };

  return <CompactTable columns={COLUMNS} data={data} />;
};