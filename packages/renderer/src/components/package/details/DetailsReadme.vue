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
<style>
.prose thead {
  color: white;
}
.prose hr {
  border-color: rgba(255, 255, 255, 0.1) !important;
}
.prose th,
.prose thead,
.prose tr {
  border-bottom-color: rgba(255, 255, 255, 0.1) !important;
}
.prose img {
  margin: 0 !important;
  display: inline-block;
}

.prose pre,
.prose code {
  font-family: 'Fira Code', sans-serif;
  @apply bg-black bg-opacity-20 rounded-lg;
}

.prose code {
  @apply p-1 rounded-md !important;
}

.prose pre code {
  padding: 0;
  background-color: transparent;
}
.prose a {
  color: theme('colors.blue.500') !important;
}
</style>
