// Resume data types
export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
}

export interface WorkExperience {
  id: string;
  companyName: string;
  jobTitle: string;
  location: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isCurrentJob: boolean;
  responsibilities: string;
}

export interface Education {
  id: string;
  schoolName: string;
  major: string;
  degree: string;
  startYear: string;
  endYear: string;
  additionalInfo?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

export interface OptionalSections {
  hobbies: string;
  certificates: Certificate[];
  languages: Language[];
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  professionalSummary: string;
  workExperiences: WorkExperience[];
  education: Education[];
  skills: Skill[];
  optionalSections: OptionalSections;
}

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DEGREES = [
  'High School',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'Doctorate/PhD'
];

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;

export const LANGUAGE_PROFICIENCY = ['Basic', 'Conversational', 'Fluent', 'Native'] as const;
