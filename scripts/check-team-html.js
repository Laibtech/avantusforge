const http = require("http");

http.get("http://localhost:3001/team", (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    console.log("HTTP STATUS:", res.statusCode);
    const imgMatches = data.match(/src="[^"]*team[^"]*"/g) || [];
    console.log("Images found in /team HTML:");
    imgMatches.forEach((m) => console.log(" ", m));

    console.log("\nKey team name checks:");
    console.log("  Contains 'Laiba Baig':", data.includes("Laiba Baig"));
    console.log("  Contains 'Maira':", data.includes("Maira"));
    console.log("  Contains 'Bilal':", data.includes("Bilal"));
    console.log("  Contains 'Technical Director':", data.includes("Technical Director"));
    console.log("  Contains 'Muzamil':", data.includes("Muzamil"));
    console.log("  Contains 'Operations Director':", data.includes("Operations Director"));
    console.log("  Contains 'Hamza Tariq':", data.includes("Hamza Tariq"));
    console.log("  Contains 'Usman Farooq':", data.includes("Usman Farooq"));
  });
});
