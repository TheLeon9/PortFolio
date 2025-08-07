import React, { useState, useEffect } from 'react';
import styles from './index.module.scss';

import { useTheme } from '@/context/ThemeContext.js';
import { useRouter } from 'next/router';
import { withAdminAuth } from '@/lib/auth/auth.js';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import Title from '@/components/UI/admin/Title';
import Pillar from '@/components/UI/admin/Pillar';

// --- Auth guard SSR ---
export const getServerSideProps = withAdminAuth();

export default function Skills() {
  const { logged, setStatus } = useTheme();
  const router = useRouter();

  const [skill, setSkill] = useState('');
  const [skillsList, setSkillsList] = useState([]);

  useEffect(() => {
    if (!logged) {
      router.replace('/admin');
      return;
    }

    (async () => {
      try {
        const res = await fetch('/api/skill');
        const data = await res.json();
        if (res.ok && data.data) setSkillsList(data.data);
        else
          setStatus({
            error: data.message || '❌ Failed to load Skills',
            success: '',
          });
      } catch {
        setStatus({ error: '❌ Error loading Skills', success: '' });
      }
    })();
  }, [logged, router, setStatus]);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setStatus({ error: '', success: '' });

    if (skill.trim() === '') return;

    try {
      const res = await fetch('/api/skill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: skill.trim(),
          order: skillsList.length + 1,
        }),
      });

      const data = await res.json();

      setStatus({
        error: !res.ok ? data.message || '❌ Failed to add Skill' : '',
        success: res.ok ? data.message || '✅ Skill added' : '',
      });

      if (res.ok) {
        setSkillsList([...skillsList, data.data]);
        setSkill('');
      }
    } catch (err) {
      setStatus({
        error: '❌ Server error when adding Skill',
        success: '',
      });
    }
  };

  const handleRemoveSkill = async (id) => {
    setStatus({ error: '', success: '' });

    try {
      const res = await fetch(`/api/skill?id=${id}`, { method: 'DELETE' });
      const data = await res.json();

      setStatus({
        error: !res.ok ? data.message || '❌ Failed to delete Skill' : '',
        success: res.ok ? data.message || '✅ Skill deleted' : '',
      });

      if (res.ok) {
        const updatedList = skillsList.filter((s) => s.id !== id);

        const reordered = updatedList.map((s, i) => ({ ...s, order: i + 1 }));
        setSkillsList(reordered);

        await Promise.all(
          reordered.map((s) =>
            fetch(`/api/skill?id=${s.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order: s.order }),
            })
          )
        );
      }
    } catch {
      setStatus({ error: '❌ Server error when deleting Skill', success: '' });
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;

    const updatedSkills = [...skillsList];
    const [movedSkill] = updatedSkills.splice(source.index, 1);
    updatedSkills.splice(destination.index, 0, movedSkill);

    const reordered = updatedSkills.map((skill, i) => ({
      ...skill,
      order: i + 1,
    }));

    setSkillsList(reordered);

    try {
      await Promise.all(
        reordered.map((skill) =>
          fetch(`/api/skill?id=${skill.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: skill.order }),
          })
        )
      );
      setStatus({ error: '', success: '✅ Skill order updated' });
    } catch {
      setStatus({ error: '❌ Failed to update skill order', success: '' });
    }
  };

  return (
    <div className={styles.section_container}>
      <div className={styles.skills}>
        {/* Pillar */}
        <Pillar />
        {/* Middle */}
        <div className={styles.container}>
          {/* Title */}
          <Title title="Skills" />

          {/* Forms */}
          <form className={styles.skills_form} onSubmit={handleAddSkill}>
            <input
              className="input_style"
              type="text"
              placeholder="Add a skill..."
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              required
            />

            <button type="submit" className="input_button">
              ADD
            </button>
          </form>

          {/* Skills List */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="skills">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={styles.skills_list}
                >
                  {[...skillsList]
                    .sort((a, b) => a.order - b.order)
                    .map((skill, index) => (
                      <Draggable
                        key={skill.id}
                        draggableId={skill.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            {skill.value}
                            <button
                              onClick={() => handleRemoveSkill(skill.id)}
                              className="delete_button"
                            >
                              DELETE
                            </button>
                          </li>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        {/* Pillar */}
        <Pillar />
      </div>
    </div>
  );
}
