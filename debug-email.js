const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(process.cwd(), 'data', 'outlets.json');

try {
    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    const outlets = JSON.parse(fileData);

    console.log(`Total outlets found: ${outlets.length}`);

    const targetEmail = "theuniversallord243@gmail.com";
    const query = targetEmail.trim().toLowerCase();

    console.log(`Searching for: '${query}'`);

    const found = outlets.find(o => {
        const stored = o.email ? o.email.trim().toLowerCase() : '';
        console.log(`Checking against: '${stored}' (Original: '${o.email}')`);
        return stored === query;
    });

    if (found) {
        console.log("SUCCESS: Match found!");
        console.log("ID:", found.id);
        console.log("Pass:", found.password);
    } else {
        console.log("FAILURE: No match found.");
    }

} catch (e) {
    console.error("Error reading file:", e);
}
