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

function randOf(arr: any[]) {
    return arr[rand(0, arr.length - 1)];
}

async function getRandomImage() {
    // const res = await fetch(`https://customsearch.googleapis.com/customsearch/v1?cx=${process.env.SEARCH_ID!}&searchType=image&q=stock+image&siteSearch=investopedia.com,upload.wikimedia.org&siteSearchFilter=e&key=${process.env.SEARCH_KEY!}&start=${rand(0, 191)}`)
    // const endpoints = ["royalty-free", "public-domain", "creative-common", "high-resolution", "creative", "non-copyrighted", "blogging"]

    // const res = await fetch(`
    //     https://unsplash.com/napi/landing_pages/images/stock/${randOf(endpoints)}?page=${rand(1, 1000)}&per_page=30
    // `);

    // very basic and broad terms to search for that are not specific in any way
    const searchTerms = ["people", "person", "building", "city", "nature", "landscape", "animals", "travel", "business", "technology"];

    const res = await fetch(`
        https://www.alamy.com/search-api/search/?qt=${randOf(searchTerms)}&sortBy=relevant&ispartial=true&langcode=en&isbot=false&type=picture&geo=US&nasty=0&editorial=1&pn=${rand(1, 500)}&ps=100
        `)
    const data = await res.json();

    console.log(data);

    const images = data.items.map((item: any) => item.renditions["450v"].href);
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

(async () => {
    const imageUrl = await getRandomImage();
    console.log(`Got image: ${imageUrl}`);

    await postImage(imageUrl);
    console.log("Posted image successfully");
})();