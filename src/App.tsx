import { Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import PersonalInfoForm from './components/forms/PersonalInfoForm'
import ProfessionalSummaryForm from './components/forms/ProfessionalSummaryForm'
import WorkExperienceForm from './components/forms/WorkExperienceForm'
import EducationForm from './components/forms/EducationForm'
import SkillsForm from './components/forms/SkillsForm'
import OptionalSectionsForm from './components/forms/OptionalSectionsForm'
import PreviewPage from './components/PreviewPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<PersonalInfoForm />} />
        <Route path="/summary" element={<ProfessionalSummaryForm />} />
        <Route path="/experience" element={<WorkExperienceForm />} />
        <Route path="/education" element={<EducationForm />} />
        <Route path="/skills" element={<SkillsForm />} />
        <Route path="/optional" element={<OptionalSectionsForm />} />
        <Route path="/preview" element={<PreviewPage />} />
      </Routes>
    </Layout>
  )
}

export default App
