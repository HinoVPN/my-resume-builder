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
  courseOrQualification: string; // 課程或資格
  institution: string;           // 機構/學校
  startYear: string;            // 開始年份
  startMonth: string;           // 開始月份
  endYear: string;              // 結束年份
  endMonth: string;             // 結束月份
  isCurrentStudy: boolean;      // 目前在讀狀態 (類似 isCurrentJob)
  highlights?: string;          // 課程亮點 (可選)
  
  // Legacy fields for backward compatibility (will be migrated)
  educationLevel?: string;
  schoolName?: string;
  fieldOfStudy?: string;
  degreeType?: string;
  honoursClassification?: string;
  schoolType?: string;
  gpa?: string;
  isCurrentlyEnrolled?: boolean; // Legacy field
  hasGraduated?: boolean;
  hasFinished?: boolean;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  years?: number; // Optional years of experience
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

export const MONTHS_ZH_TW = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月'
];

// Helper function to get localized months
export const getLocalizedMonths = (language: string) => {
  return language === 'zh-TW' ? MONTHS_ZH_TW : MONTHS;
};

// 教育程度 (Education Levels)
export const EDUCATION_LEVELS = [
  'High School',
  'Associate Degree', 
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'Doctorate/PhD',
  'Other'
];

export const EDUCATION_LEVELS_ZH_TW = [
  '中學',
  '副學士',
  '學士', 
  '碩士',
  '博士',
  '其他'
];

// 榮譽等級 (Honours Classifications)
export const HONOURS_CLASSIFICATIONS = [
  'None',
  'First-Class Honours',
  'Upper Second-Class Honours',
  'Lower Second-Class Honours', 
  'Third-Class Honours',
  'Graduated with Honours'
];

export const HONOURS_CLASSIFICATIONS_ZH_TW = [
  '無',
  '一級榮譽',
  '二等一級榮譽',
  '二等二級榮譽',
  '三級榮譽',
  '優等'
];

// 學士學位類型 (Bachelor Degree Types)
export const BACHELOR_DEGREE_TYPES = [
  'Bachelor of Arts (B.A.)',
  'Bachelor of Science (B.Sc.)',
  'Bachelor of Engineering (B.Eng.)',
  'Bachelor of Business Administration (B.B.A.)',
  'Other'
];

export const BACHELOR_DEGREE_TYPES_ZH_TW = [
  '文學士 (B.A.)',
  '理學士 (B.Sc.)',
  '工學士 (B.Eng.)',
  '商學士 (B.B.A.)',
  '其他'
];

// 碩士學位類型 (Master Degree Types)
export const MASTER_DEGREE_TYPES = [
  'Master of Arts (M.A.)',
  'Master of Science (M.Sc.)',
  'Master of Business Administration (M.B.A.)',
  'Master of Engineering (M.Eng.)',
  'Other'
];

export const MASTER_DEGREE_TYPES_ZH_TW = [
  '文學碩士 (M.A.)',
  '理學碩士 (M.Sc.)',
  '工商管理碩士 (M.B.A.)',
  '工程碩士 (M.Eng.)',
  '其他'
];

// 博士學位類型 (Doctorate Degree Types)
export const DOCTORATE_DEGREE_TYPES = [
  'Doctor of Philosophy (Ph.D.)',
  'Doctor of Education (Ed.D.)',
  'Juris Doctor (J.D.)',
  'Doctor of Medicine (M.D.)',
  'Other'
];

export const DOCTORATE_DEGREE_TYPES_ZH_TW = [
  '哲學博士 (Ph.D.)',
  '教育博士 (Ed.D.)',
  '法學博士 (J.D.)',
  '醫學博士 (M.D.)',
  '其他'
];

// 中學類型 (School Types)
export const SCHOOL_TYPES = [
  'High School',
  'Vocational School',
  'International Baccalaureate (IB)',
  'Other'
];

export const SCHOOL_TYPES_ZH_TW = [
  '高中',
  '職業學校',
  '國際文憑 (IB)',
  '其他'
];

// Helper functions
export const getLocalizedEducationLevels = (language: string) => {
  return language === 'zh-TW' ? EDUCATION_LEVELS_ZH_TW : EDUCATION_LEVELS;
};

export const getLocalizedHonoursClassifications = (language: string) => {
  return language === 'zh-TW' ? HONOURS_CLASSIFICATIONS_ZH_TW : HONOURS_CLASSIFICATIONS;
};

export const getLocalizedBachelorDegreeTypes = (language: string) => {
  return language === 'zh-TW' ? BACHELOR_DEGREE_TYPES_ZH_TW : BACHELOR_DEGREE_TYPES;
};

export const getLocalizedMasterDegreeTypes = (language: string) => {
  return language === 'zh-TW' ? MASTER_DEGREE_TYPES_ZH_TW : MASTER_DEGREE_TYPES;
};

export const getLocalizedDoctorateDegreeTypes = (language: string) => {
  return language === 'zh-TW' ? DOCTORATE_DEGREE_TYPES_ZH_TW : DOCTORATE_DEGREE_TYPES;
};

export const getLocalizedSchoolTypes = (language: string) => {
  return language === 'zh-TW' ? SCHOOL_TYPES_ZH_TW : SCHOOL_TYPES;
};

// Legacy support - keep old function names for backward compatibility
export const DEGREES = EDUCATION_LEVELS;
export const DEGREES_ZH_TW = EDUCATION_LEVELS_ZH_TW;
export const getLocalizedDegrees = getLocalizedEducationLevels;

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;

export const SKILL_LEVELS_ZH_TW = ['初學', '中等', '熟練', '專家'] as const;

// Helper function to get localized skill levels
export const getLocalizedSkillLevels = (language: string) => {
  return language === 'zh-TW' ? SKILL_LEVELS_ZH_TW : SKILL_LEVELS;
};

export const LANGUAGE_PROFICIENCY = ['Basic', 'Conversational', 'Fluent', 'Native'] as const;

export const LANGUAGE_PROFICIENCY_ZH_TW = ['基礎', '對話', '流利', '母語'] as const;

// Helper function to get localized language proficiency levels
export const getLocalizedLanguageProficiency = (language: string) => {
  return language === 'zh-TW' ? LANGUAGE_PROFICIENCY_ZH_TW : LANGUAGE_PROFICIENCY;
};
