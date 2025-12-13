require('dotenv').config();
const url = process.env.DATABASE_URL;
if (!url) {
    console.log("DATABASE_URL is undefined or empty");
} else {
    // Print scheme only
    const scheme = url.split(':')[0];
    console.log("Scheme:", scheme);
    // basic check
    console.log("Length:", url.length);
}
