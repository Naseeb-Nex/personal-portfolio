/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import './Cards.css';

export interface SummaryData {
  name?: string;
  role?: string;
  bio?: string;
}

export const SummaryCard = ({ data }: { data?: SummaryData }) => (
  <div className="chat-card">
    <h3>{data?.name}</h3>
    <div className="chat-card-subtitle">{data?.role}</div>
    <div className="chat-card-desc">{data?.bio}</div>
  </div>
);

export interface EducationItem {
  degree?: string;
  school?: string;
  period?: string;
}

export const EducationCard = ({ data }: { data?: EducationItem[] }) => (
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

export const SkillsCard = ({ data }: { data?: Record<string, string[]> }) => (
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

export interface ExperienceItem {
  role?: string;
  company?: string;
  duration?: string;
  bullets?: string[];
}

export const ExperienceCard = ({ data }: { data?: ExperienceItem[] }) => (
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

export interface CertificationItem {
  name?: string;
  issuer?: string;
  year?: string;
}

export const CertificationsCard = ({ data }: { data?: CertificationItem[] }) => (
  <div className="chat-card">
    <h3>Certifications</h3>
    {data?.map((cert, i) => (
      <div key={i} className="chat-card-item">
        <div className="chat-card-title">{cert.name}</div>
        <div className="chat-card-subtitle">{cert.issuer} • {cert.year}</div>
      </div>
    ))}
  </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ComponentMap: Record<string, React.ComponentType<{ data: any }>> = {
  summary: SummaryCard,
  education: EducationCard,
  skills: SkillsCard,
  experience: ExperienceCard,
  certifications: CertificationsCard,
};
