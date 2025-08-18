import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  userList as staticUserList,
  projectsList as staticProjectsList,
  skillsList as staticSkillsList,
} from '@/constants';

// Create the context
const ConstantsContext = createContext();

export const ConstantsProvider = ({ children }) => {
  // Default states = static constants
  const [user, setUser] = useState(staticUserList[0] || {});
  const [projects, setProjects] = useState(staticProjectsList);
  const [skills, setSkills] = useState(staticSkillsList);

  // Fetch dynamic data from API
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/constant');
        if (!res.ok) throw new Error('API failed');

        const { data } = await res.json();

        // Update states and localStorage if data exists
        if (data?.users?.length) {
          setUser(data.users[0]);
          localStorage.setItem('userData', JSON.stringify(data.users[0]));
        }
        if (data?.projects?.length) {
          setProjects(data.projects);
          localStorage.setItem('projectsData', JSON.stringify(data.projects));
        }
        if (data?.skills?.length) {
          setSkills(data.skills);
          localStorage.setItem('skillsData', JSON.stringify(data.skills));
        }
      } catch {
        // Fallback to localStorage if API fails
        const cachedUser = localStorage.getItem('userData');
        const cachedProjects = localStorage.getItem('projectsData');
        const cachedSkills = localStorage.getItem('skillsData');

        if (cachedUser) setUser(JSON.parse(cachedUser));
        if (cachedProjects) setProjects(JSON.parse(cachedProjects));
        if (cachedSkills) setSkills(JSON.parse(cachedSkills));
      }
    }

    fetchData();
  }, []);

  return (
    <ConstantsContext.Provider value={{ user, projects, skills }}>
      {children}
    </ConstantsContext.Provider>
  );
};

// Custom hook to use the constants context
export const useConstants = () => {
  return useContext(ConstantsContext);
};
