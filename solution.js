"use strict";

const fs = require("fs");
const { execSync } = require("child_process");

const MS_IN_DAY = 24 * 60 * 60 * 1000;

const COLOR_MAP = {
  "#ebedf0": 0,
  "#9be9a8": 1,
  "#40c463": 3,
  "#30a14e": 6,
  "#216e39": 11,
};

function readColors(path) {
  if (!path) {
    console.error("Usage: node solution.js file.json");
    process.exit(1);
  }

  const text = fs.readFileSync(path, "utf-8");
  return JSON.parse(text);
}

function getStartDate(today) {
  const start = new Date(today.getTime() - 364 * MS_IN_DAY);

  return new Date(
    start.getTime() - start.getDay() * MS_IN_DAY
  );
}

function getColsPerRow(startDate, today) {
  const todayDay = today.getDay();

  const totalDays =
    Math.floor((today - startDate) / MS_IN_DAY) + 1;

  const totalWeeks = Math.ceil(totalDays / 7);

  const cols = [];

  for (let row = 0; row < 7; row += 1) {
    cols[row] =
      row <= todayDay
        ? totalWeeks
        : totalWeeks - 1;
  }

  return cols;
}

function makeCommit(date) {
  const iso = date.toISOString().slice(0, 19);

  execSync(
    `git commit --allow-empty -m "Activity commit ${iso}"`,
    {
      env: {
        ...process.env,
        GIT_AUTHOR_DATE: iso,
        GIT_COMMITTER_DATE: iso,
      },
      stdio: "ignore",
    }
  );
}

function run(colors) {
  const today = new Date();

  const startDate = getStartDate(today);

  const colsPerRow = getColsPerRow(
    startDate,
    today
  );

  let index = 0;

  for (let row = 0; row < 7; row += 1) {
    for (
      let col = 0;
      col < colsPerRow[row];
      col += 1
    ) {
      if (index >= colors.length) {
        return;
      }

      const color = colors[index];
      index += 1;

      const commits =
        COLOR_MAP[color] ?? 0;

      const cellDate = new Date(
        startDate.getTime() +
          (col * 7 + row) * MS_IN_DAY
      );

      if (cellDate > today) {
        continue;
      }

      for (let i = 0; i < commits; i += 1) {
        makeCommit(cellDate);
      }
    }
  }
}

const file = process.argv[2];

const colors = readColors(file);

run(colors);

console.log("Done");