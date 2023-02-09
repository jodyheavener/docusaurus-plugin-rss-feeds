# docusaurus-plugin-rss-feeds

⚠️ This plugin is deprecated in favour of a more robust solution: [@1password/docusaurus-plugin-stored-data](https://www.npmjs.com/package/@1password/docusaurus-plugin-stored-data)

Consume RSS feeds for rendering in Docusaurus

## Usage

Install the dependency with `yarn add docusaurus-plugin-rss-feeds` or `npm i docusaurus-plugin-rss-feeds`

Add the plugin, as well as its config, to your `docusaurus.config.js` file's plugins. The config takes one property, `feeds`, an object where the keys are feed IDs and the values are their location. For example:

```js
plugins: [
  [
    'docusaurus-plugin-rss-feeds',
    {
      feeds: {
        "blog": "https://example.com/blog.xml"
      }
    }
  ]
],
```

Now, when you start your dev server or build the site the plugin will retrieve the contents of each RSS feed specified in the config and store it as plugin data. Access this data in your site using the `useRssFeed` hook (available via the `@theme` alias), which takes a feed ID and returns a JSON structure of your RSS feed's data. For example:

```jsx
import useRssFeed from "@theme/useRssFeed";

const FeedItems = () => {
  const feedData = useRssFeed("blog");
  return (
    <ul>
      {feedData.item.map((item) => (
        <li key={item.guid}>{item.title}</li>
      ))}
    </ul>
  );
};
```

If you're using TypeScript you can make the hook module alias available by referencing the plugin's types:

```ts
/// <reference types="docusaurus-plugin-rss-feeds" />
```

ℹ️ Heads up - this plugin only retrieves feed data whenever the plugin is called, and is not meant for live-loading feed data on each page load. You are responsible for setting up triggers or regular builds to re-generate the static content.

## License

MIT
