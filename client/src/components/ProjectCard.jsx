import { Link } from 'react-router-dom';
import Icon from '../lib/icons.jsx';
import Img from './Img.jsx';

export default function ProjectCard({ project, tall = false }) {
  return (
    <Link
      to={`/our-work/${project.slug}`}
      className={`project-card${tall ? ' project-card--tall' : ''}`}
    >
      <Img src={project.cover_image} alt={project.title} />
      <span className="project-card__veil" />
      <div className="project-card__body">
        {project.category_name && (
          <span className="project-card__cat">{project.category_name}</span>
        )}
        <h3>{project.title}</h3>
        <div className="project-card__meta">
          {project.location && <span>{project.location}</span>}
          {project.location && project.year && <i className="divider-dot" />}
          {project.year && <span>{project.year}</span>}
        </div>
        <span className="project-card__cta">
          View project <Icon.arrowRight />
        </span>
      </div>
    </Link>
  );
}
