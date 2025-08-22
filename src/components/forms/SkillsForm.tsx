import React, { useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { addSkill, updateSkill, removeSkill } from '../../store/resumeSlice';
import { type Skill } from '../../types/resume';

const SkillsForm: React.FC = () => {
  const skills = useAppSelector(state => state.resume.skills);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [newSkillName, setNewSkillName] = useState('');


  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addNewSkill = (skillName: string) => {
    //if the skill string is contains comma, split it into multiple skills
    //if the skill repeat, don't add it
    const skillNames = skillName.split(',');
    skillNames.forEach(name => {
      if (name.trim() && !skills.find(skill => skill.name.toLowerCase().trim() === name.toLowerCase().trim())) {
      const newSkill: Skill = {
        id: generateId(),
        name: name.trim(),
        years: undefined
      };
      dispatch(addSkill(newSkill));
        setNewSkillName('');
      }
    });
  };

  const removeSkillItem = (id: string) => {
    dispatch(removeSkill(id));
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
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Desktop Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
                <div className="col-span-6">{t('skills.skillName')}</div>
                <div className="col-span-4">{t('skills.yearsOfExperiencePlural')}</div>
                <div className="col-span-2 text-center">{t('common.actions')}</div>
              </div>
              <div className="divide-y divide-gray-100">
                {skills.map((skill) => (
                  <div key={skill.id} className="px-4 py-4 hover:bg-gray-50 transition-colors">
                    {/* Desktop Layout */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-6">
                        <span className="font-medium text-gray-900">{skill.name}</span>
                      </div>
                      <div className="col-span-4">
                        <div className="relative w-full">
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={skill.years || ''}
                            onChange={(e) => {
                              const years = e.target.value ? parseInt(e.target.value) : undefined;
                              updateSkillYears(skill.id, years);
                            }}
                            className="form-input w-full text-sm pr-12"
                            placeholder="0"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                            {t('common.years')}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeSkillItem(skill.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-md transition-colors"
                          title={t('skills.removeSkill')}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Mobile Layout */}
                    <div className="md:hidden">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-900 text-lg">{skill.name}</span>
                        <button
                          type="button"
                          onClick={() => removeSkillItem(skill.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-md transition-colors"
                          title={t('skills.removeSkill')}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('skills.yearsOfExperiencePlural')} ({t('common.optional')})
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={skill.years || ''}
                            onChange={(e) => {
                              const years = e.target.value ? parseInt(e.target.value) : undefined;
                              updateSkillYears(skill.id, years);
                            }}
                            className="form-input w-full pr-12"
                            placeholder="0"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            {t('common.years')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              <strong>{t('common.tip')}:</strong> {t('skills.yearsOptionalHint')}
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
