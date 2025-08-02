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

export default function Projects() {
  const { logged } = useTheme();
  const router = useRouter();

  const [project, setProject] = useState({
    title: '',
    description: '',
    url: '',
    highlights: ['', '', '', '', ''],
  });
  const [projectsList, setProjectsList] = useState([]);

  const [status, setStatus] = useState({
    error: '',
    success: '',
  });

  useEffect(() => {
    if (!logged) {
      router.replace('/admin');
    }

    (async () => {
      try {
        const res = await fetch('/api/project');
        const data = await res.json();
        if (res.ok && data.data) setProjectsList(data.data);
        else {
          setStatus({
            error: data.message || '❌ Failed to load Projects',
            success: '',
          });
        }
      } catch {
        setStatus({ error: '❌ Error loading Projects', success: '' });
      }
    })();
  }, [logged, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject({ ...project, [name]: value });
  };

  const handleHighlightChange = (index, value) => {
    const newHighlights = [...project.highlights];
    newHighlights[index] = value;
    setProject({ ...project, highlights: newHighlights });
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    setStatus({ error: '', success: '' });

    const payload = {
      projectNumber: projectsList.length + 1,
      title: project.title,
      description: project.description,
      url: project.url,
      highlight1: project.highlights[0],
      highlight2: project.highlights[1],
      highlight3: project.highlights[2],
      highlight4: project.highlights[3],
      highlight5: project.highlights[4],
    };

    try {
      const res = await fetch('/api/project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      setStatus({
        error: !res.ok ? data.message || '❌ Failed to add Project' : '',
        success: res.ok ? data.message || '✅ Project added' : '',
      });

      if (res.ok) {
        setProjectsList([...projectsList, data.data]);
        setProject({
          projectNumber: '',
          title: '',
          description: '',
          url: '',
          highlights: ['', '', '', '', ''],
        });
      }
    } catch (err) {
      setStatus({
        error: '❌ Server error when adding Project',
        success: '',
      });
    }
  };

  const handleRemoveProject = async (id) => {
    setStatus({ error: '', success: '' });

    try {
      const res = await fetch(`/api/project?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      setStatus({
        error: !res.ok ? data.message || '❌ Failed to delete Project' : '',
        success: res.ok ? data.message || '✅ Project deleted' : '',
      });

      if (res.ok) {
        const updatedList = projectsList.filter((p) => p.id !== id);
        const reordered = updatedList.map((p, i) => ({
          ...p,
          projectNumber: i + 1,
        }));
        setProjectsList(reordered);

        await Promise.all(
          reordered.map((p) =>
            fetch(`/api/project?id=${p.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ projectNumber: p.projectNumber }),
            })
          )
        );
      }
    } catch (err) {
      console.log(err);

      setStatus({
        error: '❌ Server error when deleting Project',
        success: '',
      });
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;

    const updatedProjects = [...projectsList];
    const [movedProject] = updatedProjects.splice(source.index, 1);
    updatedProjects.splice(destination.index, 0, movedProject);

    const reordered = updatedProjects.map((p, i) => ({
      ...p,
      projectNumber: i + 1,
    }));
    setProjectsList(reordered);

    try {
      await Promise.all(
        reordered.map((p) =>
          fetch(`/api/project?id=${p.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectNumber: p.projectNumber }),
          })
        )
      );
      setStatus({ error: '', success: '✅ Project order updated' });
    } catch {
      setStatus({ error: '❌ Failed to update project order', success: '' });
    }
  };

  return (
    <div className={styles.section_container}>
      <div className={styles.projects}>
        {/* Pillar */}
        <Pillar />
        {/* Middle */}
        <div className={styles.container}>
          {/* Title */}
          <Title title="Projects" />

          {/* Forms */}
          <form className={styles.projects_form} onSubmit={handleAddProject}>
            <input
              className="input_style"
              type="text"
              name="title"
              placeholder="Project Title"
              value={project.title}
              onChange={handleChange}
              required
            />
            <textarea
              className="input_style"
              name="description"
              placeholder="Project Description"
              value={project.description}
              onChange={handleChange}
            />
            <input
              className="input_style"
              type="url"
              name="url"
              placeholder="Project URL"
              value={project.url}
              onChange={handleChange}
            />

            {project.highlights.map((highlight, index) => (
              <input
                className="input_style"
                key={index}
                type="text"
                placeholder={`Highlight ${index + 1}`}
                value={highlight}
                onChange={(e) => handleHighlightChange(index, e.target.value)}
              />
            ))}

            {status.error && (
              <div className="error_banner">
                <p>{status.error}</p>
              </div>
            )}
            {status.success && (
              <div className="success_banner">
                <p>{status.success}</p>
              </div>
            )}
            <button type="submit" className="input_button">
              ADD
            </button>
          </form>

          {/* Projets List */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="projects">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={styles.project_list}
                >
                  {[...projectsList]
                    .sort((a, b) => a.projectNumber - b.projectNumber)
                    .map((project, index) => (
                      <Draggable
                        key={project.id}
                        draggableId={project.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={styles.project_item}
                          >
                            <span>
                              {project.projectNumber} - {project.title}
                            </span>
                            <button
                              onClick={() => handleRemoveProject(project.id)}
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
