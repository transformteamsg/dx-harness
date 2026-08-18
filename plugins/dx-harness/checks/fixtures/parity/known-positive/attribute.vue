<!--
  attribute.vue, a parity fixture. .vue is not an ast-grep language at 0.44.1, so
  this file is reached only through sgconfig.yml's languageGlobs mapping to html.

  A multi-line html comment is a syntax node now, so nothing written in here can
  reach a rule. The header therefore names the expected findings in words rather
  than in code: a raw hex and an off-scale padding in the style attribute, and a
  Tailwind palette class in the class attribute. The exact lines are in expected/.
-->
<template>
  <div style="color: #123456; padding: 15px;" class="bg-red-500">Card</div>
</template>
