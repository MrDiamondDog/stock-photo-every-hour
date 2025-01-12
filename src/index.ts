import { TwitterApi } from 'twitter-api-v2';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Initialize Twitter client
const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
});

function rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

async function getRandomImage() {
    const res = await fetch(`https://customsearch.googleapis.com/customsearch/v1?cx=${process.env.SEARCH_ID!}&searchType=image&q=stock+image&siteSearch=investopedia.com,upload.wikimedia.org&siteSearchFilter=e&key=${process.env.SEARCH_KEY!}&start=${rand(0, 191)}`)
    const data = await res.json();

    const images = data.items.map((item: any) => item.link);
    return images[rand(0, images.length - 1)];
}

async function postImage(imageUrl: string) {
    console.log(`Posting image: ${imageUrl}`);

    // download image as file
    const res = await fetch(imageUrl);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload image
    const image = await client.v1.uploadMedia(buffer, {
        mimeType: "image/jpeg",
    });
    
    // Post tweet
    await client.v2.tweet("", {
        media: {
            media_ids: [image],
        }
    });
}

// Schedule to run every hour
setInterval(async () => postImage(await getRandomImage()), 1000 * 60 * 60);
(async () => postImage(await getRandomImage()))();