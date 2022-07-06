import { usePluginData } from "@docusaurus/useGlobalData";
import { PLUGIN_ID, FeedData } from "../../shared";

const useRssFeed = <T = Record<string, any>>(name: string): T => {
  const pluginData = usePluginData(PLUGIN_ID) as FeedData;
  return pluginData.feeds[name];
};

export default useRssFeed;
