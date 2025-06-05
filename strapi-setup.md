# Strapi Setup Instructions

## 1. Install Strapi
\`\`\`bash
npx create-strapi-app@latest lightberry-strapi --quickstart
cd lightberry-strapi
\`\`\`

## 2. Create Content Type
After Strapi starts, go to http://localhost:1337/admin and:

1. Create an admin account
2. Go to Content-Types Builder
3. Create a new Collection Type called "Project"
4. Add these fields:
   - `title` (Text - Short text)
   - `description` (Text - Long text)
   - `img` (Text - Short text, for image URL)
   - `link` (Text - Short text, for project URL)

## 3. Configure Permissions
1. Go to Settings > Users & Permissions Plugin > Roles
2. Click on "Public"
3. Under "Project", check "find" and "findOne"
4. Save

## 4. Add Sample Data
Go to Content Manager > Project and create some sample projects with:
- Title: "Weather App"
- Description: "A simple weather forecasting app with real-time data."
- Img: "https://example.com/weather.png"
- Link: "https://weather.lightberry.app"

## 5. Environment Variables (Optional)
Create a `.env.local` file in your Next.js project:
\`\`\`
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
\`\`\`

Then update the fetch URL to use:
`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/projects?populate=*`
