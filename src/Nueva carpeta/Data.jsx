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



export const Data = () => {
  const data = { nodes };

  return <CompactTable data={data} />;
};