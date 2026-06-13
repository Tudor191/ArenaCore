const { spawn } = require("child_process");
const { exec } = require("child_process");

const server = spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
});

const checkReady = setInterval(async () => {
  try {
    const res = await fetch("http://localhost:3000");
    if (res.status < 500) {
      clearInterval(checkReady);
      if (process.platform === "win32") {
        exec("start http://localhost:3000");
      } else if (process.platform === "darwin") {
        exec("open http://localhost:3000");
      } else {
        exec("xdg-open http://localhost:3000");
      }
    }
  } catch {}
}, 1000);

server.on("close", () => clearInterval(checkReady));
