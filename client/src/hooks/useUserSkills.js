import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'jobgraph.userSkills';

/**
 * The user's own skill set, persisted in localStorage.
 * Job cards use it to show a live "match" badge, and the Job Match page uses
 * it as the source of truth for the match calculation.
 */
export function useUserSkills() {
  const [skills, setSkills] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(skills));
    } catch {
      // storage unavailable — ignore, state still works for the session
    }
  }, [skills]);

  const toggleSkill = useCallback((id) => {
    setSkills((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }, []);

  const setAllSkills = useCallback((ids) => setSkills(ids), []);

  return { skills, toggleSkill, setAllSkills };
}
