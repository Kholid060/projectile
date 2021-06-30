<template>
  <div
    ref="container"
    class="prose max-w-none prose-blue"
    v-html="parser(pkg?.details.readme || '')"
  ></div>
</template>
<script>
import { nextTick, ref } from 'vue';
import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import hljs from '@/lib/highlight';

export default {
  props: {
    pkg: {
      type: Object,
      default: () => ({}),
    },
  },
  setup() {
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, { language: lang }).value;
          } catch (error) {
            console.error(error);
          }
        }

        return '';
      },
    });
    md.use(markdownItAnchor);

    const container = ref(null);
    const parser = (value) => md.render(value);

    nextTick(() => {
      const links = container.value.querySelectorAll('a');

      links.forEach((link) => {
        const url = link.href.replace('http://localhost:3000/', '');
        const isExternalLink = /^(http:|https:)/.test(url);

        if (isExternalLink) {
          link.target = '_blank';
          link.title = url;

          return;
        }

        if (url.startsWith('#')) {
          link.onclick = () => {
            const scroll = document.querySelector('.package-details');
            const target = container.value.querySelector(url);

            scroll.scrollTo(0, target ? target.offsetTop - 64 : 0);

            return false;
          };

          return;
        }

        link.onclick = () => false;
      });
    });

    return {
      parser,
      container,
    };
  },
};
</script>
