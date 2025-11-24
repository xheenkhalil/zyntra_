import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaUsers, FaExclamationTriangle, FaChevronRight, FaClock } from 'react-icons/fa';
import { getOrganizationProctoringOverview } from '../services/proctoringService';

interface ExamOverview {
    id: string;
    title: string;
    status: 'draft' | 'live' | 'ended';
    created_at: string;
    active_candidates: number;
    total_alerts: number;
}

const ProctoringOverview: React.FC = () => {
    const [exams, setExams] = useState<ExamOverview[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const data = await getOrganizationProctoringOverview();
                setExams(data);
            } catch (error) {
                console.error("Failed to fetch proctoring overview:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExams();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <FaShieldAlt className="h-8 w-8 text-indigo-600" />
                        Proctoring Dashboard
                    </h1>
                    <p className="mt-2 text-gray-600">Select an active exam to view real-time proctoring data.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {exams.map((exam) => (
                        <div
                            key={exam.id}
                            onClick={() => navigate(`/proctoring/${exam.id}`)}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow hover:border-indigo-300 group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                                        {exam.title}
                                    </h3>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${exam.status === 'live' ? 'bg-green-100 text-green-800' :
                                        exam.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                        {exam.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                                    <FaChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center text-gray-600">
                                        <FaUsers className="h-4 w-4 mr-2" />
                                        Active Candidates
                                    </div>
                                    <span className="font-medium text-gray-900">{exam.active_candidates}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center text-gray-600">
                                        <FaExclamationTriangle className="h-4 w-4 mr-2" />
                                        Total Alerts
                                    </div>
                                    <span className={`font-medium ${exam.total_alerts > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                                        {exam.total_alerts}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center text-gray-600">
                                        <FaClock className="h-4 w-4 mr-2" />
                                        Created
                                    </div>
                                    <span className="text-gray-500">
                                        {new Date(exam.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {exams.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <FaShieldAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No Exams Found</h3>
                        <p className="text-gray-500 mt-2">You haven't created any exams yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProctoringOverview;
