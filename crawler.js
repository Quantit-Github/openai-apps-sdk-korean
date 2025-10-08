// Simple crawling script to extract all pages
const fs = require('fs').promises;
const path = require('path');

const pages = [
  {
    url: '/apps-sdk/concepts/user-interaction',
    file: 'core-concepts/user-interaction.md',
    title: 'User Interaction'
  },
  {
    url: '/apps-sdk/concepts/design-guidelines',
    file: 'core-concepts/design-guidelines.md',
    title: 'Design Guidelines'
  },
  {
    url: '/apps-sdk/plan/use-case',
    file: 'plan/use-case.md',
    title: 'Research Use Cases'
  },
  {
    url: '/apps-sdk/plan/tools',
    file: 'plan/tools.md',
    title: 'Define Tools'
  },
  {
    url: '/apps-sdk/plan/components',
    file: 'plan/components.md',
    title: 'Design Components'
  },
  {
    url: '/apps-sdk/build/mcp-server',
    file: 'build/mcp-server.md',
    title: 'Set up your server'
  },
  {
    url: '/apps-sdk/build/custom-ux',
    file: 'build/custom-ux.md',
    title: 'Build a Custom UX'
  },
  {
    url: '/apps-sdk/build/auth',
    file: 'build/auth.md',
    title: 'Authenticate Users'
  },
  {
    url: '/apps-sdk/build/storage',
    file: 'build/storage.md',
    title: 'Persist State'
  },
  {
    url: '/apps-sdk/build/examples',
    file: 'build/examples.md',
    title: 'Examples'
  },
  {
    url: '/apps-sdk/deploy',
    file: 'deploy/deploy-your-app.md',
    title: 'Deploy Your App'
  },
  {
    url: '/apps-sdk/deploy/connect-chatgpt',
    file: 'deploy/connect-chatgpt.md',
    title: 'Connect from ChatGPT'
  },
  {
    url: '/apps-sdk/deploy/testing',
    file: 'deploy/testing.md',
    title: 'Test Your Integration'
  },
  {
    url: '/apps-sdk/guides/optimize-metadata',
    file: 'guides/optimize-metadata.md',
    title: 'Optimize Metadata'
  },
  {
    url: '/apps-sdk/guides/security-privacy',
    file: 'guides/security-privacy.md',
    title: 'Security & Privacy'
  },
  {
    url: '/apps-sdk/deploy/troubleshooting',
    file: 'guides/troubleshooting.md',
    title: 'Troubleshooting'
  },
  {
    url: '/apps-sdk/reference',
    file: 'resources/reference.md',
    title: 'Reference'
  },
  {
    url: '/apps-sdk/app-developer-guidelines',
    file: 'resources/app-developer-guidelines.md',
    title: 'App Developer Guidelines'
  }
];

console.log('Pages to crawl:');
pages.forEach((page, i) => {
  console.log(`${i + 1}. ${page.title} -> ${page.file}`);
});
console.log(`\nTotal: ${pages.length} pages`);
