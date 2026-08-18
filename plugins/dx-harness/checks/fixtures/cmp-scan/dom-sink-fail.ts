/* CMP-9's non-JSX sinks. A bare `.innerHTML` READ is not a sink, so `snapshot`
   below is clean and only the assignment, the insertAdjacentHTML call and the
   document.write call are reported. */

export function snapshot(el: HTMLElement) {
  return el.innerHTML;
}

export function paint(el: HTMLElement, html: string) {
  el.innerHTML = html;
  el.insertAdjacentHTML("beforeend", html);
  document.write(html);
}
