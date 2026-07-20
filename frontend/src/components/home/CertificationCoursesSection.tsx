import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL ? import.meta.env.VITE_BACKEND_URL.replace(/\/api\/?$/, '') : '';
import type { Certification } from '../../types/certification';

const CertificationCoursesSection: React.FC = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      // Assuming public endpoint to get published certifications
      const res = await axios.get(API_URL + '/api/certifications');
      // Filter for published ones only just in case
      setCertifications(res.data.filter((c: Certification) => c.is_published));
    } catch (error) {
      console.error('Failed to fetch certifications', error);
    }
  };

  if (certifications.length === 0) return null;

  return (
    <div className="w-full bg-[#f8fafc] py-16 md:py-24 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111A50] tracking-tight mb-4">
            Professional Certification Courses
          </h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full opacity-90 mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Elevate your career with our industry-recognized certification programs. Master comprehensive curriculums and prove your expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certifications.map((cert) => (
            <div 
              key={cert.id} 
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col border border-gray-100"
            >
              {cert.image_url ? (
                <div className="h-48 w-full bg-gray-200 overflow-hidden relative">
                  <img src={cert.image_url} alt={cert.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[#111A50] font-bold text-sm shadow-sm">
                    ${cert.price}
                  </div>
                </div>
              ) : (
                <div className="h-48 w-full bg-gradient-to-br from-[#111A50] to-blue-800 flex items-center justify-center relative">
                  <FaGraduationCap className="text-6xl text-white opacity-50" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[#111A50] font-bold text-sm shadow-sm">
                    ${cert.price}
                  </div>
                </div>
              )}
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                    {cert.title}
                  </h3>
                  <div className="flex items-center text-yellow-500 text-sm font-bold">
                    ★ {cert.average_rating || '0.0'} <span className="text-gray-400 font-normal ml-1">({cert.participant_count || 0})</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-3">
                  {cert.description}
                </p>
                
                <button 
                  onClick={() => navigate(`/certifications/${cert.id}`)}
                  className="w-full flex items-center justify-center py-3 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold rounded-xl transition-colors duration-300 group"
                >
                  View Details
                  <FaChevronRight className="ml-2 text-sm transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CertificationCoursesSection;
