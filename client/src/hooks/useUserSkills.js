import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'jobgraph.userSkills';

/**
 * The user's own skill set, persisted in localStorage.
 * Job cards use it to show a live "match" badge, and the Job Match page uses
 * it as the source of truth for the match calculation.
 */
export function useUserSkills() {
  const [skills, setSkills] = useState(readStoredSkills);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(skills));
    } catch (err) {
      // Storage may be full or blocked (private mode). State still works for
      // this session, but the failure should not be invisible.
      console.warn(`[useUserSkills] could not persist skills: ${err.message}`);
    }
  }, [skills]);

  const toggleSkill = useCallback((id) => {
    setSkills((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }, []);

  const setAllSkills = useCallback((ids) => setSkills(Array.isArray(ids) ? ids : []), []);

  return { skills, toggleSkill, setAllSkills };
}

/**
 * Reads the persisted skills, tolerating unavailable storage and corrupt or
 * unexpected values (anything but an array of ids would break every consumer).
 */
function readStoredSkills() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (err) {
    console.warn(`[useUserSkills] localStorage is unavailable: ${err.message}`);
    return [];
  }
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('stored value is not an array');
    return parsed.filter((id) => typeof id === 'string');
  } catch (err) {
    console.warn(`[useUserSkills] discarding corrupt stored skills: ${err.message}`);
    return [];
  }
}
