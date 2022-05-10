import { usePluginData } from "@docusaurus/useGlobalData";
import { FeedData, PLUGIN_ID } from ".";

export const useRssFeed = <T = Record<string, any>>(name: string): T => {
  const pluginData = usePluginData(PLUGIN_ID) as FeedData;
  return pluginData.feeds[name];
};
