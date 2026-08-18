<!-- CMP-9 in a Svelte component. `{@html …}` is plain text to the html parser,
     which is why the rule matches a text node for it rather than a node kind of
     its own. -->
<p class="comment">{@html comment.body}</p>
