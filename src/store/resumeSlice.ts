import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { 
  ResumeData, 
  PersonalInfo, 
  WorkExperience, 
  Education, 
  Skill, 
  OptionalSections,
  SectionOrdering 
} from '../types/resume';

// Initial state
const initialState: ResumeData = {
  personalInfo: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: ''
  },
  professionalSummary: {
    content: ''
  },
  workExperiences: [],
  education: [],
  skills: [],
  optionalSections: {
    hobbies: '',
    certificates: [],
    languages: [],
    customSections: []
  }
};

// Redux Toolkit slice
const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    // Personal Info Actions
    updatePersonalInfo: (state, action: PayloadAction<PersonalInfo>) => {
      state.personalInfo = action.payload;
    },

    // Professional Summary Actions
    updateProfessionalSummary: (state, action: PayloadAction<string>) => {
      state.professionalSummary = {
        content: action.payload
      };
    },

    // Work Experience Actions
    addWorkExperience: (state, action: PayloadAction<WorkExperience>) => {
      state.workExperiences.push(action.payload);
    },

    updateWorkExperience: (state, action: PayloadAction<{ id: string; data: WorkExperience }>) => {
      const index = state.workExperiences.findIndex(exp => exp.id === action.payload.id);
      if (index !== -1) {
        state.workExperiences[index] = action.payload.data;
      }
    },

    removeWorkExperience: (state, action: PayloadAction<string>) => {
      state.workExperiences = state.workExperiences.filter(exp => exp.id !== action.payload);
    },

    // Education Actions
    addEducation: (state, action: PayloadAction<Education>) => {
      state.education.push(action.payload);
    },

    updateEducation: (state, action: PayloadAction<{ id: string; data: Education }>) => {
      const index = state.education.findIndex(edu => edu.id === action.payload.id);
      if (index !== -1) {
        state.education[index] = action.payload.data;
      }
    },

    removeEducation: (state, action: PayloadAction<string>) => {
      state.education = state.education.filter(edu => edu.id !== action.payload);
    },

    // Skills Actions
    addSkill: (state, action: PayloadAction<Skill>) => {
      state.skills.push(action.payload);
    },

    updateSkill: (state, action: PayloadAction<{ id: string; data: Skill }>) => {
      const index = state.skills.findIndex(skill => skill.id === action.payload.id);
      if (index !== -1) {
        state.skills[index] = action.payload.data;
      }
    },

    removeSkill: (state, action: PayloadAction<string>) => {
      state.skills = state.skills.filter(skill => skill.id !== action.payload);
    },

    // Optional Sections Actions
    updateOptionalSections: (state, action: PayloadAction<OptionalSections>) => {
      state.optionalSections = action.payload;
    },

    // Section Ordering Actions
    updateSectionOrdering: (state, action: PayloadAction<SectionOrdering[]>) => {
      state.sectionOrdering = action.payload;
    },

    // Reset Action
    resetResume: () => {
      return initialState;
    }
  }
});

// Export actions
export const {
  updatePersonalInfo,
  updateProfessionalSummary,
  addWorkExperience,
  updateWorkExperience,
  removeWorkExperience,
  addEducation,
  updateEducation,
  removeEducation,
  addSkill,
  updateSkill,
  removeSkill,
  updateOptionalSections,
  updateSectionOrdering,
  resetResume
} = resumeSlice.actions;

// Export reducer
export default resumeSlice.reducer;
