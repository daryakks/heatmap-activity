"use strict";

const fs = require("fs");
const { execSync } = require("child_process");

const COMMITS_BY_COLOR = {
  "#ebedf0": 0,
  "#9be9a8": 1,
  "#40c463": 3,
  "#30a14e": 6,
  "#216e39": 11,
};

function readColors(filePath) {
  if (!filePath) {
    console.error("Usage: node solution.js <file.json>");
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getStartDate(today) {
  const dayStart = startOfDay(today);
  const yearWindowStart = addDays(dayStart, -364);
  return addDays(yearWindowStart, -yearWindowStart.getDay());
}

function getColumnsPerRow(startDate, today) {
  const todayStart = startOfDay(today);
  const totalDays = Math.floor((todayStart - startDate) / (24 * 60 * 60 * 1000)) + 1;
  const totalWeeks = Math.ceil(totalDays / 7);
  const todayDayOfWeek = todayStart.getDay();

  return Array.from({ length: 7 }, (_, row) =>
    row <= todayDayOfWeek ? totalWeeks : totalWeeks - 1
  );
}

function formatTimestamp(date, serial) {
  const commitDate = new Date(date);
  commitDate.setHours(12, 0, serial, 0);

  const year = commitDate.getFullYear();
  const month = String(commitDate.getMonth() + 1).padStart(2, "0");
  const day = String(commitDate.getDate()).padStart(2, "0");
  const hours = String(commitDate.getHours()).padStart(2, "0");
  const minutes = String(commitDate.getMinutes()).padStart(2, "0");
  const seconds = String(commitDate.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

function makeCommit(timestamp) {
  execSync(`git commit --allow-empty -m "Activity commit ${timestamp}"`, {
    env: {
      ...process.env,
      GIT_AUTHOR_DATE: timestamp,
      GIT_COMMITTER_DATE: timestamp,
    },
    stdio: "ignore",
  });
}

function createCommits(colors) {
  const today = new Date();
  const startDate = getStartDate(today);
  const columnsPerRow = getColumnsPerRow(startDate, today);

  let colorIndex = 0;

  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < columnsPerRow[row]; col += 1) {
      if (colorIndex >= colors.length) {
        return;
      }

      const color = String(colors[colorIndex]).toLowerCase();
      colorIndex += 1;

      const commitsCount = COMMITS_BY_COLOR[color] ?? 0;
      if (commitsCount === 0) {
        continue;
      }

      const cellDate = addDays(startDate, col * 7 + row);
      if (cellDate > today) {
        continue;
      }

      for (let i = 0; i < commitsCount; i += 1) {
        makeCommit(formatTimestamp(cellDate, i));
      }
    }
  }
}

function main() {
  const filePath = process.argv[2];
  const colors = readColors(filePath);
  createCommits(colors);
}

main();