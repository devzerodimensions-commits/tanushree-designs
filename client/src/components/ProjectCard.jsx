import Img from './Img.jsx';

/**
 * A finished project: the photograph and its name, nothing else.
 *
 * There is no per-project page, so the card is a plain tile rather than a
 * link — no cursor change, no hover cue, nothing that promises a page that
 * is not there.
 */
export default function ProjectCard({ project }) {
  return (
    <article className="project-card">
      <Img src={project.cover_image} alt={project.title} />
      <span className="project-card__veil" />
      <div className="project-card__body">
        <h3>{project.title}</h3>
      </div>
    </article>
  );
}
