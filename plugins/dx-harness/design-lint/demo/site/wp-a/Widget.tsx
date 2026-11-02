export function Widget() {
  return (
    <section>
      <img src="/wp-a/project.svg" alt="Volunteers planting a community garden" />
      <video controls>
        <source src="/wp-a/film.mp4" type="video/mp4" />
        <track kind="captions" src="/wp-a/film.vtt" srcLang="en" label="English" />
      </video>
      <button type="button" tabIndex={0}>
        Play
      </button>
    </section>
  );
}
