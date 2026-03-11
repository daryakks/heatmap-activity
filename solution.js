const fs = require("fs");
const { execSync } = require("child_process");

const [,, jsonPath] = process.argv;
if (!jsonPath) {
    console.error("Usage: node solution.js test.json");
    process.exit(1);
}

const colors = JSON.parse(fs.readFileSync(jsonPath, "utf8"));


const levelMap = {
    "#ebedf0": 0,
    "#9be9a8": 1,
    "#40c463": 3,
    "#30a14e": 6,
    "#216e39": 11,
};


const today = new Date();

const startDate = new Date(today);
startDate.setDate(today.getDate() - 364);
startDate.setDate(startDate.getDate() - startDate.getDay()); 


const numRows = 7; 
const numCols = Math.ceil(colors.length / numRows);


function addDays(date, days) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}


function randomTime(date) {
    const hours = Math.floor(Math.random() * 12) + 8; 
    const minutes = Math.floor(Math.random() * 60);
    const seconds = Math.floor(Math.random() * 60);
    const d = new Date(date);
    d.setHours(hours, minutes, seconds);
    return d.toISOString();
}

for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
        const idx = row * numCols + col;
        const color = colors[idx];
        if (!color) continue;
        const commitsCount = levelMap[color] || 0;
        if (commitsCount === 0) continue;

        const cellDate = addDays(startDate, col * 7 + row);

        for (let i = 0; i < commitsCount; i++) {
            const timestamp = randomTime(cellDate);
            try {
                execSync(`git commit --allow-empty -m "Activity commit ${timestamp}"`, {
                    env: {
                        ...process.env,
                        GIT_AUTHOR_DATE: timestamp,
                        GIT_COMMITTER_DATE: timestamp,
                    },
                });
            } catch (err) {
                console.error("Git commit failed:", err.message);
            }
        }
    }
}

console.log("Коммиты созданы! Не забудьте сделать git push.");