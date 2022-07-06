import { LoadContext, Plugin } from "@docusaurus/types";
import pluginRssFeeds, { themePath } from ".";
import { FeedData, PLUGIN_ID } from "./shared";
import https from "https";
import { IncomingMessage } from "http";
import { readFileSync } from "fs";
import { resolve } from "path";

const xmlData = readFileSync(resolve(__dirname, "test-data.xml"), "utf-8");

const feeds = {
  "feed-1": "https://example.com/feed.xml",
};

jest.mock("https", () => ({
  ...jest.requireActual("https"),
  request: (
    options: Parameters<typeof https.request>[0],
    callback: (res: IncomingMessage) => void
  ) =>
    callback({
      // @ts-ignore
      on: (event, listener) => {
        switch (event) {
          case "data":
            (listener as (chunk: any) => void)(Buffer.from(xmlData, "utf8"));
            break;
          case "end":
            (listener as () => void)();
            break;
        }
      },
      statusCode: 200,
      statusMessage: "API Success",
    }),
  on: jest.fn(),
  end: jest.fn(),
}));

describe("pluginRssFeeds", () => {
  let pluginResult: Plugin<FeedData>;
  beforeAll(() => {
    pluginResult = pluginRssFeeds(null as unknown as LoadContext, { feeds });
  });

  it("has the correct plugin name", () => {
    expect(pluginResult.name).toBe(PLUGIN_ID);
  });

  describe("loadContent", () => {
    it("parses each feed and returns the formatted data", async () => {
      const data = await pluginResult.loadContent!();
      expect(data).toEqual({
        "feed-1": expect.any(Object),
      });
    });
  });

  describe("contentLoaded", () => {
    it("sets the global data", async () => {
      const setGlobalData = jest.fn();
      const content = { foo: "bar" };
      await pluginResult.contentLoaded!({
        content: { "feed-1": content },
        actions: {
          setGlobalData,
          addRoute: jest.fn(),
          createData: jest.fn(),
        },
        allContent: {},
      });
      expect(setGlobalData).toHaveBeenCalledWith({
        feeds: { "feed-1": content },
      });
    });
  });

  describe("getThemePath", () => {
    it("returns a path to the theme components directory", () => {
      expect(pluginResult.getThemePath!()).toBe(themePath);
    });
  });
});
