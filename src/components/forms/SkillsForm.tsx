import React, { useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { addSkill, updateSkill, removeSkill } from '../../store/resumeSlice';
import { type Skill, getLocalizedSkillLevels } from '../../types/resume';

const SkillsForm: React.FC = () => {
  const skills = useAppSelector(state => state.resume.skills);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [newSkillName, setNewSkillName] = useState('');
  const localizedSkillLevels = getLocalizedSkillLevels(i18n.language);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addNewSkill = (skillName: string) => {
    if (skillName.trim() && !skills.find(skill => skill.name.toLowerCase() === skillName.toLowerCase())) {
      const newSkill: Skill = {
        id: generateId(),
        name: skillName.trim(),
        level: 'Intermediate',
        years: undefined
      };
      dispatch(addSkill(newSkill));
      setNewSkillName('');
    }
  };

  const removeSkillItem = (id: string) => {
    dispatch(removeSkill(id));
  };

  const updateSkillLevel = (id: string, level: Skill['level']) => {
    const skill = skills.find(s => s.id === id);
    if (skill) {
      const updatedSkill = { ...skill, level };
      dispatch(updateSkill({ id, data: updatedSkill }));
    }
  };

  const updateSkillYears = (id: string, years: number | undefined) => {
    const skill = skills.find(s => s.id === id);
    if (skill) {
      const updatedSkill = { ...skill, years };
      dispatch(updateSkill({ id, data: updatedSkill }));
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addNewSkill(newSkillName);
    }
  };

  const handleAddClick = () => {
    addNewSkill(newSkillName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/optional');
  };

  const handleBack = () => {
    navigate('/education');
  };

  const getLevelColor = (level: Skill['level']) => {
    switch (level) {
      case 'Beginner': return 'bg-red-100 text-red-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-blue-100 text-blue-800';
      case 'Expert': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('skills.title')}</h2>
        <p className="text-gray-600">
          {t('skills.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('skills.addSkillsLabel')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="form-input flex-1"
              placeholder={t('skills.placeholder')}
            />
            <button
              type="button"
              onClick={handleAddClick}
              className="btn-primary flex items-center px-4"
              disabled={!newSkillName.trim()}
            >
              <Plus className="w-4 h-4 mr-1" />
              {t('common.add')}
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <strong>{t('common.tip')}:</strong> {t('skills.addTip')}
          </div>
        </div>

        {skills.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('skills.yourSkills')} ({skills.length})
            </label>
            <div className="space-y-3">
              {skills.map((skill) => (
                <div key={skill.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900 text-lg">{skill.name}</span>
                    <button
                      type="button"
                      onClick={() => removeSkillItem(skill.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('skills.skillLevel')}
                      </label>
                      <select
                        value={skill.level}
                        onChange={(e) => updateSkillLevel(skill.id, e.target.value as Skill['level'])}
                        className="form-select"
                      >
                        {localizedSkillLevels.map((level, index) => (
                          <option key={level} value={getLocalizedSkillLevels('en')[index]}>{level}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('skills.yearsOfExperiencePlural')} ({t('common.optional')})
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={skill.years || ''}
                        onChange={(e) => {
                          const years = e.target.value ? parseInt(e.target.value) : undefined;
                          updateSkillYears(skill.id, years);
                        }}
                        className="form-input"
                        placeholder={t('skills.yearsPlaceholder')}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(skill.level)}`}>
                      {t(`skills.levels.${skill.level}`)}
                    </span>
                    {skill.years && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {t('skills.yearsOfExperience', { years: skill.years })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {skills.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-4">{t('skills.noSkills')}</p>
            <p className="text-sm text-gray-400">
              {t('skills.noSkillsHint')}
            </p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h4 className="font-medium text-blue-900 mb-2">{t('skills.levelGuide')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-red-100 rounded-full mr-2"></span>
              <strong>{t('skills.levels.Beginner')}:</strong> {t('skills.levelDescriptions.beginner')}
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-yellow-100 rounded-full mr-2"></span>
              <strong>{t('skills.levels.Intermediate')}:</strong> {t('skills.levelDescriptions.intermediate')}
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-blue-100 rounded-full mr-2"></span>
              <strong>{t('skills.levels.Advanced')}:</strong> {t('skills.levelDescriptions.advanced')}
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-100 rounded-full mr-2"></span>
              <strong>{t('skills.levels.Expert')}:</strong> {t('skills.levelDescriptions.expert')}
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button 
            type="button" 
            onClick={handleBack}
            className="btn-secondary flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </button>
          <button 
            type="submit" 
            className="btn-primary flex items-center"
          >
            {t('skills.nextButton')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default SkillsForm;
