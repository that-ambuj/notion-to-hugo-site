import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { config } from "dotenv";
import fs from "fs/promises";

config();

const notion = new Client({ auth: process.env["NOTION_KEY"] });

const databaseId = process.env["NOTION_DATABASE_ID"];

// set this to whatever directory you want to export markdown files
const MARKDOWN_DIR = "./hugo-site";

export async function downloadMarkdown() {
  const n2m = new NotionToMarkdown({ notionClient: notion, staticFileDir: "hugo-site/static" });

  if (!databaseId) throw Error("Missing NOTION_DATABASE_ID environment variable.");

  // Query the blog database
  const res = await notion.databases.query({
    database_id: databaseId
  });

  console.log("Downloading Pages from Notion....");

  await Promise.all(res.results.map(async (r) => {
    const pageData = await notion.pages.retrieve({ page_id: r.id });

    // @ts-ignore: JSON data is not typed in pageData
    const tags = pageData?.properties?.Tags?.multi_select.map(t => t.name);

    // @ts-ignore: JSON data is not typed in pageData
    const author = pageData?.properties?.Authors?.people[0]?.name;


    // @ts-ignore: JSON data is not typed in pageData
    const title = pageData?.properties?.Name?.title[0]?.plain_text;
    // @ts-ignore: JSON data is not typed in pageData
    const publishedOn = pageData?.properties["Published On"].date?.start;
    const slugifiedTitle = title.split(" ").join("-").toLowerCase();

    const mdBlocks = await n2m.pageToMarkdown(r.id);

    const mdString = n2m.toMarkdownString(mdBlocks);

    // Front Matter is in TOML
    const hugoHeader = `+++
title = "${title}"
date = ${publishedOn}
author = "${author ?? 'Anonymous'}"
tags = ["${tags.join('", "')}"]
+++`;

    await fs.writeFile(`${MARKDOWN_DIR}/content/${slugifiedTitle || r.id}.md`, hugoHeader + mdString, "utf8");
  }));
}

await downloadMarkdown();