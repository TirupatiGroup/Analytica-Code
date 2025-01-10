import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../../components/HSidebar';

const SubProjectPage = ({ projects, setProjects }) => {
  const { id } = useParams();
  const projectId = parseInt(id, 10);

  // Find the project based on the project ID
  const project = projects.find((p) => p.id === projectId);
  
  // State for adding a sub-project
  const [showModal, setShowModal] = useState(false);
  const [subProjectName, setSubProjectName] = useState('');

  if (!project) {
    return <div className="p-6">Project not found.</div>;
  }

  const handleAddSubProject = (e) => {
    e.preventDefault();
    if (subProjectName.trim()) {
      const newSubProject = { id: project.subProjects.length + 1, name: subProjectName };
      
      // Update projects state to include the new sub-project
      setProjects((prevProjects) =>
        prevProjects.map((p) =>
          p.id === projectId ? { ...p, subProjects: [...p.subProjects, newSubProject] } : p
        )
      );

      setSubProjectName('');
      setShowModal(false);
    }
  };

  return (
   <div className='flex'>
    <Sidebar/>
     <div className="flex flex-col flex-1 p-6">
      <h1 className="text-2xl font-bold mb-4">{project.proname}</h1>
      <h2 className="text-xl mb-2">Sub-Projects:</h2>
      <div className="ml-4">
        {project.subProjects.length > 0 ? (
          project.subProjects.map((subProject) => (
            <div key={subProject.id} className="text-gray-600">
              - {subProject.name}
            </div>
          ))
        ) : (
          <div className="text-gray-600">No sub-projects available.</div>
        )}
      </div>
      
      <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={() => setShowModal(true)}
      >
        Add Sub-Project
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <form
            className="bg-white p-6 rounded-lg shadow-lg"
            onSubmit={handleAddSubProject}
          >
            <h2 className="text-xl mb-4">Add Sub-Project</h2>
            <label className="block mb-2">Sub-Project Name *</label>
            <input
              type="text"
              value={subProjectName}
              onChange={(e) => setSubProjectName(e.target.value)}
              required
              className="border w-full p-2 rounded-lg mb-4"
              placeholder="Sub-Project Name"
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

export default SubProjectPage;
