/* A React component of the demo site. It passes the JSX rules of WP-10 to WP-19. */
export const Contact = () => (
  <form>
    <label htmlFor="contact-email">Email address</label>
    <input id="contact-email" name="email" type="email" autoComplete="email" />
  </form>
);
