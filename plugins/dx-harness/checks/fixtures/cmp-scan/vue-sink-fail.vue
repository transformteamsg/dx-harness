<!-- CMP-9 in a Vue single-file component. `.vue` is not an ast-grep language at
     0.44.1, so it reaches the html rules through sgconfig.yml's languageGlobs and
     `v-html` parses as an ordinary attribute. -->
<template>
  <div class="comment" v-html="comment.body"></div>
</template>
