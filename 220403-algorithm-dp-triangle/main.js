const triangle = [
  [1],
  [2, 3],
  [4, 5, 6],
  [7, 8, 9, 8],
  [7, 6, 5, 4, 3],
  [2, 1, 2, 3, 4, 5]
];

for (let i = 1; i < triangle.length; i++) {
  for (let j = 0; j < triangle[i].length; j++) {
    if (j === 0) triangle[i][j] += triangle[i-1][0];
    else if (j === triangle[i].length - 1) triangle[i][j] += triangle[i-1][j-1];
    else triangle[i][j] += Math.max(triangle[i-1][j], triangle[i-1][j-1]);
  }
}
console.log(Math.max(...triangle[triangle.length - 1]));