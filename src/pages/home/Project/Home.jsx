import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/HSidebar'; // Assuming you have a sidebar component

const TicProjects = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const navigate = useNavigate(); // Initialize navigate

  // Function to fetch projects (mocked here)
  const fetchProjects = () => {
    const mockProjects = [
      { id: 1, proname: 'Project Alpha', subProjects: [] },
      { id: 2, proname: 'Project Beta', subProjects: [] },
      { id: 3, proname: 'Project Gamma', subProjects: [] },
    ];
    setProjects(mockProjects);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectSubmit = (e) => {
    e.preventDefault();
    if (projectName.trim()) {
      const newProject = { id: projects.length + 1, proname: projectName, subProjects: [] };
      setProjects((prevProjects) => [...prevProjects, newProject]);
      setShowModal(false);
      setProjectName('');
    }
  };

  const handleProjectClick = (projectId) => {
    navigate(`/sub-projects/${projectId}`); // Navigate on click
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Projects</h1>
          <button
            className="bg-white text-indigo-800 border border-indigo-800 px-4 py-2 rounded hover:bg-indigo-100"
            onClick={() => setShowModal(true)}
          >
            Add Project
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-4 border rounded-lg hover:bg-green-100 hover:shadow cursor-pointer"
              onClick={() => handleProjectClick(project.id)} // Redirect on click
            >
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">
                  {project.proname}
                </span>
              </div>
              <div className="mt-2">
                {project.subProjects.map((subProject) => (
                  <div key={subProject.id} className="ml-4 text-gray-600">
                    - {subProject.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <form
              className="bg-white p-6 rounded-lg shadow-lg"
              onSubmit={handleProjectSubmit}
            >
              <h2 className="text-xl mb-4">Add Project</h2>
              <label className="block mb-2">Project Name *</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                className="border w-full p-2 rounded-lg mb-4"
                placeholder="Project Name"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicProjects;
