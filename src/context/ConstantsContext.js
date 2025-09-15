import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  userList as staticUserList,
  projectsList as staticProjectsList,
  skillsList as staticSkillsList,
} from '@/constants';

// Create the context
const ConstantsContext = createContext();

export const ConstantsProvider = ({ children }) => {
  // =========================
  // Static Data States
  // =========================
  const [user, setUser] = useState(staticUserList[0] || {});
  const [projects, setProjects] = useState(staticProjectsList);
  const [skills, setSkills] = useState(staticSkillsList);
  const [isReady, setIsReady] = useState(false);

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
      } finally {
        setIsReady(true);
      }
    }

    fetchData();
  }, []);

  // =========================
  // Admin Logic
  // =========================

  // Admin logged
  const [logged, isLogged] = useState(false);

  // Admin Status (error / success)
  const [status, setStatus] = useState({
    error: '',
    success: '',
  });

  useEffect(() => {
    if (!status.success && !status.error) return;

    const timer = setTimeout(() => {
      setStatus({ success: '', error: '' });
    }, 3000);

    return () => clearTimeout(timer);
  }, [status.success, status.error]);

  // Admin Dark Mode
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const storedTheme = localStorage.getItem('darkMode');
    if (storedTheme) setDarkMode(storedTheme === 'true');
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      darkMode ? 'dark' : 'light'
    );
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  // =========================
  // Return Provider
  // =========================

  return (
    <ConstantsContext.Provider
      value={{
        user,
        projects,
        skills,
        logged,
        isReady,
        setIsReady,
        // Admin
        isLogged,
        status,
        setStatus,
        darkMode,
        toggleTheme,
      }}
    >
      {children}
    </ConstantsContext.Provider>
  );
};

// Custom hook to use the constants context
export const useConstants = () => {
  return useContext(ConstantsContext);
};
