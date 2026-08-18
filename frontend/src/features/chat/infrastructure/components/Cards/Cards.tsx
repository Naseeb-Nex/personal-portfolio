import React from 'react';
import './Cards.css';

export const SummaryCard = ({ data }: { data: any }) => (
  <div className="chat-card">
    <h3>{data.name}</h3>
    <div className="chat-card-subtitle">{data.role}</div>
    <div className="chat-card-desc">{data.bio}</div>
  </div>
);

export const EducationCard = ({ data }: { data: any[] }) => (
  <div className="chat-card">
    <h3>Education</h3>
    {data?.map((edu, i) => (
      <div key={i} className="chat-card-item">
        <div className="chat-card-title">{edu.degree}</div>
        <div className="chat-card-subtitle">{edu.school} • {edu.period}</div>
      </div>
    ))}
  </div>
);

export const SkillsCard = ({ data }: { data: Record<string, string[]> }) => (
  <div className="chat-card">
    <h3>Technical Skills</h3>
    {Object.entries(data || {}).map(([category, skills]) => (
      <div key={category} className="chat-card-item">
        <div className="chat-card-title" style={{ textTransform: 'capitalize' }}>
          {category.replace('_', ' ')}
        </div>
        <div className="chat-badge-container">
          {skills?.map((skill: string) => (
            <span key={skill} className="chat-badge">{skill}</span>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const ExperienceCard = ({ data }: { data: any[] }) => (
  <div className="chat-card">
    <h3>Experience</h3>
    {data?.map((exp, i) => (
      <div key={i} className="chat-card-item">
        <div className="chat-card-title">{exp.role} at {exp.company}</div>
        <div className="chat-card-subtitle">{exp.duration}</div>
        {exp.bullets && (
          <ul>
            {exp.bullets.map((b: string, j: number) => <li key={j}>{b}</li>)}
          </ul>
        )}
      </div>
    ))}
  </div>
);

export const CertificationsCard = ({ data }: { data: any[] }) => (
  <div className="chat-card">
    <h3>Certifications</h3>
    {data?.map((cert, i) => (
      <div key={i} className="chat-card-item">
        <div className="chat-card-title">{cert.name}</div>
        <div className="chat-card-subtitle">{cert.year}</div>
      </div>
    ))}
  </div>
);

export const ProjectsCard = ({ data }: { data: any[] }) => (
  <div className="chat-card">
    <h3>Key Projects</h3>
    {data?.map((proj, i) => (
      <div key={i} className="chat-card-item">
        <div className="chat-card-title">{proj.name}</div>
        <div className="chat-card-desc" style={{ marginBottom: '8px' }}>{proj.description}</div>
        <div className="chat-badge-container">
          {proj.tech?.map((t: string) => (
            <span key={t} className="chat-badge">{t}</span>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const ComponentMap: Record<string, React.FC<any>> = {
  SummaryCard,
  EducationCard,
  SkillsCard,
  ExperienceCard,
  CertificationsCard,
  ProjectsCard,
};
