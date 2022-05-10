import type {
  LoadContext,
  OptionValidationContext,
  Plugin,
} from "@docusaurus/types";
import { Joi } from "@docusaurus/utils-validation";
import https from "https";
import path from "path";
import { Parser } from "xml2js";

export type FeedData = Record<string, any>;
export type PluginOptions = { feeds: Record<string, string> };
export const PLUGIN_ID = "docusaurus-plugin-rss-feeds";

const xmlParser = new Parser({
  explicitArray: false,
});

export default function pluginRssFeeds(
  _: LoadContext,
  { feeds = {} }: PluginOptions
): Plugin<FeedData> {
  return {
    name: PLUGIN_ID,

    async loadContent() {
      const parsed = await Promise.all(
        Object.entries(feeds).map(async ([name, url]) => {
          const response = await httpsPromise(url);
          let data = await xmlParser.parseStringPromise(response.body);

          try {
            const channel = data.rss.channel;
            if (!channel) {
              throw new Error("Channel data not found");
            }
            data = channel;
          } catch {
            // most rss feeds will be structured like the above, but
            // if it's a non-standard feed don't try to drill down
          }

          return [name, data];
        })
      );

      return Object.fromEntries(parsed);
    },

    async contentLoaded({ content, actions: { setGlobalData } }) {
      setGlobalData({
        feeds: content,
      });
    },

    configureWebpack() {
      return {
        resolve: {
          alias: {
            [`${PLUGIN_ID}$`]: path.resolve(__dirname, "index.js"),
          },
        },
      };
    },
  };
}

const httpsPromise = (
  options: Parameters<typeof https.request>[0]
): Promise<{
  statusCode?: number;
  headers: NodeJS.Dict<string | string[]>;
  body: string;
}> =>
  new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      let body = "";
      const { statusCode, headers } = response;

      response.on("data", (chunk) => (body += chunk.toString()));
      response.on("error", reject);
      response.on("end", () => {
        if (statusCode! >= 200 && statusCode! <= 299) {
          return resolve({
            statusCode,
            headers,
            body,
          });
        }

        reject(`Request failed. Status: ${response.statusCode}, body: ${body}`);
      });
    });

    request.on("error", reject);
    request.end();
  });

const pluginOptionsSchema = Joi.object<PluginOptions>({
  feeds: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
});

export function validateOptions({
  validate,
  options,
}: OptionValidationContext<
  Partial<PluginOptions>,
  PluginOptions
>): PluginOptions {
  return validate(pluginOptionsSchema, options);
}
